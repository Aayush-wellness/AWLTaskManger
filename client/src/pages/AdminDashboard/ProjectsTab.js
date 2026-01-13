import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Card, CardContent, Grid } from '@mui/material';
import { Eye, CheckSquare, FolderPlus, Users, FileText } from 'lucide-react';
import BulkTaskAssignmentModal from './BulkTaskAssignmentModal';
import './ProjectsTab.css';

const ProjectsTab = ({ projects, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('assign');
  const [projectsList, setProjectsList] = useState(projects);

  useEffect(() => {
    setProjectsList(projects);
  }, [projects]);

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  return (
    <Box className="projects-tab-modern">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <FolderPlus size={24} />
          </Box>
          Bulk Task Assignment
        </Typography>
        <Typography sx={{ color: '#64748b', ml: 8 }}>
          Upload documents and assign tasks to multiple employees at once
        </Typography>
      </Box>

      {/* Modern Tab Navigation */}
      <Box sx={{ 
        background: 'white', 
        borderRadius: '16px', 
        p: 1, 
        mb: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'inline-flex',
        gap: 1
      }}>
        <Box
          onClick={() => setActiveTab('assign')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'assign' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'assign' ? 'white' : '#64748b',
            fontWeight: activeTab === 'assign' ? 600 : 500,
            '&:hover': activeTab !== 'assign' ? { backgroundColor: '#f1f5f9' } : {}
          }}
        >
          <CheckSquare size={18} />
          <Typography sx={{ fontSize: '14px', fontWeight: 'inherit' }}>Assign Tasks</Typography>
        </Box>
        <Box
          onClick={() => setActiveTab('view')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 3,
            py: 1.5,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            background: activeTab === 'view' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
            color: activeTab === 'view' ? 'white' : '#64748b',
            fontWeight: activeTab === 'view' ? 600 : 500,
            '&:hover': activeTab !== 'view' ? { backgroundColor: '#f1f5f9' } : {}
          }}
        >
          <Eye size={18} />
          <Typography sx={{ fontSize: '14px', fontWeight: 'inherit' }}>View Projects</Typography>
        </Box>
      </Box>

      {/* Assign Tasks Tab */}
      {activeTab === 'assign' && (
        <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <CardContent sx={{ p: 0 }}>
            <BulkTaskAssignmentModal
              isOpen={true}
              onClose={() => {}}
              onTasksCreated={() => { onRefresh(); }}
              isEmbedded={true}
            />
          </CardContent>
        </Card>
      )}

      {/* View Projects Tab */}
      {activeTab === 'view' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155' }}>All Projects</Typography>
            <Chip label={`${projectsList.length} projects`} size="small" sx={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 500 }} />
          </Box>

          {projectsList.length === 0 ? (
            <Card sx={{ borderRadius: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <FileText size={48} style={{ color: '#cbd5e1', marginBottom: 16 }} />
                <Typography variant="h6" sx={{ color: '#94a3b8', mb: 1 }}>No projects yet</Typography>
                <Typography sx={{ color: '#cbd5e1', fontSize: '14px' }}>Create a project to get started!</Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {projectsList.map(project => (
                <Grid item xs={12} sm={6} lg={4} key={project._id}>
                  <Card sx={{ 
                    borderRadius: '20px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    border: '2px solid transparent',
                    '&:hover': { 
                      transform: 'translateY(-4px)', 
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                      borderColor: '#667eea'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <Box sx={{
                          width: 48, height: 48, borderRadius: '14px',
                          background: getAvatarColor(project.name),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '18px'
                        }}>
                          {project.name?.charAt(0).toUpperCase()}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: '#1e293b', fontSize: '16px' }}>{project.name}</Typography>
                          {project.department?.name && (
                            <Chip 
                              label={project.department.name} 
                              size="small" 
                              sx={{ 
                                mt: 0.5,
                                backgroundColor: '#f1f5f9', 
                                color: '#64748b',
                                fontSize: '11px',
                                height: '22px'
                              }} 
                            />
                          )}
                        </Box>
                      </Box>
                      
                      {project.description && (
                        <Typography sx={{ 
                          color: '#64748b', 
                          fontSize: '14px', 
                          lineHeight: 1.6,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {project.description}
                        </Typography>
                      )}

                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        pt: 2,
                        borderTop: '1px solid #f1f5f9'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Users size={14} style={{ color: '#94a3b8' }} />
                          <Typography sx={{ fontSize: '13px', color: '#64748b' }}>
                            {project.vendors?.length || 0} vendors
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ProjectsTab;
