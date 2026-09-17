import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

export const getPublicArticles = asyncHandler(async (_req: Request, res: Response) => {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: { articles },
  });
});

export const getDoctorArticles = asyncHandler(async (req: Request, res: Response) => {
  const doctorId = (req as any).user?.id;

  const articles = await prisma.article.findMany({
    where: {
      OR: [
        { authorId: doctorId },
        { authorId: null }
      ]
    },
    orderBy: { createdAt: 'desc' },
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: { articles },
  });
});

export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { title, category, readTimeMinutes, date, excerpt, content, imageUrl, authorName, authorRole } = req.body;

  if (!title || !category || !excerpt) {
    throw new AppError('Title, category, and excerpt are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const finalAuthorName = authorName || (user?.name ? (user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`) : 'Dr. Jansevarogyam Medical Team');
  const finalAuthorRole = authorRole || user?.specialization || 'Consultant Specialist';

  const article = await prisma.article.create({
    data: {
      title,
      category,
      authorId: user?.id || null,
      authorName: finalAuthorName,
      authorRole: finalAuthorRole,
      readTimeMinutes: Number(readTimeMinutes) || 5,
      date: date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      excerpt,
      content: content || excerpt,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
      published: true,
    },
  });

  res.status(HTTP_STATUS.CREATED).json({
    status: 'success',
    data: { article },
  });
});

export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { title, category, readTimeMinutes, date, excerpt, content, imageUrl } = req.body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  if (existing.authorId && user?.id && existing.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('You can only update your own articles', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  const article = await prisma.article.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(category && { category }),
      ...(readTimeMinutes && { readTimeMinutes: Number(readTimeMinutes) }),
      ...(date && { date }),
      ...(excerpt && { excerpt }),
      ...(content && { content }),
      ...(imageUrl && { imageUrl }),
    },
  });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    data: { article },
  });
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  if (existing.authorId && user?.id && existing.authorId !== user.id && user.role !== 'ADMIN') {
    throw new AppError('You can only delete your own articles', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  await prisma.article.delete({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Article deleted successfully',
  });
});
