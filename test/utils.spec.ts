import { describe, expect, it } from 'vitest';
import {
  deserialise,
  joinPaths,
  replaceParams,
  serialise,
  sha256,
  sha256Hmac,
  telemetry,
} from '../src/utils';
import { PPError } from '../src/error';

describe('sha256', () => {
  it('calculates the SHA256 hash of some string', () => {
    expect(sha256('hello')).toBe(
      'LPJNul+wow4m6DsqxbninhsWHlwfp0JecwQzYpOLmCQ=',
    );
  });
});

describe('sha256Hmac', () => {
  it('calculates the HMAC SHA256 hash of some string', () => {
    expect(sha256Hmac('secret', 'hello')).toBe(
      'iKqz7ejTrflNJquQ07r9SiCDBww7zOnAFO4EpEOEfAs=',
    );
  });
});

describe('joinPaths', () => {
  it('joins two paths adding a forward slash in the middle', () => {
    const result = joinPaths('left/path', 'right/path');
    expect(result).toBe('left/path/right/path');
  });

  it('joins two paths sanitising the left path first', () => {
    const result = joinPaths('left/path///', 'right/path');
    expect(result).toBe('left/path/right/path');
  });

  it('joins two paths sanitising the right path first', () => {
    const result = joinPaths('left/path', '///right/path');
    expect(result).toBe('left/path/right/path');
  });
});

describe('serialise', () => {
  it('stringifies a record with strings', () => {
    expect(serialise({ key: 'value' })).toBe('{"key":"value"}');
  });

  it('stringifies a record with numbers', () => {
    expect(serialise({ key: 123 })).toBe('{"key":123}');
  });

  it('stringifies a record with dates', () => {
    const now = new Date();
    expect(serialise({ key: now })).toBe(`{"key":"${now.toISOString()}"}`);
  });

  it('stringifies a record with sets', () => {
    const list = new Set(['value1', 'value2']);
    expect(serialise({ key: list })).toBe(`{"key":["value1","value2"]}`);
  });

  it('stringifies a record with arrays', () => {
    const list = ['value1', 'value2'];
    expect(serialise({ key: list })).toBe(`{"key":["value1","value2"]}`);
  });

  it('stringifies a record with sub-records', () => {
    const record = { more: 'values' };
    expect(serialise({ key: record })).toBe('{"key":{"more":"values"}}');
  });

  it('stringifies an array of objects', () => {
    const array_of_objects = [
      { key1: 'value 1', key2: 1000, key3: 1 },
      { key1: 'value 2', key2: 234, key3: 1 },
    ];
    expect(serialise({ array_of_objects })).toBe(
      '{"array_of_objects":[{"key1":"value 1","key2":1000,"key3":1},{"key1":"value 2","key2":234,"key3":1}]}',
    );
  });

  it('stringifies an empty record as an empty string', () => {
    expect(serialise({})).toBe('');
  });
});

describe('deserialise', () => {
  it('deserialises a JSON string representing an object', () => {
    expect(deserialise('{"key":"value"}')).toEqual({ key: 'value' });
  });

  it('throws an error for invalid JSON strings', () => {
    expect(() => deserialise('{abc}')).toThrowError(PPError);
  });

  it('throws an error if the deserialised data is not an object', () => {
    expect(() => deserialise('[1,2,3]')).toThrowError(PPError);
  });
});

describe('replaceParams', () => {
  it('returns the same value if no parameters are found', () => {
    const result = replaceParams('this is the haystack', { param: 'value' });
    expect(result).toBe('this is the haystack');
  });

  it('returns the value with the only parameter replaced', () => {
    const result = replaceParams('this [is] the haystack', { is: 'was' });
    expect(result).toBe('this was the haystack');
  });

  it('returns the value with the only parameter replaced multiple times', () => {
    const result = replaceParams('th[is] [is] the haystack', { is: 'was' });
    expect(result).toBe('thwas was the haystack');
  });

  it('returns the value with multiple different parameters replaced', () => {
    const result = replaceParams('this [is] [the] haystack', {
      is: 'was',
      the: 'a',
    });
    expect(result).toBe('this was a haystack');
  });

  it('returns the value with the unexisting paramaters removed', () => {
    const result = replaceParams('[this is ]the haystack', {});
    expect(result).toBe('the haystack');
  });
});

describe('telemetry', () => {
  it('returns some anonymous environment parameters for service improvement', () => {
    expect(telemetry()).toStrictEqual({
      package: expect.any(Object),
      environment: expect.any(Object),
    });
  });
});
