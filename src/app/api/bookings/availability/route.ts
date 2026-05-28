import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/bookings/availability — PUBLIC endpoint
// Returns only booked/blocked dates (no private client data exposed)
// Used by contact form to show unavailable dates
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  try {
    let whereClause = {};

    if (month !== null && year !== null) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      const startDate = new Date(yearNum, monthNum, 1);
      const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);
      whereClause = {
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      };
    }

    const bookings = await prisma.booking.findMany({
      where: {
        ...whereClause,
        status: {
          not: "cancelled",
        },
      },
      select: {
        eventDate: true,
        isBlocked: true,
        eventType: true,
      },
      orderBy: { eventDate: "asc" },
    });

    // Only expose the date and type — no client personal data
    const unavailableDates = bookings.map((b) => ({
      date: b.eventDate.toISOString().split("T")[0], // "YYYY-MM-DD"
      isBlocked: b.isBlocked,
      eventType: b.isBlocked ? null : b.eventType,
    }));

    return NextResponse.json(unavailableDates);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
