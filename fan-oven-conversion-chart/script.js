document.addEventListener('DOMContentLoaded', function() {
    const temperatureInput = document.getElementById('temperature');
    const fromUnitSelect = document.getElementById('from-unit');
    const convertBtn = document.getElementById('convert-btn');
    const resultsDiv = document.getElementById('results');

    // 温度转换函数
    function convertTemperature(value, fromUnit) {
        const results = [];
        let celsius;

        // 首先将输入转换为摄氏度
        switch(fromUnit) {
            case 'conventional':
                celsius = parseFloat(value);
                break;
            case 'fan':
                celsius = parseFloat(value) + 20; // 风扇烤箱温度比传统烤箱低20度
                break;
            case 'gas':
                // Gas Mark 到摄氏度的转换
                const gasToC = {
                    '1': 140,
                    '2': 150,
                    '3': 160,
                    '4': 180,
                    '5': 190,
                    '6': 200,
                    '7': 220,
                    '8': 230,
                    '9': 240
                };
                celsius = gasToC[value] || 0;
                break;
        }

        // 计算其他单位的温度
        const fanTemp = celsius - 20;
        const fahrenheit = (celsius * 9/5) + 32;
        const fanFahrenheit = (fanTemp * 9/5) + 32;

        // 查找最接近的Gas Mark
        const gasMarks = [
            {mark: 1, temp: 140},
            {mark: 2, temp: 150},
            {mark: 3, temp: 160},
            {mark: 4, temp: 180},
            {mark: 5, temp: 190},
            {mark: 6, temp: 200},
            {mark: 7, temp: 220},
            {mark: 8, temp: 230},
            {mark: 9, temp: 240}
        ];

        let gasMarkValue = 'N/A';
        let closestDiff = Infinity;

        gasMarks.forEach(({mark, temp}) => {
            const diff = Math.abs(temp - celsius);
            if (diff < closestDiff) {
                closestDiff = diff;
                gasMarkValue = mark;
            }
        });

        // 返回所有转换结果
        if (fromUnit !== 'conventional') {
            results.push(`Conventional Oven: ${Math.round(celsius)}°C / ${Math.round(fahrenheit)}°F`);
        }
        if (fromUnit !== 'fan') {
            results.push(`Fan Oven: ${Math.round(fanTemp)}°C / ${Math.round(fanFahrenheit)}°F`);
        }
        if (fromUnit !== 'gas' && gasMarkValue !== 'N/A') {
            results.push(`Gas Mark: ${gasMarkValue}`);
        }

        return results.join('<br>');
    }

    // 添加转换按钮点击事件
    convertBtn.addEventListener('click', function() {
        const temperature = temperatureInput.value;
        const fromUnit = fromUnitSelect.value;

        if (!temperature) {
            resultsDiv.innerHTML = '<span style="color: #e74c3c;">Please enter a temperature value</span>';
            return;
        }

        const result = convertTemperature(temperature, fromUnit);
        resultsDiv.innerHTML = result;
    });

    // 添加输入框回车键事件
    temperatureInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });
});