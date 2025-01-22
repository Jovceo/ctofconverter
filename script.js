document.addEventListener('DOMContentLoaded', function() {
    const celsiusInput = document.getElementById('celsius');
    const convertBtn = document.getElementById('convert');
    const resultElement = document.getElementById('result');
    
    // 添加调试信息
    console.log('转换按钮元素:', convertBtn);
    
    if (!convertBtn) {
        console.error('未找到转换按钮元素！');
        return;
    }
    
    // 输入验证
    celsiusInput.addEventListener('input', function(e) {
        const value = e.target.value;
        if (!/^-?\d*\.?\d*$/.test(value)) {
            e.target.value = value.replace(/[^\d.-]/g, '');
        }
    });
    
    // Enter 键支持
    celsiusInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertTemperature();
        }
    });
    
    // 添加点击事件调试
    convertBtn.addEventListener('click', function() {
        console.log('按钮被点击');
        convertTemperature();
    });
    
    function convertTemperature() {
        const celsius = parseFloat(celsiusInput.value);
        
        if (isNaN(celsius)) {
            resultElement.textContent = '请输入有效的数字';
            return;
        }
        
        const fahrenheit = (celsius * 9/5) + 32;
        resultElement.textContent = `${celsius}°C = ${fahrenheit.toFixed(1)}°F`;
        
        // 添加结果复制功能
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '复制结果';
        copyBtn.className = 'copy-btn';
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(resultElement.textContent);
            copyBtn.textContent = '已复制';
            setTimeout(() => copyBtn.textContent = '复制结果', 2000);
        };
        resultElement.appendChild(copyBtn);
    }
}); 