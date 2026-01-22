import { Plus } from 'lucide-react'

const MisEmptyState = ({ onAddClick }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 20px',
      backgroundColor: '#f9fafb',
      borderRadius: '12px',
      border: '2px dashed #e5e7eb'
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
      <p style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
        No MIS Data Yet
      </p>
      <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0' }}>
        Click "Add MIS Data" to create your first entry
      </p>
      <button
        onClick={onAddClick}
        style={{
          padding: '12px 24px',
          backgroundColor: '#5b7cfa',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          transition: 'all 0.2s',
          boxShadow: '0 2px 8px rgba(91, 124, 250, 0.3)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#4c63d2'
          e.target.style.boxShadow = '0 4px 12px rgba(91, 124, 250, 0.4)'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#5b7cfa'
          e.target.style.boxShadow = '0 2px 8px rgba(91, 124, 250, 0.3)'
        }}
      >
        <Plus size={18} />
        <span>Add MIS Data</span>
      </button>
    </div>
  )
}

export default MisEmptyState
