import { Download, Archive, Trash2 } from 'lucide-react'

const ReportActions = ({ reportId, onArchive, onDelete, onExport }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onExport(reportId, 'json')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#2563eb'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#3b82f6'
        }}
      >
        <Download size={16} />
        Export JSON
      </button>

      <button
        onClick={() => onExport(reportId, 'csv')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#059669'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#10b981'
        }}
      >
        <Download size={16} />
        Export CSV
      </button>

      <button
        onClick={() => onArchive(reportId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          backgroundColor: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#7c3aed'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#8b5cf6'
        }}
      >
        <Archive size={16} />
        Archive
      </button>

      <button
        onClick={() => onDelete(reportId)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.target.style.backgroundColor = '#dc2626'
        }}
        onMouseOut={(e) => {
          e.target.style.backgroundColor = '#ef4444'
        }}
      >
        <Trash2 size={16} />
        Delete
      </button>
    </div>
  )
}

export default ReportActions
