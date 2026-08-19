import { NextRequest, NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/storage";
import { getVideoPathForJob } from "@/lib/pipeline";
import { reclipWithTrim } from "@/lib/video-processor";
import { JobClip } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getJob(params.id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { clipId, start, end } = await req.json();
    const videoPath = getVideoPathForJob(params.id);
    if (!videoPath) {
      return NextResponse.json({ error: "Source video not found" }, { status: 404 });
    }

    const filename = await reclipWithTrim(
      params.id,
      videoPath,
      clipId,
      start,
      end
    );

    const updatedClips: JobClip[] = job.clips.map((c) =>
      c.id === clipId ? { ...c, filename, start, end } : c
    );
    await updateJob(params.id, { clips: updatedClips });

    return NextResponse.json({ filename });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Edit failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
