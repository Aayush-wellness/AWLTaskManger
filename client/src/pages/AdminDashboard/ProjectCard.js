import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import { getSmallAvatarUrl } from '../../utils/avatarUtils';
import './ProjectCard.css';

const ProjectCard = ({ project, onTaskToggle, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  // Calculate progress for each team member
  const getMemberProgress = (memberId) => {
    const memberTasks = project.memberTasks?.[memberId] || [];
    if (memberTasks.length === 0) return 0;
    const completed = memberTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / memberTasks.length) * 100);
  };

  // Get all team members
  const teamMembers = project.teamMembers || [];

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    
    Object.values(project.memberTasks || {}).forEach(tasks => {
      totalTasks += tasks.length;
      completedTasks += tasks.filter(t => t.status === 'completed').length;
    });
    
    return totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-info">
          <h3>{project.name}</h3>
          <span className={`status-badge ${project.status}`}>{project.status}</span>
        </div>
        <button
          className="expand-btn"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <div className="project-card-body">
        {/* Overall Progress */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-percentage">{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {/* Team Members */}
        <div className="team-members">
          <h4>Team Members ({teamMembers.length})</h4>
          <div className="members-list">
            {teamMembers.map(member => (
              <div key={member._id} className="member-card">
                <div className="member-header">
                  <img
                    src={getSmallAvatarUrl(member.avatar)}
                    alt={member.name}
                    className="member-avatar"
                  />
                  <div className="member-info">
                    <span className="member-name">{member.name}</span>
                    <span className="member-role">{member.jobTitle}</span>
                  </div>
                  <div className="member-progress">
                    <span className="progress-text">{getMemberProgress(member._id)}%</span>
                  </div>
                </div>

                {/* Member Progress Bar */}
                <div className="member-progress-bar">
                  <div
                    className="member-progress-fill"
                    style={{ width: `${getMemberProgress(member._id)}%` }}
                  ></div>
                </div>

                {/* Member Tasks */}
                {expanded && (
                  <div className="member-tasks">
                    {(project.memberTasks?.[member._id] || []).map((task, idx) => (
                      <div key={idx} className="task-item">
                        <button
                          className="task-checkbox"
                          onClick={() => onTaskToggle(member._id, idx)}
                          title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {task.status === 'completed' ? (
                            <CheckCircle size={18} className="checked" />
                          ) : (
                            <Circle size={18} />
                          )}
                        </button>
                        <span className={`task-name ${task.status === 'completed' ? 'completed' : ''}`}>
                          {task.taskName}
                        </span>
                      </div>
                    ))}
                    {(!project.memberTasks?.[member._id] || project.memberTasks[member._id].length === 0) && (
                      <p className="no-tasks">No tasks assigned</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="project-card-footer">
        <button
          className="delete-btn"
          onClick={() => onDelete(project._id, project.name)}
          title="Delete project"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
