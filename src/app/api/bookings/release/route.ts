import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId } = await req.json();

    const existing = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true, providerId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existing.status !== "ESCROW_HELD") {
      const releasable = ["QUOTE_APPROVED", "WORK_COMPLETED", "ESCROW_HELD"];
      if (!releasable.includes(existing.status)) {
      return NextResponse.json(
        { error: "Booking is not in releasable state yet." },
        { status: 400 }
      );
      }
    }

    // In a real app, this would trigger an actual bank transfer/escrow release.
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "RELEASED", paymentReleasedAt: new Date() },
      include: { provider: true }
    });

    // Update provider metrics on successful release
    await prisma.provider.update({
      where: { id: booking.providerId },
      data: {
        totalHires: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Payment Release Error:", error);
    return NextResponse.json({ error: "Failed to release payment" }, { status: 500 });
  }
}
