import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Editor from '@/components/Editor';

export default async function PageView({ params }: { params: { id: string } }) {
  const page = await prisma.page.findUnique({
    where: { id: params.id },
    include: { blocks: { orderBy: { order: 'asc' } } },
  });
  if (!page) return notFound();

  return (
    <div className="container">
      <div className="pageTitle">{page.title}</div>
      <Editor pageId={page.id} initialBlocks={page.blocks} />
    </div>
  );
}
