import { NextRequest, NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({
  credentials: process.env.FAL_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, duration = 5, aspect_ratio = '16:9' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Use production Fal model (Kling v3 via Fal for high-quality text-to-video)
    const result = await fal.subscribe('fal-ai/kling-video/v3/standard/text-to-video', {
      input: {
        prompt,
        duration: duration.toString(),
        aspect_ratio,
        generate_audio: false, // Set true for native audio if desired/supported
        negative_prompt: 'blur, distort, and low quality',
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('Fal generation progress:', update.logs?.map((log: any) => log.message));
        }
      },
    });

    const videoUrl = result.data?.video?.url;

    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL in response' }, { status: 500 });
    }

    return NextResponse.json({
      status: 'COMPLETED',
      videoUrl,
      requestId: result.requestId,
    });
  } catch (error: any) {
    console.error('Fal AI error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate video with Fal AI',
      status: 'FAILED' 
    }, { status: 500 });
  }
}
