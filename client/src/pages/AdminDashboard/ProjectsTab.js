import { useState, useEffect } from 'react';
import { Eye, CheckSquare } from 'lucide-react';
import BulkTaskAssignmentModal from './BulkTaskAssignmentModal';
import './ProjectsTab.css';

const ProjectsTab = ({ projects, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('assign');
  const [projectsList, setProjectsList] = useState(projects);

  // Update local state when projects prop changes
  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

  return (
    <div className="projects-tab-container">
      {/* Tab Navigation */}
      <div className="projects-tab-nav">
        <button
          className={`tab-button ${activeTab === 'assign' ? 'active' : ''}`}
          onClick={() => setActiveTab('assign')}
        >
          <CheckSquare size={18} />
          Assign Tasks
        </button>
        <button
          className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          <Eye size={18} />
          View Tasks
        </button>
      </div>

      {/* Assign Tasks Tab */}
      {activeTab === 'assign' && (
        <div className="projects-tab-content">
          <BulkTaskAssignmentModal
            isOpen={true}
            onClose={() => {}}
            onTasksCreated={() => {
              onRefresh();
            }}
            isEmbedded={true}
          />
        </div>
      )}

      {/* View Tasks Tab */}
      {activeTab === 'view' && (
        <div className="projects-tab-content">
          <div className="view-tasks-container">
            <h3>Project Tasks</h3>
            {projectsList.length === 0 ? (
              <div className="empty-state">
                <p>No projects yet. Create one to get started!</p>
              </div>
            ) : (
              <div className="projects-list">
                {projectsList.map(project => (
                  <div key={project._id} className="project-item">
                    <h4>{project.name}</h4>
                    <p className="project-description">{project.description}</p>
                    <div className="project-meta">
                      <span className="project-department">{project.department?.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsTab;
