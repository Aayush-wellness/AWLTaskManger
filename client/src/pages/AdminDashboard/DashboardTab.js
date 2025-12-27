import { FolderKanban, Users, Briefcase } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardTab = ({ tasks, employees, onEmployeeClick }) => {
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    totalEmployees: employees.length
  };

  const statusData = [
    { name: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#3b82f6' },
    { name: 'Pending', value: tasks.filter(t => t.status === 'pending').length, color: '#fbbf24' },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#ef4444' }
  ];

  return (
    <>
      <div className="stats-grid">
        <StatCard 
          icon={<FolderKanban />} 
          title="Total Tasks" 
          value={stats.totalTasks} 
          color="#667eea" 
        />
        <StatCard 
          icon={<Users />} 
          title="Total Employees" 
          value={stats.totalEmployees} 
          color="#48bb78" 
          clickable={true}
          onClick={onEmployeeClick}
        />
        <StatCard 
          icon={<Briefcase />} 
          title="Completed Tasks" 
          value={stats.completedTasks} 
          color="#10b981" 
        />
        <StatCard 
          icon={<FolderKanban />} 
          title="Pending Tasks" 
          value={stats.pendingTasks} 
          color="#fbbf24" 
        />
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const StatCard = ({ icon, title, value, color, clickable, onClick }) => (
  <div 
    className={`stat-card ${clickable ? 'clickable' : ''}`} 
    style={{ borderLeft: `4px solid ${color}` }}
    onClick={clickable ? onClick : undefined}
  >
    <div className="stat-icon" style={{ color }}>{icon}</div>
    <div className="stat-info">
      <h4>{title}</h4>
      <p>{value}</p>
    </div>
  </div>
);

export default DashboardTab;
