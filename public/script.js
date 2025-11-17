// Celsius to Fahrenheit Converter - Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const celsiusInput = document.getElementById('celsius');
    const fahrenheitResult = document.getElementById('fahrenheit-result');
    const copyBtn = document.getElementById('copy-btn');
    const validationMessage = document.getElementById('validation-message');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const emptyHistoryMessage = document.getElementById('empty-history-message');
    const step1Viz = document.getElementById('step1-viz');
    const step2Viz = document.getElementById('step2-viz');
    const step3Viz = document.getElementById('step3-viz');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Constants
    const ABSOLUTE_ZERO = -273.15;
    const MAX_TEMP = 1000000;
    const HISTORY_MAX_ITEMS = 10;
    const HISTORY_KEY = 'conversionHistory';
    
    // Initialize
    loadConversionHistory();
    updateEmptyHistoryState();
    
    // Event Listeners
    celsiusInput.addEventListener('input', handleCelsiusInput);
    copyBtn.addEventListener('click', handleCopyResult);
    clearHistoryBtn.addEventListener('click', clearHistory);
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // FAQ accordion functionality
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => toggleFaqItem(item));
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.mobile-menu-toggle')) {
            toggleMobileMenu();
        }
    });
    
    // Celsius input handler
    function handleCelsiusInput() {
        const celsiusValue = parseFloat(celsiusInput.value);
        
        // Clear previous validation
        validationMessage.textContent = '';
        validationMessage.classList.remove('error', 'success');
        
        // Handle empty input
        if (celsiusInput.value === '') {
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        // Validate input
        if (isNaN(celsiusValue)) {
            showValidationMessage('Please enter a valid number', 'error');
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        if (celsiusValue < ABSOLUTE_ZERO) {
            showValidationMessage(`Temperature cannot be below absolute zero (${ABSOLUTE_ZERO}°C)`, 'error');
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        if (celsiusValue > MAX_TEMP) {
            showValidationMessage(`Temperature cannot exceed ${MAX_TEMP.toLocaleString()}°C`, 'error');
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        // Convert and display
        const fahrenheitValue = convertCtoF(celsiusValue);
        fahrenheitResult.textContent = formatTemperature(fahrenheitValue);
        
        // Show conversion steps
        updateStepVisualizations(celsiusValue, fahrenheitValue);
        
        // Add to history
        addToHistory(celsiusValue, fahrenheitValue);
        
        // Show success message for certain conversions
        if (celsiusValue === 0) {
            showValidationMessage('Water freezes at 0°C (32°F)', 'success');
        } else if (celsiusValue === 100) {
            showValidationMessage('Water boils at 100°C (212°F)', 'success');
        } else if (celsiusValue === -40) {
            showValidationMessage('-40°C equals -40°F (the scales meet here!)', 'success');
        } else if (celsiusValue === 37) {
            showValidationMessage('Normal human body temperature is approximately 37°C (98.6°F)', 'success');
        }
    }
    
    // Conversion function
    function convertCtoF(celsius) {
        return (celsius * 9/5) + 32;
    }
    
    // Format temperature for display
    function formatTemperature(temp) {
        // Round to 1 decimal place for cleaner display, but keep precision for calculations
        const rounded = Math.round(temp * 10) / 10;
        
        // For very cold temperatures, show more precision
        if (temp < 0 && temp > -1) {
            return rounded.toFixed(1) + '°F';
        }
        
        // For most temperatures, show as integer if it's a whole number
        if (rounded % 1 === 0) {
            return rounded.toString() + '°F';
        }
        
        return rounded.toFixed(1) + '°F';
    }
    
    // Show validation message
    function showValidationMessage(message, type) {
        validationMessage.textContent = message;
        validationMessage.classList.add(type);
    }
    
    // Copy result to clipboard
    function handleCopyResult() {
        if (fahrenheitResult.textContent === '--') return;
        
        navigator.clipboard.writeText(fahrenheitResult.textContent)
            .then(() => {
                // Visual feedback
                const originalText = copyBtn.querySelector('.btn-text').textContent;
                copyBtn.querySelector('.btn-text').textContent = 'Copied!';
                copyBtn.style.backgroundColor = '#27ae60';
                
                setTimeout(() => {
                    copyBtn.querySelector('.btn-text').textContent = originalText;
                    copyBtn.style.backgroundColor = '';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy to clipboard. Please try again.');
            });
    }
    
    // Update step visualizations
    function updateStepVisualizations(celsius, fahrenheit) {
        const step1 = celsius * 9/5;
        const step2 = step1 + 32;
        
        step1Viz.textContent = `${celsius} × 9/5 = ${step1.toFixed(2)}`;
        step2Viz.textContent = `${step1.toFixed(2)} + 32 = ${step2.toFixed(2)}`;
        step3Viz.textContent = `Result: ${formatTemperature(fahrenheit)}`;
    }
    
    // Clear step visualizations
    function clearStepVisualizations() {
        step1Viz.textContent = '';
        step2Viz.textContent = '';
        step3Viz.textContent = '';
    }
    
    // History management
    function addToHistory(celsius, fahrenheit) {
        let history = getHistory();
        const timestamp = new Date().toISOString();
        const conversion = { celsius, fahrenheit, timestamp };
        
        // Add to beginning of array
        history.unshift(conversion);
        
        // Limit history size
        if (history.length > HISTORY_MAX_ITEMS) {
            history = history.slice(0, HISTORY_MAX_ITEMS);
        }
        
        // Save and update UI
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        updateHistoryUI();
        updateEmptyHistoryState();
    }
    
    function getHistory() {
        const historyJSON = localStorage.getItem(HISTORY_KEY);
        return historyJSON ? JSON.parse(historyJSON) : [];
    }
    
    function loadConversionHistory() {
        updateHistoryUI();
    }
    
    function updateHistoryUI() {
        const history = getHistory();
        historyList.innerHTML = '';
        
        history.forEach((conversion, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${conversion.celsius}°C = ${formatTemperature(conversion.fahrenheit)}</span>
                <span class="history-time">${formatTimeSince(new Date(conversion.timestamp))}</span>
            `;
            historyList.appendChild(li);
        });
    }
    
    function clearHistory() {
        if (getHistory().length === 0) return;
        
        if (confirm('Are you sure you want to clear your conversion history?')) {
            localStorage.removeItem(HISTORY_KEY);
            updateHistoryUI();
            updateEmptyHistoryState();
        }
    }
    
    function updateEmptyHistoryState() {
        if (getHistory().length === 0) {
            emptyHistoryMessage.classList.remove('sr-only');
            historyList.innerHTML = '<li class="history-empty">No conversions yet</li>';
        } else {
            emptyHistoryMessage.classList.add('sr-only');
        }
    }
    
    function formatTimeSince(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} min ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hr ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }
        
        // For older dates, show the actual date
        return date.toLocaleDateString();
    }
    
    // Mobile menu functionality
    function toggleMobileMenu() {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');
    }
    
    // FAQ accordion functionality
    function toggleFaqItem(item) {
        const isActive = item.classList.contains('active');
        
        // Close all items first
        faqItems.forEach(faq => {
            faq.classList.remove('active');
        });
        
        // Open clicked item if it was closed
        if (!isActive) {
            item.classList.add('active');
        }
    }
    
    // Tooltip functionality for info buttons
    document.querySelectorAll('.info-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const tooltipText = this.getAttribute('data-tooltip');
            if (tooltipText) {
                // Remove any existing tooltips
                document.querySelectorAll('.tooltip').forEach(t => t.remove());
                
                // Create new tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                
                // Position tooltip
                const rect = this.getBoundingClientRect();
                tooltip.style.position = 'absolute';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
                tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
                
                document.body.appendChild(tooltip);
                
                // Remove tooltip on click outside or after delay
                const removeTooltip = function() {
                    tooltip.remove();
                    document.removeEventListener('click', removeTooltip);
                };
                
                setTimeout(removeTooltip, 3000);
                document.addEventListener('click', removeTooltip);
            }
        });
    });
    
    // Add some common conversions on page load for better UX
    setTimeout(() => {
        if (getHistory().length === 0) {
            // Add some common conversions to history for first-time users
            const commonTemps = [0, 100, 20, 37, -18, 180];
            commonTemps.forEach(temp => {
                addToHistory(temp, convertCtoF(temp));
            });
        }
    }, 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Focus on input when pressing '/' (like search boxes)
        if (e.key === '/' && e.target !== celsiusInput) {
            e.preventDefault();
            celsiusInput.focus();
        }
        
        // Clear input when pressing Escape
        if (e.key === 'Escape' && document.activeElement === celsiusInput) {
            celsiusInput.value = '';
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            validationMessage.textContent = '';
            validationMessage.classList.remove('error', 'success');
        }
    });
    
    // PWA functionality (optional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(function(error) {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
});

// Add some basic styles for dynamically created elements
const dynamicStyles = `
    .tooltip {
        position: fixed;
        background: #333;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 1000;
        max-width: 200px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .tooltip::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 5px 5px 0;
        border-style: solid;
        border-color: #333 transparent transparent;
    }
    
    .history-empty {
        text-align: center;
        color: #777;
        font-style: italic;
        padding: 20px !important;
    }
    
    .history-time {
        font-size: 0.8em;
        color: #777;
    }
    
    @media (max-width: 767px) {
        .nav-links.active {
            display: flex !important;
            flex-direction: column;
        }
    }
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);