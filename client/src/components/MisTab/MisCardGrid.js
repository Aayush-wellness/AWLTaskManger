import MisCard from './MisCard'

const MisCardGrid = ({ data, onEdit, onDelete }) => {
  if (data.length === 0) {
    return (
      <div style={{
        gridColumn: '1 / -1',
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        border: '2px dashed #e5e7eb'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
          No Results Found
        </p>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <>
      {data.map((item, index) => (
        <MisCard
          key={item._id}
          item={item}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

export default MisCardGrid
