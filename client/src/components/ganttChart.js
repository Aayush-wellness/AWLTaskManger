import React, { useState, useMemo } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

const GanttChart = ({ ganttTasks, ganttLinks }) => {
  const [tasks] = useState(ganttTasks || []);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = normal, 0.5 = zoomed out, 2 = zoomed in
  const [hoveredTask, setHoveredTask] = useState(null);

  // Calculate date range for the timeline
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        start: today,
        end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      };
    }

    const dates = tasks
      .flatMap(t => [new Date(t.start_date || t.startDate), new Date(t.end_date || t.endDate)])
      .filter(d => !isNaN(d.getTime()));

    if (dates.length === 0) {
      const today = new Date();
      return {
        start: today,
        end: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      };
    }

    // Add padding days
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    minDate.setDate(minDate.getDate() - 2);
    maxDate.setDate(maxDate.getDate() + 2);

    return { start: minDate, end: maxDate };
  }, [tasks]);

  // Generate days for the timeline header
  const days = useMemo(() => {
    const dayList = [];
    const current = new Date(dateRange.start);
    while (current <= dateRange.end) {
      dayList.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dayList;
  }, [dateRange]);

  // Group days by week/month for header
  const months = useMemo(() => {
    const monthMap = {};
    days.forEach(day => {
      const key = `${day.getFullYear()}-${day.getMonth()}`;
      if (!monthMap[key]) {
        monthMap[key] = {
          name: day.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          days: 0
        };
      }
      monthMap[key].days++;
    });
    return Object.values(monthMap);
  }, [days]);

  // Calculate task position and width
  const getTaskStyle = (task) => {
    const start = new Date(task.start_date || task.startDate);
    const end = new Date(task.end_date || task.endDate);
    
    const totalDays = Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
    const startOffset = Math.max(0, Math.ceil((start - dateRange.start) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    
    const leftPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;

    return {
      left: `${leftPercent}%`,
      width: `${Math.max(widthPercent, 3)}%`
    };
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { 
          color: '#10b981', 
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          bg: '#dcfce7',
          icon: <CheckCircle size={12} />,
          label: 'Completed'
        };
      case 'in-progress':
        return { 
          color: '#3b82f6', 
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          bg: '#dbeafe',
          icon: <Clock size={12} />,
          label: 'In Progress'
        };
      case 'blocked':
        return { 
          color: '#ef4444', 
          gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          bg: '#fee2e2',
          icon: <AlertCircle size={12} />,
          label: 'Blocked'
        };
      case 'pending':
      default:
        return { 
          color: '#f59e0b', 
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          bg: '#fef3c7',
          icon: <Calendar size={12} />,
          label: 'Pending'
        };
    }
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date) => {
    return date.getDay() === 0 || date.getDay() === 6;
  };

  const dayWidth = 48 * zoomLevel;

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
              Task Timeline
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} • {days.length} days
            </p>
          </div>
        </div>
        
        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s'
            }}
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span style={{ fontSize: '12px', color: '#64748b', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25))}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              transition: 'all 0.2s'
            }}
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: '0' }}>
        <div style={{ minWidth: `${200 + days.length * dayWidth}px` }}>
          {/* Month Header */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <div style={{
              width: '200px',
              minWidth: '200px',
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: '12px',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderRight: '1px solid #e2e8f0'
            }}>
              Task
            </div>
            <div style={{ display: 'flex', flex: 1 }}>
              {months.map((month, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${month.days * dayWidth}px`,
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    borderRight: '1px solid #e2e8f0',
                    background: '#f8fafc'
                  }}
                >
                  {month.name}
                </div>
              ))}
            </div>
          </div>

          {/* Days Header */}
          <div style={{
            display: 'flex',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <div style={{
              width: '200px',
              minWidth: '200px',
              borderRight: '1px solid #e2e8f0'
            }} />
            <div style={{ display: 'flex', flex: 1 }}>
              {days.map((day, idx) => (
                <div
                  key={idx}
                  style={{
                    width: `${dayWidth}px`,
                    minWidth: `${dayWidth}px`,
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '11px',
                    borderRight: '1px solid #f1f5f9',
                    backgroundColor: isToday(day) ? '#e0e7ff' : isWeekend(day) ? '#f8fafc' : 'white',
                    position: 'relative'
                  }}
                >
                  <div style={{ 
                    color: isToday(day) ? '#4338ca' : isWeekend(day) ? '#94a3b8' : '#64748b',
                    fontWeight: isToday(day) ? 600 : 400
                  }}>
                    {day.getDate()}
                  </div>
                  <div style={{ 
                    fontSize: '9px', 
                    color: isToday(day) ? '#4338ca' : '#94a3b8',
                    textTransform: 'uppercase'
                  }}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  {isToday(day) && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: '#4338ca'
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          {tasks.length === 0 ? (
            <div style={{
              padding: '48px',
              textAlign: 'center',
              color: '#94a3b8'
            }}>
              <Calendar size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '14px' }}>No tasks to display</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Add tasks to see them on the timeline</p>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {tasks.map((task, idx) => {
                const statusConfig = getStatusConfig(task.status);
                const isHovered = hoveredTask === task.id;
                
                return (
                  <div
                    key={task.id || idx}
                    style={{
                      display: 'flex',
                      marginBottom: '4px',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                      background: isHovered ? '#f8fafc' : 'transparent',
                      borderRadius: '8px',
                      margin: '0 8px 4px 8px'
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    {/* Task Name */}
                    <div style={{
                      width: '192px',
                      minWidth: '192px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: statusConfig.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: statusConfig.color,
                        flexShrink: 0
                      }}>
                        {statusConfig.icon}
                      </div>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#1e293b',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {task.text || task.taskName || 'Untitled'}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#94a3b8'
                        }}>
                          {statusConfig.label}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Bar */}
                    <div style={{
                      flex: 1,
                      position: 'relative',
                      height: '44px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {/* Grid lines */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex'
                      }}>
                        {days.map((day, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${dayWidth}px`,
                              minWidth: `${dayWidth}px`,
                              borderRight: '1px solid #f1f5f9',
                              background: isToday(day) ? 'rgba(99, 102, 241, 0.05)' : isWeekend(day) ? '#fafafa' : 'transparent'
                            }}
                          />
                        ))}
                      </div>

                      {/* Task Bar */}
                      <div
                        style={{
                          position: 'absolute',
                          height: '28px',
                          background: statusConfig.gradient,
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '11px',
                          fontWeight: 600,
                          boxShadow: isHovered ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                          cursor: 'pointer',
                          zIndex: isHovered ? 10 : 1,
                          ...getTaskStyle(task)
                        }}
                        title={`${task.text || task.taskName}\n${new Date(task.start_date || task.startDate).toLocaleDateString()} - ${new Date(task.end_date || task.endDate).toLocaleDateString()}`}
                      >
                        {task.progress !== undefined && task.progress > 0 && (
                          <span>{Math.round(task.progress * 100)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['pending', 'in-progress', 'completed', 'blocked'].map(status => {
            const config = getStatusConfig(status);
            return (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  background: config.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {config.icon}
                </div>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#4338ca'
          }} />
          <span style={{ fontSize: '12px', color: '#64748b' }}>Today</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
