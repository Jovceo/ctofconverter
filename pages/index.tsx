import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Converter from '../components/Converter';
import ReferenceSection from '../components/ReferenceSection';
import PracticalScenarios from '../components/PracticalScenarios';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import Head from 'next/head';
import Link from 'next/link';
import { useTranslation } from '../utils/i18n';

export default function Home() {
  const { t, pageTranslation, common } = useTranslation('home');
  const homeMeta = pageTranslation?.meta || {};
  const commonMeta = common?.meta || {};

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: homeMeta.title || commonMeta.defaultTitle || 'Celsius to Fahrenheit Converter',
    url: 'https://ctofconverter.com/',
    description:
      homeMeta.description ||
      commonMeta.defaultDescription ||
      'Free online tool to convert temperatures from Celsius to Fahrenheit with detailed calculation steps',
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
    <Layout>
      <Head>
        <title>{homeMeta.title || commonMeta.defaultTitle || 'Celsius to Fahrenheit Converter'}</title>
        <meta
          name="description"
          content={
            homeMeta.description ||
            commonMeta.defaultDescription ||
            'Free online tool to convert temperatures from Celsius to Fahrenheit.'
          }
        />
        <meta
          property="og:title"
          content={homeMeta.ogTitle || homeMeta.title || commonMeta.ogTitle || commonMeta.defaultTitle}
        />
        <meta
          property="og:description"
          content={
            homeMeta.ogDescription ||
            homeMeta.description ||
            commonMeta.ogDescription ||
            commonMeta.defaultDescription
          }
        />
        <meta
          name="twitter:title"
          content={
            homeMeta.twitterTitle ||
            homeMeta.title ||
            commonMeta.twitterTitle ||
            commonMeta.defaultTitle
          }
        />
        <meta
          name="twitter:description"
          content={
            homeMeta.twitterDescription ||
            homeMeta.description ||
            commonMeta.twitterDescription ||
            commonMeta.defaultDescription
          }
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <Header />
      <Navigation />
      <main id="main-content" className="container">
        <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li>
              <Link href="https://ctofconverter.com">{t('breadcrumb.home')}</Link>
            </li>
            <li aria-current="page">{pageTranslation?.breadcrumb?.current || 'Celsius to Fahrenheit'}</li>
          </ol>
        </nav>

        <Converter />
        <ReferenceSection />
        <PracticalScenarios />
        <FAQSection />
      </main>
      <Footer />
      <Analytics />
    </Layout>
  );
}

