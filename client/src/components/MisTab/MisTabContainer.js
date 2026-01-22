import { useState, useEffect } from 'react'
import axios from '../../config/axios'
import toast from '../../utils/toast'
import MisHeader from './MisHeader'
import MisFilterPanel from './MisFilterPanel'
import MisEmptyState from './MisEmptyState'
import MisCardGrid from './MisCardGrid'
import MisPagination from './MisPagination'
import MisModal from './MisModal'

const MisTabContainer = () => {
  // Modal states
  const [isOpen, setIsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingCardId, setEditingCardId] = useState(null)

  // Data state
  const [savedData, setSavedData] = useState([])

  // Filter & pagination states
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch MIS data from API
  const fetchMISData = async () => {
    try {
      const response = await axios.get('/api/mis')
      const dataWithDates = (response.data.data || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
      }))
      setSavedData(dataWithDates)
    } catch (error) {
      console.error('Error fetching MIS data:', error)
      toast.error('Failed to fetch MIS data')
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchMISData()
  }, [])

  // Handle modal open
  const handleAddClick = () => {
    setIsOpen(true)
    setIsEditMode(false)
    setEditingCardId(null)
  }

  // Handle modal close
  const handleClose = () => {
    setIsOpen(false)
    setIsEditMode(false)
    setEditingCardId(null)
  }

  // Handle save data from modal (for new entries)
  const handleSaveData = async (data) => {
    try {
      const response = await axios.post('/api/mis', { rows: data })
      const newEntry = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: response.data.data.updatedAt ? new Date(response.data.data.updatedAt) : null
      }
      setSavedData([newEntry, ...savedData])
      setIsOpen(false)
      toast.success('MIS entry created successfully!')
    } catch (error) {
      console.error('Error saving MIS data:', error)
      toast.error('Failed to save MIS data: ' + (error.response?.data?.message || error.message))
    }
  }

  // Handle edit card
  const handleEditCard = (cardId) => {
    setEditingCardId(cardId)
    setIsEditMode(true)
    setIsOpen(true)
  }

  // Handle update card data
  const handleUpdateCard = async (data) => {
    try {
      const response = await axios.put(`/api/mis/${editingCardId}`, { rows: data })
      const updatedEntry = {
        ...response.data.data,
        createdAt: new Date(response.data.data.createdAt),
        updatedAt: response.data.data.updatedAt ? new Date(response.data.data.updatedAt) : null
      }
      setSavedData(savedData.map(item =>
        item._id === editingCardId 
          ? updatedEntry
          : item
      ))
      setIsOpen(false)
      setIsEditMode(false)
      setEditingCardId(null)
      toast.success('MIS entry updated successfully!')
    } catch (error) {
      console.error('Error updating MIS data:', error)
      toast.error('Failed to update MIS data: ' + (error.response?.data?.message || error.message))
    }
  }

  // Handle delete card
  const handleDeleteCard = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`/api/mis/${id}`)
        setSavedData(savedData.filter(item => item._id !== id))
        toast.success('MIS entry deleted successfully!')
      } catch (error) {
        console.error('Error deleting MIS data:', error)
        toast.error('Failed to delete MIS data: ' + (error.response?.data?.message || error.message))
      }
    }
  }

  // Get the card data for editing
  const getEditingCardData = () => {
    return savedData.find(item => item._id === editingCardId)
  }

  // Filter data based on search and date period
  const getFilteredData = () => {
    let filtered = savedData

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
  }, [searchQuery, sortBy, filterPeriod])

  return (
    <div style={{ padding: '20px' }}>
      {/* Header with Add Button */}
      <MisHeader onAddClick={handleAddClick} />

      {/* Show empty state if no data */}
      {savedData.length === 0 ? (
        <MisEmptyState onAddClick={handleAddClick} />
      ) : (
        <>
          {/* Filter and Search Controls */}
          <MisFilterPanel
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterPeriod={filterPeriod}
            onFilterChange={setFilterPeriod}
            totalEntries={savedData.length}
            filteredCount={filteredData.length}
            currentPage={currentPage}
            totalPages={totalPages}
          />

          {/* Cards Container */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '30px'
          }}>
            <MisCardGrid
              data={paginatedData}
              onEdit={handleEditCard}
              onDelete={handleDeleteCard}
            />
          </div>

          {/* Pagination Controls */}
          <MisPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal Component */}
      <MisModal
        isOpen={isOpen}
        onClose={handleClose}
        onSave={isEditMode ? handleUpdateCard : handleSaveData}
        title={isEditMode ? "Edit MIS Data" : "Add MIS Data"}
        initialData={isEditMode ? getEditingCardData()?.rows : null}
        isEditMode={isEditMode}
      />
    </div>
  )
}

export default MisTabContainer
