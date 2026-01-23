
import Link from 'next/link';
import Layout from '../components/Layout';

function Error({ statusCode }: { statusCode: number }) {
    return (
        <Layout
            seo={{
                title: "Error | C to F Converter",
                description: "An error occurred.",
                robots: "noindex, follow"
            }}
        >
            <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#e74c3c' }}>
                    {statusCode ? `Error ${statusCode}` : 'An error occurred'}
                </h1>
                <p style={{ marginBottom: '40px' }}>
                    {statusCode
                        ? `An error ${statusCode} occurred on server`
                        : 'An error occurred on client'}
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

Error.getInitialProps = ({ res, err }: any) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
