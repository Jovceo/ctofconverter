export type TranslationDictionary = Record<string, any>;

function getNestedValue(dictionary: TranslationDictionary | null | undefined, key: string) {
  if (!dictionary) return undefined;

  let value: any = dictionary;
  for (const segment of key.split('.')) {
    if (value && typeof value === 'object' && segment in value) {
      value = value[segment];
      continue;
    }
    return undefined;
  }

  return value;
}

export function replacePlaceholders(
  text: string,
  replacements: Record<string, string | number>
): string {
  let result = text;

  Object.keys(replacements).forEach((key) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(replacements[key]));
  });

  return result;
}

export function createTranslator({
  locale,
  common,
  page,
}: {
  locale: string;
  common: TranslationDictionary;
  page?: TranslationDictionary | null;
}) {
  return {
    locale,
    common,
    pageTranslation: page || null,
    t: (key: string, replacements?: Record<string, string | number>) => {
      const isCommonKey = key.startsWith('common:');
      const lookupKey = isCommonKey ? key.slice('common:'.length) : key;

      const rawValue = !isCommonKey
        ? getNestedValue(page || null, lookupKey) ?? getNestedValue(common, lookupKey)
        : getNestedValue(common, lookupKey);

      if (rawValue === null || rawValue === undefined) {
        return key;
      }

      if (typeof rawValue === 'string' && replacements) {
        return replacePlaceholders(rawValue, replacements);
      }

      return rawValue;
    },
  };
}
