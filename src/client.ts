import fetch from 'node-fetch';

import { createToken } from './token.js';
import { PPError } from './error.js';

type PaymentInit = {
  metadata: string;
  urn: string;
  amount: number;
  email: string;
  note?: string;
};

const INITIATE_PAYMENT_ENDPOINT = '/api/integration/generic/initiate';

export class Client {
  private key: string;
  private base: string;

  public constructor(key: string, base: string = 'https://pay.ponchopay.com/') {
    this.key = key;

    while (base.slice(-1) === '/') {
      base = base.slice(0, -1);
    }
    this.base = base;
  }

  private getUrl(endpoint: string): string {
    return `${this.base}${endpoint}`;
  }

  private getData(init: PaymentInit): string {
    return JSON.stringify({
      ...init,
      token: createToken(this.key, init.metadata),
    });
  }

  public async initiatePayment(init: PaymentInit): Promise<string> {
    const response = await fetch(this.getUrl(INITIATE_PAYMENT_ENDPOINT), {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: this.getData(init),
      redirect: 'manual',
    });

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
}
