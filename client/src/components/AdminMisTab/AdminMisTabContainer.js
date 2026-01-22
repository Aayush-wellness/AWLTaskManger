import { useState, useEffect } from 'react'
import { BarChart3 } from 'lucide-react'
import axios from '../../config/axios'
import toast from '../../utils/toast'
import AdminMisFilterPanel from './AdminMisFilterPanel'
import AdminMisCardGrid from './AdminMisCardGrid'
import AdminMisPagination from './AdminMisPagination'
import EmployeePerformanceReport from './EmployeePerformanceReport'

const AdminMisTabContainer = ({ employees, onRefresh }) => {
  // Data state
  const [allMisData, setAllMisData] = useState([])

  // Filter & pagination states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch all MIS data from all employees
  const fetchAllMisData = async () => {
    try {
      const response = await axios.get('/api/mis/admin/all')
      const dataWithDates = (response.data.data || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
      }))
      setAllMisData(dataWithDates)
    } catch (error) {
      console.error('Error fetching MIS data:', error)
      toast.error('Failed to fetch MIS data')
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchAllMisData()
  }, [])

  // Filter data based on search, employee, and date period
  const getFilteredData = () => {
    let filtered = allMisData

    // Filter by employee
    if (selectedEmployee) {
      filtered = filtered.filter(item => item.userId === selectedEmployee)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.rows.some(row =>
          row.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          row.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Filter by date period
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (filterPeriod === 'today') {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt.getFullYear(), item.createdAt.getMonth(), item.createdAt.getDate())
        return itemDate.getTime() === today.getTime()
      })
    } else if (filterPeriod === 'week') {
      filtered = filtered.filter(item => item.createdAt >= weekAgo)
    } else if (filterPeriod === 'month') {
      filtered = filtered.filter(item => item.createdAt >= monthAgo)
    }

    // Sort data
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.createdAt - a.createdAt)
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.createdAt - b.createdAt)
    } else if (sortBy === 'alphabetical') {
      filtered.sort((a, b) => {
        const nameA = a.rows[0]?.projectName || ''
        const nameB = b.rows[0]?.projectName || ''
        return nameA.localeCompare(nameB)
      })
    }

    return filtered
  }

  // Get paginated data
  const filteredData = getFilteredData()
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, filterPeriod, selectedEmployee])

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              Employee MIS Reports
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              color: '#64748b'
            }}>
              View and manage MIS data from all employees
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <AdminMisFilterPanel
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        filterPeriod={filterPeriod}
        onFilterChange={setFilterPeriod}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        employees={employees}
        totalEntries={allMisData.length}
        filteredCount={filteredData.length}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Cards Container */}
      {filteredData.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
            {allMisData.length === 0 ? 'No MIS Data Available' : 'No Results Found'}
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {allMisData.length === 0 
              ? 'Employees have not submitted any MIS data yet'
              : 'Try adjusting your search or filters'}
          </p>
        </div>
      ) : (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '30px'
          }}>
            <AdminMisCardGrid
              data={paginatedData}
              employees={employees}
            />
          </div>

          {/* Pagination Controls */}
          <AdminMisPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Performance Report Section */}
      <EmployeePerformanceReport
        selectedEmployeeId={selectedEmployee}
        selectedEmployeeName={selectedEmployee ? employees.find(e => e._id === selectedEmployee)?.name : ''}
        employees={employees}
      />
    </div>
  )
}

export default AdminMisTabContainer
