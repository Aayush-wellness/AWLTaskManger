import { Plus } from 'lucide-react'

const MisHeader = ({ onAddClick }) => {
  return (
    <div style={{ marginBottom: '30px' }}>
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
          display: 'flex',
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

export default MisHeader
