import Project from '../models/Project.js';
import User from '../models/User.js';


export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).populate('admin', 'name email').populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('admin', 'name email').populate('members', 'name email');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (!project.members.some((member) => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User to add not found' });
    }

    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can remove members' });
    }

    if (project.admin.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the admin from the project' });
    }

    project.members = project.members.filter((memberId) => memberId.toString() !== userId);
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
