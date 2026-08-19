import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getJobOutputDir } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const outputDir = getJobOutputDir(params.jobId);

  if (!fs.existsSync(outputDir)) {
    return NextResponse.json({ error: "No clips found" }, { status: 404 });
  }

  const mp4Files = fs.readdirSync(outputDir).filter((f) => f.endsWith(".mp4"));

  if (mp4Files.length === 0) {
    return NextResponse.json({ error: "No clips ready" }, { status: 404 });
  }

  // Build a multipart response: return JSON with download URLs
  const files = mp4Files.map((f) => {
    const stat = fs.statSync(path.join(outputDir, f));
    return {
      filename: f,
      url: `/api/clips/${params.jobId}/${f}?download=1`,
      size: stat.size,
    };
  });

  return NextResponse.json({
    jobId: params.jobId,
    totalClips: files.length,
    files,
  });
}
