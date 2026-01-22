const MisPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          padding: '10px 16px',
          backgroundColor: currentPage === 1 ? '#e5e7eb' : '#5b7cfa',
          color: currentPage === 1 ? '#9ca3af' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#4c63d2'
          }
        }}
        onMouseOut={(e) => {
          if (currentPage !== 1) {
            e.target.style.backgroundColor = '#5b7cfa'
          }
        }}
      >
        ← Previous
      </button>

      <div style={{
        display: 'flex',
        gap: '6px',
        alignItems: 'center'
      }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '8px 12px',
              backgroundColor: currentPage === page ? '#5b7cfa' : '#f3f4f6',
              color: currentPage === page ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: currentPage === page ? 600 : 500,
              fontSize: '13px',
              transition: 'all 0.2s',
              minWidth: '36px'
            }}
            onMouseOver={(e) => {
              if (currentPage !== page) {
                e.target.style.backgroundColor = '#e5e7eb'
              }
            }}
            onMouseOut={(e) => {
              if (currentPage !== page) {
                e.target.style.backgroundColor = '#f3f4f6'
              }
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: '10px 16px',
          backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#5b7cfa',
          color: currentPage === totalPages ? '#9ca3af' : 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = '#4c63d2'
          }
        }}
        onMouseOut={(e) => {
          if (currentPage !== totalPages) {
            e.target.style.backgroundColor = '#5b7cfa'
          }
        }}
      >
        Next →
      </button>
    </div>
  )
}

export default MisPagination
