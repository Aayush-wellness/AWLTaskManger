import { useState } from 'react';
import { Plus, FileText, ExternalLink } from 'lucide-react';
import axios from '../../config/axios';
import ProjectDetails from '../../components/ProjectDetails';
import CreateProjectModal from '../../components/ProjectManagement/CreateProjectModal';

const ProjectsTab = ({ projects, departments, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const handleDeleteProject = async (projectId, projectName, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the project "${projectName}"? This action cannot be undone and will affect all related tasks.`)) {
      try {
        await axios.delete(`/api/projects/${projectId}`);
        onRefresh();
        alert('Project deleted successfully');
      } catch (err) {
        alert('Failed to delete project: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div>
      <div className="header-section">
        <h2>Projects</h2>
        <button onClick={() => setShowModal(true)} className="add-btn">
          <Plus size={20} /> Add Project
        </button>
      </div>

      <div className="cards-grid">
        {projects.map(project => (
          <div 
            key={project._id} 
            className="info-card project-card-clickable"
            onClick={() => setSelectedProject(project)}
          >
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            
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
              <div className="card-footer-left">
                <span className={`status-badge ${project.status}`}>{project.status}</span>
                {project.vendorCount > 0 && (
                  <span className="vendor-count">{project.vendorCount} entr{project.vendorCount !== 1 ? 'ies' : 'y'}</span>
                )}
              </div>
              <div className="card-actions">
                <button 
                  onClick={(e) => handleDeleteProject(project._id, project.name, e)}
                  className="delete-card-btn"
                  title="Delete Project"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <CreateProjectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onProjectCreated={() => onRefresh()}
          departments={departments}
        />
      )}

      {selectedProject && (
        <ProjectDetails
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={onRefresh}
          userRole="admin"
        />
      )}
    </div>
  );
};

export default ProjectsTab;
