import { describe, it, expect, beforeEach, vi } from 'vitest';

const makePostRequestMock = vi.hoisted(() => vi.fn());
const makePutRequestMock = vi.hoisted(() => vi.fn());
const apiMock = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    makePostRequest: makePostRequestMock,
    makePutRequest: makePutRequestMock,
  }),
);
vi.mock('../src/api', () => ({ Api: apiMock }));

import { Client, Weekday, PaymentMethodType } from '../src/client';
import { serialise } from '../src/utils';
import { PPError } from '../src/error';

const urn = 'IUpGPArQ';
const email = 'help@ponchopay.com';
const key = '6N28tFbrufnfCT58ZvmzIwaL8S1aVFryIasJazFqdc516T/1ZrLw7CDqOSlF5NeF';
const base = 'https://some.base/url';
const location = 'https://returned/location';
const authorization = expect.stringMatching(/^Bearer\seyJhbGciOiJIUzI1NiJ9/);

describe('Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('ensures the api is created with the default base', async () => {
      new Client(key);
      expect(apiMock).toHaveBeenCalledWith('https://pay.ponchopay.com/');
    });

    it('ensures the api is created with the given base', async () => {
      new Client(key, base);
      expect(apiMock).toHaveBeenCalledWith(base);
    });
  });

  describe('initiatePayment', () => {
    const token = 'ytfBNCiHCbU/WdEZ1yEB60DsMpgD7VgR0SSqgJhj0mY=';
    const defaults = { metadata: 'order-1234', urn, amount: 1234, email };

    it('initiates a new payment', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      await expect(client.initiatePayment(defaults)).resolves.toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/initiate',
        {},
        serialise({ ...defaults, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a payment with a note', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      const data = {
        ...defaults,
        note: "Here's your dough, now go have some fun-dough",
      };
      await expect(client.initiatePayment(data)).resolves.toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/initiate',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a payment with an expiry date', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      const data = { ...defaults, expiry: '2025-04-03T12:57:16.000Z' } as const;
      await expect(client.initiatePayment(data)).resolves.toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/initiate',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a payment with a minimum card amount constraint', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      const data = { ...defaults, constraints: { minimum_card_amount: 123 } };
      await expect(client.initiatePayment(data)).resolves.toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/initiate',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('fails if the response from the server is not a redirect', async () => {
      const response = new Response('all good?', { status: 200 });
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      await expect(client.initiatePayment(defaults)).rejects.toBeInstanceOf(
        PPError,
      );
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/initiate',
        {},
        serialise({ ...defaults, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('initiateSubscription', () => {
    const token = 'Axii0jwfzrkfh57WttOCi3qi+icnUC2dFKtre3b4pM4=';
    const defaults = {
      urn,
      amount: 1234,
      metadata: 'subscription-1234',
      email,
      repetition: {
        granularity: 'weekly',
        period: 2,
        weekdays: new Set([Weekday.Tuesday, Weekday.Friday]),
      },
    } as const;

    it('initiates a new subscription', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);
      const subscription = await client.initiateSubscription(defaults);

      expect(subscription).toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/subscription',
        {},
        serialise({ ...defaults, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a new subscription with a note', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const data = {
        ...defaults,
        note: "Here's your dough, now go have some fun-dough",
      };

      const client = new Client(key);
      const subscription = await client.initiateSubscription(data);

      expect(subscription).toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/subscription',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a new subscription with an ending', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const data = {
        ...defaults,
        ending: { condition: 'date', date: '2024-01-16T11:13:20.000Z' },
      } as const;

      const client = new Client(key);
      const subscription = await client.initiateSubscription(data);

      expect(subscription).toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/subscription',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('initiates a new subscription with an additional one time payment', async () => {
      const response = Response.redirect(location, 302);
      makePostRequestMock.mockResolvedValueOnce(response);

      const data = {
        ...defaults,
        additional_one_time_payment: {
          amount: 678,
          metadata: 'order-5678',
        },
      } as const;

      const client = new Client(key);
      const subscription = await client.initiateSubscription(data);

      expect(subscription).toBe(location);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/subscription',
        {},
        serialise({ ...data, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });

    it('fails if the response from the server is not a redirect', async () => {
      const response = new Response('all good?', { status: 200 });
      makePostRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);

      await expect(
        client.initiateSubscription(defaults),
      ).rejects.toBeInstanceOf(PPError);
      expect(makePostRequestMock).toHaveBeenCalledWith(
        '/api/integration/generic/subscription',
        {},
        serialise({ ...defaults, token }),
      );
      expect(makePutRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('updatePaymentMethod', () => {
    it('updates a payment method', async () => {
      const response = new Response(undefined, { status: 204 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const data = { type: PaymentMethodType.Card, amount: 234 };

      const client = new Client(key);
      await client.updatePaymentMethod('cb35f971', { ...data, urn, email });

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment-method/cb35f971',
        { Authorization: authorization },
        serialise(data),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });

    it('updates a payment method with a voucher provider', async () => {
      const response = new Response(undefined, { status: 204 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const data = {
        type: PaymentMethodType.ChildcareVouchers,
        amount: 234,
        voucher_provider: 'fun_for_kids',
      };

      const client = new Client(key);
      await client.updatePaymentMethod('cb35f971', { ...data, urn, email });

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment-method/cb35f971',
        { Authorization: authorization },
        serialise(data),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });

    it('fails if the response from the server is not satisfactory', async () => {
      const response = new Response('all good?', { status: 200 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const data = { type: PaymentMethodType.Card, amount: 234 };

      const client = new Client(key);
      await expect(
        client.updatePaymentMethod('cb35f971', { ...data, urn, email }),
      ).rejects.toBeInstanceOf(PPError);

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment-method/cb35f971',
        { Authorization: authorization },
        serialise(data),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('refundPaymentMethod', () => {
    it('refunds a payment method', async () => {
      const response = new Response(undefined, { status: 204 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const data = { amount: 234 };

      const client = new Client(key);
      await client.refundPaymentMethod('cb35f971', { ...data, urn, email });

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment-method/cb35f971/refund',
        { Authorization: authorization },
        serialise(data),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });

    it('fails if the response from the server is not satisfactory', async () => {
      const response = new Response('all good?', { status: 200 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const data = { amount: 234 };

      const client = new Client(key);
      await expect(
        client.refundPaymentMethod('cb35f971', { ...data, urn, email }),
      ).rejects.toBeInstanceOf(PPError);

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment-method/cb35f971/refund',
        { Authorization: authorization },
        serialise(data),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });
  });

  describe('cancelPayment', () => {
    it('cancels a payment', async () => {
      const response = new Response(undefined, { status: 204 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);
      await client.cancelPayment('d34e567a', { urn, email });

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment/d34e567a/cancel',
        { Authorization: authorization },
        serialise({}),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });

    it('fails if the response from the server is not satisfactory', async () => {
      const response = new Response('all good?', { status: 200 });
      makePutRequestMock.mockResolvedValueOnce(response);

      const client = new Client(key);
      await expect(
        client.cancelPayment('d34e567a', { urn, email }),
      ).rejects.toBeInstanceOf(PPError);

      expect(makePutRequestMock).toHaveBeenCalledWith(
        '/api/payment/d34e567a/cancel',
        { Authorization: authorization },
        serialise({}),
      );
      expect(makePostRequestMock).not.toHaveBeenCalled();
    });
  });
});
