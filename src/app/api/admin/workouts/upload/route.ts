import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const THUMB_MAX = 4 * 1024 * 1024;
const VIDEO_MAX = 500 * 1024 * 1024;

/** Whether Blob uploads are available (admin only). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const configured = Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  return NextResponse.json({ blobUploadsConfigured: configured });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      {
        error:
          "File upload is not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob) to upload thumbnails and videos.",
      },
      { status: 503 },
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        const imageKinds = ["thumbnail", "scheduleDayImage"] as const;
        const videoKinds = ["video", "scheduleDayVideo"] as const;
        const isImage = imageKinds.includes(clientPayload as (typeof imageKinds)[number]);
        const isVideo = videoKinds.includes(clientPayload as (typeof videoKinds)[number]);
        if (!isImage && !isVideo) {
          throw new Error(
            "Invalid upload kind (thumbnail, video, scheduleDayImage, or scheduleDayVideo).",
          );
        }
        const prefixByPayload: Record<string, string> = {
          thumbnail: "workouts/thumbnails/",
          video: "workouts/videos/",
          scheduleDayImage: "schedule-days/images/",
          scheduleDayVideo: "schedule-days/videos/",
        };
        const prefix = prefixByPayload[clientPayload ?? ""] ?? "";
        if (!prefix || !pathname.startsWith(prefix)) {
          throw new Error("Invalid upload path.");
        }
        if (isImage) {
          return {
            allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
            maximumSizeInBytes: THUMB_MAX,
            addRandomSuffix: true,
          };
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
          maximumSizeInBytes: VIDEO_MAX,
          addRandomSuffix: true,
          multipart,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Upload token failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
