import { batchCelsiusToFahrenheit, generateConversionTable } from '../utils/converter'

export default function ConversionTable({ celsiusValues = [0, 10, 20, 30, 37, 40, 50, 60, 70, 80, 90, 100] }) {
  const conversions = batchCelsiusToFahrenheit(celsiusValues)
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>温度转换表</h3>
        <p className="text-muted">常见温度对照表</p>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>摄氏度 (°C)</th>
              <th>华氏度 (°F)</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            {conversions.map((item, index) => {
              let description = ''
              let className = ''
              
              if (item.celsius === 0) {
                description = '水的冰点'
                className = 'table-info'
              } else if (item.celsius === 37) {
                description = '人体正常体温'
                className = 'table-success'
              } else if (item.celsius === 100) {
                description = '水的沸点'
                className = 'table-danger'
              } else if (item.celsius < 0) {
                description = '冰点以下'
                className = 'table-primary'
              } else if (item.celsius > 30) {
                description = '炎热'
                className = 'table-warning'
              } else {
                description = '常温'
              }
              
              return (
                <tr key={index} className={className}>
                  <td><strong>{item.celsius}°C</strong></td>
                  <td><strong>{item.fahrenheit.toFixed(1)}°F</strong></td>
                  <td>{description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3">
        <p className="text-muted">
          <small>
            提示：点击表格行可以查看更多详细信息
          </small>
        </p>
      </div>
    </div>
  )
}