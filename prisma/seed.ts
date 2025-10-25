import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const page = await prisma.page.upsert({
    where: { id: 'seed-page' },
    update: {},
    create: {
      id: 'seed-page',
      title: 'Welcome to your Notion-like Page',
    },
  });

  const existing = await prisma.block.findMany({ where: { pageId: page.id } });
  if (existing.length === 0) {
    await prisma.block.createMany({
      data: [
        { pageId: page.id, type: 'heading', content: 'Getting Started', order: 0 },
        { pageId: page.id, type: 'paragraph', content: 'Click anywhere to edit. Use Enter to add blocks.', order: 1 },
        { pageId: page.id, type: 'todo', content: 'Try toggling this todo', order: 2 },
        { pageId: page.id, type: 'quote', content: 'Simplicity is the soul of efficiency.', order: 3 },
        { pageId: page.id, type: 'divider', content: '', order: 4 },
        { pageId: page.id, type: 'paragraph', content: 'Have fun!', order: 5 },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
