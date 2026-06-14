import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_KEY,
});

console.log("FAL KEY EXISTS:", !!process.env.FAL_KEY);
console.log("FAL KEY PREFIX:", process.env.FAL_KEY?.substring(0, 10));

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 5, aspect_ratio = '16:9' } = await request.json();

    console.log("Incoming Fal Request");
    console.log("FAL KEY EXISTS:", !!process.env.FAL_KEY);

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
          negative_prompt: 'blur, distort, and low quality',
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("Queue Update:", update.status);
        },
      }
    );

    console.log("Fal Result:", JSON.stringify(result, null, 2));

    const videoUrl = result.data?.video?.url;

    if (!videoUrl) {
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
    console.error("FULL FAL ERROR:", error);
    console.error("ERROR MESSAGE:", error?.message);
    console.error("ERROR BODY:", error?.body);
    console.error("ERROR RESPONSE:", error?.response);

    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate video with Fal AI',
        status: 'FAILED',
      },
      { status: 500 }
    );
  }
}
