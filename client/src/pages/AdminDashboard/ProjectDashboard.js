import { useState, useEffect, useMemo } from 'react';
import {
  Box, Card, CardContent, Typography, Chip, Tab, Tabs, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog,
  DialogContent, Button, IconButton, TextField, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { 
  CheckCircle, Clock, AlertTriangle, Target, X, Users, 
  TrendingUp, FolderKanban, BarChart3, ArrowRight, Calendar, Search, Eye
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const ProjectDashboard = ({ projects, employees }) => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState(0);
  const [tasksData, setTasksData] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const allTasks = [];
    employees.forEach(emp => {
      if (emp.tasks && Array.isArray(emp.tasks)) {
        emp.tasks.forEach(task => {
          allTasks.push({
            ...task,
            employeeId: emp._id,
            employeeName: emp.name,
            employeeEmail: emp.email,
            employeeJobTitle: emp.jobTitle,
            employeeDepartment: emp.department?.name || 'N/A',
          });
        });
      }
    });
    setTasksData(allTasks);
  }, [employees]);

  const isOverdue = (endDate, status) => {
    if (status === 'completed' || !endDate) return false;
    return new Date(endDate) < new Date();
  };

  const projectStats = useMemo(() => {
    return projects.map(project => {
      const projectTasks = tasksData.filter(task => task.project === project.name);
      const completed = projectTasks.filter(t => t.status === 'completed').length;
      const inProgress = projectTasks.filter(t => t.status === 'in-progress').length;
      const blocked = projectTasks.filter(t => t.status === 'blocked').length;
      const notStarted = projectTasks.filter(t => t.status === 'pending').length;
      const overdue = projectTasks.filter(t => isOverdue(t.endDate, t.status)).length;
      const total = projectTasks.length;
      const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...project,
        tasks: projectTasks,
        stats: { total, completed, inProgress, blocked, notStarted, overdue, completionPercentage }
      };
    });
  }, [projects, tasksData]);

  const overallStats = useMemo(() => {
    const totalTasks = tasksData.length;
    const completedTasks = tasksData.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasksData.filter(t => t.status === 'in-progress').length;
    const blockedTasks = tasksData.filter(t => t.status === 'blocked').length;
    const pendingTasks = tasksData.filter(t => t.status === 'pending').length;
    const overdueTasks = tasksData.filter(t => isOverdue(t.endDate, t.status)).length;

    const deptStats = {};
    employees.forEach(emp => {
      const deptName = emp.department?.name || 'Unassigned';
      if (!deptStats[deptName]) {
        deptStats[deptName] = { name: deptName, members: 0, tasks: 0, completed: 0 };
      }
      deptStats[deptName].members++;
      const empTasks = tasksData.filter(t => t.employeeId === emp._id);
      deptStats[deptName].tasks += empTasks.length;
      deptStats[deptName].completed += empTasks.filter(t => t.status === 'completed').length;
    });

    return {
      totalTasks, completedTasks, inProgressTasks, blockedTasks, pendingTasks, overdueTasks,
      completionPercentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      departmentStats: Object.values(deptStats),
    };
  }, [tasksData, employees]);

  const productivityTrend = useMemo(() => {
    const trend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayTasks = tasksData.filter(t => {
        const taskDate = new Date(t.createdAt || t.startDate);
        return taskDate.toDateString() === date.toDateString();
      });
      trend.push({
        date: dateStr,
        completed: dayTasks.filter(t => t.status === 'completed').length,
        inProgress: dayTasks.filter(t => t.status === 'in-progress').length,
        pending: dayTasks.filter(t => t.status === 'pending').length,
        total: dayTasks.length,
      });
    }
    return trend;
  }, [tasksData]);

  const getStatusColor = (status) => {
    const colors = {
      'completed': '#10b981',
      'in-progress': '#3b82f6',
      'blocked': '#ef4444',
      'pending': '#f59e0b',
    };
    return colors[status] || '#6b7280';
  };

  const tabConfig = [
    { label: 'Admin Overview', icon: <BarChart3 size={18} /> },
    { label: 'Project Dashboard', icon: <FolderKanban size={18} /> },
    { label: 'Project Departments', icon: <Users size={18} /> },
    { label: 'View Assigned Tasks', icon: <Eye size={18} /> },
    { label: 'Productivity Trends', icon: <TrendingUp size={18} /> },
  ];

  return (
    <Box sx={{ width: '100%', minHeight: '100%' }}>
      {/* Modern Tab Navigation */}
      <Box sx={{ 
        background: 'white', 
        borderRadius: '16px', 
        p: 1, 
        mb: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Tabs 
          value={activeView} 
          onChange={(e, newValue) => setActiveView(newValue)}
          sx={{
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-flexContainer': { gap: '8px', flexWrap: 'wrap' },
          }}
        >
          {tabConfig.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              sx={{
                textTransform: 'none',
                fontSize: '14px',
                fontWeight: 500,
                color: '#64748b',
                borderRadius: '12px',
                minHeight: '48px',
                px: 2.5,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'white',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  fontWeight: 600,
                },
                '&:hover:not(.Mui-selected)': {
                  background: '#f1f5f9',
                  color: '#334155',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content Views */}
      {activeView === 0 && <AdminOverviewView stats={overallStats} />}
      {activeView === 1 && <ProjectDashboardView stats={projectStats} setSelectedProject={setSelectedProject} setActiveView={setActiveView} />}
      {activeView === 2 && <ProjectDepartmentsView stats={projectStats} employees={employees} tasksData={tasksData} selectedProject={selectedProject} setSelectedProject={setSelectedProject} selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} setSelectedMember={setSelectedMember} setMemberDetailsOpen={setMemberDetailsOpen} />}
      {activeView === 3 && <ViewAssignedTasksView tasksData={tasksData} currentUser={user} getStatusColor={getStatusColor} isOverdue={isOverdue} />}
      {activeView === 4 && <ProductivityTrendsView trend={productivityTrend} />}

      <MemberDetailsModal open={memberDetailsOpen} member={selectedMember} onClose={() => setMemberDetailsOpen(false)} getStatusColor={getStatusColor} />
    </Box>
  );
};

export default ProjectDashboard;

// Helper function for avatar colors
const getAvatarColor = (name) => {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  ];
  const index = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

// Stat Card Component
const StatCard = ({ icon, label, value, gradient, subtitle }) => (
  <Card sx={{ 
    borderRadius: '16px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
  }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box sx={{
          width: 52, height: 52, borderRadius: '14px',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
        }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 500, mb: 0.5 }}>{label}</Typography>
          <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{value}</Typography>
          {subtitle && <Typography sx={{ fontSize: '12px', color: '#94a3b8', mt: 0.5 }}>{subtitle}</Typography>}
        </Box>
      </Box>
    </CardContent>
  </Card>
);


// Admin Overview View
const AdminOverviewView = ({ stats }) => (
  <Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Admin Overview</Typography>
      <Typography sx={{ color: '#64748b' }}>Organization-wide task metrics and department performance</Typography>
    </Box>

    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<Target size={24} />} label="Total Tasks" value={stats.totalTasks} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<CheckCircle size={24} />} label="Completed" value={stats.completedTasks} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" subtitle={`${stats.completionPercentage}% done`} />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<Clock size={24} />} label="In Progress" value={stats.inProgressTasks} gradient="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<AlertTriangle size={24} />} label="Overdue" value={stats.overdueTasks} gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" subtitle="Need attention" />
      </Grid>
    </Grid>

    <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 4 }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>Overall Completion</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '14px' }}>Team progress across all projects</Typography>
          </Box>
          <Box sx={{ px: 3, py: 1.5, background: stats.completionPercentage > 70 ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '12px' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: stats.completionPercentage > 70 ? '#16a34a' : '#d97706' }}>{stats.completionPercentage}%</Typography>
          </Box>
        </Box>
        <Box sx={{ height: 12, borderRadius: 6, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${stats.completionPercentage}%`, background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)', borderRadius: 6, transition: 'width 0.5s ease' }} />
        </Box>
      </CardContent>
    </Card>

    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>Department Performance</Typography>
    <Grid container spacing={3}>
      {stats.departmentStats.map((dept, idx) => {
        const deptCompletion = dept.tasks > 0 ? Math.round((dept.completed / dept.tasks) * 100) : 0;
        return (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: getAvatarColor(dept.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                    {dept.name?.charAt(0).toUpperCase()}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{dept.name}</Typography>
                    <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>{dept.members} members</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 }}>
                  <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{dept.tasks}</Typography>
                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Tasks</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, backgroundColor: '#f0fdf4', borderRadius: '10px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#16a34a' }}>{dept.completed}</Typography>
                    <Typography sx={{ fontSize: '11px', color: '#64748b' }}>Done</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${deptCompletion}%`, borderRadius: 3, background: deptCompletion > 70 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)' }} />
                  </Box>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: deptCompletion > 70 ? '#16a34a' : '#d97706' }}>{deptCompletion}%</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
);

// Project Dashboard View
const ProjectDashboardView = ({ stats, setSelectedProject, setActiveView }) => (
  <Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Project Dashboard</Typography>
      <Typography sx={{ color: '#64748b' }}>Click on a project to view department breakdown</Typography>
    </Box>

    <Grid container spacing={3}>
      {stats.map(project => (
        <Grid item xs={12} md={6} lg={4} key={project._id}>
          <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.3s ease', border: '2px solid transparent', '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 40px rgba(102, 126, 234, 0.15)', borderColor: '#667eea' } }} onClick={() => { setSelectedProject(project); setActiveView(2); }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ width: 48, height: 48, borderRadius: '14px', background: getAvatarColor(project.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px' }}>
                    {project.name?.charAt(0).toUpperCase()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{project.name}</Typography>
                    <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>{project.stats.total} tasks</Typography>
                  </Box>
                </Box>
                <Box sx={{ px: 2, py: 1, borderRadius: '20px', background: project.stats.completionPercentage > 70 ? '#dcfce7' : project.stats.completionPercentage > 40 ? '#dbeafe' : '#fef3c7', color: project.stats.completionPercentage > 70 ? '#16a34a' : project.stats.completionPercentage > 40 ? '#1d4ed8' : '#d97706', fontWeight: 700, fontSize: '14px' }}>
                  {project.stats.completionPercentage}%
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ height: 8, borderRadius: 4, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                  <Box sx={{ height: '100%', width: `${project.stats.completionPercentage}%`, borderRadius: 4, background: project.stats.completionPercentage > 70 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : project.stats.completionPercentage > 40 ? 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', transition: 'width 0.5s ease' }} />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
                {[
                  { label: 'Done', value: project.stats.completed, color: '#22c55e', bg: '#f0fdf4' },
                  { label: 'Active', value: project.stats.inProgress, color: '#3b82f6', bg: '#eff6ff' },
                  { label: 'Blocked', value: project.stats.blocked, color: '#ef4444', bg: '#fef2f2' },
                  { label: 'Todo', value: project.stats.notStarted, color: '#f59e0b', bg: '#fffbeb' },
                ].map((stat, idx) => (
                  <Box key={idx} sx={{ p: 1.5, backgroundColor: stat.bg, borderRadius: '10px', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '10px', color: stat.color, fontWeight: 500, textTransform: 'uppercase' }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>

              {project.stats.overdue > 0 && (
                <Box sx={{ p: 2, backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AlertTriangle size={18} style={{ color: '#ef4444' }} />
                  <Typography sx={{ color: '#dc2626', fontWeight: 600, fontSize: '13px' }}>{project.stats.overdue} overdue task{project.stats.overdue !== 1 ? 's' : ''}</Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                <Typography sx={{ fontSize: '13px', color: '#667eea', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>View departments <ArrowRight size={16} /></Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);


// Project Departments View
const ProjectDepartmentsView = ({ stats, employees, tasksData, selectedProject, setSelectedProject, selectedDepartment, setSelectedDepartment, setSelectedMember, setMemberDetailsOpen }) => {
  const project = selectedProject || stats[0];
  if (!project) return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <FolderKanban size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
      <Typography variant="h6" sx={{ color: '#94a3b8' }}>No projects available</Typography>
    </Box>
  );

  const projectTasks = tasksData.filter(task => task.project === project.name);
  const departmentsInProject = {};
  
  projectTasks.forEach(task => {
    const dept = task.employeeDepartment;
    if (!departmentsInProject[dept]) {
      departmentsInProject[dept] = { name: dept, members: [], tasks: [], completed: 0, inProgress: 0, blocked: 0, pending: 0 };
    }
    departmentsInProject[dept].tasks.push(task);
    if (task.status === 'completed') departmentsInProject[dept].completed++;
    else if (task.status === 'in-progress') departmentsInProject[dept].inProgress++;
    else if (task.status === 'blocked') departmentsInProject[dept].blocked++;
    else if (task.status === 'pending') departmentsInProject[dept].pending++;
  });

  Object.keys(departmentsInProject).forEach(deptName => {
    const deptMembers = employees.filter(emp => emp.department?.name === deptName);
    departmentsInProject[deptName].members = deptMembers;
  });

  const departments = Object.values(departmentsInProject);
  const selectedDeptData = selectedDepartment ? departmentsInProject[selectedDepartment] : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 0.5 }}>{project.name}</Typography>
          <Typography sx={{ color: '#64748b' }}>Department & Team Overview</Typography>
        </Box>
        {selectedDepartment && (
          <Button onClick={() => setSelectedDepartment(null)} variant="outlined" startIcon={<ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 500, borderColor: '#e2e8f0', color: '#64748b', '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f8fafc' } }}>
            Back to Departments
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={selectedDeptData ? 5 : 12}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>Departments</Typography>
            <Chip label={`${departments.length} teams`} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: selectedDeptData ? '1fr' : { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
            {departments.map(dept => {
              const deptCompletion = dept.tasks.length > 0 ? Math.round((dept.completed / dept.tasks.length) * 100) : 0;
              const isSelected = selectedDepartment === dept.name;

              return (
                <Card key={dept.name} sx={{ cursor: 'pointer', borderRadius: '16px', border: isSelected ? '2px solid #667eea' : '1px solid #e2e8f0', backgroundColor: isSelected ? '#f5f3ff' : 'white', boxShadow: isSelected ? '0 4px 20px rgba(102, 126, 234, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', borderColor: '#c7d2fe' } }} onClick={() => setSelectedDepartment(dept.name)}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: getAvatarColor(dept.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px' }}>
                          {dept.name?.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>{dept.name}</Typography>
                          <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>{dept.members.length} members</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ px: 1.5, py: 0.5, borderRadius: '20px', backgroundColor: deptCompletion > 70 ? '#dcfce7' : deptCompletion > 40 ? '#dbeafe' : '#fee2e2', color: deptCompletion > 70 ? '#166534' : deptCompletion > 40 ? '#1e40af' : '#991b1b', fontWeight: 600, fontSize: '13px' }}>
                        {deptCompletion}%
                      </Box>
                    </Box>

                    <Box sx={{ height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden', mb: 3 }}>
                      <Box sx={{ height: '100%', width: `${deptCompletion}%`, borderRadius: 3, background: deptCompletion > 70 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : deptCompletion > 40 ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)' }} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
                      {[
                        { label: 'Done', value: dept.completed, color: '#22c55e', bg: '#f0fdf4' },
                        { label: 'Active', value: dept.inProgress, color: '#3b82f6', bg: '#eff6ff' },
                        { label: 'Blocked', value: dept.blocked, color: '#ef4444', bg: '#fef2f2' },
                        { label: 'Todo', value: dept.pending, color: '#f59e0b', bg: '#fffbeb' },
                      ].map((stat, idx) => (
                        <Box key={idx} sx={{ p: 1.5, backgroundColor: stat.bg, borderRadius: '10px', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '16px', fontWeight: 700, color: stat.color }}>{stat.value}</Typography>
                          <Typography sx={{ fontSize: '9px', color: stat.color, fontWeight: 500, textTransform: 'uppercase' }}>{stat.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Grid>

        {selectedDeptData && (
          <Grid item xs={12} md={7}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>{selectedDeptData.name} Team</Typography>
                <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>Click on a member to view tasks</Typography>
              </Box>
              <Chip label={`${selectedDeptData.members.length} members`} size="small" sx={{ backgroundColor: '#fef3c7', color: '#92400e', fontWeight: 500 }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedDeptData.members.map(member => {
                const memberTasks = selectedDeptData.tasks.filter(t => t.employeeId === member._id);
                const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
                const memberInProgress = memberTasks.filter(t => t.status === 'in-progress').length;
                const memberBlocked = memberTasks.filter(t => t.status === 'blocked').length;
                const memberPending = memberTasks.filter(t => t.status === 'pending').length;
                const memberCompletion = memberTasks.length > 0 ? Math.round((memberCompleted / memberTasks.length) * 100) : 0;

                return (
                  <Card key={member._id} sx={{ cursor: 'pointer', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', borderColor: '#c7d2fe' } }}
                    onClick={() => {
                      setSelectedMember({ employeeId: member._id, employeeName: member.name, employeeJobTitle: member.jobTitle, tasks: memberTasks, completed: memberCompleted, inProgress: memberInProgress, blocked: memberBlocked, pending: memberPending, overdue: memberTasks.filter(t => t.status !== 'completed' && t.endDate && new Date(t.endDate) < new Date()).length });
                      setMemberDetailsOpen(true);
                    }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ width: 56, height: 56, borderRadius: '14px', background: getAvatarColor(member.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px', flexShrink: 0 }}>
                          {member.name?.charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{member.name}</Typography>
                              <Typography sx={{ fontSize: '13px', color: '#94a3b8' }}>{member.jobTitle || 'Team Member'}</Typography>
                            </Box>
                            <Box sx={{ px: 2, py: 0.75, borderRadius: '20px', backgroundColor: memberCompletion > 70 ? '#dcfce7' : memberCompletion > 40 ? '#dbeafe' : '#fee2e2', color: memberCompletion > 70 ? '#166534' : memberCompletion > 40 ? '#1e40af' : '#991b1b', fontWeight: 600, fontSize: '14px' }}>
                              {memberCompletion}%
                            </Box>
                          </Box>
                          <Box sx={{ height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden', mb: 2 }}>
                            <Box sx={{ height: '100%', width: `${memberCompletion}%`, borderRadius: 3, background: memberCompletion > 70 ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : memberCompletion > 40 ? 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)' }} />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            {[{ label: 'Done', value: memberCompleted, color: '#22c55e' }, { label: 'Active', value: memberInProgress, color: '#3b82f6' }, { label: 'Blocked', value: memberBlocked, color: '#ef4444' }, { label: 'Todo', value: memberPending, color: '#f59e0b' }].map((stat, idx) => (
                              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: stat.color }} />
                                <Typography sx={{ fontSize: '12px', color: '#64748b' }}>{stat.value} {stat.label}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                        <ArrowRight size={20} style={{ color: '#cbd5e1' }} />
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

// View Assigned Tasks View - Shows tasks assigned by the current admin
const ViewAssignedTasksView = ({ tasksData, currentUser, getStatusColor, isOverdue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Filter tasks assigned by current user
  const assignedTasks = useMemo(() => {
    const currentUserName = currentUser?.name || currentUser?.email || '';
    return tasksData.filter(task => {
      const assignedBy = task.AssignedBy || task.assignedBy || '';
      return assignedBy.toLowerCase().includes(currentUserName.toLowerCase());
    });
  }, [tasksData, currentUser]);

  // Apply filters and search
  const filteredTasks = useMemo(() => {
    let filtered = [...assignedTasks];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.taskName?.toLowerCase().includes(term) ||
        task.employeeName?.toLowerCase().includes(term) ||
        task.project?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
      } else if (sortBy === 'dueDate') {
        return new Date(a.endDate || '9999-12-31') - new Date(b.endDate || '9999-12-31');
      }
      return 0;
    });

    return filtered;
  }, [assignedTasks, searchTerm, statusFilter, sortBy]);

  // Stats for assigned tasks
  const stats = useMemo(() => ({
    total: assignedTasks.length,
    completed: assignedTasks.filter(t => t.status === 'completed').length,
    inProgress: assignedTasks.filter(t => t.status === 'in-progress').length,
    pending: assignedTasks.filter(t => t.status === 'pending').length,
    blocked: assignedTasks.filter(t => t.status === 'blocked').length,
    overdue: assignedTasks.filter(t => isOverdue(t.endDate, t.status)).length,
  }), [assignedTasks, isOverdue]);

  const getStatusChip = (status) => {
    const config = {
      'completed': { bg: '#dcfce7', color: '#166534', label: 'Completed' },
      'in-progress': { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
      'pending': { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
      'blocked': { bg: '#fee2e2', color: '#991b1b', label: 'Blocked' },
    };
    const c = config[status] || { bg: '#f1f5f9', color: '#64748b', label: status };
    return (
      <Chip 
        label={c.label} 
        size="small" 
        sx={{ backgroundColor: c.bg, color: c.color, fontWeight: 600, fontSize: '12px' }} 
      />
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>View Assigned Tasks</Typography>
        <Typography sx={{ color: '#64748b' }}>Track tasks you've assigned to team members</Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#667eea' }}>{stats.total}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Total Assigned</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>{stats.completed}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#3b82f6' }}>{stats.inProgress}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{stats.blocked}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Blocked</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card sx={{ borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: stats.overdue > 0 ? '#fef2f2' : 'white' }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#dc2626' }}>{stats.overdue}</Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Overdue</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1, minWidth: '200px' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by task, employee, or project..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={18} style={{ color: '#94a3b8', marginRight: 8 }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    '&:hover': { backgroundColor: '#f1f5f9' },
                    '&.Mui-focused': { backgroundColor: 'white' },
                  }
                }}
              />
            </Box>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="dueDate">Due Date</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <Eye size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>No tasks found</Typography>
            <Typography sx={{ color: '#cbd5e1', fontSize: '14px' }}>
              {assignedTasks.length === 0 
                ? "You haven't assigned any tasks yet" 
                : "No tasks match your current filters"}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Task</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Project</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Due Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task, index) => {
                  const taskOverdue = isOverdue(task.endDate, task.status);
                  return (
                    <TableRow 
                      key={task._id || index} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8fafc' },
                        backgroundColor: taskOverdue ? '#fef2f2' : 'transparent',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: '10px',
                            background: getAvatarColor(task.employeeName),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 600, fontSize: '14px',
                          }}>
                            {task.employeeName?.charAt(0).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{task.employeeName}</Typography>
                            <Typography sx={{ fontSize: '12px', color: '#94a3b8' }}>{task.employeeDepartment}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, color: '#334155', fontSize: '14px' }}>{task.taskName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.project || 'No Project'} 
                          size="small" 
                          sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500, fontSize: '12px' }} 
                        />
                      </TableCell>
                      <TableCell>
                        {getStatusChip(task.status)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={14} style={{ color: taskOverdue ? '#ef4444' : '#94a3b8' }} />
                          <Typography sx={{ 
                            fontSize: '13px', 
                            color: taskOverdue ? '#ef4444' : '#64748b',
                            fontWeight: taskOverdue ? 600 : 400,
                          }}>
                            {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No date'}
                          </Typography>
                          {taskOverdue && <AlertTriangle size={14} style={{ color: '#ef4444' }} />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 120 }}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                            <Box sx={{ 
                              height: '100%', 
                              width: `${task.progress || 0}%`, 
                              borderRadius: 3, 
                              background: getStatusColor(task.status),
                            }} />
                          </Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b', minWidth: 35 }}>
                            {task.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};


// Productivity Trends View
const ProductivityTrendsView = ({ trend }) => (
  <Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>Productivity Trends</Typography>
      <Typography sx={{ color: '#64748b' }}>Weekly task activity and completion patterns</Typography>
    </Box>

    <Grid container spacing={3}>
      <Grid item xs={12} lg={8}>
        <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>Task Activity (Last 7 Days)</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="completed" name="Completed" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                <Area type="monotone" dataKey="inProgress" name="In Progress" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInProgress)" />
                <Area type="monotone" dataKey="pending" name="Pending" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} lg={4}>
        <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>Daily Breakdown</Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={trend} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis dataKey="date" type="category" stroke="#94a3b8" fontSize={11} width={60} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                  }} 
                />
                <Bar dataKey="total" name="Total Tasks" fill="#667eea" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Summary Cards */}
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {[
        { label: 'Most Productive Day', value: trend.reduce((max, day) => day.completed > max.completed ? day : max, trend[0])?.date || 'N/A', icon: <TrendingUp size={20} />, gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' },
        { label: 'Total Completed', value: trend.reduce((sum, day) => sum + day.completed, 0), icon: <CheckCircle size={20} />, gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
        { label: 'Avg Daily Tasks', value: Math.round(trend.reduce((sum, day) => sum + day.total, 0) / trend.length) || 0, icon: <BarChart3 size={20} />, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
      ].map((item, idx) => (
        <Grid item xs={12} sm={4} key={idx}>
          <Card sx={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 48, height: 48, borderRadius: '12px', background: item.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  {item.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>{item.value}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);


// Member Details Modal
const MemberDetailsModal = ({ open, member, onClose, getStatusColor }) => {
  if (!member) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: '20px', overflow: 'hidden' }
      }}
    >
      {/* Gradient Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        p: 4, 
        color: 'white',
        position: 'relative',
      }}>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
          }}
        >
          <X size={20} />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ 
            width: 72, 
            height: 72, 
            borderRadius: '18px', 
            backgroundColor: 'rgba(255,255,255,0.2)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 700,
          }}>
            {member.employeeName?.charAt(0).toUpperCase()}
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{member.employeeName}</Typography>
            <Typography sx={{ opacity: 0.9 }}>{member.employeeJobTitle || 'Team Member'}</Typography>
          </Box>
        </Box>

        {/* Stats Row */}
        <Box sx={{ display: 'flex', gap: 3, mt: 3 }}>
          {[
            { label: 'Total', value: member.tasks?.length || 0 },
            { label: 'Completed', value: member.completed || 0 },
            { label: 'In Progress', value: member.inProgress || 0 },
            { label: 'Blocked', value: member.blocked || 0 },
            { label: 'Overdue', value: member.overdue || 0 },
          ].map((stat, idx) => (
            <Box key={idx} sx={{ textAlign: 'center' }}>
              <Typography sx={{ fontSize: '24px', fontWeight: 700 }}>{stat.value}</Typography>
              <Typography sx={{ fontSize: '12px', opacity: 0.8 }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>Task Details</Typography>
          
          {member.tasks?.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography sx={{ color: '#94a3b8' }}>No tasks assigned</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Task Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Project</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {member.tasks?.map((task, idx) => (
                    <TableRow key={idx} sx={{ '&:hover': { backgroundColor: '#f8fafc' } }}>
                      <TableCell>
                        <Typography sx={{ fontWeight: 500, color: '#334155' }}>{task.taskName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.project || 'No Project'} 
                          size="small" 
                          sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500, fontSize: '11px' }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          sx={{ 
                            backgroundColor: task.status === 'completed' ? '#dcfce7' : task.status === 'in-progress' ? '#dbeafe' : task.status === 'blocked' ? '#fee2e2' : '#fef3c7',
                            color: task.status === 'completed' ? '#166534' : task.status === 'in-progress' ? '#1e40af' : task.status === 'blocked' ? '#991b1b' : '#92400e',
                            fontWeight: 600,
                            fontSize: '11px',
                            textTransform: 'capitalize',
                          }} 
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '13px', color: '#64748b' }}>
                            {task.endDate ? new Date(task.endDate).toLocaleDateString() : 'No date'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 100 }}>
                          <Box sx={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                            <Box sx={{ 
                              height: '100%', 
                              width: `${task.progress || 0}%`, 
                              borderRadius: 3, 
                              background: getStatusColor(task.status),
                            }} />
                          </Box>
                          <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>
                            {task.progress || 0}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
