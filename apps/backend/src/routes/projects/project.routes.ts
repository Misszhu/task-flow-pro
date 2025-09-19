import { Router } from 'express';
import { ProjectController } from '../../controllers/projects/projectController';

const router: Router = Router();
const projectController = new ProjectController();

// 项目相关路由
router.get('/', projectController.getAllProjects.bind(projectController));
router.post('/', projectController.createProject.bind(projectController));
router.get('/:id', projectController.getProjectById.bind(projectController));

// 项目成员相关路由
router.post('/:projectId/members', projectController.addProjectMember.bind(projectController));
router.get('/:projectId/members', projectController.getProjectMembers.bind(projectController));
router.put('/:projectId/members/:userId', projectController.updateProjectMemberRole.bind(projectController));
router.delete('/:projectId/members/:userId', projectController.removeProjectMember.bind(projectController));

export default router;
