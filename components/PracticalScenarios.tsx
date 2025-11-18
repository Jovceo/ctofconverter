export default function PracticalScenarios() {
  return (
    <section className="formula-section" role="region" aria-labelledby="practical-title">
      <h2 id="practical-title">Practical Scenarios for Celsius to Fahrenheit Conversion</h2>
      <div className="practical-uses">
        <div className="use-case">
          <div className="use-case-header">Cooking</div>
          <div className="use-case-body">
            <p>
              Oven temperature settings, recipe temperature conversions, controlling temperatures
              for melting sugar syrups and chocolate.
            </p>
            <ul className="use-case-examples">
              <li>
                <strong>Baking temperature:</strong> 180°C = 356°F (standard baking temperature)
              </li>
              <li>
                <strong>Low temperature cooking:</strong> 65°C = 149°F (ideal temperature for slow
                cooking meat)
              </li>
              <li>
                <strong>Chocolate melting:</strong> 45°C = 113°F (avoid overheating chocolate)
              </li>
            </ul>
          </div>
        </div>

        <div className="use-case">
          <div className="use-case-header">Weather Forecast</div>
          <div className="use-case-body">
            <p>
              Understanding local temperatures during international travel, adapting to different
              countries&apos; weather reporting systems.
            </p>
            <ul className="use-case-examples">
              <li>
                <strong>Summer comfort temperature:</strong> 22-26°C = 72-79°F
              </li>
              <li>
                <strong>Winter indoor temperature:</strong> 20-22°C = 68-72°F
              </li>
              <li>
                <strong>Heat wave warning:</strong> &gt;35°C = &gt;95°F (temperature at which most
                countries issue heat wave warnings)
              </li>
            </ul>
          </div>
        </div>

        <div className="use-case">
          <div className="use-case-header">Medical</div>
          <div className="use-case-body">
            <p>
              Body temperature monitoring, medical equipment temperature conversion, medication
              storage temperature requirements.
            </p>
            <ul className="use-case-examples">
              <li>
                <strong>Normal body temperature:</strong> 36.5-37.5°C = 97.7-99.5°F
              </li>
              <li>
                <strong>Fever:</strong> &gt;38°C = &gt;100.4°F
              </li>
              <li>
                <strong>Hypothermia risk:</strong> &lt;35°C = &lt;95°F
              </li>
            </ul>
          </div>
        </div>

        <div className="use-case">
          <div className="use-case-header">Scientific Research</div>
          <div className="use-case-body">
            <p>
              Laboratory temperature control, temperature unit conversion in scientific literature,
              international research collaboration.
            </p>
            <ul className="use-case-examples">
              <li>
                <strong>Laboratory standard temperature:</strong> 20-25°C = 68-77°F
              </li>
              <li>
                <strong>Freezer storage:</strong> -80°C = -112°F (long-term biological sample
                preservation)
              </li>
              <li>
                <strong>PCR reaction:</strong> 95°C = 203°F (DNA denaturation temperature)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

