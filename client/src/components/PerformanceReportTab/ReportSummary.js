const ReportSummary = ({ summary }) => {
  const metrics = [
    {
      label: 'Total Submissions',
      value: summary.totalSubmissions,
      icon: '📝',
      color: '#3b82f6'
    },
    {
      label: 'Active Employees',
      value: summary.totalEmployees,
      icon: '👥',
      color: '#10b981'
    },
    {
      label: 'Avg Projects/Submission',
      value: summary.avgProjectsPerSubmission,
      icon: '📦',
      color: '#f59e0b'
    },
    {
      label: 'Submission Rate',
      value: `${summary.submissionRate}%`,
      icon: '📊',
      color: '#8b5cf6'
    },
    {
      label: 'Quality Score',
      value: `${summary.qualityScore}/100`,
      icon: '⭐',
      color: '#ec4899'
    },
    {
      label: 'Consistency Score',
      value: `${summary.consistencyScore}/100`,
      icon: '✅',
      color: '#06b6d4'
    }
  ]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)'
            e.currentTarget.style.transform = 'translateY(-4px)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0, 0, 0, 0.08)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '24px'
            }}>
              {metric.icon}
            </div>
            <p style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b'
            }}>
              {metric.label}
            </p>
          </div>
          <p style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: 700,
            color: metric.color
          }}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ReportSummary
