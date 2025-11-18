import Head from 'next/head';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Celsius to Fahrenheit Converter',
    url: 'https://ctofconverter.com/',
    description: 'Free online tool to convert temperatures from Celsius to Fahrenheit with detailed calculation steps',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Celsius to Fahrenheit | °C to °F Converter</title>
        <meta
          name="description"
          content="Convert Celsius to Fahrenheit quickly with the C to F Converter. Get results instantly, learn the formula, and check the conversion chart."
        />
        <link rel="canonical" href="https://ctofconverter.com" />
        <meta name="author" content="Temperature Conversion Experts" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="https://ctofconverter.com/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://ctofconverter.com/apple-touch-icon.png" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Celsius to Fahrenheit Converter" />
        <meta
          property="og:description"
          content="Free Online Temperature Calculator for Instant Conversions. Instantly convert temperatures from Celsius (°C) to Fahrenheit (°F) with precise results and step-by-step details."
        />
        <meta property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta property="og:url" content="https://ctofconverter.com/" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Celsius to Fahrenheit Converter" />
        <meta
          name="twitter:description"
          content="Free Online Temperature Calculator for Instant Conversions. Instantly convert temperatures from Celsius (°C) to Fahrenheit (°F) with precise results and step-by-step details."
        />
        
        {/* Mobile */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="C to F Converter" />
        <meta name="theme-color" content="#3498db" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {children}
    </>
  );
}

