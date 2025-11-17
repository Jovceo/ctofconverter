import { useState } from 'react'
import { 
  celsiusToFahrenheit, 
  formatTemperature, 
  getTemperatureContext 
} from '../utils/converter'

export default function AdvancedConverter() {
  const [celsius, setCelsius] = useState('')
  const [showDetails, setShowDetails] = useState(false)

  const handleInputChange = (e) => {
    const value = e.target.value
    // 只允许数字和小数点
    if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
      setCelsius(value)
    }
  }

  const fahrenheit = celsius ? celsiusToFahrenheit(parseFloat(celsius)) : null
  const context = celsius ? getTemperatureContext(parseFloat(celsius)) : null

  return (
    <div className="card">
      <div className="card-header">
        <h2>高级温度转换器</h2>
        <p className="text-muted">基于Next.js的动态转换器</p>
      </div>
      
      <div className="form-group">
        <label className="form-label" htmlFor="celsius-input">
          摄氏度 (°C)
        </label>
        <input
          id="celsius-input"
          type="text"
          className="form-control"
          value={celsius}
          onChange={handleInputChange}
          placeholder="输入摄氏度，例如：25"
        />
      </div>

      {celsius && (
        <div className="mt-4">
          <div className="alert alert-info">
            <h4>转换结果</h4>
            <p className="mb-2">
              <strong>{formatTemperature(parseFloat(celsius), 'C')}</strong> = 
              <strong className="text-primary">{formatTemperature(fahrenheit, 'F')}</strong>
            </p>
            {context && (
              <p className="mb-0">
                <span className="badge bg-secondary">{context.description}</span>
              </p>
            )}
          </div>

          <button 
            className="btn btn-secondary mt-3"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? '隐藏详情' : '显示详情'}
          </button>

          {showDetails && (
            <div className="mt-3">
              <div className="card">
                <div className="card-header">
                  <h5>转换详情</h5>
                </div>
                <div className="card-body">
                  <p><strong>公式：</strong> °F = (°C × 9/5) + 32</p>
                  <p><strong>计算过程：</strong></p>
                  <p>°F = ({celsius} × 9/5) + 32</p>
                  <p>°F = {(parseFloat(celsius) * 9/5).toFixed(2)} + 32</p>
                  <p>°F = <strong>{fahrenheit.toFixed(2)}</strong></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!celsius && (
        <div className="mt-4">
          <div className="alert alert-light">
            <h5>使用说明</h5>
            <ul className="mb-0">
              <li>在上方输入框中输入摄氏度数值</li>
              <li>支持小数和负数</li>
              <li>实时显示转换结果</li>
              <li>点击"显示详情"查看计算过程</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}