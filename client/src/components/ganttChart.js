import React, { useState, useMemo } from 'react';

const GanttChart = ({ ganttTasks, ganttLinks }) => {

  const [tasks] = useState(ganttTasks || [])
  tasks?.forEach(element => {
    console.log("elements: ", element)
  });
  //  console.log(`ganttTasks.. is ${ganttTasks}`);
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

    return {
      start: new Date(Math.min(...dates.map(d => d.getTime()))),
      end: new Date(Math.max(...dates.map(d => d.getTime())))
    };
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
      width: `${Math.max(widthPercent, 2)}%`
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'in-progress':
        return '#f59e0b';
      case 'pending':
      default:
        return '#5b7cfa';
    }
  };

  return (
    <div 
    style={{
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      padding: '16px'
    }}>
      <div style={{ overflowX: 'auto' }}>
        {/* Timeline Header */}
        <div style={{
          display: 'flex',
          marginBottom: '16px',
          borderBottom: '2px solid #4268b3ff'
        }}>
          <div style={{
            width: '200px',
            minWidth: '200px',
            padding: '8px',
            fontWeight: '600',
            color: '#374151',
            borderRight: '1px solid #e5e7eb'
          }}>
            Task Name
          </div>
          <div style={{ display: 'flex', flex: 1 }}>
            {days.map((day, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  minWidth: '40px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#6b7280',
                  borderRight: '1px solid #f3f4f6',
                  backgroundColor: day.getDay() === 0 || day.getDay() === 6 ? '#f9fafb' : 'white'
                }}
              >
                {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        {tasks.length === 0 ? (
          <div style={{
            padding: '32px',
            textAlign: 'center',
            color: '#9ca3af'
          }}>
            No tasks to display
          </div>
        ) : (
          tasks.map((task, idx) => (
            <div
              key={task.id || idx}
              style={{
                display: 'flex',
                marginBottom: '12px',
                alignItems: 'center'
              }}
            >
              <div style={{
                width: '200px',
                minWidth: '200px',
                padding: '8px',
                fontSize: '14px',
                color: '#374151',
                fontWeight: '500',
                borderRight: '1px solid #e5e7eb',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {task.text || task.taskName || 'Untitled'}
              </div>
              <div style={{
                flex: 1,
                position: 'relative',
                height: '32px',
                backgroundColor: '#f9fafb',
                borderRadius: '4px'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    height: '100%',
                    backgroundColor: getStatusColor(task.status),
                    borderRadius: '4px',
                    opacity: 0.8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    ...getTaskStyle(task)
                  }}
                >
                  {task.progress ? `${Math.round(task.progress * 100)}%` : ''}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        gap: '24px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#5b7cfa',
            borderRadius: '2px'
          }} />
          <span>Pending</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#f59e0b',
            borderRadius: '2px'
          }} />
          <span>In Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            backgroundColor: '#10b981',
            borderRadius: '2px'
          }} />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;
