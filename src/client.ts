import { createJWT, createToken } from './token.js';
import { PPError } from './error.js';
import { Api } from './api.js';
import { replaceParams, Serialisable, serialise } from './utils.js';

type ISO8601Date = `${number}-${number}-${number}`;
type ISO8601Time = `${number}:${number}:${number}.${number}Z`;
type DateValue = `${ISO8601Date}T${ISO8601Time}` | Date;

type Constraints = { minimum_card_amount?: number };

type BasePaymentInit = {
  amount: number;
  metadata: string;
  note?: string;
  expiry?: DateValue;
  constraints?: Constraints;
};

type PaymentInit = BasePaymentInit & {
  urn: string;
  email: string;
};

export enum Weekday {
  Monday = 'monday',
  Tuesday = 'tuesday',
  Wednesday = 'wednesday',
  Thursday = 'thursday',
  Friday = 'friday',
  Saturday = 'saturday',
  Sunday = 'sunday',
}

type SubscriptionRepetition =
  | { granularity: 'day'; period: number }
  | { granularity: 'week'; period: number; weekdays: Set<Weekday> }
  | { granularity: 'month'; period: number; day: number }
  | { granularity: 'year'; period: number };

type SubscriptionEnding =
  | { condition: 'never' }
  | { condition: 'occurrences'; occurrences: number }
  | { condition: 'date'; date: DateValue };

type SubscriptionInit = {
  urn: string;
  amount: number;
  metadata: string;
  note?: string;
  email: string;
  repetition: SubscriptionRepetition;
  ending?: SubscriptionEnding;
  additional_one_time_payment?: BasePaymentInit;
};

export enum PaymentMethodType {
  Card = 'card',
  ChildcareVouchers = 'childcare-voucher',
  TaxFreeChildcare = 'tax-free-childcare',
}

type JWTPayload = {
  urn: string;
  email: string;
};

type PaymentMethodUpdate = JWTPayload & {
  type: PaymentMethodType;
  amount: number;
  voucher_provider?: string;
};

type PaymentMethodRefund = JWTPayload & {
  amount: number;
};

/**
 * PonchoPay client.
 * It collects the methods to manipulate payments in PonchoPay.
 */
export class Client {
  private readonly api: Api;
  private readonly key: string;

  public constructor(key: string, base: string = 'https://pay.ponchopay.com/') {
    this.api = new Api(base);
    this.key = key;
  }

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

  private async issuePutRequest(
    url: string,
    { urn, email, ...data }: JWTPayload & Serialisable,
  ): Promise<void> {
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
   * Initiates a payment.
   * This method returns a URL to redirect the user to.
   */
  public async initiatePayment(init: PaymentInit): Promise<string> {
    return await this.getRedirectLocation(
      '/api/integration/generic/initiate',
      init,
    );
  }

  /**
   * Initiates a subscription.
   * This method returns a URL to redirect the user to.
   */
  public async initiateSubscription(init: SubscriptionInit): Promise<string> {
    return await this.getRedirectLocation(
      '/api/integration/generic/subscription',
      init,
    );
  }

  /**
   * Updates a single payment method within a payment.
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
   * Requests the cancelation of payment.
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
}
