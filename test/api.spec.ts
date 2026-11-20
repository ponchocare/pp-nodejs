import { describe, it, expect, beforeEach, vi } from 'vitest';

const fetchMock = vi.hoisted(() => vi.fn());
vi.mock('node-fetch', () => ({ default: fetchMock }));

import { Api } from '../src/api';
import { serialise } from '../src/utils';

const path = '/endpoint/path';
const body = serialise({ payment: '9207f21a', amount: 123 });

beforeEach(() => fetchMock.mockClear());

describe.each([
  { name: 'Without additional headers', headers: undefined },
  { name: 'With additional headers', headers: { 'x-extra': 'header' } },
])('Api ($name)', ({ headers }) => {
  describe.each([
    { method: 'get', fn: 'makeGetRequest' },
    { method: 'post', fn: 'makePostRequest' },
    { method: 'put', fn: 'makePutRequest' },
  ])('$fn', ({ method, fn }) => {
    it('sends a request', async () => {
      const mockedResponse = new Response('response', { status: 200 });
      fetchMock.mockResolvedValueOnce(mockedResponse);

      const api = new Api('https://base.url', headers);
      const expectedResponse = await api[fn](
        path,
        { 'Accept-Language': 'en' },
        body,
      );

      expect(expectedResponse).toBe(mockedResponse);
      expect(fetchMock).toHaveBeenCalledWith(`https://base.url${path}`, {
        method,
        headers: {
          ...(headers ?? {}),
          'Accept-Language': 'en',
          'content-type': 'application/json',
          'x-telemetry': expect.any(String),
        },
        body: method === 'get' ? undefined : body,
        redirect: 'manual',
      });
    });
  });
});
