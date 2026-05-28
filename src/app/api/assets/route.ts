import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { success: false, error: "Missing asset key parameter" },
        { status: 400 }
      );
    }

    const asset = await prisma.siteAsset.findUnique({
      where: { key },
    });

    return NextResponse.json({ success: true, asset });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to fetch asset";
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized administrative access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, imageUrl, altText } = body;

    if (!key || !imageUrl) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: key and imageUrl" },
        { status: 400 }
      );
    }

    const asset = await prisma.siteAsset.upsert({
      where: { key },
      update: {
        imageUrl,
        altText: altText || null,
      },
      create: {
        key,
        imageUrl,
        altText: altText || null,
      },
    });

    return NextResponse.json({ success: true, asset });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : "Failed to update asset";
    return NextResponse.json(
      { success: false, error: errMsg },
      { status: 500 }
    );
  }
}
