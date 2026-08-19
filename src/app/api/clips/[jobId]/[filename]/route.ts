import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getJobOutputDir } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string; filename: string } }
) {
  const filePath = path.join(getJobOutputDir(params.jobId), params.filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);

  const ext = path.extname(params.filename).toLowerCase();
  const contentType =
    ext === ".mp4"
      ? "video/mp4"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

  const download = req.nextUrl.searchParams.get("download") === "1";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": stat.size.toString(),
      ...(download
        ? { "Content-Disposition": `attachment; filename="${params.filename}"` }
        : {}),
    },
  });
}
