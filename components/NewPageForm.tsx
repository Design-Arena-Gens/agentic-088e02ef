"use client";

import { createPage } from '@/app/actions';
import { useTransition, useState } from 'react';

export default function NewPageForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const t = title.trim() || 'Untitled';
        startTransition(async () => {
          const page = await createPage(t);
          window.location.href = `/page/${page.id}`;
        });
      }}
      style={{ display: 'flex', gap: 8 }}
    >
      <input
        placeholder="New page title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="button"
        style={{ minWidth: 260 }}
      />
      <button className="button" disabled={isPending}>
        {isPending ? 'Creating…' : 'Create Page'}
      </button>
    </form>
  );
}
