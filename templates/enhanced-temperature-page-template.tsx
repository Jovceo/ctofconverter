'use client';

import { useState, useEffect } from 'react';
import { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature, analyzeTemperature } from '../utils/temperaturePageHelpers';

interface TemperaturePageTemplateProps {
  temperatureValue: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  pageTitle: string;
  pageDescription: string;
  initialUnit?: 'celsius' | 'fahrenheit';
}

const TemperaturePageTemplate = ({
  temperatureValue,
  temperatureUnit,
  pageTitle,
  pageDescription,
  initialUnit = 'celsius'
}: TemperaturePageTemplateProps) => {
  // 计算初始温度值
  const [celsius, setCelsius] = useState<number>(
    temperatureUnit === 'celsius' ? temperatureValue : fahrenheitToCelsius(temperatureValue)
  );
  const [fahrenheit, setFahrenheit] = useState<number>(
    temperatureUnit === 'fahrenheit' ? temperatureValue : celsiusToFahrenheit(temperatureValue)
  );

  // 单位切换状态
  const [isCelsiusToFahrenheit, setIsCelsiusToFahrenheit] = useState<boolean>(initialUnit === 'celsius');
  const [inputValue, setInputValue] = useState<string>(temperatureValue.toString());
  const [result, setResult] = useState<string>(
    temperatureUnit === 'celsius' ? formatTemperature(celsiusToFahrenheit(temperatureValue)) : formatTemperature(fahrenheitToCelsius(temperatureValue))
  );

  // 复制结果状态
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // 分析温度上下文
  const temperatureContext = analyzeTemperature(celsius);

  // 处理单位切换
  const handleUnitToggle = () => {
    setIsCelsiusToFahrenheit(!isCelsiusToFahrenheit);
    if (isCelsiusToFahrenheit) {
      // 切换到华氏度转摄氏度
      setInputValue(formatTemperature(fahrenheit));
      setResult(formatTemperature(celsius));
    } else {
      // 切换到摄氏度转华氏度
      setInputValue(formatTemperature(celsius));
      setResult(formatTemperature(fahrenheit));
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 处理转换计算
  const handleConvert = () => {
    const value = parseFloat(inputValue);
    if (!isNaN(value)) {
      if (isCelsiusToFahrenheit) {
        // 摄氏度转华氏度
        const f = celsiusToFahrenheit(value);
        setResult(formatTemperature(f));
        setCelsius(value);
        setFahrenheit(f);
      } else {
        // 华氏度转摄氏度
        const c = fahrenheitToCelsius(value);
        setResult(formatTemperature(c));
        setFahrenheit(value);
        setCelsius(c);
      }
    }
  };

  // 处理复制结果
  const handleCopyResult = () => {
    const resultText = `${celsius}°C = ${fahrenheit}°F`;
    navigator.clipboard.writeText(resultText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  // 响应式样式
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1rem',
    },
    header: {
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: '#2c3e50',
    },
    description: {
      fontSize: '1rem',
      color: '#666',
      marginBottom: '1rem',
    },
    conversionResult: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      textAlign: 'center' as const,
      marginBottom: '1.5rem',
    },
    resultText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    buttonGroup: {
      display: 'flex' as const,
      justifyContent: 'center' as const,
      gap: '0.5rem',
      flexWrap: 'wrap' as const,
    },
    button: {
      padding: '0.5rem 1rem',
      backgroundColor: '#007bff',
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.25rem',
      cursor: 'pointer',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s',
    },
    buttonSecondary: {
      backgroundColor: '#6c757d',
    },
    converterContainer: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
    },
    converterTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#2c3e50',
    },
    inputGroup: {
      display: 'flex' as const,
      gap: '0.5rem',
      marginBottom: '1rem',
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #ced4da',
      borderRadius: '0.25rem',
      fontSize: '1rem',
    },
    unitLabel: {
      display: 'flex' as const,
      alignItems: 'center' as const,
      fontWeight: 'bold' as const,
    },
    contextSection: {
      backgroundColor: '#ffffff',
      border: '1px solid #e9ecef',
      borderRadius: '0.5rem',
      padding: '1.5rem',
      marginBottom: '1.5rem',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    contextTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#2c3e50',
    },
    contextCategories: {
      display: 'flex' as const,
      gap: '0.5rem',
      marginBottom: '1rem',
      flexWrap: 'wrap' as const,
    },
    categoryBadge: {
      backgroundColor: '#007bff',
      color: '#ffffff',
      padding: '0.25rem 0.75rem',
      borderRadius: '1rem',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    contextDescription: {
      fontSize: '1rem',
      color: '#666',
      lineHeight: '1.5',
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>{pageTitle}</h1>
        <p style={styles.description}>{pageDescription}</p>
      </header>

      {/* 转换结果显示 */}
      <section style={styles.conversionResult}>
        <div style={styles.resultText}>
          {celsius}°C = {fahrenheit}°F
        </div>
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={handleCopyResult}
          >
            {copySuccess ? '已复制！' : '复制结果'}
          </button>
          <button
            style={styles.button}
            onClick={handleUnitToggle}
          >
            切换到 {isCelsiusToFahrenheit ? '°F 到 °C' : '°C 到 °F'}
          </button>
        </div>
      </section>

      {/* 交互式温度转换器 */}
      <section style={styles.converterContainer}>
        <h2 style={styles.converterTitle}>温度转换器</h2>
        <div style={styles.inputGroup}>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={`输入 ${isCelsiusToFahrenheit ? '°C' : '°F'}`}
            style={styles.input}
          />
          <span style={styles.unitLabel}>
            {isCelsiusToFahrenheit ? '°C' : '°F'}
          </span>
        </div>
        <div style={styles.buttonGroup}>
          <button
            style={styles.button}
            onClick={handleConvert}
          >
            转换为 {isCelsiusToFahrenheit ? '°F' : '°C'}
          </button>
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
          {result} {isCelsiusToFahrenheit ? '°F' : '°C'}
        </div>
      </section>

      {/* 温度上下文信息 */}
      <section style={styles.contextSection}>
        <h2 style={styles.contextTitle}>关于 {celsius}°C</h2>
        <div style={styles.contextCategories}>
          {temperatureContext.categoryKeys.map((category: string, index: number) => (
            <span key={index} style={styles.categoryBadge}>{category}</span>
          ))}
        </div>
        <p style={styles.contextDescription}>{temperatureContext.descriptionKey}</p>
      </section>
    </div>
  );
};

export default TemperaturePageTemplate;
