import { describe, expect, it } from 'vitest';
import { joinPaths, replaceParams, serialise, telemetry } from '../src/utils';

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

  it('stringifies an empty record as an empty string', () => {
    expect(serialise({})).toBe('');
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
