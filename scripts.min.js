// ==  Celsius to Fahrenheit Converter  == //
// 一步到位：主区域骨架屏高度锁定后释放 + 所有 CLS 优化
(() => {
  /* ---------- DOM 元素 ---------- */
  const celsiusInput       = document.getElementById('celsius');
  const fahrenheitResult   = document.getElementById('fahrenheit-result');
  const copyBtn            = document.getElementById('copy-btn');
  const copyBtnText        = copyBtn.querySelector('.btn-text');
  const clearHistoryBtn    = document.getElementById('clear-history');
  const historyList        = document.getElementById('history-list');
  const validationMsg      = document.getElementById('validation-message');
  const step1Viz           = document.getElementById('step1-viz');
  const step2Viz           = document.getElementById('step2-viz');
  const step3Viz           = document.getElementById('step3-viz');

  /* ---------- 状态 ---------- */
  let conversionHistory = JSON.parse(localStorage.getItem('c2fHistory') || '[]');
  const COPY_ORIGINAL = copyBtnText.textContent;

  /* ---------- 核心转换 ---------- */
  function convertTemperature(val) {
    if (val === '' || val === null || val === undefined) {
      renderResult('--');
      return;
    }
    const c = parseFloat(val);
    if (isNaN(c)) {
      renderResult('--');
      showMsg('Please enter a valid number');
      return;
    }
    if (c < -273.15) {
      renderResult('--');
      showMsg('Temperature cannot be below absolute zero (-273.15°C)');
      return;
    }
    const f = (c * 9 / 5) + 32;
    const rounded = Math.round(f * 100) / 100;
    renderResult(`${rounded}°F`);
    addToHistory(c, rounded);
    updateSteps(c, rounded);
    releaseHeight();   // 一步到位：释放精确高度
  }

  function renderResult(text) {
    fahrenheitResult.textContent = text;
    copyBtn.style.display = text === '--' ? 'none' : 'inline-flex';
  }

  function showMsg(msg) {
    validationMsg.textContent = msg;
    setTimeout(() => validationMsg.textContent = '', 3000);
  }

  /* ---------- 历史记录 ---------- */
  function addToHistory(c, f) {
    if (conversionHistory[0] && conversionHistory[0].celsius === c) return;
    conversionHistory.unshift({ celsius: c, fahrenheit: f });
    if (conversionHistory.length > 10) conversionHistory.pop();
    localStorage.setItem('c2fHistory', JSON.stringify(conversionHistory));
    renderHistory();
  }

  function renderHistory() {
    historyList.innerHTML = '';
    if (!conversionHistory.length) return;
    conversionHistory.forEach(item => {
      const li = document.createElement('li');
      li.className = 'history-item';
      li.textContent = `${item.celsius}°C = ${item.fahrenheit}°F`;
      li.tabIndex = 0;
      li.setAttribute('role', 'button');
      li.setAttribute('aria-label', `Apply ${item.celsius}°C`);
      li.addEventListener('click', () => {
        celsiusInput.value = item.celsius;
        convertTemperature(item.celsius);
        celsiusInput.focus();
      });
      li.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          celsiusInput.value = item.celsius;
          convertTemperature(item.celsius);
          celsiusInput.focus();
        }
      });
      historyList.appendChild(li);
    });
  }

  /* ---------- 步骤可视化 ---------- */
  function updateSteps(c, f) {
    const mul = (c * 9 / 5).toFixed(2);
    if (step1Viz) step1Viz.textContent = `${c} × 9/5 = ${mul}`;
    if (step2Viz) step2Viz.textContent = `${mul} + 32 = ${f.toFixed(2)}`;
    if (step3Viz) step3Viz.textContent = `Final result: ${f.toFixed(2)}°F`;
  }

  /* ---------- 复制功能（不变宽） ---------- */
  copyBtn.addEventListener('click', async () => {
    const text = fahrenheitResult.textContent;
    if (text === '--') return;
    try {
      await navigator.clipboard.writeText(text);
      copyBtnText.textContent = '✓';
      copyBtn.style.backgroundColor = '#27ae60';
      setTimeout(() => {
        copyBtnText.textContent = COPY_ORIGINAL;
        copyBtn.style.backgroundColor = '';
      }, 1500);
    } catch (err) {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    copyBtnText.textContent = '✓';
    copyBtn.style.backgroundColor = '#27ae60';
    setTimeout(() => {
      copyBtnText.textContent = COPY_ORIGINAL;
      copyBtn.style.backgroundColor = '';
    }, 1500);
  }

  /* ---------- 清空历史 ---------- */
  clearHistoryBtn.addEventListener('click', () => {
    conversionHistory = [];
    localStorage.removeItem('c2fHistory');
    renderHistory();
  });

  /* ---------- 防抖输入 ---------- */
  const debouncedConvert = debounce(function () {
    convertTemperature(celsiusInput.value);
  }, 300);

  celsiusInput.addEventListener('input', debouncedConvert);
  celsiusInput.addEventListener('change', () => convertTemperature(celsiusInput.value));

  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /* ---------- URL 参数识别 ---------- */
  function initFromURL() {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('celsius');
    if (c !== null && !isNaN(c)) {
      celsiusInput.value = c;
      convertTemperature(c);
    }
  }

  /* ---------- 一步到位：释放精确高度 ---------- */
  function releaseHeight() {
    const main = document.getElementById('main-content');
    if (main) main.style.height = 'auto';
  }

  /* ---------- 初始化 ---------- */
  function init() {
    renderHistory();
    initFromURL();
    celsiusInput.focus();
  }

  init();
})();