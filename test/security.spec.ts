import { describe, expect, it } from 'vitest';
import { createToken, createJWT } from '../src';
import { jwtVerify } from 'jose';
import { serialise } from '../src/utils';
import { isValidCallback, parseCallback } from '../src/security';
import { PPError } from '../src/error';

const urn = 'IUXfYEwc';
const key = 'oIUjW4n39vKZXpNQJQALbEW9oQ69GUVmOx43J/+/o6SHLlM9kCAkgM0bdd9WjoX9';
const email = 'help@ponchopay.com';
const hashedKey = 'nmlPGFX7EQ0kI16vPP0GUZUL9I2ZfR2ebZtam0ZB36U=';
const metadata = serialise({ order: '7ee5422c' });
const data = serialise({ amount: 123 });

describe('createToken', () => {
  it('generates a token from a key and metadata', () => {
    expect(createToken(key, metadata)).toBe(
      'M1p0UAdLLxavwVrmfRStkSvAxwzpMGjpxFjVdxBquFc=',
    );
  });
});

describe('createJWT', () => {
  it('generates a jwt from a urn, key, email, and data', async () => {
    const jwt = await createJWT(urn, key, email, data);
    const payload = await jwtVerify(jwt, Buffer.from(hashedKey, 'base64'));

    expect(payload).toStrictEqual({
      protectedHeader: { alg: 'HS256' },
      payload: {
        email,
        exp: expect.any(Number),
        iat: expect.any(Number),
        sig: 'gy94YzQircdzlf5hIcYBZnddVWQfjp9sBYTe/LuoyQc=',
        urn,
      },
    });
  });
});

describe('isValidCallback', () => {
  it('validates a callback with the integration key', async () => {
    const request = new Request('http://server/endpoint', {
      method: 'post',
      headers: { signature: 'XUdedl8SQDqWNuxXvAkSAsXQ7nIzOwPg_f_De0PS2yM' },
      body: '{some data}',
    });

    await expect(isValidCallback(key, request)).resolves.toBe(true);
  });

  it('does not validate a callback if the signature header is not set', async () => {
    const request = new Request('http://server/endpoint', {
      method: 'post',
      body: '{some data}',
    });

    await expect(isValidCallback(key, request)).resolves.toBe(false);
  });
});

describe('parseCallback', () => {
  it('parses a callback with the integration key', async () => {
    const request = new Request('http://server/endpoint', {
      method: 'post',
      headers: { signature: 'jbkD742hUPr8KhPmecQLqgDacPoQ8RKkmjp-Un8scM0' },
      body: '{"payment":1234}',
    });

    await expect(parseCallback(key, request)).resolves.toStrictEqual({
      payment: 1234,
    });
  });

  it('throws an error is the callback is invalid', async () => {
    const request = new Request('http://server/endpoint', {
      method: 'post',
      headers: { signature: 'invalid' },
      body: '{"payment":1234}',
    });

    await expect(parseCallback(key, request)).rejects.toThrowError(PPError);
  });
});
