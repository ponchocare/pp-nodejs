import { createHash, createHmac } from 'node:crypto';
import { PPError } from './error';

type SerialisableValue =
  | string
  | number
  | Date
  | Set<SerialisableValue>
  | SerialisableValue[]
  | { [key: string]: SerialisableValue };

export type Serialisable = Record<string, SerialisableValue>;

/**
 * Generates a simple SHA256 hash for a given string.
 *
 * @param data the input data to hash
 *
 * @return the base64 encoded SHA256 hash
 */
export function sha256(data: string): string {
  return createHash('sha256').update(data).digest().toString('base64');
}

/**
 * Generates a HMAC-SHA256 hash using a secret key and the provided data.
 *
 * @param key  the secret key used for HMAC generation
 * @param data the data to generate the HMAC hash for
 *
 * @return the base64 encoded HMAC-SHA256 hash
 */
export function sha256Hmac(key: string, data: string): string {
  return createHmac('sha256', Buffer.from(key, 'utf8'))
    .update(data)
    .digest()
    .toString('base64');
}

/**
 * Joins two URL paths in a manner that correctly handles leading and trailing slashes.
 *
 * @param left  the initial part of the path
 * @param right the subsequent part of the path
 *
 * @return the correctly concatenated path
 */
export function joinPaths(left: string, right: string): string {
  const trimmedLeft = left.replace(new RegExp(`[/]+$`), '');
  const trimmedRight = right.replace(new RegExp(`^[/]+`), '');

  return `${trimmedLeft}/${trimmedRight}`;
}

/**
 * Serializes a data structure into a JSON string format. It handles serialization
 * of objects like Date by converting them to an ISO 8601 string.
 *
 * @param data the data to serialize
 *
 * @return the resulting JSON string
 */
export function serialise(data: Serialisable): string {
  function prepareForSerialisation(
    value: SerialisableValue,
  ): Exclude<SerialisableValue, Set<SerialisableValue>> {
    if (Array.isArray(value)) {
      return value.map(prepareForSerialisation);
    }

    if (value instanceof Set) {
      return prepareForSerialisation(Array.from(value));
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          prepareForSerialisation(item),
        ]),
      );
    }

    return value;
  }

  if (Object.keys(data).length === 0) {
    return '';
  }

  return JSON.stringify(prepareForSerialisation(data));
}

/**
 * Deserializes a JSON string into a PHP object, performing basic validation checks.
 *
 * @param data the JSON string to decode
 *
 * @return the resulting PHP object
 */
export function deserialise<T extends object>(data: string): T {
  let deserialised: T;
  try {
    deserialised = JSON.parse(data);
  } catch {
    throw new PPError('Unexpected JSON value.');
  }

  if (deserialised?.constructor === Object) {
    return deserialised;
  }

  throw new PPError('Unexpected JSON value.');
}

/**
 * Replaces placeholders in a path string (e.g., `[param]`) with actual values from an array.
 *
 * @param haystack the string containing placeholders
 * @param params   an associative array mapping placeholder names to replacement values
 *
 * @return string the path with all specified parameters correctly replaced
 */
export function replaceParams(
  haystack: string,
  params: Record<string, string>,
): string {
  return haystack.replaceAll(
    /\[([a-z ]+)\]/gi,
    (_, name) => params[name] ?? '',
  );
}

/**
 * Collects system and package version information to be used for telemetry tracking.
 *
 * @return an array containing package and environment details
 */
export function telemetry(): Record<string, SerialisableValue> {
  const { arch, platform, version } = process;

  return {
    package: { vendor: 'poncho', name: '##NAME##', version: '##VERSION##' },
    environment: { runtime: 'nodejs', arch, platform, version },
  };
}
