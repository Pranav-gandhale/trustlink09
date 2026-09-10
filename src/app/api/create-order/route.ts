import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: Request) {
  try {
    const { fixedPrice, currency, bookingId } = await request.json();

    if (typeof fixedPrice !== "number" || fixedPrice <= 0) {
      return NextResponse.json({ error: "fixedPrice must be a positive number" }, { status: 400 });
    }

    const options = {
      amount: Math.round(fixedPrice * 100), // Razorpay expects amount in paise
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { razorpayOrderId: order.id },
      });
    }

    return NextResponse.json({
      razorpay_order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return NextResponse.json(
      { error: "Error creating Razorpay order" },
      { status: 500 }
    );
  }
}