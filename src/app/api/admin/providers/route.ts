import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is an ADMIN
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Fetch all providers pending review
    const pendingProviders = await prisma.provider.findMany({
      where: { status: "PENDING_REVIEW" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            photo: true
          }
        }
      },
      orderBy: {
        user: {
          createdAt: "desc"
        }
      }
    });

    // Also fetch verified ones just for history/context if needed, but let's keep it lean
    const verifiedProviders = await prisma.provider.findMany({
      where: { status: "VERIFIED" },
      include: {
        user: { select: { name: true, photo: true } }
      },
      take: 10,
      orderBy: { repeatHireCount: "desc" }
    });

    return NextResponse.json({ 
      pending: pendingProviders,
      verified: verifiedProviders 
    });

  } catch (error) {
    console.error("Admin Providers Error:", error);
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}
