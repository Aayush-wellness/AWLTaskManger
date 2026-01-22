import { Trophy } from 'lucide-react'

const TopPerformers = ({ performers }) => {
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
        <Trophy size={20} style={{ color: '#f59e0b' }} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e293b'
        }}>
          Top Performers
        </h3>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {performers.map((performer, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#fef3c7',
              borderLeft: '4px solid #f59e0b',
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
                #{idx + 1} {performer.userName}
              </p>
              <div style={{
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {performer.score}/100
              </div>
            </div>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: '#92400e'
            }}>
              {performer.reason}
            </p>
          </div>
        ))}
      </div>

      {performers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          color: '#64748b',
          fontSize: '13px'
        }}>
          No top performers data available
        </div>
      )}
    </div>
  )
}

export default TopPerformers
