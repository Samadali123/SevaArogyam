"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../controllers/index.js");
const auth_1 = require("../../middlewares/auth.js");
const constants_1 = require("../../utilities/constants.js");
const router = (0, express_1.Router)();
// Protect all branch routes (Only Admin can manage branches)
router.use(auth_1.isLoggedIn);
router.use((0, auth_1.restrictTo)(constants_1.USER_ROLES.ADMIN));
router.post('/', index_1.branchController.createBranch);
router.get('/', index_1.branchController.getBranches);
router.get('/search', index_1.branchController.searchBranches);
router.get('/:id', index_1.branchController.getBranchById);
router.put('/:id', index_1.branchController.updateBranch);
router.delete('/:id', index_1.branchController.deleteBranch);
exports.default = router;
//# sourceMappingURL=branch.js.map