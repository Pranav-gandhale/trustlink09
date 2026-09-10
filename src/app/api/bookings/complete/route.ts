import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { bookingId, photoUrl } = await req.json();

    if (!photoUrl || typeof photoUrl !== "string") {
      return NextResponse.json({ error: "After photo is required." }, { status: 400 });
    }

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        completionPhoto: photoUrl,
        status: "WORK_COMPLETED"
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Booking Completion Error:", error);
    return NextResponse.json({ error: "Failed to complete booking" }, { status: 500 });
  }
}
