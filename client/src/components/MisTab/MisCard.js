const MisCard = ({ item, index, onEdit, onDelete }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      position: 'relative'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)'
      e.currentTarget.style.transform = 'translateY(-6px)'
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}>
      {/* Card Header with Title and Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f3f4f6'
      }}>
        <div>
          <h3 style={{
            margin: '0 0 6px 0',
            color: '#1e293b',
            fontSize: '18px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            📊 MIS Entry #{index + 1}
          </h3>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#94a3b8',
            fontWeight: 500
          }}>
            📅 {item.createdAt.toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            {item.updatedAt && (
              <span style={{ marginLeft: '12px', color: '#64748b' }}>
                (Updated: {item.updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </p>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {/* Edit Button */}
          <button
            onClick={() => onEdit(item._id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#5b7cfa',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px 8px',
              transition: 'all 0.2s',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#dbeafe'
              e.target.style.fontSize = '22px'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.fontSize = '20px'
            }}
            title="Edit this entry"
          >
            ✏️
          </button>
          {/* Delete Button */}
          <button
            onClick={() => onDelete(item._id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px 8px',
              transition: 'all 0.2s',
              borderRadius: '6px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fee2e2'
              e.target.style.fontSize = '22px'
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.fontSize = '20px'
            }}
            title="Delete this entry"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Card Content - Table Style Display */}
      <div style={{ marginBottom: '20px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
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
                #
              </th>
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
                textAlign: 'left',
                fontWeight: 700,
                color: '#64748b',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {item.rows.map((row, rowIndex) => (
              <tr key={rowIndex} style={{
                borderBottom: rowIndex < item.rows.length - 1 ? '1px solid #e5e7eb' : 'none',
                backgroundColor: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb'
              }}>
                <td style={{
                  padding: '12px',
                  color: '#1e293b',
                  fontWeight: 600,
                  minWidth: '40px'
                }}>
                  {rowIndex + 1}
                </td>
                <td style={{
                  padding: '12px',
                  color: '#1e293b',
                  fontWeight: 600,
                  maxWidth: '200px',
                  wordBreak: 'break-word'
                }}>
                  {row.projectName || 'N/A'}
                </td>
                <td style={{
                  padding: '12px',
                  color: '#475569',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  maxWidth: '300px'
                }}>
                  {row.description || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card Footer with Summary */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #f3f4f6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <span style={{ fontWeight: 600 }}>
            📦 {item.rows.length} Project{item.rows.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{
          backgroundColor: '#f0f9ff',
          color: '#0369a1',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          ID: {item._id}
        </div>
      </div>
    </div>
  )
}

export default MisCard
