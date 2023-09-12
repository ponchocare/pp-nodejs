import { createHash } from 'node:crypto';

export function createToken(key: string, metadata: string): string {
  return createHash('sha256')
    .update(`${metadata}.${key}`)
    .digest()
    .toString('base64');
}
