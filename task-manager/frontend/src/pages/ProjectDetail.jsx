import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import api from '../context/api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users, Calendar } from 'lucide-react';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...newTask, project: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: '' });
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error creating task', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error adding member', error);
      alert(error.response?.data?.message || 'Error adding member');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error deleting task', error);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      fetchProjectAndTasks();
    } catch (error) {
      console.error('Error removing member', error);
      alert(error.response?.data?.message || 'Error removing member');
    }
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found.</div>;

  const isAdmin = project.admin._id === user._id;

  const renderTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <div key={task._id} className="glass-card" style={{ padding: '1rem', background: 'rgba(30, 41, 59, 0.9)' }}>
          <div className="flex-between mb-1">
            <span className={`badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
            {(isAdmin || (task.assignedTo && task.assignedTo._id === user._id)) && (
              <select 
                className="input-field" 
                style={{ padding: '0.2rem', fontSize: '0.8rem', marginLeft: 'auto', marginRight: isAdmin ? '0.5rem' : '0' }}
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            )}
            {isAdmin && (
              <button 
                onClick={() => handleDeleteTask(task._id)}
                style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.2rem' }}
                title="Delete Task"
              >
                ×
              </button>
            )}
          </div>
          <h4 style={{ marginBottom: '0.5rem' }}>{task.title}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {task.description}
          </p>
          <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
            <strong>Assigned to:</strong> {task.assignedTo ? task.assignedTo.name : 'Unassigned'}
          </div>
          <div className="flex-between" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {task.dueDate && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Calendar size={12} /> {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ));
  };

  return (
    <div>
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <h1>{project.name}</h1>
            {isAdmin && <span className="badge" style={{ background: 'var(--primary-color)' }}>Admin</span>}
          </div>
          <p>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {isAdmin && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <Users size={18} /> Manage Members
              </button>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={18} /> New Task
              </button>
            </>
          )}
        </div>
      </div>
      

      {isAdmin && project.members && project.members.length > 0 && (
        <div className="glass-card mb-4" style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Project Members</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {project.members.map(member => (
              <div key={member._id} className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.8rem' }}>
                {member.name}
                {member._id !== project.admin._id && (
                  <button onClick={() => handleRemoveMember(member._id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '1.2rem', lineHeight: '1' }}>
                    ×
                  </button>
                )}
                {member._id === project.admin._id && <span style={{ fontSize: '0.7rem', color: 'var(--primary-color)' }}>(Admin)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="kanban-board">
        <div className="kanban-column">
          <div className="kanban-header">
            <h3><span className="badge status-todo">To Do</span></h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {tasks.filter(t => t.status === 'To Do').length}
            </span>
          </div>
          <div className="task-list">
            {renderTasks('To Do')}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            <h3><span className="badge status-inprogress">In Progress</span></h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {tasks.filter(t => t.status === 'In Progress').length}
            </span>
          </div>
          <div className="task-list">
            {renderTasks('In Progress')}
          </div>
        </div>

        <div className="kanban-column">
          <div className="kanban-header">
            <h3><span className="badge status-done">Done</span></h3>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {tasks.filter(t => t.status === 'Done').length}
            </span>
          </div>
          <div className="task-list">
            {renderTasks('Done')}
          </div>
        </div>
      </div>


      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="close-btn" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateTask}>
                <div className="input-group">
                  <label>Task Title</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <textarea
                    className="input-field"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Assign To</label>
                  <select
                    className="input-field"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {project.members && project.members.map(member => (
                      <option key={member._id} value={member._id}>{member.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label>Priority</label>
                    <select
                      className="input-field"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Team Member</h2>
              <button className="close-btn" onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddMember}>
                <div className="input-group">
                  <label>User Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>User must have an existing account.</small>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
