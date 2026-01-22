const EmployeeMetricsTable = ({ metrics }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#10b981'
      case 'on-track':
        return '#f59e0b'
      case 'at-risk':
        return '#ef4444'
      default:
        return '#64748b'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#d1fae5'
      case 'on-track':
        return '#fef3c7'
      case 'at-risk':
        return '#fee2e2'
      default:
        return '#f3f4f6'
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px',
      overflowX: 'auto'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: 700,
        color: '#1e293b'
      }}>
        📊 Employee Performance Metrics
      </h3>

      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#f3f4f6',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <th style={{
              padding: '12px',
              textAlign: 'left',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Employee
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Submissions
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Projects
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Consistency
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Quality
            </th>
            <th style={{
              padding: '12px',
              textAlign: 'center',
              fontWeight: 700,
              color: '#64748b',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((emp, idx) => (
            <tr
              key={idx}
              style={{
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}
            >
              <td style={{
                padding: '12px',
                color: '#1e293b',
                fontWeight: 600
              }}>
                <div>
                  <p style={{ margin: '0 0 4px 0' }}>{emp.userName}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>{emp.userEmail}</p>
                </div>
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                color: '#1e293b',
                fontWeight: 600
              }}>
                {emp.submissions}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                color: '#1e293b',
                fontWeight: 600
              }}>
                {emp.totalProjects}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  {emp.consistencyScore}/100
                </div>
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#f3f4f6',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  color: '#1e293b'
                }}>
                  {emp.qualityScore}/100
                </div>
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: getStatusBgColor(emp.status),
                  color: getStatusColor(emp.status),
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '12px',
                  textTransform: 'capitalize'
                }}>
                  {emp.status}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {metrics.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b'
        }}>
          No employee metrics available
        </div>
      )}
    </div>
  )
}

export default EmployeeMetricsTable
