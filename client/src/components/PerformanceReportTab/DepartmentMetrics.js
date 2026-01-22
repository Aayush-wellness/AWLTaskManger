const DepartmentMetrics = ({ metrics }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      marginBottom: '24px'
    }}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        fontWeight: 700,
        color: '#1e293b'
      }}>
        🏢 Department Performance
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {metrics.map((dept, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6'
              e.currentTarget.style.borderColor = '#d1d5db'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb'
              e.currentTarget.style.borderColor = '#e5e7eb'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: '#1e293b'
              }}>
                {dept.department}
              </h4>
              <div style={{
                backgroundColor: '#dbeafe',
                color: '#0369a1',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600
              }}>
                Rank #{dept.ranking}
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Avg Submissions
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#3b82f6'
                }}>
                  {dept.avgSubmissions}
                </p>
              </div>

              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Employees
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#10b981'
                }}>
                  {dept.employeeCount}
                </p>
              </div>

              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Quality Score
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#f59e0b'
                }}>
                  {dept.avgQuality}/100
                </p>
              </div>

              <div>
                <p style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#64748b',
                  textTransform: 'uppercase'
                }}>
                  Consistency
                </p>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#8b5cf6'
                }}>
                  {dept.avgConsistency}/100
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {metrics.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#64748b'
        }}>
          No department metrics available
        </div>
      )}
    </div>
  )
}

export default DepartmentMetrics
