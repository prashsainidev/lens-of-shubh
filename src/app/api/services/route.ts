import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Zod Schema for Service item validation
const servicePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price text is too long"),
  features: z.array(z.string().min(1, "Feature item cannot be empty")).min(1, "At least one feature is required"),
  popular: z.boolean().default(false),
});

export async function GET() {
  try {
    // Fetch all services, sorting popular: true first, then by createdAt desc
    const services = await prisma.service.findMany({
      orderBy: [
        { popular: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error("GET /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Admin Authentication Check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access! Admin session required." },
        { status: 401 }
      );
    }

    // 2. Parse and Validate Request Body using Zod
    const body = await req.json();
    const result = servicePostSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, price, features, popular } = result.data;

    const service = await prisma.service.create({
      data: {
        title,
        description,
        price,
        features,
        popular,
      },
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error) {
    console.error("POST /api/services error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create service" },
      { status: 500 }
    );
  }
}
