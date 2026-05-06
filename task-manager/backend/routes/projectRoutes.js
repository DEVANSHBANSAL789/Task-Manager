import express from 'express';
import { createProject, getMyProjects, getProjectById, addMember, removeMember } from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createProject).get(protect, getMyProjects);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/members').post(protect, addMember);
router.route('/:id/members/:userId').delete(protect, removeMember);

export default router;
