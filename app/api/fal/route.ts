import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_KEY,
});

console.log("FAL KEY EXISTS:", !!process.env.FAL_KEY);
console.log("FAL KEY PREFIX:", process.env.FAL_KEY?.substring(0, 10));

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 5, aspect_ratio = '16:9' } =
      await request.json();

    console.log("========== FAL DEBUG ==========");
    console.log("Incoming Fal Request");
    console.log("FAL KEY EXISTS:", !!process.env.FAL_KEY);
    console.log("FAL KEY PREFIX:", process.env.FAL_KEY?.substring(0, 10));
    console.log("MODEL:", "fal-ai/minimax/video-01-live");
    console.log("PROMPT:", prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const result = await fal.subscribe(
      'fal-ai/minimax/video-01-live',
      {
        input: {
          prompt,
          duration: duration.toString(),
          aspect_ratio,
          generate_audio: false,
          negative_prompt: 'blur, distort, low quality',
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("QUEUE STATUS:", update.status);

          if ("logs" in update && update.logs) {
            console.log(
              "QUEUE LOGS:",
              update.logs.map((log: any) => log.message)
            );
          }
        },
      }
    );

    console.log("========== FAL SUCCESS ==========");
    console.log("FULL RESULT:");
    console.log(JSON.stringify(result, null, 2));

    const videoUrl = result?.data?.video?.url;

    if (!videoUrl) {
      console.error("NO VIDEO URL RETURNED");
      console.error(JSON.stringify(result, null, 2));

      return NextResponse.json(
        { error: 'No video URL in response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'COMPLETED',
      videoUrl,
      requestId: result.requestId,
    });
  } catch (error: any) {
    console.error("========== FAL ERROR ==========");
    console.error("RAW ERROR:", error);

    if (error instanceof Error) {
      console.error("MESSAGE:", error.message);
      console.error("STACK:", error.stack);
    }

    console.error("NAME:", error?.name);
    console.error("STATUS:", error?.status);

    try {
      console.error(
        "BODY:",
        JSON.stringify(error?.body, null, 2)
      );
    } catch {}

    try {
      console.error(
        "RESPONSE:",
        JSON.stringify(error?.response, null, 2)
      );
    } catch {}

    try {
      console.error(
        "CAUSE:",
        JSON.stringify(error?.cause, null, 2)
      );
    } catch {}

    return NextResponse.json(
      {
        error: error?.message || "Fal request failed",
        details: error?.body || error?.response || null,
        status: "FAILED",
      },
      { status: 500 }
    );
  }
}
