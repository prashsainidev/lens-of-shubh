import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/projects — fetch all projects (admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.weddingProject.findMany({
      include: {
        bookings: {
          orderBy: { eventDate: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects — bulk create a project and its functions (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      clientName,
      phone,
      email,
      religion,
      status,
      totalAmount,
      advancePaid,
      notes,
      events, // array of { eventType, eventDate, venue, notes }
    } = body;

    if (!clientName) {
      return NextResponse.json(
        { error: "clientName is required" },
        { status: 400 }
      );
    }

    const project = await prisma.weddingProject.create({
      data: {
        clientName,
        phone: phone || null,
        email: email || null,
        religion: religion || "Hindu",
        status: status || "confirmed",
        totalAmount: totalAmount || null,
        advancePaid: advancePaid || null,
        notes: notes || null,
        bookings: {
          create: (events || []).map((ev: any) => ({
            eventType: ev.eventType,
            eventDate: new Date(ev.eventDate),
            venue: ev.venue || null,
            notes: ev.notes || null,
            status: status || "confirmed",
            isBlocked: false,
          })),
        },
      },
      include: {
        bookings: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("POST projects error:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
