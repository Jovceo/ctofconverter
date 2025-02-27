function convertToFahrenheit() {
  const celsius = parseFloat(document.getElementById('celsiusInput').value);
  const resultElement = document.getElementById('result');
  const converterTool = document.getElementById('converterTool');

  if (!isNaN(celsius)) {
    // Calculate Fahrenheit
    const fahrenheit = (celsius * 9 / 5) + 32;
    resultElement.innerText = `${celsius}°C = ${fahrenheit.toFixed(1)}°F`;

    // Generate dynamic link
    let formattedCelsius = celsius.toString();
    if (formattedCelsius.includes('-')) {
      formattedCelsius = formattedCelsius.replace('-', 'minus'); // Replace negative sign with "minus"
    }
    formattedCelsius = formattedCelsius.replace('.', '-'); // Replace decimal point with hyphen
    const link = `https://ctofconverter.com/${formattedCelsius}-c-to-f.html`;

    // Remove existing link if it exists
    const existingLink = document.getElementById('dynamicLink');
    if (existingLink) {
      existingLink.remove();
    }

    // Create and insert new link
    const dynamicLink = document.createElement('p');
    dynamicLink.id = 'dynamicLink';
    dynamicLink.innerHTML = `More about Convert: <a href="${link}" target="_blank">${celsius}°C</a>`;
    converterTool.appendChild(dynamicLink);
  } else {
    resultElement.innerText = "Please enter a valid number.";
    // Remove existing link if it exists
    const existingLink = document.getElementById('dynamicLink');
    if (existingLink) {
      existingLink.remove();
    }
  }
}