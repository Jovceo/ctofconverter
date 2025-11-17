// Fahrenheit to Celsius Converter - Main functionality
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const fahrenheitInput = document.getElementById('fahrenheit');
    const celsiusResult = document.getElementById('celsius-result');
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
    const ABSOLUTE_ZERO = -459.67;
    const MAX_TEMP = 1000000;
    const HISTORY_MAX_ITEMS = 10;
    const HISTORY_KEY = 'fahrenheitToCelsiusHistory';
    
    // Initialize
    loadConversionHistory();
    updateEmptyHistoryState();
    
    // Event Listeners
    fahrenheitInput.addEventListener('input', handleFahrenheitInput);
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
    
    // Fahrenheit input handler
    function handleFahrenheitInput() {
        const fahrenheitValue = parseFloat(fahrenheitInput.value);
        
        // Clear previous validation
        validationMessage.textContent = '';
        validationMessage.classList.remove('error', 'success');
        
        // Handle empty input
        if (fahrenheitInput.value === '') {
            celsiusResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        // Validate input
        if (isNaN(fahrenheitValue)) {
            showValidationMessage('Please enter a valid number', 'error');
            celsiusResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        if (fahrenheitValue < ABSOLUTE_ZERO) {
            showValidationMessage(`Temperature cannot be below absolute zero (${ABSOLUTE_ZERO}°F)`, 'error');
            celsiusResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        if (fahrenheitValue > MAX_TEMP) {
            showValidationMessage(`Temperature cannot exceed ${MAX_TEMP.toLocaleString()}°F`, 'error');
            celsiusResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        // Convert and display
        const celsiusValue = convertFtoC(fahrenheitValue);
        celsiusResult.textContent = formatTemperature(celsiusValue);
        
        // Show conversion steps
        updateStepVisualizations(fahrenheitValue, celsiusValue);
        
        // Add to history
        addToHistory(fahrenheitValue, celsiusValue);
        
        // Show success message for certain conversions
        if (fahrenheitValue === 32) {
            showValidationMessage('Water freezes at 32°F (0°C)', 'success');
        } else if (fahrenheitValue === 212) {
            showValidationMessage('Water boils at 212°F (100°C)', 'success');
        } else if (fahrenheitValue === -40) {
            showValidationMessage('-40°F equals -40°C (the scales meet here!)', 'success');
        } else if (fahrenheitValue === 98.6) {
            showValidationMessage('Normal human body temperature is approximately 98.6°F (37°C)', 'success');
        }
    }
    
    // Conversion function
    function convertFtoC(fahrenheit) {
        return (fahrenheit - 32) * 5/9;
    }
    
    // Format temperature for display
    function formatTemperature(temp) {
        // Round to 1 decimal place for cleaner display, but keep precision for calculations
        const rounded = Math.round(temp * 10) / 10;
        
        // For very cold temperatures, show more precision
        if (temp < 0 && temp > -1) {
            return rounded.toFixed(1) + '°C';
        }
        
        // For most temperatures, show as integer if it's a whole number
        if (rounded % 1 === 0) {
            return rounded.toString() + '°C';
        }
        
        return rounded.toFixed(1) + '°C';
    }
    
    // Show validation message
    function showValidationMessage(message, type) {
        validationMessage.textContent = message;
        validationMessage.classList.add(type);
    }
    
    // Copy result to clipboard
    function handleCopyResult() {
        if (celsiusResult.textContent === '--') return;
        
        navigator.clipboard.writeText(celsiusResult.textContent)
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
    function updateStepVisualizations(fahrenheit, celsius) {
        const step1 = fahrenheit - 32;
        const step2 = step1 * 5/9;
        
        step1Viz.textContent = `${fahrenheit} - 32 = ${step1.toFixed(2)}`;
        step2Viz.textContent = `${step1.toFixed(2)} × 5/9 = ${step2.toFixed(2)}`;
        step3Viz.textContent = `Result: ${formatTemperature(celsius)}`;
    }
    
    // Clear step visualizations
    function clearStepVisualizations() {
        step1Viz.textContent = '';
        step2Viz.textContent = '';
        step3Viz.textContent = '';
    }
    
    // History management
    function addToHistory(fahrenheit, celsius) {
        let history = getHistory();
        const timestamp = new Date().toISOString();
        const conversion = { fahrenheit, celsius, timestamp };
        
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
                <span>${conversion.fahrenheit}°F = ${formatTemperature(conversion.celsius)}</span>
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
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - 40) + 'px';
                tooltip.style.left = (rect.left + rect.width/2 - 100) + 'px';
                tooltip.style.width = '200px';
                
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
            const commonTemps = [32, 212, 68, 98.6, 0, 350];
            commonTemps.forEach(temp => {
                addToHistory(temp, convertFtoC(temp));
            });
        }
    }, 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Focus on input when pressing '/' (like search boxes)
        if (e.key === '/' && e.target !== fahrenheitInput) {
            e.preventDefault();
            fahrenheitInput.focus();
        }
        
        // Clear input when pressing Escape
        if (e.key === 'Escape' && document.activeElement === fahrenheitInput) {
            fahrenheitInput.value = '';
            celsiusResult.textContent = '--';
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