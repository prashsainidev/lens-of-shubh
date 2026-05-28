import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/bookings/[id] — update a booking
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

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(clientName !== undefined && { clientName }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(eventType !== undefined && { eventType }),
        ...(eventDate !== undefined && { eventDate: new Date(eventDate) }),
        ...(venue !== undefined && { venue }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
        ...(isBlocked !== undefined && { isBlocked }),
        ...(blockReason !== undefined && { blockReason }),
        ...(totalAmount !== undefined && { totalAmount }),
        ...(advancePaid !== undefined && { advancePaid }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[id] — delete a booking
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
    await prisma.booking.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
