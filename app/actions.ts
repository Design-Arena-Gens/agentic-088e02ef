"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const blockInput = z.object({
  id: z.string().optional(),
  pageId: z.string(),
  type: z.enum(['heading','paragraph','todo','quote','divider']),
  content: z.string(),
  order: z.number().int().nonnegative(),
});

export async function createBlock(input: z.infer<typeof blockInput>) {
  const data = blockInput.parse(input);
  const block = await prisma.block.create({ data });
  revalidatePath("/");
  return block;
}

export async function updateBlock(id: string, updates: Partial<z.infer<typeof blockInput>>) {
  const safe = blockInput.partial().parse(updates);
  const block = await prisma.block.update({ where: { id }, data: safe });
  revalidatePath("/");
  return block;
}

export async function deleteBlock(id: string) {
  await prisma.block.delete({ where: { id } });
  revalidatePath("/");
}

export async function reorderBlocks(pageId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, idx) =>
      prisma.block.update({ where: { id }, data: { order: idx } })
    )
  );
  revalidatePath("/");
}

export async function createPage(title: string) {
  const page = await prisma.page.create({ data: { title } });
  revalidatePath(`/page/${page.id}`);
  return page;
}
