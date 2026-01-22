import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, AlertCircle } from 'lucide-react'
import axios from '../../config/axios'
import toast from '../../utils/toast'
import ReportHeader from './ReportHeader'
import ReportFilters from './ReportFilters'
import ReportSummary from './ReportSummary'
import EmployeeMetricsTable from './EmployeeMetricsTable'
import DepartmentMetrics from './DepartmentMetrics'
import ProjectMetrics from './ProjectMetrics'
import TopPerformers from './TopPerformers'
import AtRiskEmployees from './AtRiskEmployees'
import ReportActions from './ReportActions'

const PerformanceReportTabContainer = () => {
  const [reports, setReports] = useState([])
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    reportType: 'all',
    archived: false
  })

  // Fetch reports
  const fetchReports = async (pageNum = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pageNum)
      params.append('limit', 10)
      
      if (filters.reportType !== 'all') {
        params.append('reportType', filters.reportType)
      }
      params.append('archived', filters.archived)

      const response = await axios.get(`/api/reports?${params}`)
      setReports(response.data.data)
      setPage(response.data.pagination.page)
      setTotalPages(response.data.pagination.pages)

      if (response.data.data.length > 0 && !selectedReport) {
        setSelectedReport(response.data.data[0])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchReports(1)
  }, [filters])

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPage(1)
  }

  // Handle report selection
  const handleSelectReport = (report) => {
    setSelectedReport(report)
  }

  // Handle generate report
  const handleGenerateReport = async (reportType) => {
    try {
      setLoading(true)
      const response = await axios.post('/api/reports/generate', {
        reportType,
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: new Date()
      })

      toast.success(`${reportType} report generated successfully`)
      fetchReports(1)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error(error.response?.data?.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  // Handle archive report
  const handleArchiveReport = async (reportId) => {
    try {
      await axios.put(`/api/reports/${reportId}/archive`)
      toast.success('Report archived successfully')
      fetchReports(page)
    } catch (error) {
      console.error('Error archiving report:', error)
      toast.error('Failed to archive report')
    }
  }

  // Handle delete report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    try {
      await axios.delete(`/api/reports/${reportId}`)
      toast.success('Report deleted successfully')
      setSelectedReport(null)
      fetchReports(page)
    } catch (error) {
      console.error('Error deleting report:', error)
      toast.error('Failed to delete report')
    }
  }

  // Handle export
  const handleExport = async (reportId, format) => {
    try {
      const endpoint = `/api/reports/${reportId}/export/${format}`
      const response = await axios.get(endpoint, { responseType: 'blob' })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${reportId}.${format}`)
      document.body.appendChild(link)
      link.click()
      link.parentChild.removeChild(link)

      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <ReportHeader />

      {/* Filters */}
      <ReportFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onTriggerReport={handleGenerateReport}
        loading={loading}
      />

      {/* Main Content */}
      {loading && !selectedReport ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p>Loading reports...</p>
        </div>
      ) : selectedReport ? (
        <>
          {/* Report Selection */}
          <div style={{
            backgroundColor: '#f9fafb',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid #e5e7eb'
          }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Select Report
            </label>
            <select
              value={selectedReport._id}
              onChange={(e) => {
                const report = reports.find(r => r._id === e.target.value)
                handleSelectReport(report)
              }}
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
              {reports.map(report => (
                <option key={report._id} value={report._id}>
                  {report.reportType.toUpperCase()} - {new Date(report.period.startDate).toLocaleDateString()} to {new Date(report.period.endDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Report Actions */}
          <ReportActions
            reportId={selectedReport._id}
            onArchive={handleArchiveReport}
            onDelete={handleDeleteReport}
            onExport={handleExport}
          />

          {/* Summary */}
          <ReportSummary summary={selectedReport.summary} />

          {/* Top Performers & At-Risk */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            <TopPerformers performers={selectedReport.topPerformers} />
            <AtRiskEmployees employees={selectedReport.atRiskEmployees} />
          </div>

          {/* Employee Metrics Table */}
          <EmployeeMetricsTable metrics={selectedReport.employeeMetrics} />

          {/* Department Metrics */}
          <DepartmentMetrics metrics={selectedReport.departmentMetrics} />

          {/* Project Metrics */}
          <ProjectMetrics metrics={selectedReport.projectMetrics} />

          {/* Recommendations */}
          {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '20px',
              marginTop: '24px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <AlertCircle size={20} style={{ color: '#d97706' }} />
                <h3 style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#92400e'
                }}>
                  Recommendations
                </h3>
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: '20px',
                color: '#92400e'
              }}>
                {selectedReport.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
          border: '2px dashed #e5e7eb'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
          <p style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px 0' }}>
            No Reports Available
          </p>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Generate your first performance report to get started
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px'
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => fetchReports(p)}
              style={{
                padding: '8px 12px',
                backgroundColor: page === p ? '#5b7cfa' : '#f3f4f6',
                color: page === p ? 'white' : '#64748b',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: page === p ? 600 : 500,
                fontSize: '13px'
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default PerformanceReportTabContainer
