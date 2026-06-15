import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.S3_BUCKET || "nesubs";

export async function uploadFile(file: Buffer, fileName: string, contentType: string): Promise<string> {
  const key = `uploads/${Date.now()}-${fileName}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  );

  // Return an absolute proxy URL instead of a direct R2 URL
  const baseUrl = process.env.VITE_API_BASE_URL || "http://localhost:3000/api";
  return `${baseUrl}/images/${key.replace('uploads/', '')}`;
}

export async function getFile(key: string) {
  const fullKey = `uploads/${key}`;
  const response = await s3Client.send(
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fullKey,
    })
  );
  return response;
}
