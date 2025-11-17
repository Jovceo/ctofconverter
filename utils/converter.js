// 温度转换工具函数

/**
 * 摄氏度转华氏度
 * @param {number} celsius - 摄氏度
 * @returns {number} 华氏度
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9/5) + 32;
}

/**
 * 华氏度转摄氏度
 * @param {number} fahrenheit - 华氏度
 * @returns {number} 摄氏度
 */
export function fahrenheitToCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5/9;
}

/**
 * 批量转换摄氏度到华氏度
 * @param {number[]} celsiusArray - 摄氏度数组
 * @returns {Object[]} 转换结果数组
 */
export function batchCelsiusToFahrenheit(celsiusArray) {
  return celsiusArray.map(celsius => ({
    celsius,
    fahrenheit: celsiusToFahrenheit(celsius)
  }));
}

/**
 * 获取温度转换公式
 * @param {string} type - 转换类型 ('c-to-f' | 'f-to-c')
 * @returns {string} 公式字符串
 */
export function getConversionFormula(type) {
  if (type === 'c-to-f') {
    return '°F = (°C × 9/5) + 32';
  } else if (type === 'f-to-c') {
    return '°C = (°F - 32) × 5/9';
  }
  return '';
}

/**
 * 格式化温度显示
 * @param {number} value - 温度值
 * @param {string} unit - 单位 ('C' | 'F')
 * @param {number} precision - 小数位数
 * @returns {string} 格式化后的温度字符串
 */
export function formatTemperature(value, unit, precision = 1) {
  if (isNaN(value)) return 'N/A';
  return `${value.toFixed(precision)}°${unit}`;
}

/**
 * 生成温度转换表
 * @param {number} start - 起始温度
 * @param {number} end - 结束温度
 * @param {number} step - 步长
 * @returns {Object[]} 转换表数据
 */
export function generateConversionTable(start, end, step = 1) {
  const table = [];
  for (let celsius = start; celsius <= end; celsius += step) {
    table.push({
      celsius,
      fahrenheit: celsiusToFahrenheit(celsius)
    });
  }
  return table;
}

/**
 * 判断是否为合理温度范围
 * @param {number} celsius - 摄氏度
 * @returns {Object} 包含判断结果和描述的对象
 */
export function getTemperatureContext(celsius) {
  if (celsius < -273.15) {
    return {
      valid: false,
      description: '温度不能低于绝对零度(-273.15°C)',
      category: 'invalid'
    };
  } else if (celsius < -40) {
    return {
      valid: true,
      description: '极寒温度',
      category: 'extreme-cold'
    };
  } else if (celsius < 0) {
    return {
      valid: true,
      description: '冰点以下',
      category: 'below-freezing'
    };
  } else if (celsius === 0) {
    return {
      valid: true,
      description: '水的冰点',
      category: 'freezing-point'
    };
  } else if (celsius < 10) {
    return {
      valid: true,
      description: '凉爽',
      category: 'cool'
    };
  } else if (celsius < 20) {
    return {
      valid: true,
      description: '温和',
      category: 'mild'
    };
  } else if (celsius < 30) {
    return {
      valid: true,
      description: '温暖',
      category: 'warm'
    };
  } else if (celsius < 40) {
    return {
      valid: true,
      description: '炎热',
      category: 'hot'
    };
  } else {
    return {
      valid: true,
      description: '极热温度',
      category: 'extreme-hot'
    };
  }
}

/**
 * 获取常见温度参考点
 * @returns {Object[]} 常见温度参考点数组
 */
export function getCommonTemperatureReferences() {
  return [
    { name: '绝对零度', celsius: -273.15, description: '理论最低温度' },
    { name: '干冰升华点', celsius: -78.5, description: '固态二氧化碳升华' },
    { name: '液氮沸点', celsius: -196, description: '氮气液化' },
    { name: '北极冬季', celsius: -40, description: '极地冬季温度' },
    { name: '冰箱冷冻室', celsius: -18, description: '家用冰箱冷冻' },
    { name: '水的冰点', celsius: 0, description: '水结冰的温度' },
    { name: '室温', celsius: 20, description: '舒适的室内温度' },
    { name: '人体正常体温', celsius: 37, description: '健康人体核心温度' },
    { name: '水的沸点', celsius: 100, description: '标准大气压下' },
    { name: '烤箱温度', celsius: 180, description: '烘焙常用温度' }
  ];
}