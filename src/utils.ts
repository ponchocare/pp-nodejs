type SerialisableValue =
  | string
  | number
  | Date
  | Set<SerialisableValue>
  | SerialisableValue[]
  | { [key: string]: SerialisableValue };

export type Serialisable = Record<string, SerialisableValue>;

/**
 * Clears the start of the string from any matching character
 */
function trimStart(haystack: string, needle: string): string {
  const regex = new RegExp(`^[${needle}]+`);
  return haystack.replace(regex, '');
}

/**
 * Clears the end of the string from any matching character
 */
function trimEnd(haystack: string, needle: string): string {
  const regex = new RegExp(`[${needle}]+$`);
  return haystack.replace(regex, '');
}

/**
 * Joins two paths with a single forward slash in the middle
 */
export function joinPaths(left: string, right: string): string {
  return trimEnd(left, '/') + '/' + trimStart(right, '/');
}

/**
 * Ensures the value will be serialised correctly
 */
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

/**
 * JSON-stringifies a record.
 *
 * This method enforces the following rules:
 * - If the record does not have key/value pairs, it returns empty string
 * - Any Set is flatten out to a simple array
 */
export function serialise(data: Serialisable): string {
  if (Object.keys(data).length === 0) {
    return '';
  }

  return JSON.stringify(prepareForSerialisation(data));
}

/**
 * Replaces any occurrence of [param] in the haystack with the corresponding value from params
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
 * Returns some anonymous environment parameters.
 * Those values are used to improve the service.
 */
export function telemetry(): Record<string, SerialisableValue> {
  const { arch, platform, version } = process;

  return {
    package: { vendor: 'poncho', name: '##NAME##', version: '##VERSION##' },
    environment: { runtime: 'nodejs', arch, platform, version },
  };
}
