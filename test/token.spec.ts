import { describe, expect, it } from 'vitest';
import { createToken } from '../src';

describe('createToken', () => {
  it('generates a token from a key and metadata', () => {
    expect(createToken('key', 'metadata')).toBe(
      'QUYCI7s3sDpIYvVcKojrKpQWZt+u3pp7O7E4Rdu+G1w=',
    );
  });
});
