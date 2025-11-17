// JavaScript for c-to-f.html page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with 160°C
    const celsiusInput = document.getElementById('celsius');
    if (celsiusInput) {
        celsiusInput.value = '160';
        // Trigger input event to update conversion
        const event = new Event('input', { bubbles: true });
        celsiusInput.dispatchEvent(event);
    }
    
    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items first
            faqItems.forEach(faq => {
                faq.classList.remove('active');
            });
            
            // Open clicked item if it was closed
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
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
});

// Add styles for dynamically created elements
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
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);