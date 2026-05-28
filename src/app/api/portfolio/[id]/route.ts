import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH: Update portfolio item details (supports title, description, category, imageUrl, featured)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access! Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, category, imageUrl, featured } = body;

    // Build dynamic update data object based on what was passed
    const updateData: {
      title?: string;
      description?: string | null;
      category?: string;
      imageUrl?: string;
      featured?: boolean;
    } = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ success: false, error: "Invalid title value" }, { status: 400 });
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      updateData.description = description || null;
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        return NextResponse.json({ success: false, error: "Invalid category value" }, { status: 400 });
      }
      updateData.category = category;
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string" || !imageUrl.trim()) {
        return NextResponse.json({ success: false, error: "Invalid imageUrl value" }, { status: 400 });
      }
      updateData.imageUrl = imageUrl;
    }

    if (featured !== undefined) {
      if (typeof featured !== "boolean") {
        return NextResponse.json({ success: false, error: "Featured must be a boolean" }, { status: 400 });
      }
      updateData.featured = featured;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid fields to update provided." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.portfolio.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("PATCH /api/portfolio/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update portfolio item details" },
      { status: 500 }
    );
  }
}

// DELETE: Delete portfolio item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access! Admin session required." },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Portfolio item deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/portfolio/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}
