import Task from '../models/Task.js';
import Project from '../models/Project.js';


export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, project, assignedTo } = req.body;

    const projectExists = await Project.findById(project);
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (projectExists.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can create tasks in this project' });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project,
      assignedTo,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }


    if (!project.members.includes(req.user._id) && project.admin.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    let tasks;
    if (project.admin.toString() === req.user._id.toString()) {
        tasks = await Task.find({ project: projectId }).populate('assignedTo', 'name email');
    } else {
        tasks = await Task.find({ project: projectId, assignedTo: req.user._id }).populate('assignedTo', 'name email');
    }
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    task.status = status;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.project);
    
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can delete tasks' });
    }

    await task.deleteOne();

    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
