document.addEventListener('DOMContentLoaded', function() {
    // 元素引用
    const celsiusInput = document.getElementById('celsius');
    const fahrenheitResult = document.getElementById('fahrenheit-result');
    const copyButton = document.getElementById('copy-btn');
    const clearHistoryButton = document.getElementById('clear-history');
    const historyList = document.getElementById('history-list');
    const validationMessage = document.getElementById('validation-message');
    const step1Viz = document.getElementById('step1-viz');
    const step2Viz = document.getElementById('step2-viz');
    const step3Viz = document.getElementById('step3-viz');
    const emptyHistoryMessage = document.getElementById('empty-history-message');
    
    // 转换历史数组
    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    
    // 初始化页面
    function init() {
        displayHistory();
        setupEventListeners();
        setupFAQToggle();
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // 输入事件
        celsiusInput.addEventListener('input', handleConversion);
        
        // 复制按钮事件
        copyButton.addEventListener('click', copyResult);
        
        // 清除历史按钮事件
        clearHistoryButton.addEventListener('click', clearHistory);
        
        // 移动菜单切换
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
                navLinks.classList.toggle('active');
            });
        }
    }
    
    // 设置FAQ切换
    function setupFAQToggle() {
        const faqQuestions = document.querySelectorAll('.faq-question');
        
        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                this.parentElement.classList.toggle('active');
            });
        });
    }
    
    // 处理温度转换
    function handleConversion() {
        const celsiusValue = parseFloat(celsiusInput.value);
        
        // 验证输入
        if (isNaN(celsiusValue)) {
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            hideValidationMessage();
            return;
        }
        
        // 检查是否超出合理范围
        if (celsiusValue < -273.15) {
            showValidationMessage('Temperature cannot be below absolute zero (-273.15°C)');
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        if (celsiusValue > 1000000) {
            showValidationMessage('Temperature is unrealistically high');
            fahrenheitResult.textContent = '--';
            clearStepVisualizations();
            return;
        }
        
        // 清除验证消息（如果输入有效）
        hideValidationMessage();
        
        // 执行转换
        const fahrenheitValue = (celsiusValue * 9/5) + 32;
        
        // 显示结果
        fahrenheitResult.textContent = `${fahrenheitValue.toFixed(2)}°F`;
        
        // 显示计算步骤
        displayConversionSteps(celsiusValue, fahrenheitValue);
        
        // 保存到历史记录
        addToHistory(celsiusValue, fahrenheitValue);
    }
    
    // 显示转换步骤
    function displayConversionSteps(celsius, fahrenheit) {
        const step1Result = celsius * 9/5;
        step1Viz.textContent = `${celsius} × 9/5 = ${step1Result.toFixed(2)}`;
        
        step2Viz.textContent = `${step1Result.toFixed(2)} + 32 = ${(step1Result + 32).toFixed(2)}`;
        
        step3Viz.textContent = `Result: ${fahrenheit.toFixed(2)}°F`;
    }
    
    // 清除步骤可视化
    function clearStepVisualizations() {
        step1Viz.textContent = '';
        step2Viz.textContent = '';
        step3Viz.textContent = '';
    }
    
    // 显示验证消息
    function showValidationMessage(message) {
        validationMessage.textContent = message;
        validationMessage.style.display = 'block';
    }
    
    // 隐藏验证消息
    function hideValidationMessage() {
        validationMessage.textContent = '';
        validationMessage.style.display = 'none';
    }
    
    // 添加到历史记录
    function addToHistory(celsius, fahrenheit) {
        const conversion = {
            celsius: celsius,
            fahrenheit: fahrenheit,
            timestamp: new Date().toISOString()
        };
        
        // 添加到数组开头
        conversionHistory.unshift(conversion);
        
        // 限制历史记录长度
        if (conversionHistory.length > 10) {
            conversionHistory = conversionHistory.slice(0, 10);
        }
        
        // 保存到本地存储
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        
        // 更新显示
        displayHistory();
    }
    
    // 显示历史记录
    function displayHistory() {
        historyList.innerHTML = '';
        
        if (conversionHistory.length === 0) {
            emptyHistoryMessage.classList.remove('sr-only');
            return;
        }
        
        emptyHistoryMessage.classList.add('sr-only');
        
        conversionHistory.forEach(conversion => {
            const listItem = document.createElement('li');
            const date = new Date(conversion.timestamp);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            listItem.innerHTML = `
                <span>${conversion.celsius}°C = ${conversion.fahrenheit.toFixed(2)}°F</span>
                <span>${timeString}</span>
            `;
            
            historyList.appendChild(listItem);
        });
    }
    
    // 清除历史记录
    function clearHistory() {
        if (confirm('Are you sure you want to clear your conversion history?')) {
            conversionHistory = [];
            localStorage.removeItem('conversionHistory');
            displayHistory();
        }
    }
    
    // 复制结果到剪贴板
    function copyResult() {
        if (fahrenheitResult.textContent === '--') return;
        
        navigator.clipboard.writeText(fahrenheitResult.textContent)
            .then(() => {
                // 显示成功反馈
                const originalText = copyButton.querySelector('.btn-text').textContent;
                copyButton.querySelector('.btn-text').textContent = 'Copied!';
                
                setTimeout(() => {
                    copyButton.querySelector('.btn-text').textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy result to clipboard');
            });
    }
    
    // 初始化页面
    init();
});