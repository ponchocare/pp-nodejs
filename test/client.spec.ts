import { describe, it, expect, beforeEach, vi } from 'vitest';

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));
vi.mock('node-fetch', () => ({ default: fetchMock }));

import { Client } from '../src';
import { PPError } from '../src/error';

const token = 'KxS2N+iLo3WCgBbPN8sAEUUaA2jNOLuVG/kkkqQrBI4=';
const defaults = {
  metadata: 'order-1234',
  urn: 'URN1234',
  amount: 1234,
  email: 'some@guy.com',
};

describe('Client', async () => {
  const Response = (
    await vi.importActual<typeof import('node-fetch')>('node-fetch')
  ).Response;

  beforeEach(() => fetchMock.mockClear());

  describe('initiatePayment', () => {
    it('requests a url for a payment', async () => {
      const url = 'http://some/url';
      const client = new Client('key');

      fetchMock.mockResolvedValueOnce(Response.redirect(url, 302));
      expect(await client.initiatePayment(defaults)).toBe(url);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://pay.ponchopay.com/api/integration/generic/initiate',
        {
          body: JSON.stringify({ ...defaults, token }),
          headers: { 'content-type': 'application/json' },
          method: 'post',
          redirect: 'manual',
        },
      );
    });

    it('requests a url for a payment on another server', async () => {
      const url = 'http://some/url';
      const client = new Client('key', 'https://other.server/');

      fetchMock.mockResolvedValueOnce(Response.redirect(url, 302));
      expect(await client.initiatePayment(defaults)).toBe(url);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://other.server/api/integration/generic/initiate',
        {
          body: JSON.stringify({ ...defaults, token }),
          headers: { 'content-type': 'application/json' },
          method: 'post',
          redirect: 'manual',
        },
      );
    });

    it('requests a url for a payment with a note', async () => {
      const url = 'http://some/url';
      const init = {
        ...defaults,
        note: "Here's your dough, now go have some fun-dough",
      };
      const client = new Client('key');

      fetchMock.mockResolvedValueOnce(Response.redirect(url, 302));
      expect(await client.initiatePayment(init)).toBe(url);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://pay.ponchopay.com/api/integration/generic/initiate',
        {
          body: JSON.stringify({ ...init, token }),
          headers: { 'content-type': 'application/json' },
          method: 'post',
          redirect: 'manual',
        },
      );
    });

    it.each([
      [new Date(1705403600000), '2024-01-16T11:13:20.000Z'],
      ['some string', 'some string'],
    ])(
      'requests a url for a payment with an expiry date',
      async (sending, sent) => {
        const url = 'http://some/url';
        const init = {
          ...defaults,
          expiry: sending,
        };
        const client = new Client('key');

        fetchMock.mockResolvedValueOnce(Response.redirect(url, 302));
        expect(await client.initiatePayment(init)).toBe(url);
        expect(fetchMock).toHaveBeenCalledWith(
          'https://pay.ponchopay.com/api/integration/generic/initiate',
          {
            body: JSON.stringify({ ...init, expiry: sent, token }),
            headers: { 'content-type': 'application/json' },
            method: 'post',
            redirect: 'manual',
          },
        );
      },
    );

    it('fails if the response from the server is not a redirect', async () => {
      const client = new Client('key');

      fetchMock.mockResolvedValueOnce(
        new Response('all good?', { status: 200 }),
      );
      expect(client.initiatePayment(defaults)).rejects.toBeInstanceOf(PPError);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://pay.ponchopay.com/api/integration/generic/initiate',
        {
          body: JSON.stringify({ ...defaults, token }),
          headers: { 'content-type': 'application/json' },
          method: 'post',
          redirect: 'manual',
        },
      );
    });
  });
});
