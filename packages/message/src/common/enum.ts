export interface EnumExt<E extends Record<string, string | number>> {
  Readable: (value: E[keyof E]) => keyof E;
}

export namespace Enum {
  export type KeyOf<E extends Record<string, any>> = Exclude<keyof E, keyof EnumExt<any>>;
}

export function Enum<E extends Record<Exclude<string, keyof EnumExt<any>>, string | number>>(
  name: string,
  record: E,
): E & EnumExt<E> {
  Object.defineProperty(record, 'name', {
    value: name,
    writable: false,
    configurable: false,
    enumerable: false,
  });

  // Readable
  const reversed = (Object.entries(record) as [keyof E, E[keyof E]][]).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {} as Record<E[keyof E], keyof E>,
  );
  Object.defineProperty(record, 'Readable', {
    value: (value: E[keyof E]) => reversed[value] || `${name}(${value})`,
    writable: false,
    configurable: false,
    enumerable: false,
  });

  return record as E & EnumExt<E>;
}
