import { NextRequest, NextResponse } from "next/server";

// Kling AI integration proxy
// This keeps your API token server-side only.
// 
// Setup:
// 1. Go to https://kling.ai (or app.klingai.com) → Developer / API section
// 2. Create Access Key + Secret Key
// 3. Generate a JWT API Token following their "API Authentication" guide (they have an online generator or code sample)
// 4. Put the resulting Bearer token in .env.local as KLING_API_TOKEN
//
// The official endpoint is region-specific (singapore or global).
const KLING_BASE = "https://api-singapore.klingai.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, negativePrompt = "", duration = "5", aspectRatio = "16:9", mode = "pro" } = body;

    const token = process.env.KLING_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Kling AI not configured. Add KLING_API_TOKEN to .env.local (see docs for how to generate the JWT token from your Access Key + Secret Key)." },
        { status: 400 }
      );
    }

    // Submit text-to-video task
    const createRes = await fetch(`${KLING_BASE}/v1/videos/text2video`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model_name: "kling-v2-6", // or "kling-v3" / "kling-v1" depending on access
        prompt: prompt,
        negative_prompt: negativePrompt,
        duration: String(duration), // "5" or "10"
        mode: mode, // "std" or "pro"
        aspect_ratio: aspectRatio, // "16:9" | "9:16" | "1:1"
        sound: "off", // or "on"
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok || createData.code !== 0) {
      return NextResponse.json(
        { error: createData.message || "Failed to submit to Kling AI", details: createData },
        { status: 502 }
      );
    }

    const taskId = createData.data?.task_id;
    if (!taskId) {
      return NextResponse.json({ error: "No task_id returned from Kling" }, { status: 502 });
    }

    return NextResponse.json({ taskId, status: "submitted" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Kling proxy error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "taskId required" }, { status: 400 });
  }

  const token = process.env.KLING_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Kling not configured" }, { status: 400 });
  }

  try {
    const statusRes = await fetch(`${KLING_BASE}/v1/videos/text2video/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const statusData = await statusRes.json();

    if (!statusRes.ok) {
      return NextResponse.json({ error: "Failed to query Kling task", details: statusData }, { status: 502 });
    }

    const task = statusData.data;
    const taskStatus = task?.task_status || task?.status;

    if (taskStatus === "succeed" || taskStatus === "success") {
      // Different Kling response shapes exist; try common paths
      const videoUrl =
        task?.task_result?.videos?.[0]?.url ||
        task?.task_result?.video_url ||
        task?.videos?.[0]?.url ||
        task?.result?.video_url ||
        null;

      return NextResponse.json({
        taskId,
        status: "succeed",
        videoUrl,
        raw: task,
      });
    }

    if (taskStatus === "failed" || taskStatus === "fail") {
      return NextResponse.json({
        taskId,
        status: "failed",
        error: task?.task_result?.message || "Generation failed",
        raw: task,
      });
    }

    // still processing
    return NextResponse.json({
      taskId,
      status: taskStatus || "processing",
      progress: task?.progress || 0,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
