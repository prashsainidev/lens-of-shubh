import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Zod Schema for Portfolio item validation
const portfolioPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
  category: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    // Dynamic filtering based on category
    const whereClause = category ? { category } : {};

    const portfolio = await prisma.portfolio.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        category: true,
        featured: true,
        createdAt: true,
      },
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ success: true, portfolio });
  } catch (error) {
    console.error("GET /api/portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch portfolio items" },
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
    const result = portfolioPostSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, description, imageUrl, category, featured } = result.data;

    // Optional: image URL size/length limit check
    if (imageUrl.length > 2000) {
      return NextResponse.json(
        { success: false, error: "Image URL string is too long (limit: 2000 chars)" },
        { status: 400 }
      );
    }

    const item = await prisma.portfolio.create({
      data: {
        title,
        description: description || null,
        imageUrl,
        category,
        featured,
      },
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    console.error("POST /api/portfolio error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}
