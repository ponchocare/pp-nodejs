import { SignJWT } from 'jose';
import { sha256 } from './utils';
import { createHash } from 'node:crypto';

/**
 * Creates a token for initialisation endpoints.
 */
export function createToken(key: string, metadata: string): string {
  return sha256(`${metadata}.${key}`);
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
  return await new SignJWT({ urn, email, sig: sha256(data) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5s')
    .sign(createHash('sha256').update(key).digest());
}
