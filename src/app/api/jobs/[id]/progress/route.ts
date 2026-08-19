import { NextRequest } from "next/server";
import { getJob } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      async function send() {
        if (closed) return;
        const job = await getJob(params.id);
        if (!job) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Job not found" })}\n\n`));
          controller.close();
          closed = true;
          return;
        }

        const data = JSON.stringify({
          status: job.status,
          progress: job.progress,
          message: job.message,
          clips: job.clips,
        });

        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        if (job.status === "done" || job.status === "error") {
          controller.close();
          closed = true;
          return;
        }

        setTimeout(send, 1500);
      }

      send();

      req.signal.addEventListener("abort", () => {
        closed = true;
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
