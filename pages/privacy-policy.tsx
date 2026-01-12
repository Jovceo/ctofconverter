import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
// import { useRouter } from 'next/router'; // removed unused import // removed unused import
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';

interface PrivacyPolicyProps {
    title: string;
    description: string;
    content: string; // HTML string
    homeText: string;
    logoText: string;
    locale: string;
}

export default function PrivacyPolicy({ title, description, content, homeText, logoText, locale }: PrivacyPolicyProps) {
    return (
        <Layout
            seo={{
                title: `${title} - C to F Converter`,
                description,
            }}
        >
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

                <Footer />
            </div>

            <style jsx>{`
                .breadcrumb { margin: 1rem 0; font-size: 0.9rem; }
                .breadcrumb a { color: #3182ce; text-decoration: none; }
                .legal-content {
                    padding: 2rem 0;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .legal-content h2 {
                    margin-top: 3rem;
                    color: #2c3e50;
                    border-bottom: 2px solid #edf2f7;
                    padding-bottom: 0.5rem;
                    font-size: 1.5rem;
                    margin-bottom: 1.5rem;
                }
                .legal-content h3 {
                    margin-top: 2rem;
                    color: #4a5568;
                    font-size: 1.25rem;
                    margin-bottom: 1rem;
                }
                .legal-content h4 {
                    margin-top: 1.5rem;
                    color: #4a5568;
                    font-size: 1.1rem;
                    margin-bottom: 0.75rem;
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

// ---------- 数据获取 ----------
// getStaticPaths removed because this page is not dynamic. Locale is provided via context in getStaticProps.

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    const loc = locale || 'en';
    const path = require('path');
    const fs = require('fs');
    const jsonPath = path.join(process.cwd(), 'public', 'locales', loc, 'privacy-policy.json');
    const commonPath = path.join(process.cwd(), 'locales', loc, 'common.json');

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const data = JSON.parse(raw);

    const commonRaw = fs.readFileSync(commonPath, 'utf-8');
    const commonData = JSON.parse(commonRaw);
    const homeText = commonData.nav?.home || 'Home';
    const logoText = commonData.nav?.logoText || 'Celsius to Fahrenheit Converter';

    return {
        props: {
            title: data.title,
            description: data.description,
            content: data.content,
            homeText,
            logoText,
            locale: loc,
        },
    };
};
