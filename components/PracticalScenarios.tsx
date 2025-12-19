import { useTranslation } from '../utils/i18n';

export default function PracticalScenarios() {
  const { pageTranslation } = useTranslation('home');
  const practical = pageTranslation?.practical;

  if (!practical) {
    return null;
  }

  return (
    <section className="formula-section" role="region" aria-labelledby="practical-title">
      <h2 id="practical-title">{practical.title}</h2>
      <div className="practical-uses">
        {practical.items.map((item: { title: string; description: string; bullets: string[] }, index: number) => (
          <div className="use-case" key={index}>
            <div className="use-case-header">{item.title}</div>
            <div className="use-case-body">
              <p>{item.description}</p>
              <ul className="use-case-examples">
                {item.bullets.map((bullet: string, bulletIndex: number) => (
                  <li key={bulletIndex}>
                    <span dangerouslySetInnerHTML={{ __html: bullet }} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

