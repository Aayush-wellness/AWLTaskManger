import { AlertTriangle } from 'lucide-react'

const AtRiskEmployees = ({ employees }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <AlertTriangle size={20} style={{ color: '#ef4444' }} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e293b'
        }}>
          At-Risk Employees
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {employees.map((employee, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#fee2e2',
              borderLeft: '4px solid #ef4444',
              padding: '12px',
              borderRadius: '6px'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                {employee.userName}
              </p>
              <div style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {employee.score}/100
              </div>
            </div>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#7f1d1d'
            }}>
              {employee.reason}
            </p>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#64748b',
          fontSize: '13px'
        }}>
          No at-risk employees
        </div>
      )}
    </div>
  )
}

export default AtRiskEmployees
