import { User } from '@prisma/client';

/**
 * @description Extends the default Express Request type to include
 *              the decoded JWT user payload after the `isLoggedIn` middleware runs.
 */
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}
