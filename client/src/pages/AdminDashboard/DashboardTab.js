import { FolderKanban, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const DashboardTab = ({ tasks, employees, onEmployeeClick }) => {
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    blockedTasks: tasks.filter(t => t.status === 'blocked').length,
    totalEmployees: employees.length
  };

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const statusData = [
    { name: 'Completed', value: stats.completedTasks, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#3b82f6' },
    { name: 'Pending', value: stats.pendingTasks, color: '#f59e0b' },
    { name: 'Blocked', value: stats.blockedTasks, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Mock trend data for the area chart
  const trendData = [
    { name: 'Mon', tasks: 12, completed: 8 },
    { name: 'Tue', tasks: 19, completed: 14 },
    { name: 'Wed', tasks: 15, completed: 11 },
    { name: 'Thu', tasks: 22, completed: 18 },
    { name: 'Fri', tasks: 18, completed: 15 },
    { name: 'Sat', tasks: 10, completed: 8 },
    { name: 'Sun', tasks: 8, completed: 6 },
  ];

  return (
    <div className="dashboard-tab-modern">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome back! 👋</h1>
          <p>Here's what's happening with your team today.</p>
        </div>
        <div className="quick-stats">
          <div className="completion-ring">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionRate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="completion-text">
              <span className="completion-value">{completionRate}%</span>
              <span className="completion-label">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="modern-stats-grid">
        <StatCardModern 
          icon={<FolderKanban size={24} />}
          title="Total Tasks"
          value={stats.totalTasks}
          trend="+12%"
          trendUp={true}
          gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        />
        <StatCardModern 
          icon={<Users size={24} />}
          title="Team Members"
          value={stats.totalEmployees}
          trend="+3"
          trendUp={true}
          gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          clickable={true}
          onClick={onEmployeeClick}
        />
        <StatCardModern 
          icon={<CheckCircle size={24} />}
          title="Completed"
          value={stats.completedTasks}
          trend={`${completionRate}%`}
          trendUp={completionRate > 50}
          gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
        />
        <StatCardModern 
          icon={<Clock size={24} />}
          title="In Progress"
          value={stats.inProgressTasks}
          subtitle="Active now"
          gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
        />
        <StatCardModern 
          icon={<AlertTriangle size={24} />}
          title="Pending"
          value={stats.pendingTasks}
          subtitle="Awaiting action"
          gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
        />
        <StatCardModern 
          icon={<TrendingUp size={24} />}
          title="Blocked"
          value={stats.blockedTasks}
          subtitle="Need attention"
          gradient="linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)"
          alert={stats.blockedTasks > 0}
        />
      </div>

      {/* Charts Section */}
      <div className="charts-grid-modern">
        {/* Pie Chart Card */}
        <div className="chart-card-modern">
          <div className="chart-header">
            <h3>Task Distribution</h3>
            <span className="chart-subtitle">By status</span>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px 16px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {statusData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: item.color }} />
                  <span className="legend-label">{item.name}</span>
                  <span className="legend-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Area Chart Card */}
        <div className="chart-card-modern">
          <div className="chart-header">
            <h3>Weekly Activity</h3>
            <span className="chart-subtitle">Tasks overview</span>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#667eea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white',
                    padding: '12px 16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#667eea" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorTasks)" 
                  name="Total Tasks"
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Overview</h3>
        <div className="quick-actions-grid">
          <div className="quick-action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <FolderKanban size={20} />
            </div>
            <div className="action-info">
              <span className="action-title">Active Projects</span>
              <span className="action-value">{Math.ceil(stats.totalTasks / 5)}</span>
            </div>
          </div>
          <div className="quick-action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <CheckCircle size={20} />
            </div>
            <div className="action-info">
              <span className="action-title">Completion Rate</span>
              <span className="action-value">{completionRate}%</span>
            </div>
          </div>
          <div className="quick-action-card">
            <div className="action-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Clock size={20} />
            </div>
            <div className="action-info">
              <span className="action-title">Avg. Tasks/Member</span>
              <span className="action-value">{stats.totalEmployees > 0 ? Math.round(stats.totalTasks / stats.totalEmployees) : 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCardModern = ({ icon, title, value, trend, trendUp, subtitle, gradient, clickable, onClick, alert }) => (
  <div 
    className={`stat-card-modern ${clickable ? 'clickable' : ''} ${alert ? 'alert' : ''}`}
    onClick={clickable ? onClick : undefined}
  >
    <div className="stat-card-content">
      <div className="stat-icon-modern" style={{ background: gradient }}>
        {icon}
      </div>
      <div className="stat-details">
        <span className="stat-title">{title}</span>
        <span className="stat-value-modern">{value}</span>
        {trend && (
          <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </span>
        )}
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
    {clickable && <div className="click-indicator">View all →</div>}
  </div>
);

export default DashboardTab;
