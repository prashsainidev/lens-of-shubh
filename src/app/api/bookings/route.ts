import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/bookings — fetch all bookings (admin only), optionally filter by month/year
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // 0-indexed (0 = Jan)
  const year = searchParams.get("year");

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

  try {
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: { project: true },
      orderBy: { eventDate: "asc" },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("GET bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST /api/bookings — create a new booking (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      projectId,
      clientName,
      phone,
      email,
      eventType,
      eventDate,
      venue,
      notes,
      status,
      isBlocked,
      blockReason,
      totalAmount,
      advancePaid,
    } = body;

    if (!eventDate) {
      return NextResponse.json(
        { error: "eventDate is required" },
        { status: 400 }
      );
    }
    if (!isBlocked && !projectId && !clientName) {
      return NextResponse.json(
        { error: "clientName is required for standalone bookings" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        projectId: projectId || null,
        clientName: projectId ? null : (clientName || "Blocked"),
        phone: projectId ? null : (phone || null),
        email: projectId ? null : (email || null),
        eventType: eventType || "Personal",
        eventDate: new Date(eventDate),
        venue: venue || null,
        notes: notes || null,
        status: status || "confirmed",
        isBlocked: isBlocked || false,
        blockReason: blockReason || null,
        totalAmount: projectId ? null : (totalAmount || null),
        advancePaid: projectId ? null : (advancePaid || null),
      },
      include: { project: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("POST booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
