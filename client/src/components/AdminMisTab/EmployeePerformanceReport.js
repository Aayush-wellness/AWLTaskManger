import { useState } from 'react'
import { Download, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import axios from '../../config/axios'
import toast from '../../utils/toast'

const EmployeePerformanceReport = ({ selectedEmployeeId, selectedEmployeeName, employees }) => {
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [showReport, setShowReport] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Generate performance report for selected employee
  const handleGenerateReport = async (useCustomDates = false) => {
    if (!selectedEmployeeId) {
      toast.error('Please select an employee first')
      return
    }

    try {
      setLoading(true)

      let startDate, endDate

      if (useCustomDates) {
        // Use custom date range
        startDate = new Date(dateRange.startDate)
        endDate = new Date(dateRange.endDate)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
      } else {
        // Use current week (Monday to Friday)
        const today = new Date()
        const dayOfWeek = today.getDay()
        startDate = new Date(today)
        startDate.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
        startDate.setHours(0, 0, 0, 0)

        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 4)
        endDate.setHours(23, 59, 59, 999)
      }

      // Fetch employee MIS data
      const response = await axios.get(`/api/mis/employee/${selectedEmployeeId}`)
      const employeeMisData = response.data.data || []

      // Filter for selected employee and date range
      const filteredData = employeeMisData.filter(item => {
        const itemDate = new Date(item.createdAt)
        return itemDate >= startDate && itemDate <= endDate
      })

      // Calculate metrics
      const metrics = calculateEmployeeMetrics(filteredData, selectedEmployeeName, startDate, endDate)
      setReportData(metrics)
      setShowReport(true)
      setShowDatePicker(false)

      toast.success('Performance report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate performance report')
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics for employee
  const calculateEmployeeMetrics = (misData, employeeName, startDate, endDate) => {
    if (misData.length === 0) {
      return {
        employeeName,
        submissions: 0,
        totalProjects: 0,
        avgDescriptionLength: 0,
        consistencyScore: 0,
        status: 'no-data',
        projectBreakdown: [],
        insights: 'No MIS data available for this period',
        dateRange: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
      }
    }

    // Calculate basic metrics
    const totalProjects = misData.reduce((sum, sub) => sum + (sub.rows?.length || 0), 0)
    const totalDescLength = misData.reduce((sum, sub) =>
      sum + sub.rows.reduce((rowSum, row) => rowSum + (row.description?.length || 0), 0), 0
    )
    const avgDescriptionLength = Math.round(totalDescLength / totalProjects)

    // Calculate consistency score (adjusted for date range)
    const consistencyScore = calculateConsistencyScore(misData, startDate, endDate)

    // Determine status based on consistency score only
    let status = 'on-track'
    if (consistencyScore >= 80) status = 'excellent'
    else if (consistencyScore < 60) status = 'at-risk'

    // Generate insights
    const insights = generateInsights(consistencyScore, totalProjects, avgDescriptionLength)

    // Calculate project breakdown
    const projectCounts = {}
    misData.forEach(sub => {
      sub.rows?.forEach(row => {
        const projectName = row.projectName || 'Unnamed Project'
        projectCounts[projectName] = (projectCounts[projectName] || 0) + 1
      })
    })

    const projectBreakdown = Object.entries(projectCounts)
      .map(([projectName, count]) => ({
        projectName,
        count,
        percentage: Math.round((count / totalProjects) * 100)
      }))
      .sort((a, b) => b.count - a.count)

    return {
      employeeName,
      submissions: misData.length,
      totalProjects,
      avgDescriptionLength,
      consistencyScore,
      status,
      projectBreakdown,
      insights,
      dateRange: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
      generatedAt: new Date().toLocaleString()
    }
  }

  // Calculate consistency score (adjusted for date range)
  const calculateConsistencyScore = (submissions, startDate, endDate) => {
    if (submissions.length === 0) return 0

    // Calculate expected submissions based on date range
    const diffTime = Math.abs(endDate - startDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 // +1 to include both start and end date
    
    // Expected: 1 submission per day (excluding weekends)
    let expectedSubmissions = 0
    for (let i = 0; i < diffDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dayOfWeek = date.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        expectedSubmissions++
      }
    }

    const actualSubmissions = submissions.length

    let gapPenalty = 0
    const sortedSubmissions = submissions.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    for (let i = 0; i < sortedSubmissions.length - 1; i++) {
      const gap = (new Date(sortedSubmissions[i + 1].createdAt) - new Date(sortedSubmissions[i].createdAt)) / (1000 * 60 * 60 * 24)
      if (gap > 1) gapPenalty += 10 // Penalty for gaps > 1 day
    }

    const submissionRate = (actualSubmissions / expectedSubmissions) * 100
    const consistencyScore = Math.max(0, submissionRate - gapPenalty)

    return Math.min(100, Math.round(consistencyScore))
  }

  // Generate insights
  const generateInsights = (consistency, totalProjects, avgDescLength) => {
    const insights = []

    if (consistency < 50) {
      insights.push('⚠️ Low submission consistency - needs improvement')
    } else if (consistency >= 80) {
      insights.push('✅ Excellent submission consistency')
    }

    if (totalProjects > 5) {
      insights.push('📦 Working on diverse projects')
    } else if (totalProjects <= 2) {
      insights.push('📌 Limited project diversity')
    }

    if (avgDescLength < 50) {
      insights.push('📝 Descriptions are too brief')
    } else if (avgDescLength > 150) {
      insights.push('📝 Detailed and comprehensive descriptions')
    }

    return insights.length > 0 ? insights.join(' | ') : 'Performance metrics within normal range'
  }

  // Export report as JSON
  const handleExportJSON = () => {
    if (!reportData) return

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-report-${selectedEmployeeName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Report exported as JSON')
  }

  // Export report as CSV
  const handleExportCSV = () => {
    if (!reportData) return

    let csv = 'Employee Performance Report\n'
    csv += `Employee: ${reportData.employeeName}\n`
    csv += `Generated: ${reportData.generatedAt}\n\n`

    csv += 'SUMMARY\n'
    csv += `Submissions,${reportData.submissions}\n`
    csv += `Total Projects,${reportData.totalProjects}\n`
    csv += `Avg Description Length,${reportData.avgDescriptionLength}\n`
    csv += `Consistency Score,${reportData.consistencyScore}/100\n`
    csv += `Status,${reportData.status}\n\n`

    csv += 'PROJECT BREAKDOWN\n'
    csv += 'Project Name,Count,Percentage\n'
    reportData.projectBreakdown.forEach(proj => {
      csv += `"${proj.projectName}",${proj.count},${proj.percentage}%\n`
    })

    csv += '\nINSIGHTS\n'
    csv += `"${reportData.insights}"\n`

    const dataBlob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `performance-report-${selectedEmployeeName}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('Report exported as CSV')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#10b981'
      case 'on-track':
        return '#f59e0b'
      case 'at-risk':
        return '#ef4444'
      case 'no-data':
        return '#64748b'
      default:
        return '#64748b'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'excellent':
        return '#d1fae5'
      case 'on-track':
        return '#fef3c7'
      case 'at-risk':
        return '#fee2e2'
      case 'no-data':
        return '#f3f4f6'
      default:
        return '#f3f4f6'
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
      marginTop: '24px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <TrendingUp size={20} style={{ color: '#667eea' }} />
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e293b'
        }}>
          Performance Report
        </h3>
      </div>

      {/* Generate Button */}
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={() => handleGenerateReport(false)}
          disabled={loading || !selectedEmployeeId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: selectedEmployeeId ? '#667eea' : '#cbd5e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedEmployeeId && !loading ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s',
            marginRight: '8px'
          }}
          onMouseOver={(e) => {
            if (selectedEmployeeId && !loading) {
              e.target.style.backgroundColor = '#5b63d9'
            }
          }}
          onMouseOut={(e) => {
            if (selectedEmployeeId && !loading) {
              e.target.style.backgroundColor = '#667eea'
            }
          }}
        >
          <TrendingUp size={16} />
          {loading ? 'Generating...' : 'Generate This Week'}
        </button>

        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          disabled={!selectedEmployeeId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: selectedEmployeeId ? '#10b981' : '#cbd5e1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: selectedEmployeeId ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            if (selectedEmployeeId) {
              e.target.style.backgroundColor = '#059669'
            }
          }}
          onMouseOut={(e) => {
            if (selectedEmployeeId) {
              e.target.style.backgroundColor = '#10b981'
            }
          }}
        >
          <Calendar size={16} />
          Custom Date Range
        </button>
      </div>

      {/* Custom Date Picker */}
      {showDatePicker && (
        <div style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: '#64748b',
            textTransform: 'uppercase'
          }}>
            Select Date Range
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '4px'
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748b',
                marginBottom: '4px'
              }}>
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport(true)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '12px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      )}

      {/* Report Display */}
      {showReport && reportData && (
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          {/* Date Range Info */}
          <div style={{
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '12px',
            color: '#1e40af',
            fontWeight: 600
          }}>
            📅 Report Period: {reportData.dateRange}
          </div>
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Submissions
              </p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#3b82f6' }}>
                {reportData.submissions}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Projects
              </p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                {reportData.totalProjects}
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Consistency
              </p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#f59e0b' }}>
                {reportData.consistencyScore}/100
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                Status
              </p>
              <div style={{
                display: 'inline-block',
                backgroundColor: getStatusBgColor(reportData.status),
                color: getStatusColor(reportData.status),
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'capitalize'
              }}>
                {reportData.status === 'no-data' ? 'No Data' : reportData.status}
              </div>
            </div>
          </div>

          {/* Insights */}
          {reportData.insights && (
            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #93c5fd',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '12px',
              color: '#1e40af'
            }}>
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} /> Insights
              </p>
              <p style={{ margin: 0, lineHeight: '1.5' }}>
                {reportData.insights}
              </p>
            </div>
          )}

          {/* Project Breakdown */}
          {reportData.projectBreakdown.length > 0 && (
            <div style={{
              marginBottom: '16px'
            }}>
              <p style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#64748b',
                textTransform: 'uppercase'
              }}>
                Project Breakdown
              </p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {reportData.projectBreakdown.map((proj, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {proj.projectName}
                    </span>
                    <span style={{
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      color: '#64748b',
                      fontWeight: 600
                    }}>
                      {proj.count} ({proj.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleExportJSON}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#2563eb'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#3b82f6'
              }}
            >
              <Download size={14} />
              Export JSON
            </button>

            <button
              onClick={handleExportCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#059669'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#10b981'
              }}
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>
      )}

      {/* No Employee Selected */}
      {!selectedEmployeeId && !showReport && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
          color: '#64748b',
          fontSize: '13px'
        }}>
          👤 Select an employee to generate their performance report
        </div>
      )}
    </div>
  )
}

export default EmployeePerformanceReport
