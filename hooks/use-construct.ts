import { env } from "@/lib/env";

export function useConstructUrl(key: string): string {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.s3.us-east-1.amazonaws.com/${key}`;
}
