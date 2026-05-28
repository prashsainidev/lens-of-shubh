import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 1. Fetch counts in parallel
    const [
      totalInquiries,
      newInquiries,
      pendingTestimonials,
      portfolioItems,
    ] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "new" } }),
      prisma.testimonial.count({ where: { approved: false } }),
      prisma.portfolio.count(),
    ]);

    // 2. Fetch recent inquiries (last 5)
    const recentInquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // 3. Fetch pending testimonials (last 3 unapproved)
    const recentPendingTestimonials = await prisma.testimonial.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalInquiries,
        newInquiries,
        pendingTestimonials,
        portfolioItems,
      },
      recentInquiries,
      recentPendingTestimonials,
    });
  } catch (error) {
    console.error("GET /api/admin/overview error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load admin overview metrics" },
      { status: 500 }
    );
  }
}
