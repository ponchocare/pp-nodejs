import { describe, it, expect, beforeEach, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('node-fetch', () => ({ default: fetchMock }));

import { Api } from '../src/api';
import { serialise } from '../src/utils';

const prod = 'pay.ponchopay.com';
const demo = 'demo.ponchopay.com';
const path = '/endpoint/path';
const headers = { 'Accept-Language': 'en' };
const body = serialise({ payment: '9207f21a', amount: 123 });

describe.each([
  { base: undefined, expected: prod, description: 'default base' },
  { base: `https://${demo}/`, expected: demo, description: 'demo url' },
])('Api (With $description)', async ({ base, expected }) => {
  beforeEach(() => fetchMock.mockClear());

  describe.each([
    { method: 'post', fn: 'makePostRequest' },
    { method: 'put', fn: 'makePutRequest' },
  ])('$fn', ({ method, fn }) => {
    it('sends a request', async () => {
      const mockedResponse = new Response('response', { status: 200 });
      fetchMock.mockResolvedValueOnce(mockedResponse);

      const api = new Api(base);
      const expectedResponse = await api[fn](path, headers, body);

      expect(expectedResponse).toBe(mockedResponse);
      expect(fetchMock).toHaveBeenCalledWith(`https://${expected}${path}`, {
        method,
        headers: {
          'Accept-Language': 'en',
          'content-type': 'application/json',
          'x-telemetry': expect.any(String),
        },
        body,
        redirect: 'manual',
      });
    });
  });
});
