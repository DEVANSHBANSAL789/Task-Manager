import express from 'express';
import { createTask, getTasksByProject, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createTask);
router.route('/project/:projectId').get(protect, getTasksByProject);
router.route('/:id').delete(protect, deleteTask);
router.route('/:id/status').patch(protect, updateTaskStatus);

export default router;
