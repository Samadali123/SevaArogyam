import { Request, Response } from 'express';
import { prisma } from '@config/database';
import { AppError } from '@errors/AppError';
import { ERROR_CODES } from '@errors/errorCodes';
import { HTTP_STATUS } from '@utilities/constants';
import { asyncHandler } from '@utilities/asyncHandler';

const INITIAL_BLOGS = [
  {
    title: 'Understanding Diabetes & Managing Blood Sugar in Malwa Summers',
    category: 'General Medicine',
    authorName: 'Dr. Rajesh Sharma',
    authorRole: 'Senior Physician',
    readTimeMinutes: 5,
    date: '28 Aug 2026',
    excerpt: 'Learn essential tips on hydration, glycemic index foods, and medication adjustments during hot summer months in Madhya Pradesh.',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600',
    content: 'Diabetes management requires continuous monitoring of blood glucose levels, proper hydration, and adherence to prescribed medications. In hot climate regions like Malwa, staying hydrated with plain water and avoiding sugary drinks is critical.'
  },
  {
    title: 'Childhood Immunization Schedule: Why Timely Vaccines Matter',
    category: 'Pediatrics',
    authorName: 'Dr. Anjali Verma',
    authorRole: 'Pediatric Specialist',
    readTimeMinutes: 4,
    date: '22 Aug 2026',
    excerpt: 'A complete guide for parents in Sarangpur and Rajgarh regarding essential vaccinations from birth to age 5.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    content: 'Immunization is one of the most effective ways to protect children against severe vaccine-preventable diseases. Following the National Immunization Schedule ensures your child builds strong immunity.'
  },
  {
    title: 'Preventing Joint Stiffness & Osteoarthritis in Senior Citizens',
    category: 'Orthopedics',
    authorName: 'Dr. Vikramaditya Singh',
    authorRole: 'Orthopedic Surgeon',
    readTimeMinutes: 6,
    date: '15 Aug 2026',
    excerpt: 'Effective exercises, dietary calcium intake, and modern non-surgical therapies for joint mobility.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
    content: 'Osteoarthritis affects joint cartilage and bone structure over time. Gentle joint mobility exercises, adequate vitamin D3 & calcium intake, and maintaining an optimal weight can significantly preserve knee health.'
  }
];

export const getPublicArticles = asyncHandler(async (_req: Request, res: Response) => {
  let articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });

  if (articles.length === 0) {
    await prisma.article.createMany({
      data: INITIAL_BLOGS.map(b => ({
        ...b,
        published: true,
      })),
    });

    articles = await prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
  }

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
  const doctor = (req as any).user;
  const { title, category, readTimeMinutes, date, excerpt, content, imageUrl } = req.body;

  if (!title || !category || !excerpt) {
    throw new AppError('Title, category, and excerpt are required', HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, true);
  }

  const article = await prisma.article.create({
    data: {
      title,
      category,
      authorId: doctor.id,
      authorName: doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`,
      authorRole: doctor.specialization || 'Consultant Specialist',
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
  const doctorId = (req as any).user?.id;
  const { title, category, readTimeMinutes, date, excerpt, content, imageUrl } = req.body;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  if (existing.authorId && existing.authorId !== doctorId) {
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
  const doctorId = (req as any).user?.id;

  const existing = await prisma.article.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Article not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND, true);
  }

  if (existing.authorId && existing.authorId !== doctorId) {
    throw new AppError('You can only delete your own articles', HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN, true);
  }

  await prisma.article.delete({ where: { id } });

  res.status(HTTP_STATUS.OK).json({
    status: 'success',
    message: 'Article deleted successfully',
  });
});
