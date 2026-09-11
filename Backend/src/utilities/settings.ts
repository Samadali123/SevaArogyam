import { prisma } from '@config/database';

export const getSystemSetting = async (key: string, defaultValue: any) => {
  const setting = await prisma.systemSetting.findUnique({
    where: { key }
  });
  if (setting) {
    return setting.value;
  }
  return defaultValue;
};
