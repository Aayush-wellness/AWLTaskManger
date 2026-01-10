import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Plus, Trash2 } from 'lucide-react';
import axios from '../../config/axios';
import toast from '../../utils/toast';
import ProjectDetails from '../../components/ProjectDetails';
import CreateProjectModal from '../AdminDashboard/CreateProjectModal';

const ProjectsTab = ({ projects, onRefresh }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departments, setDepartments] = useState([]);

  // Fetch departments for the create project modal
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

  return (
    <div>
      <div className="header-section">
        <h2>Projects</h2>
        <button 
          onClick={() => setShowCreateModal(true)} 
          className="add-btn"
          title="Create New Project"
        >
          <Plus size={20} /> Create Project
        </button>
      </div>

      <div className="cards-grid">
        {projects.length === 0 ? (
          <p className="no-tasks">No projects available.</p>
        ) : (
          projects.map(project => (
            <div 
              key={project._id} 
              className="info-card project-card-clickable"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedProject(project)}>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  
                  {/* Document Links Section */}
                  {project.documentLinks && project.documentLinks.length > 0 && (
                    <div className="project-documents">
                      <div className="documents-header">
                        <strong>Documents ({project.documentCount}):</strong>
                      </div>
                      <div className="document-links-preview">
                        {project.documentLinks.slice(0, 3).map((doc, idx) => (
                          <a 
                            key={idx} 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="doc-link-small"
                            onClick={(e) => e.stopPropagation()}
                            title={`${doc.name} (from ${doc.vendorName})`}
                          >
                            <FileText size={12} />
                            {doc.name}
                            <ExternalLink size={10} />
                          </a>
                        ))}
                        {project.documentLinks.length > 3 && (
                          <span className="more-docs">+{project.documentLinks.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="card-footer">
                    <span className={`status-badge ${project.status}`}>{project.status}</span>
                    {project.vendorCount > 0 && (
                      <span className="vendor-count">{project.vendorCount} entr{project.vendorCount !== 1 ? 'ies' : 'y'}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project._id, project.name);
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    marginLeft: '8px',
                    flexShrink: 0
                  }}
                  title="Delete project"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
