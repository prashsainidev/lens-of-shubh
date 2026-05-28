import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Zod Schema for Testimonial validation
const testimonialPostSchema = z.object({
  clientName: z.string().min(1, "Client name is required").max(100, "Client name is too long"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  review: z.string().min(1, "Review is required").max(1000, "Review cannot exceed 1000 characters"),
  imageUrl: z.string().url("Valid image URL is required").nullable().optional().or(z.literal("")),
  type: z.string().optional(),
  extraData: z.string().nullable().optional(),
  approved: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const whereClause = all ? {} : { approved: true };

    const testimonials = await prisma.testimonial.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Parse and Validate Request Body using Zod
    const result = testimonialPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { clientName, rating, review, imageUrl, type, extraData, approved } = result.data;

    const session = await getServerSession(authOptions);
    const approvedVal = (session && approved === true) ? true : false;

    const testimonial = await prisma.testimonial.create({
      data: {
        clientName,
        rating,
        review,
        imageUrl: imageUrl || null,
        type: type || "standard",
        extraData: extraData || null,
        approved: approvedVal,
      },
    });

    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit testimonial" },
      { status: 500 }
    );
  }
}
