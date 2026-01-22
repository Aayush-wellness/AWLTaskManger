const MisFilterPanel = ({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  filterPeriod, 
  onFilterChange,
  totalEntries,
  filteredCount,
  currentPage,
  totalPages
}) => {
  return (
    <div style={{
      backgroundColor: '#f9fafb',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '30px',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Search Input */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            🔍 Search Projects
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by project name or description..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'inherit',
              color: '#334155',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Date Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            📅 Filter by Period
          </label>
          <select
            value={filterPeriod}
            onChange={(e) => onFilterChange(e.target.value)}
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
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            marginBottom: '6px'
          }}>
            ↕️ Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        fontSize: '13px',
        color: '#64748b',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontWeight: 600 }}>
          📊 Total: {totalEntries} entries
        </span>
        <span style={{ fontWeight: 600 }}>
          🔎 Showing: {filteredCount} entries
        </span>
        {filteredCount > 0 && (
          <span style={{ fontWeight: 600 }}>
            📄 Page {currentPage} of {totalPages}
          </span>
        )}
      </div>
    </div>
  )
}

export default MisFilterPanel
