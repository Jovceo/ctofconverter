import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';
import path from 'path';
import fs from 'fs';

interface TermsOfServiceProps {
    title: string;
    description: string;
    content: string;
    homeText: string;
    logoText: string;
    locale: string;
    lastUpdatedIso: string;
}

export default function TermsOfService({ title, description, content, homeText, logoText, locale, lastUpdatedIso }: TermsOfServiceProps) {
    return (
        <Layout seo={{ title, description }}>
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'font-ar' : ''}>
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label={`${homeText} - ${logoText}`}>
                                <span aria-hidden="true">C to F Converter</span>
                                <span className="sr-only">{logoText}</span>
                            </Link>
                        </div>
                        <h1>{title}</h1>
                        <p className="tagline">{description}</p>
                    </div>
                </header>
                <Navigation />
                <main id="main-content">
                    <div className="container">
                        <div className="breadcrumb">
                            <Link href={getLocalizedLink('/', locale)}>{homeText}</Link> &gt; <span>{title}</span>
                        </div>
                        <article className="legal-content" dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </main>

                <Footer lastUpdated={lastUpdatedIso} />
            </div>

            <style jsx>{`
                .breadcrumb { margin: 1rem 0; font-size: 0.9rem; }
                .breadcrumb a { color: #3182ce; text-decoration: none; }
                .legal-content {
                    padding: 2rem 0;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .last-updated {
                    color: #718096;
                    font-style: italic;
                    margin-bottom: 2rem;
                }
                .legal-content h2 {
                    margin-top: 3rem;
                    color: #2c3e50;
                    border-bottom: 2px solid #edf2f7;
                    padding-bottom: 0.5rem;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .legal-content p {
                    line-height: 1.8;
                    color: #4a5568;
                    margin-bottom: 1.25rem;
                }
                .legal-content ul {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }
                .legal-content li {
                    margin-bottom: 0.75rem;
                    line-height: 1.6;
                    color: #4a5568;
                }
            `}</style>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    const loc = locale || 'en';
    const jsonPath = path.join(process.cwd(), 'public', 'locales', loc, 'terms-of-service.json');
    const commonPath = path.join(process.cwd(), 'locales', loc, 'common.json');

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    const commonRaw = fs.readFileSync(commonPath, 'utf-8');
    const commonData = JSON.parse(commonRaw);
    const homeText = commonData.nav?.home || 'Home';
    const logoText = commonData.nav?.logoText || 'Celsius to Fahrenheit Converter';

    const lastUpdatedIso = '2026-01-12';
    return {
        props: {
            title: data.title,
            description: data.description,
            content: data.content,
            homeText,
            logoText,
            locale: loc,
            lastUpdatedIso,
        },
    };
};
