const ReportFilters = ({ filters, onFilterChange, onTriggerReport, loading }) => {
  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '24px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Report Type Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            📊 Report Type
          </label>
          <select
            value={filters.reportType}
            onChange={(e) => onFilterChange({ ...filters, reportType: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: '#334155',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">All Reports</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Archive Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            📁 Status
          </label>
          <select
            value={filters.archived ? 'archived' : 'active'}
            onChange={(e) => onFilterChange({ ...filters, archived: e.target.value === 'archived' })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: '#334155',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="active">Active Reports</option>
            <option value="archived">Archived Reports</option>
          </select>
        </div>
      </div>

      {/* Manual Generation Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => onTriggerReport('weekly')}
          disabled={loading}
          style={{
            padding: '10px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#059669'
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#10b981'
          }}
        >
          📅 Generate Weekly Report
        </button>

        <button
          onClick={() => onTriggerReport('monthly')}
          disabled={loading}
          style={{
            padding: '10px 16px',
            backgroundColor: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            fontSize: '13px',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#d97706'
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#f59e0b'
          }}
        >
          📆 Generate Monthly Report
        </button>
      </div>

      {/* Info Message */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#dbeafe',
        border: '1px solid #93c5fd',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#1e40af'
      }}>
        ℹ️ Reports are generated manually on-demand. Click the buttons above to generate weekly or monthly reports.
      </div>
    </div>
  )
}

export default ReportFilters
