import AdminMisCard from './AdminMisCard'

const AdminMisCardGrid = ({ data, employees }) => {
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
          No MIS Data Found
        </p>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  // Create a map of employee IDs to employee data for quick lookup
  const employeeMap = employees.reduce((acc, emp) => {
    acc[emp._id] = emp
    return acc
  }, {})

  return (
    <>
      {data.map((item, index) => {
        const employee = employeeMap[item.userId] || {}
        return (
          <AdminMisCard
            key={item._id}
            item={item}
            index={index}
            employeeName={employee.name || 'Unknown Employee'}
            employeeEmail={employee.email || 'N/A'}
          />
        )
      })}
    </>
  )
}

export default AdminMisCardGrid
