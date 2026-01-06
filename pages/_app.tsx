import type { AppProps } from 'next/app';
import '../styles/globals.css';

import Analytics from '../components/Analytics';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Analytics />
      <Component {...pageProps} />
    </>
  );
}

