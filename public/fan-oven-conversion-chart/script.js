document.addEventListener('DOMContentLoaded', () => {

    // --- Conversion Calculator Logic ---
    const tempValueInput = document.getElementById('temp-value');
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    const convertBtn = document.getElementById('convert-btn');
    const resultValueDiv = document.getElementById('result-value');

    const conversionFactors = {
        // C-to-F and F-to-C is for general temperature, not oven-specific
        'c-to-f': (c) => (c * 9/5) + 32,
        'f-to-c': (f) => (f - 32) * 5/9,
        // The main oven conversion logic
        'conventional-to-fan-c': (c) => c - 20,
        'conventional-to-fan-f': (f) => f - 40,
        'conventional-c-to-gas': (c) => {
            const gasMarks = {
                120: 1/2, 140: 1, 150: 2, 160: 3, 180: 4,
                190: 5, 200: 6, 220: 7, 230: 8, 240: 9
            };
            const closest = Object.keys(gasMarks).reduce((prev, curr) => 
                Math.abs(curr - c) < Math.abs(prev - c) ? curr : prev
            );
            return gasMarks[closest];
        },
        'fan-c-to-gas': (c) => {
            const conventionalC = c + 20; // First convert fan back to conventional
            const gasMarks = {
                120: 1/2, 140: 1, 150: 2, 160: 3, 180: 4,
                190: 5, 200: 6, 220: 7, 230: 8, 240: 9
            };
            const closest = Object.keys(gasMarks).reduce((prev, curr) => 
                Math.abs(curr - conventionalC) < Math.abs(prev - conventionalC) ? curr : prev
            );
            return gasMarks[closest];
        },
        'gas-to-conventional-c': (gas) => {
            const gasToC = {'1/2': 120, '1': 140, '2': 150, '3': 160, '4': 180, '5': 190, '6': 200, '7': 220, '8': 230, '9': 240};
            return gasToC[gas] || 'Invalid Gas Mark';
        }
    };

    convertBtn.addEventListener('click', () => {
        let inputValue = parseFloat(tempValueInput.value);
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;
        let result = '--';

        if (isNaN(inputValue)) {
            resultValueDiv.textContent = 'Please enter a number.';
            return;
        }

        // Handle temperature conversions
        if (fromUnit === 'conventional' && toUnit === 'fan') {
            result = conversionFactors['conventional-to-fan-c'](inputValue);
        } else if (fromUnit === 'conventional-f' && toUnit === 'conventional-f') {
            result = inputValue; // Same unit, no conversion
        } else if (fromUnit === 'conventional-f' && toUnit === 'fan') {
            const conventionalC = conversionFactors['f-to-c'](inputValue);
            const fanC = conversionFactors['conventional-to-fan-c'](conventionalC);
            result = Math.round(conversionFactors['c-to-f'](fanC)); // Convert back to F
        } else if (fromUnit === 'fan' && toUnit === 'conventional') {
            result = inputValue + 20;
        } else if (fromUnit === 'fan' && toUnit === 'conventional-f') {
            const conventionalC = inputValue + 20;
            result = Math.round(conversionFactors['c-to-f'](conventionalC));
        } else if (fromUnit === 'conventional' && toUnit === 'conventional-f') {
            result = Math.round(conversionFactors['c-to-f'](inputValue));
        } else if (fromUnit === 'conventional-f' && toUnit === 'conventional') {
            result = Math.round(conversionFactors['f-to-c'](inputValue));
        } else if (fromUnit === 'gas') {
             const conventionalC = conversionFactors['gas-to-conventional-c'](inputValue.toString());
             if (toUnit === 'conventional') {
                 result = conventionalC;
             } else if (toUnit === 'fan') {
                 result = conversionFactors['conventional-to-fan-c'](conventionalC);
             } else if (toUnit === 'conventional-f') {
                 result = Math.round(conversionFactors['c-to-f'](conventionalC));
             }
        } else if (fromUnit === 'conventional' && toUnit === 'gas') {
            result = conversionFactors['conventional-c-to-gas'](inputValue);
        } else if (fromUnit === 'fan' && toUnit === 'gas') {
            result = conversionFactors['fan-c-to-gas'](inputValue);
        } else {
            result = inputValue; // Same unit, no conversion
        }

        // Format and display the result
        if (toUnit.includes('conventional') || toUnit.includes('fan')) {
            resultValueDiv.textContent = `${result}°C`;
        } else if (toUnit === 'conventional-f') {
            resultValueDiv.textContent = `${result}°F`;
        } else if (toUnit === 'gas') {
            resultValueDiv.textContent = `Gas Mark ${result}`;
        }
    });

    // Handle "From" unit change to update "To" unit options
    fromUnitSelect.addEventListener('change', () => {
        const fromUnit = fromUnitSelect.value;
        const toOptions = Array.from(toUnitSelect.options);
        
        toOptions.forEach(option => {
            if (option.value === fromUnit) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });

        // Set the default "to" unit if the current one is the same as "from"
        if (toUnitSelect.value === fromUnit) {
             const newToUnit = toOptions.find(opt => !opt.disabled);
             if (newToUnit) {
                 toUnitSelect.value = newToUnit.value;
             }
        }
    });

    // --- Tabbed Interface Logic ---
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // --- Accordion (FAQ) Logic ---
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const button = item.querySelector('.accordion-btn');
        const content = item.querySelector('.accordion-content');
        const icon = item.querySelector('.icon');

        button.addEventListener('click', () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true' || false;
            
            // Close other open items
            accordionItems.forEach(otherItem => {
                const otherBtn = otherItem.querySelector('.accordion-btn');
                const otherContent = otherItem.querySelector('.accordion-content');
                const otherIcon = otherItem.querySelector('.icon');

                if (otherBtn !== button && otherBtn.getAttribute('aria-expanded') === 'true') {
                    otherBtn.setAttribute('aria-expanded', 'false');
                    otherContent.style.maxHeight = null;
                    otherIcon.textContent = '+';
                }
            });

            // Toggle current item
            button.setAttribute('aria-expanded', !isExpanded);
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.textContent = '-';
            } else {
                content.style.maxHeight = null;
                icon.textContent = '+';
            }
        });
    });
});