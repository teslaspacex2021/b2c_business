import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const socialMediaPlatforms = [
  {
    platform: 'facebook',
    name: 'Facebook',
    url: '',
    icon: 'facebook',
    description: '在Facebook上关注我们获取最新动态',
    active: false,
    sortOrder: 1,
  },
  {
    platform: 'twitter',
    name: 'Twitter',
    url: '',
    icon: 'twitter',
    description: '在Twitter上关注我们获取实时更新',
    active: false,
    sortOrder: 2,
  },
  {
    platform: 'instagram',
    name: 'Instagram',
    url: '',
    icon: 'instagram',
    description: '在Instagram上查看我们的精彩内容',
    active: false,
    sortOrder: 3,
  },
  {
    platform: 'linkedin',
    name: 'LinkedIn',
    url: '',
    icon: 'linkedin',
    description: '在LinkedIn上与我们建立专业联系',
    active: false,
    sortOrder: 4,
  },
  {
    platform: 'youtube',
    name: 'YouTube',
    url: '',
    icon: 'youtube',
    description: '订阅我们的YouTube频道观看产品视频',
    active: false,
    sortOrder: 5,
  },
  {
    platform: 'tiktok',
    name: 'TikTok',
    url: '',
    icon: 'tiktok',
    description: '在TikTok上关注我们的创意内容',
    active: false,
    sortOrder: 6,
  },
  {
    platform: 'wechat',
    name: '微信',
    url: '',
    icon: 'wechat',
    description: '关注我们的微信公众号',
    active: false,
    sortOrder: 7,
  },
  {
    platform: 'weibo',
    name: '微博',
    url: '',
    icon: 'weibo',
    description: '在微博上关注我们',
    active: false,
    sortOrder: 8,
  },
  {
    platform: 'telegram',
    name: 'Telegram',
    url: '',
    icon: 'telegram',
    description: '加入我们的Telegram频道',
    active: false,
    sortOrder: 9,
  },
  {
    platform: 'whatsapp',
    name: 'WhatsApp',
    url: '',
    icon: 'whatsapp',
    description: '通过WhatsApp联系我们',
    active: false,
    sortOrder: 10,
  },
];

async function seedSocialMedia() {
  console.log('开始初始化社媒平台数据...');

  for (const platform of socialMediaPlatforms) {
    await prisma.socialMedia.upsert({
      where: { platform: platform.platform },
      update: {
        name: platform.name,
        icon: platform.icon,
        description: platform.description,
        sortOrder: platform.sortOrder,
      },
      create: platform,
    });
  }

  console.log('社媒平台数据初始化完成！');
}

export { seedSocialMedia };

// 检查是否直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  seedSocialMedia()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
