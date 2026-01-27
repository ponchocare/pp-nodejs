import { SignJWT } from 'jose';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { PPError } from './error.js';

function sha256(data: string): Buffer {
  return createHash('sha256').update(data).digest();
}

function sha256Hmac(key: string, data: string): Buffer {
  return createHmac('sha256', Buffer.from(key, 'utf8')).update(data).digest();
}

/**
 * Creates a token for initialisation endpoints.
 */
export function createToken(key: string, metadata: string): string {
  return sha256(`${metadata}.${key}`).toString('base64');
}

/**
 * Creates a token for manipulation endpoints.
 */
export async function createJWT(
  urn: string,
  key: string,
  email: string,
  data: string,
): Promise<string> {
  return await new SignJWT({ urn, email, sig: sha256(data).toString('base64') })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5s')
    .sign(sha256(key));
}
