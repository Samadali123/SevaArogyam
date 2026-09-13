import { Router } from 'express';
import { branchController } from '@controllers/index';
import { isLoggedIn, restrictTo } from '@middlewares/auth';
import { USER_ROLES } from '@utilities/constants';

const router = Router();

// Protect all branch routes (Only Admin can manage branches)
router.use(isLoggedIn);
router.use(restrictTo(USER_ROLES.ADMIN));

router.post('/', branchController.createBranch);
router.get('/', branchController.getBranches);
router.get('/search', branchController.searchBranches);
router.get('/:id', branchController.getBranchById);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);

export default router;
