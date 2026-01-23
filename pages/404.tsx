
import Link from 'next/link';
import Layout from '../components/Layout';
import { useTranslation } from '../utils/i18n';

export default function Custom404() {
    const { t, locale } = useTranslation();

    return (
        <Layout
            seo={{
                title: "Page Not Found | C to F Converter",
                description: "The page you are looking for does not exist.",
                robots: "noindex, follow"
            }}
        >
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#2c3e50' }}>404</h1>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#7f8c8d' }}>Page Not Found</h2>
                <p style={{ marginBottom: '40px' }}>
                    Oops! The page you are looking for might have been removed or renamed.
                </p>
                <Link href="/" className="btn" style={{
                    display: 'inline-block',
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '1.1rem'
                }}>
                    Go Home
                </Link>
            </div>
        </Layout>
    );
}
