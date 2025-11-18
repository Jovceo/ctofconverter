import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Converter from '../components/Converter';
import ReferenceSection from '../components/ReferenceSection';
import PracticalScenarios from '../components/PracticalScenarios';
import FAQSection from '../components/FAQSection';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';

export default function Home() {
  return (
    <Layout>
      <Header />
      <Navigation />
      <main id="main-content" className="container">
        <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li>
              <a href="https://ctofconverter.com">Home</a>
            </li>
            <li aria-current="page">Celsius to Fahrenheit</li>
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

