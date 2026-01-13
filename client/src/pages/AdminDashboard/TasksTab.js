import { Box, Typography } from '@mui/material';
import { ListTodo } from 'lucide-react';
import HierarchicalTaskSystem from '../../components/HierarchicalTaskSystem';

const TasksTab = ({
  tasks,
  employees,
  departments,
  projects,
  lastUpdated,
  isRefreshing,
  onRefresh,
  onManualRefresh
}) => {
  return (
    <Box className="tasks-tab-modern">
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3
      }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>
              <ListTodo size={24} />
            </Box>
            All Tasks
          </Typography>
          <Typography sx={{ color: '#64748b', ml: 8 }}>
            Manage tasks by department and employee
          </Typography>
        </Box>
        {lastUpdated && (
          <Box sx={{ 
            px: 3, py: 1.5, 
            backgroundColor: '#f1f5f9', 
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <Typography sx={{ fontSize: '13px', color: '#64748b' }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Task System */}
      <Box sx={{ 
        backgroundColor: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <HierarchicalTaskSystem />
      </Box>
    </Box>
  );
};

export default TasksTab;
