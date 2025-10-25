"use client";

import { Block } from '@prisma/client';
import { useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react';
import { createBlock, deleteBlock, reorderBlocks, updateBlock } from '@/app/actions';

type EditorProps = {
  pageId: string;
  initialBlocks: Block[];
};

type OptimisticBlock = Block & { _optimistic?: boolean };

export default function Editor({ pageId, initialBlocks }: EditorProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticBlocks, setOptimisticBlocks] = useOptimistic<OptimisticBlock[], any>(
    initialBlocks,
    (state, action: any) => action(state)
  );
  const nextOrder = useMemo(() => (optimisticBlocks.at(-1)?.order ?? -1) + 1, [optimisticBlocks]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOptimisticBlocks(() => initialBlocks);
  }, [initialBlocks, setOptimisticBlocks]);

  function addBlock(afterOrder: number) {
    const tempId = `temp-${Math.random().toString(36).slice(2)}`;
    const newBlock: OptimisticBlock = {
      id: tempId,
      pageId,
      parentId: null,
      type: 'paragraph' as any,
      content: '',
      order: afterOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      _optimistic: true,
    } as any;

    setOptimisticBlocks((blocks: OptimisticBlock[]) => {
      const bumped = blocks.map((b) =>
        b.order > afterOrder ? { ...b, order: b.order + 1 } : b
      );
      const merged = [...bumped, newBlock].sort((a, b) => a.order - b.order);
      return merged;
    });

    startTransition(async () => {
      const created = await createBlock({
        pageId,
        type: newBlock.type,
        content: newBlock.content,
        order: newBlock.order,
      });
      setOptimisticBlocks((blocks: OptimisticBlock[]) =>
        blocks.map((b) => (b.id === tempId ? { ...created } : b))
      );
    });
  }

  function onChangeContent(id: string, content: string) {
    setOptimisticBlocks((blocks: OptimisticBlock[]) =>
      blocks.map((b) => (b.id === id ? { ...b, content } : b))
    );
    startTransition(async () => {
      await updateBlock(id, { content });
    });
  }

  function onToggleTodo(id: string) {
    const block = optimisticBlocks.find((b) => b.id === id);
    if (!block) return;
    const content = block.content.startsWith('[x] ')
      ? block.content.replace(/^\[x\]\s*/, '')
      : `[x] ${block.content.replace(/^\[\s\]\s*/, '')}`;
    onChangeContent(id, content);
  }

  function onRemoveBlock(id: string) {
    setOptimisticBlocks((blocks: OptimisticBlock[]) =>
      blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i }))
    );
    startTransition(async () => {
      await deleteBlock(id);
      await reorderBlocks(pageId, optimisticBlocks.filter((b) => b.id !== id).sort((a,b)=>a.order-b.order).map((b, i) => b.id));
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, idx: number, block: Block) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addBlock(block.order);
      setTimeout(() => {
        const inputs = containerRef.current?.querySelectorAll('input[data-block]');
        const next = inputs?.[idx + 1] as HTMLInputElement | undefined;
        next?.focus();
      }, 0);
    }
    if (e.key === 'Backspace' && !block.content) {
      if (optimisticBlocks.length > 1) {
        e.preventDefault();
        onRemoveBlock(block.id);
        setTimeout(() => {
          const inputs = containerRef.current?.querySelectorAll('input[data-block]');
          const prev = inputs?.[Math.max(0, idx - 1)] as HTMLInputElement | undefined;
          prev?.focus();
        }, 0);
      }
    }
  }

  return (
    <div ref={containerRef}>
      {optimisticBlocks.sort((a, b) => a.order - b.order).map((block, idx) => (
        <div key={block.id} className="block">
          {block.type === 'divider' ? (
            <div className="divider" />
          ) : block.type === 'quote' ? (
            <div className="quote">
              <input
                data-block
                className="blockInput"
                value={block.content}
                placeholder="Quote"
                onChange={(e) => onChangeContent(block.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx, block)}
              />
            </div>
          ) : block.type === 'todo' ? (
            <div className="todoRow">
              <input
                type="checkbox"
                className="checkbox"
                checked={/^\[x\]/i.test(block.content)}
                onChange={() => onToggleTodo(block.id)}
              />
              <input
                data-block
                className="blockInput"
                value={block.content.replace(/^\[[x\s]\]\s*/, '')}
                placeholder="To-do"
                onChange={(e) => onChangeContent(block.id, ( /^\[x\]/i.test(block.content) ? '[x] ' : '[ ] ' ) + e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, idx, block)}
              />
            </div>
          ) : (
            <input
              data-block
              className={`blockInput ${block.type === 'heading' ? 'heading' : ''}`}
              value={block.content}
              placeholder={block.type === 'heading' ? 'Heading' : 'Type here'}
              onChange={(e) => onChangeContent(block.id, e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, idx, block)}
            />
          )}
        </div>
      ))}

      <div style={{ marginTop: 12 }}>
        <button className="button" onClick={() => addBlock(nextOrder - 1)}>Add block</button>
        <button
          className="button"
          style={{ marginLeft: 8 }}
          onClick={() => {
            const ids = optimisticBlocks.sort((a,b)=>a.order-b.order).map((b) => b.id);
            startTransition(async () => {
              await reorderBlocks(pageId, ids);
            });
          }}
        >
          Save order
        </button>
      </div>
    </div>
  );
}
