import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH: Update service details
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
    const { title, description, price, features, popular } = body;

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        title,
        description,
        price,
        features,
        popular,
      },
    });

    return NextResponse.json({ success: true, service: updatedService });
  } catch (error) {
    console.error("PATCH /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update service details" },
      { status: 500 }
    );
  }
}

// DELETE: Delete pricing package
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

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Package deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/services/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete pricing package" },
      { status: 500 }
    );
  }
}
