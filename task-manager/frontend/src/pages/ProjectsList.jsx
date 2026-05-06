import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../context/api';
import { Plus, Folder } from 'lucide-react';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your projects and teams.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Folder size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem auto' }} />
          <h3>No projects yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Create a project to start managing tasks.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((project) => (
            <Link to={`/projects/${project._id}`} key={project._id} className="glass-card" style={{ display: 'block' }}>
              <div className="flex-between mb-2">
                <h3 style={{ fontSize: '1.25rem' }}>{project.name}</h3>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
                  {project.members.length} Members
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '40px' }}>
                {project.description || 'No description provided.'}
              </p>
              <div className="flex-between" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Admin: {project.admin?.name || 'Unknown'}</span>
                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateProject}>
                <div className="input-group">
                  <label>Project Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    className="input-field"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;
