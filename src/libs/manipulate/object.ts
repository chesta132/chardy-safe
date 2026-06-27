/** Returns a new object with only the specified keys. */
export const pick = <T extends Record<string, any>, Z extends (keyof T)[] = []>(
  data: T,
  picks?: Z
): Pick<T, Z[number]> => {
  const result = { ...data };
  if (picks) {
    for (const key of Object.keys(result)) {
      if (!picks.includes(key as keyof object)) delete result[key as keyof object];
    }
  }
  return result;
};

/** Returns a new object with the specified keys removed. */
export const omit = <T extends Record<string, any>, Z extends (keyof T)[] = []>(
  data: T,
  omits?: Z
): Omit<T, Z[number]> => {
  const result = { ...data };
  if (omits) {
    for (const key of omits) delete result[key];
  }
  return result;
};

/**
 * Creates an object from an array of keys (or an existing object's keys),
 * with all values set to a fixed value.
 *
 * @example
 * record(['foo', 'bar'], 0)      // { foo: 0, bar: 0 }
 * record({ foo: 1, bar: 'y' }, false) // { foo: false, bar: false }
 */
export function record<K extends string, Z>(data: Record<K, any> | K[], value: Z): Record<K, Z> {
  if (Array.isArray(data)) {
    const result = {} as Record<(typeof data)[number], Z>;
    data.forEach((k) => (result[k] = value));
    return result;
  } else {
    const result = { ...data } as Record<string, any>;
    Object.keys(result).forEach((key) => (result[key] = value));
    return result;
  }
}
