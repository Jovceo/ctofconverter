document.addEventListener('DOMContentLoaded', function() {
    const celsiusInput = document.getElementById('celsiusInput');
    const convertBtn = document.getElementById('convert');
    const resultElement = document.getElementById('result');
    const converterTool = document.getElementById('converterTool');
    
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
    
    // 按钮点击事件
    if (convertBtn) {
        convertBtn.addEventListener('click', function() {
            convertTemperature();
        });
    }
    
    function convertTemperature() {
        const celsius = parseFloat(celsiusInput.value);
        
        if (!isNaN(celsius)) {
            // 计算华氏温度
            const fahrenheit = (celsius * 9/5) + 32;
            resultElement.textContent = `${celsius}°C = ${fahrenheit.toFixed(1)}°F`;
            
            // 生成动态链接
            let formattedCelsius = celsius.toString();
            if (formattedCelsius.includes('-')) {
                formattedCelsius = formattedCelsius.replace('-', 'minus');
            }
            formattedCelsius = formattedCelsius.replace('.', '-');
            const link = `${formattedCelsius}-c-to-f.html`;

            // 移除已存在的链接
            const existingLink = document.getElementById('dynamicLink');
            if (existingLink) {
                existingLink.remove();
            }

            // 创建并插入新链接
            if (converterTool) {
                const dynamicLink = document.createElement('p');
                dynamicLink.id = 'dynamicLink';
                dynamicLink.innerHTML = `More about Convert: <a href="${link}" target="_blank">${celsius}°C</a>`;
                converterTool.appendChild(dynamicLink);
            }

            // 添加复制结果功能
            const copyBtn = document.createElement('button');
            copyBtn.textContent = '复制结果';
            copyBtn.className = 'copy-btn';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(resultElement.textContent);
                copyBtn.textContent = '已复制';
                setTimeout(() => copyBtn.textContent = '复制结果', 2000);
            };
            resultElement.appendChild(copyBtn);
        } else {
            resultElement.textContent = '请输入有效的数字';
            // 移除已存在的链接
            const existingLink = document.getElementById('dynamicLink');
            if (existingLink) {
                existingLink.remove();
            }
        }
    }
});