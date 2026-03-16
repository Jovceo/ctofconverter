import { createContext } from 'react';

export interface AlternateLanguageLink {
  href: string;
  hreflang: string;
  locale?: string;
}

export const AlternateLanguageLinksContext = createContext<AlternateLanguageLink[]>([]);
