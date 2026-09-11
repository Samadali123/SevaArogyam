"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
/**
 * @function asyncHandler
 * @description Wraps an async Express route handler and forwards any
 *              rejected promise (or thrown error) to Express's `next()`
 *              so the global error handler can process it.
 *
 *              Without this wrapper every async route would need its own
 *              try/catch block. With it, errors are caught automatically.
 *
 * @example
 *   export const getUser = asyncHandler(async (req, res) => {
 *     const user = await User.findById(req.params.id);
 *     if (!user) throw new AppError('User not found', 404);
 *     res.json({ success: true, data: { user } });
 *   });
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=asyncHandler.js.map