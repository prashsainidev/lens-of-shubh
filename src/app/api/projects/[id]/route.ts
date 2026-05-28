import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/projects/[id] — update project and its functions (admin only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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

    // Update parent project
    const updatedProject = await prisma.weddingProject.update({
      where: { id },
      data: {
        ...(clientName !== undefined && { clientName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(religion !== undefined && { religion }),
        ...(status !== undefined && { status }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(advancePaid !== undefined && { advancePaid }),
        ...(notes !== undefined && { notes }),
      },
    });

    // If events are specified, we replace them in a transaction
    if (events !== undefined && Array.isArray(events)) {
      await prisma.$transaction([
        prisma.booking.deleteMany({
          where: { projectId: id },
        }),
        prisma.booking.createMany({
          data: events.map((ev: any) => ({
            projectId: id,
            eventType: ev.eventType,
            eventDate: new Date(ev.eventDate),
            venue: ev.venue || null,
            notes: ev.notes || null,
            status: status || updatedProject.status,
            isBlocked: false,
          })),
        }),
      ]);
    } else if (status !== undefined) {
      // If status is updated but events are not recreated, sync status to existing bookings
      await prisma.booking.updateMany({
        where: { projectId: id },
        data: { status },
      });
    }

    const finalProject = await prisma.weddingProject.findUnique({
      where: { id },
      include: {
        bookings: {
          orderBy: { eventDate: "asc" },
        },
      },
    });

    return NextResponse.json(finalProject);
  } catch (error) {
    console.error("PATCH project error:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] — delete project and all associated bookings (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete project — CASCADE will automatically delete all bookings linked to it in the DB
    await prisma.weddingProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
