import "server-only";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";
import { requireAdmin } from "@/app/data/admin/require-admin";
import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { S3 } from "@/lib/S3Client";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, { message: "Filename is required" }),
  contentType: z.string().min(1, { message: "Content type is required" }),
  size: z.number().min(1, { message: "Size is required" }),
  isImage: z.boolean(),
});

const aj = arcjet
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 5,
    }),
  );

export async function POST(request: Request) {
  const session = await requireAdmin();

  try {
    const decision = await aj.protect(request, {
      fingerprint: session?.user.id as string,
    });

    if (decision.isDenied()) {
      return NextResponse.json({
        error: "Too many requests, wait a minute.",
        status: 429,
      });
    }

    const body = await request.json();

    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalide request Body" },
        { status: 400 },
      );
    }

    const { fileName, contentType, size } = validation.data;

    const uniqueKey = `${uuidV4()}-${fileName}`;

    const presignedUrl = await getSignedUrl(
      S3,
      new PutObjectCommand({
        Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
        Key: uniqueKey,
        ContentType: contentType,
      }),
      {
        expiresIn: 360,
      },
    );

    const response = {
      key: uniqueKey,
      presignedUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
