import React, { useState, useEffect } from 'react';
import api from '../context/api';
import { CheckSquare, Clock, ListTodo, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Here's an overview of your tasks and progress.</p>
        </div>
      </div>

      <div className="grid-cards mb-4">
        <div className="glass-card flex-between">
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Total Tasks</p>
            <h2 style={{ fontSize: '2.5rem' }}>{stats?.totalTasks || 0}</h2>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
            <ListTodo size={32} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>In Progress</p>
            <h2 style={{ fontSize: '2.5rem' }}>{stats?.tasksByStatus?.inProgress || 0}</h2>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: '#fbbf24' }}>
            <Clock size={32} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Completed</p>
            <h2 style={{ fontSize: '2.5rem' }}>{stats?.tasksByStatus?.done || 0}</h2>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: '#34d399' }}>
            <CheckSquare size={32} />
          </div>
        </div>

        <div className="glass-card flex-between">
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overdue Tasks</p>
            <h2 style={{ fontSize: '2.5rem' }}>{stats?.overdueTasks || 0}</h2>
          </div>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: '#f87171' }}>
            <AlertTriangle size={32} />
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h3>Tasks Per User (Team Overview)</h3>
        {stats?.tasksPerUser && stats.tasksPerUser.length > 0 ? (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {stats.tasksPerUser.map((userStat, index) => (
              <div key={index} className="flex-between" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>{userStat.name}</span>
                <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                  {userStat.count} {userStat.count === 1 ? 'Task' : 'Tasks'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
            No tasks found in your projects.
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
