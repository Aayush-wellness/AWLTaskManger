import { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import ProjectDetails from '../../components/ProjectDetails';

const ProjectsTab = ({ projects, onRefresh }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div>
      <div className="header-section">
        <h2>Projects</h2>
      </div>

      <div className="cards-grid">
        {projects.length === 0 ? (
          <p className="no-tasks">No projects available.</p>
        ) : (
          projects.map(project => (
            <div 
              key={project._id} 
              className="info-card project-card-clickable"
              onClick={() => setSelectedProject(project)}
            >
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
    </div>
  );
};

export default ProjectsTab;
