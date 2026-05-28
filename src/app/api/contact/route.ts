import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

// Zod Schema for Contact Inquiry validation
const contactPostSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().regex(/^\+?[0-9\s\-()]{10,20}$/, "Valid phone number is required (10-20 digits)").nullable().optional().or(z.literal("")),
  eventDate: z.string().nullable().optional(),
  eventType: z.string().nullable().optional(),
  location: z.string().max(200, "Location is too long").nullable().optional(),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  website: z.string().optional(), // Honeypot field for bot spam protection
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Honeypot Bot Spam Shield
    // If the hidden 'website' field is filled, it is a bot. Reject silently with a success status.
    if (body.website && body.website.trim() !== "") {
      console.warn("Honeypot shield triggered: Bot submission detected.");
      return NextResponse.json(
        { success: true, message: "Thank you! Your inquiry has been received." }, 
        { status: 201 }
      );
    }

    // 2. Parse and Validate Request Body using Zod
    const result = contactPostSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, phone, eventDate, eventType, location, message } = result.data;

    // Create the database record
    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        eventDate: eventDate || null,
        eventType: eventType || null,
        location: location || null,
        message,
      },
    });

    return NextResponse.json({ success: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit inquiry due to server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause = status ? { status } : {};

    const inquiries = await prisma.inquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error("GET /api/contact error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch inquiries" },
      { status: 500 }
    );
  }
}
