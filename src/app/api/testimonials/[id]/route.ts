import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// PATCH: Update testimonial approval state or other fields
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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {};
    if (typeof body.approved === "boolean") {
      dataToUpdate.approved = body.approved;
    }
    if (typeof body.clientName === "string") {
      dataToUpdate.clientName = body.clientName;
    }
    if (typeof body.rating === "number") {
      dataToUpdate.rating = body.rating;
    }
    if (typeof body.review === "string") {
      dataToUpdate.review = body.review;
    }
    if (body.imageUrl === null || typeof body.imageUrl === "string") {
      dataToUpdate.imageUrl = body.imageUrl;
    }
    if (typeof body.type === "string") {
      dataToUpdate.type = body.type;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update provided" },
        { status: 400 }
      );
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, testimonial: updatedTestimonial });
  } catch (error) {
    console.error("PATCH /api/testimonials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update testimonial details" },
      { status: 500 }
    );
  }
}

// DELETE: Reject/Delete testimonial
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

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/testimonials/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete testimonial" },
      { status: 500 }
    );
  }
}
