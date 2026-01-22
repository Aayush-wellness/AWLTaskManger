import { BarChart3 } from 'lucide-react'

const ReportHeader = () => {
  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '8px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: '#1e293b'
          }}>
            Performance Analysis Reports
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '14px',
            color: '#64748b'
          }}>
            Generate and download employee performance reports on-demand
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReportHeader
