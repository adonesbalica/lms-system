import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetLesson(id: string) {
  await requireAdmin();

  const data = await prisma.lesson.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      position: true,
      videoKey: true,
      thumbnailKey: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminGetLesson = Awaited<ReturnType<typeof adminGetLesson>>;
