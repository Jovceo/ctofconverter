document.addEventListener('DOMContentLoaded', function() {
    // 温度转换计算器功能
    const temperatureInput = document.getElementById('temp-value');
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    const convertBtn = document.getElementById('convert-btn');
    const resultValue = document.getElementById('result-value');

    // 温度转换函数
    function convertTemperature(value, fromUnit, toUnit) {
        if (!value || isNaN(value)) {
            return 'Please enter a valid temperature';
        }

        const numValue = parseFloat(value);
        let result;

        // 首先将所有输入转换为摄氏度
        let celsius;
        switch(fromUnit) {
            case 'conventional':
                celsius = numValue;
                break;
            case 'conventional-f':
                celsius = (numValue - 32) * 5/9;
                break;
            case 'fan':
                celsius = numValue + 20; // 风扇烤箱比传统烤箱低20°C
                break;
            case 'gas':
                const gasToC = {
                    '1': 140, '2': 150, '3': 160, '4': 180, '5': 190, 
                    '6': 200, '7': 220, '8': 230, '9': 240
                };
                celsius = gasToC[numValue.toString()] || 0;
                break;
        }

        // 从摄氏度转换到目标单位
        switch(toUnit) {
            case 'conventional':
                result = Math.round(celsius);
                return `${result}°C (Conventional Oven)`;
            case 'conventional-f':
                result = Math.round((celsius * 9/5) + 32);
                return `${result}°F (Conventional Oven)`;
            case 'fan':
                result = Math.round(celsius - 20);
                return `${result}°C (Fan Oven)`;
            case 'gas':
                const cToGas = {
                    '140': 1, '150': 2, '160': 3, '180': 4, '190': 5,
                    '200': 6, '220': 7, '230': 8, '240': 9
                };
                const gasMark = cToGas[Math.round(celsius)];
                return gasMark ? `Gas Mark ${gasMark}` : 'Gas Mark N/A';
        }
    }

    // 转换按钮点击事件
    convertBtn.addEventListener('click', function() {
        const temperature = temperatureInput.value;
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;

        if (!temperature) {
            resultValue.textContent = 'Please enter a temperature';
            return;
        }

        const result = convertTemperature(temperature, fromUnit, toUnit);
        resultValue.textContent = result;
    });

    // 回车键支持
    temperatureInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            convertBtn.click();
        }
    });

    // 标签页切换功能
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });

    // 移动端菜单切换
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }

    // 手风琴FAQ功能
    const accordionBtns = document.querySelectorAll('.accordion-btn');
    
    accordionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('.icon');
            
            // 关闭其他所有手风琴
            accordionBtns.forEach(otherBtn => {
                if (otherBtn !== this) {
                    otherBtn.classList.remove('active');
                    otherBtn.nextElementSibling.style.maxHeight = null;
                    otherBtn.querySelector('.icon').textContent = '+';
                }
            });
            
            // 切换当前手风琴
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.textContent = '−';
            } else {
                content.style.maxHeight = null;
                icon.textContent = '+';
            }
        });
    });

    // 平滑滚动到顶部
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 添加滚动到顶部按钮（如果需要）
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--accent-color);
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1000;
    `;
    
    document.body.appendChild(scrollBtn);
    
    scrollBtn.addEventListener('click', scrollToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
        } else {
            scrollBtn.style.opacity = '0';
        }
    });
});