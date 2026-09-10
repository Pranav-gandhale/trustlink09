import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, providerId, action } = await req.json();

    if (!email || !providerId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Verify admin
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    if (action === "APPROVE") {
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          isVerified: true,
          status: "VERIFIED",
          isBackgroundChecked: true // Assuming Aadhaar verification counts as background check
        }
      });
      return NextResponse.json({ success: true, message: "Provider Approved" });
    } else if (action === "REJECT") {
      await prisma.provider.update({
        where: { id: providerId },
        data: {
          isVerified: false,
          status: "REJECTED"
        }
      });
      return NextResponse.json({ success: true, message: "Provider Rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Admin Verify Error:", error);
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 });
  }
}
