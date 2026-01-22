const ProjectMetrics = ({ metrics }) => {
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
        📦 Project Activity
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
              Project Name
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
              Frequency
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
              Employees
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
              Avg Desc Length
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
              % of Total
            </th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((proj, idx) => (
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
                fontWeight: 600,
                maxWidth: '300px',
                wordBreak: 'break-word'
              }}>
                {proj.projectName}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                color: '#1e293b',
                fontWeight: 600
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#dbeafe',
                  color: '#0369a1',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {proj.frequency}
                </div>
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                color: '#1e293b',
                fontWeight: 600
              }}>
                {proj.employeeCount}
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center',
                color: '#1e293b',
                fontWeight: 600
              }}>
                {proj.avgDescriptionLength} chars
              </td>
              <td style={{
                padding: '12px',
                textAlign: 'center'
              }}>
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>
                  {proj.percentage}%
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
          No project metrics available
        </div>
      )}
    </div>
  )
}

export default ProjectMetrics
