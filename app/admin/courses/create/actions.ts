"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import { type CourseSchemaType, courseSchema } from "@/lib/zodSchemas";

export async function CreateCourse(
  values: CourseSchemaType,
): Promise<ApiResponse> {
  try {
    const validation = courseSchema.safeParse(values);
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!validation.success) {
      return {
        status: "error",
        message: "Invalid form data",
      };
    }

    const data = await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string,
      },
    });

    return {
      status: "success",
      message: "Course created successfully",
    };
  } catch {
    return {
      status: "error",
      message: "Failed to create course",
    };
  }
}
