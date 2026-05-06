import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const myTasks = await Task.find({ assignedTo: userId });

    const totalTasks = myTasks.length;
    
    const tasksByStatus = {
      todo: myTasks.filter(task => task.status === 'To Do').length,
      inProgress: myTasks.filter(task => task.status === 'In Progress').length,
      done: myTasks.filter(task => task.status === 'Done').length,
    };

    const overdueTasks = myTasks.filter(
      task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Done'
    ).length;

    const adminProjects = await Project.find({ admin: userId });
    let tasksForPerUserStats = myTasks;
    
    if (adminProjects.length > 0) {
        const adminProjectIds = adminProjects.map(p => p._id);
        tasksForPerUserStats = await Task.find({ project: { $in: adminProjectIds } }).populate('assignedTo', 'name');
    } else {
        tasksForPerUserStats = await Task.find({ assignedTo: userId }).populate('assignedTo', 'name');
    }

    const tasksPerUserMap = {};
    tasksForPerUserStats.forEach(task => {
        const userName = task.assignedTo ? task.assignedTo.name : 'Unassigned';
        if (!tasksPerUserMap[userName]) {
            tasksPerUserMap[userName] = 0;
        }
        tasksPerUserMap[userName]++;
    });
    
    const tasksPerUser = Object.keys(tasksPerUserMap).map(key => ({
        name: key,
        count: tasksPerUserMap[key]
    }));

    res.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
