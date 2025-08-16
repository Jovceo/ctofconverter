// 完全修复的JavaScript文件
document.addEventListener('DOMContentLoaded', function() {
    console.log('Fan Oven Conversion Script Loaded');
    
    // 温度转换计算器功能 - 增强版
    const temperatureInput = document.getElementById('temp-value');
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');
    const convertBtn = document.getElementById('convert-btn');
    const resultValue = document.getElementById('result-value');
    
    // 验证所有元素是否存在
    if (!temperatureInput || !fromUnitSelect || !toUnitSelect || !convertBtn || !resultValue) {
        console.error('转换计算器元素未找到');
        return;
    }

    // 温度转换函数 - 修复版
    function convertTemperature(value, fromUnit, toUnit) {
        if (!value || isNaN(value) || value === '') {
            return '请输入有效的温度';
        }

        const numValue = parseFloat(value);
        if (numValue < -273.15) {
            return '温度不能低于绝对零度';
        }

        let celsius;
        
        // 将所有输入转换为摄氏度作为中间值
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
                celsius = gasToC[Math.round(numValue).toString()] || 0;
                break;
            default:
                return '无效的单位';
        }

        // 从摄氏度转换到目标单位
        let result;
        let unitLabel = '';
        
        switch(toUnit) {
            case 'conventional':
                result = Math.round(celsius);
                unitLabel = '°C (传统烤箱)';
                break;
            case 'conventional-f':
                result = Math.round((celsius * 9/5) + 32);
                unitLabel = '°F (传统烤箱)';
                break;
            case 'fan':
                result = Math.round(celsius - 20);
                unitLabel = '°C (风扇烤箱)';
                break;
            case 'gas':
                const cToGas = {
                    '140': 1, '150': 2, '160': 3, '180': 4, '190': 5,
                    '200': 6, '220': 7, '230': 8, '240': 9
                };
                const gasMark = cToGas[Math.round(celsius)];
                return gasMark ? `燃气标记 ${gasMark}` : '燃气标记 不适用';
            default:
                return '无效的目标单位';
        }
        
        return `${result}${unitLabel}`;
    }

    // 转换按钮点击事件 - 修复版
    function handleConvert() {
        const temperature = temperatureInput.value.trim();
        const fromUnit = fromUnitSelect.value;
        const toUnit = toUnitSelect.value;
        
        if (!temperature || temperature === '') {
            resultValue.textContent = '请输入温度值';
            resultValue.style.color = '#e74c3c';
            return;
        }
        
        const result = convertTemperature(temperature, fromUnit, toUnit);
        resultValue.textContent = result;
        resultValue.style.color = '#27ae60';
        
        // 添加动画效果
        resultValue.style.transform = 'scale(1.1)';
        setTimeout(() => {
            resultValue.style.transform = 'scale(1)';
        }, 200);
    }
    
    // 绑定转换按钮事件
    convertBtn.addEventListener('click', handleConvert);
    
    // 回车键支持
    temperatureInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleConvert();
        }
    });
    
    // 输入验证
    temperatureInput.addEventListener('input', function() {
        if (this.value && !isNaN(this.value)) {
            this.style.borderColor = '#ddd';
        }
    });

    // 标签页切换功能 - 修复版
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (tabButtons.length > 0 && tabContents.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                
                // 移除所有活动状态
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // 添加当前活动状态
                this.classList.add('active');
                const targetTab = document.getElementById(tabName);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            });
        });
    }

    // 手风琴FAQ功能 - 完全修复版
    function initAccordion() {
        const accordionBtns = document.querySelectorAll('.accordion-btn');
        
        if (accordionBtns.length === 0) {
            console.warn('未找到手风琴按钮');
            return;
        }
        
        accordionBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const content = this.nextElementSibling;
                const icon = this.querySelector('.icon');
                
                if (!content || !icon) {
                    console.error('手风琴内容或图标未找到');
                    return;
                }
                
                // 关闭其他所有手风琴
                accordionBtns.forEach(otherBtn => {
                    if (otherBtn !== this) {
                        otherBtn.classList.remove('active');
                        const otherContent = otherBtn.nextElementSibling;
                        const otherIcon = otherBtn.querySelector('.icon');
                        if (otherContent && otherIcon) {
                            otherContent.style.maxHeight = null;
                            otherIcon.textContent = '+';
                        }
                    }
                });
                
                // 切换当前手风琴
                this.classList.toggle('active');
                
                if (this.classList.contains('active')) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.textContent = '−';
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    content.style.maxHeight = null;
                    icon.textContent = '+';
                    this.setAttribute('aria-expanded', 'false');
                }
            });
            
            // 添加键盘支持
            btn.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    }
    
    // 初始化手风琴
    initAccordion();

    // 移动端菜单切换 - 修复版
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', this.classList.contains('active'));
        });
    }

    // 平滑滚动到顶部 - 修复版
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 添加滚动到顶部按钮
    const scrollBtn = document.createElement('button');
    scrollBtn.innerHTML = '↑';
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', '回到顶部');
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ff6b35;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(scrollBtn);
    
    scrollBtn.addEventListener('click', scrollToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.style.opacity = '1';
            scrollBtn.style.transform = 'translateY(0)';
        } else {
            scrollBtn.style.opacity = '0';
            scrollBtn.style.transform = 'translateY(20px)';
        }
    });

    console.log('所有功能已初始化完成');
});