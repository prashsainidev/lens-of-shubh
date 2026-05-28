import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH: Update inquiry status
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
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status param is required" },
        { status: 400 }
      );
    }

    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, inquiry: updatedInquiry });
  } catch (error) {
    console.error("PATCH /api/contact/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update inquiry status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete inquiry
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

    await prisma.inquiry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/contact/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete inquiry" },
      { status: 500 }
    );
  }
}
