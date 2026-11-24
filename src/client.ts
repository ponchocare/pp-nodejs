import { timingSafeEqual } from 'node:crypto';
import { createJWT, createToken } from './token.js';
import { PPError } from './error.js';
import { Api } from './api.js';
import {
  deserialise,
  replaceParams,
  Serialisable,
  serialise,
  sha256Hmac,
} from './utils.js';
import {
  JWTPayload,
  LocationStatus,
  PaymentInit,
  PaymentMethodRefund,
  PaymentMethodUpdate,
  SubscriptionInit,
} from './types.js';

/**
 * Initializes a new instance of the Client. This sets up the core API connection
 * using the provided API key and determines the API client instance based on
 * whether an existing Api object or a base URL string is provided.
 */
export class Client {
  private readonly api: Api;
  private readonly key: string;

  /**
   * @param key  the integration key found in the https://pay.ponchopay.com/provider/admin/settings/api-integration page
   * @param base if an existing Api object is passed, it will be used;
   *             otherwise, the base URL string is used to instantiate a new Api object
   */
  public constructor(
    key: string,
    base: Api | string = 'https://pay.ponchopay.com/',
  ) {
    this.api = typeof base === 'string' ? new Api(base) : base;
    this.key = key;
  }

  /**
   * It consumes endpoints returning redirection URLs. This method extracts the returned redirection.
   *
   * @param url  the API endpoint URL to initiate the redirect process
   * @param data the initial payment data to be sent
   *
   * @return the final redirect URL obtained from the API response headers
   */
  private async getRedirectLocation(
    url: string,
    data: { metadata: string } & Serialisable,
  ): Promise<string> {
    const body = serialise({
      ...data,
      token: createToken(this.key, data.metadata),
    });

    const response = await this.api.makePostRequest(url, {}, body);

    if (response.status === 302) {
      const location = response.headers.get('location');
      if (typeof location === 'string') {
        return location;
      }

      throw new PPError(
        'The location header was expected in the response but it could not be found.',
      );
    }

    throw new PPError(
      `Unexpected response. Expected 302 as status code but ${response.status} was received.`,
    );
  }

  /**
   * Executes an HTTP GET request to the API to retrieve and validate location-specific payment information.
   *
   * @param url     the API endpoint URL to initiate the redirect process
   * @param payload the data for the location and the authorising email
   *
   * @return the decoded JSON object containing the payment validation status
   */

  private async issueGetRequest<T>(
    url: string,
    payload: JWTPayload & Serialisable,
  ): Promise<T> {
    const { urn, email } = payload;
    const jwt = await createJWT(urn, this.key, email, '');

    const headers = { Authorization: `Bearer ${jwt}` };
    const response = await this.api.makeGetRequest(url, headers);

    if (response.status !== 200) {
      throw new PPError(
        `Unexpected response. Expected 200 as status code but ${response.status} was received.`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Executes an HTTP PUT request to the API to modify or update a payment record.
   *
   * @param url     the API endpoint URL to initiate the redirect process
   * @param payload the data for the location, the authorising email, and the endpoint payload
   */
  private async issuePutRequest(
    url: string,
    payload: JWTPayload & Serialisable,
  ): Promise<void> {
    const { urn, email, ...data } = payload;
    const stringified = serialise(data);
    const jwt = await createJWT(urn, this.key, email, stringified);

    const headers = { Authorization: `Bearer ${jwt}` };
    const response = await this.api.makePutRequest(url, headers, stringified);

    if (response.status !== 204) {
      throw new PPError(
        `Unexpected response. Expected 204 as status code but ${response.status} was received.`,
      );
    }
  }

  /**
   * Validates the payment processing capabilities for a specified location URN.
   * This function is used to check which payment methods are available at a given location.
   *
   * @param payload the data containing the 'urn' (Unique Resource Name) and 'email' required for location identification
   *
   * @return an object structure detailing payment enablement flags as boolean values
   */

  public async validateLocationUrn(
    payload: JWTPayload,
  ): Promise<LocationStatus> {
    return await this.issueGetRequest('/api/integration/validate', payload);
  }

  /**
   * Initiates the payment transaction process for a user.
   *
   * @param init the data structure containing all necessary payment details:
   *
   * @return the redirect URL that the user's browser must navigate to in order to complete the payment
   */
  public async initiatePayment(init: PaymentInit): Promise<string> {
    return await this.getRedirectLocation(
      '/api/integration/generic/initiate',
      init,
    );
  }

  /**
   * Initiates the process for setting up a recurring subscription payment.
   *
   * @param init the data structure containing all necessary subscription details:
   *
   * @return the redirect URL that the user's browser must navigate to in order to setup the subscription
   */
  public async initiateSubscription(init: SubscriptionInit): Promise<string> {
    return await this.getRedirectLocation(
      '/api/integration/generic/subscription/redirect',
      init,
    );
  }

  /**
   * Updates specific details for an existing payment method associated with a payment record.
   *
   * @param paymentMethodId the identifier of the payment method to be modified
   * @param update the data structure containing the updated payment details
   */
  public async updatePaymentMethod(
    paymentMethodId: string,
    update: PaymentMethodUpdate,
  ): Promise<void> {
    await this.issuePutRequest(
      replaceParams('/api/payment-method/[paymentMethodId]', {
        paymentMethodId,
      }),
      update,
    );
  }

  /**
   * Refunds a single payment method within a payment.
   *
   * @param paymentMethodId the identifier of the payment method to be refunded
   * @param refund          the refund payload
   */
  public async refundPaymentMethod(
    paymentMethodId: string,
    refund: PaymentMethodRefund,
  ): Promise<void> {
    await this.issuePutRequest(
      replaceParams('/api/payment-method/[paymentMethodId]/refund', {
        paymentMethodId,
      }),
      refund,
    );
  }

  /**
   * Requests the cancelation of a payment.
   *
   * @param paymentId the identifier of the payment method to be cancelled
   * @param payload   the cancellation payload
   */
  public async cancelPayment(
    paymentId: string,
    payload: JWTPayload,
  ): Promise<void> {
    await this.issuePutRequest(
      replaceParams('/api/payment/[paymentId]/cancel', { paymentId }),
      payload,
    );
  }

  /**
   * Requests the cancelation of a recursion.
   *
   * @param recursionId the identifier of the recursion to be cancelled
   * @param payload     the cancellation payload
   */
  public async cancelRecursion(
    recursionId: string,
    payload: JWTPayload,
  ): Promise<void> {
    await this.issuePutRequest(
      replaceParams('/api/recursion/[recursionId]/cancel', { recursionId }),
      payload,
    );
  }

  /**
   * Extracts the security signature from the incoming Request object.
   *
   * @param request the incoming request containing the signature in its headers
   *
   * @return the raw signature string obtained from the request header
   */
  private getSignature(request: Request): string {
    const header = request.headers.get('signature');
    if (!header) {
      throw new PPError('Signature header not found');
    }

    return header;
  }

  /**
   * Checks if the provided data is a valid callback signature by comparing it against a computed HMAC hash.
   *
   * @param signature the expected SHA256 HMAC signature string
   * @param payload   the data received in the callback
   *
   * @return returns `true` if the signature matches the generated hash, `false` otherwise
   */
  public isValidCallback(signature: string, payload: string): boolean {
    const expected = Buffer.from(sha256Hmac(this.key, payload), 'utf8');
    const received = Buffer.from(signature, 'utf8');

    return (
      received.length === expected.length && timingSafeEqual(received, expected)
    );
  }

  /**
   * Validates an incoming HTTP request by checking its security signature against the configured API key.
   *
   * @param request the incoming request object containing the signature in the header and the body
   *
   * @return returns `true` if the request signature is valid, otherwise it returns `false`
   */
  public async isValidRequest(request: Request): Promise<boolean> {
    return this.isValidCallback(
      this.getSignature(request),
      await request.clone().text(),
    );
  }

  /**
   * Decodes and validates a payment gateway callback payload received
   *
   * @param signature the expected SHA256 HMAC signature provided in the request headers
   * @param payload   The body content of the incoming callback request
   *
   * @return the fully parsed and validated payload object from the callback
   */
  public parseCallback<T extends object>(
    signature: string,
    payload: string,
  ): T {
    const isValid = this.isValidCallback(signature, payload);
    if (!isValid) {
      throw new PPError('Callback request failed the security signature');
    }

    return deserialise(payload);
  }

  /**
   * Parses an incoming HTTP request object by extracting the signature from the headers and validating the body.
   *
   * @param request the incoming request object
   *
   * @return the fully parsed and validated payload object from the request
   */
  public async parseRequest<T extends object>(request: Request): Promise<T> {
    return this.parseCallback(
      this.getSignature(request),
      await request.clone().text(),
    );
  }
}
