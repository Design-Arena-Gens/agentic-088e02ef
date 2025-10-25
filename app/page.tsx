import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import NewPageForm from '@/components/NewPageForm';

export default async function Home() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <div className="container">
      <div className="header">
        <div className="title">Agentic Notion</div>
      </div>

      <div className="toolbar">
        <NewPageForm />
      </div>

      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <Link href={`/page/${p.id}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
