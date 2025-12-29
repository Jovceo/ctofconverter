import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useLightTranslation(translations: any, locale: string) {
    const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
        // Helper to process value
        const processValue = (val: any) => {
            if (typeof val === 'string' && replacements) {
                let result = val;
                Object.keys(replacements).forEach((k) => {
                    result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(replacements[k]));
                });
                return result;
            }
            return val;
        };

        const keys = key.split('.');
        let value = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Return key if not found
            }
        }

        return processValue(value);
    }, [translations]);

    return { t, locale };
}
