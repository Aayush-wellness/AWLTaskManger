import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Plus, Trash2, FolderKanban, FolderOpen, Link2 } from 'lucide-react';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import ProjectDetails from '../../components/ProjectDetails';
import CreateProjectModal from '../AdminDashboard/CreateProjectModal';

const ProjectsTab = ({ projects, onRefresh }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/departments');
        setDepartments(res.data);
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleProjectCreated = () => {
    toast.success('Project created successfully!');
    onRefresh();
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete the project "${projectName}"?`)) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        toast.success('Project deleted successfully!');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete project: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  // Get gradient color based on project name
  const getProjectGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ];
    const index = name ? name.charCodeAt(0) % gradients.length : 0;
    return gradients[index];
  };

  const getStatusConfig = (status) => {
    const configs = {
      'active': { bg: '#dcfce7', color: '#166534', label: 'Active' },
      'completed': { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
      'on-hold': { bg: '#fef3c7', color: '#92400e', label: 'On Hold' },
      'planning': { bg: '#f3e8ff', color: '#6b21a8', label: 'Planning' },
    };
    return configs[status] || { bg: '#f1f5f9', color: '#64748b', label: status || 'Unknown' };
  };

  return (
    <div className="modern-tab-content">
      {/* Modern Header */}
      <div className="content-header">
        <div className="header-left">
          <div className="header-icon-wrapper" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FolderKanban size={24} />
          </div>
          <div className="header-text">
            <h1>Projects</h1>
            <p>View and manage your projects</p>
          </div>
        </div>
        <div className="header-right">
          <button onClick={() => setShowCreateModal(true)} className="primary-action-btn">
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="empty-state-card">
          <FolderOpen size={56} className="empty-icon" />
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button onClick={() => setShowCreateModal(true)} className="primary-action-btn">
            <Plus size={18} />
            <span>Create Project</span>
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const statusConfig = getStatusConfig(project.status);
            return (
              <div key={project._id} className="project-card">
                <div className="project-card-header">
                  <div 
                    className="project-avatar"
                    style={{ background: getProjectGradient(project.name) }}
                  >
                    {project.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="project-info" onClick={() => setSelectedProject(project)}>
                    <h3>{project.name}</h3>
                    <span 
                      className="project-status-badge"
                      style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project._id, project.name);
                    }}
                    className="delete-project-btn"
                    title="Delete project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="project-card-body" onClick={() => setSelectedProject(project)}>
                  <p className="project-description">
                    {project.description || 'No description provided'}
                  </p>

                  {/* Document Links */}
                  {project.documentLinks && project.documentLinks.length > 0 && (
                    <div className="project-documents-section">
                      <div className="documents-label">
                        <Link2 size={14} />
                        <span>Documents ({project.documentCount || project.documentLinks.length})</span>
                      </div>
                      <div className="document-chips">
                        {project.documentLinks.slice(0, 2).map((doc, idx) => (
                          <a 
                            key={idx} 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="document-chip"
                            onClick={(e) => e.stopPropagation()}
                            title={`${doc.name} (from ${doc.vendorName})`}
                          >
                            <FileText size={12} />
                            <span>{doc.name}</span>
                            <ExternalLink size={10} />
                          </a>
                        ))}
                        {project.documentLinks.length > 2 && (
                          <span className="more-docs-badge">+{project.documentLinks.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="project-card-footer">
                  {project.vendorCount > 0 && (
                    <span className="vendor-badge">
                      {project.vendorCount} {project.vendorCount !== 1 ? 'entries' : 'entry'}
                    </span>
                  )}
                  <button 
                    className="view-details-btn"
                    onClick={() => setSelectedProject(project)}
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={onRefresh}
          userRole="employee"
        />
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        departments={departments}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectsTab;
