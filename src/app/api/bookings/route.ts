import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(req: Request) {
  try {
    const {
      providerId,
      customerEmail,
      serviceType,
      amount,
      bookingType = "DIRECT",
      inspectionFee = 0,
      issueDescription,
      taskCode,
      taskTitle,
      address,
      date,
      time,
    } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    let finalProviderId = providerId;
    if (providerId === "AUTO") {
       const bestProvider = await prisma.provider.findFirst({
         where: { serviceType: serviceType.toLowerCase().replace(" ", "-") },
         orderBy: { repeatHireCount: 'desc' }
       });
       if (!bestProvider) {
         return NextResponse.json({ error: `No provider available for this service category (${serviceType}).` }, { status: 400 });
       }
       finalProviderId = bestProvider.id;
    }

    const provider = await prisma.provider.findUnique({
      where: { id: finalProviderId },
      select: { id: true, isVerified: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    // Allow booking even if provider is not verified (MVP onboarding).

    const numericAmount = Number(amount || 0);
    const shouldCreatePayment = numericAmount > 0;
    let orderId: string | null = null;

    if (shouldCreatePayment) {
      // 1. Create Razorpay Order
      const options = {
        amount: Math.round(numericAmount * 100), // in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };
      const order = await razorpay.orders.create(options);
      orderId = order.id;
    }

    // 2. Create Booking in Database
    const booking = await prisma.booking.create({
      data: {
        customerId: user.id,
        providerId: provider.id,
        serviceType: taskTitle ? `${serviceType} - ${taskTitle}` : serviceType,
        fixedPrice: numericAmount,
        bookingType,
        issueDescription: taskCode
          ? `${issueDescription || ""} [task:${taskCode}]`.trim()
          : issueDescription,
        address,
        inspectionFee,
        holdAmount: numericAmount,
        scheduledAt: date && time ? new Date(`${date}T${time}`) : null,
        status: bookingType === "INSPECTION" ? "INSPECTION_REQUESTED" : "PENDING",
        razorpayOrderId: orderId,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      orderId,
      amount: shouldCreatePayment ? Math.round(numericAmount * 100) : 0,
      currency: "INR",
      paymentRequired: shouldCreatePayment,
    });
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { action, bookingId, providerEmail, customerEmail, finalQuote, quoteNotes } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: { include: { user: true } }, customer: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (action === "SUBMIT_QUOTE") {
      if (booking.provider.user.email !== providerEmail) {
        return NextResponse.json({ error: "Unauthorized provider action" }, { status: 403 });
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          finalQuote: Number(finalQuote),
          quoteNotes: quoteNotes || null,
          quoteSubmittedAt: new Date(),
          status: "QUOTE_SUBMITTED",
          customerApprovalStatus: "PENDING",
        },
      });
      return NextResponse.json(updated);
    }

    if (action === "CUSTOMER_DECISION") {
      if (booking.customer.email !== customerEmail) {
        return NextResponse.json({ error: "Unauthorized customer action" }, { status: 403 });
      }

      if (Number(finalQuote) > booking.holdAmount) {
        return NextResponse.json(
          { error: "Quote exceeds escrow hold. Ask provider to update quote." },
          { status: 400 }
        );
      }

      const approved = quoteNotes === "APPROVE";
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: {
          customerApprovalStatus: approved ? "APPROVED" : "REJECTED",
          status: approved ? "QUOTE_APPROVED" : "QUOTE_REJECTED",
          approvedAt: approved ? new Date() : null,
          rejectedAt: approved ? null : new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    console.error("Update Booking Error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const role = searchParams.get("role");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        bookings: {
          include: {
            provider: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        provider: {
          include: {
            bookings: {
              include: {
                customer: {
                  select: { name: true }
                }
              },
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return bookings based on role
    if (role === "PROVIDER" && user.provider) {
      return NextResponse.json(user.provider.bookings);
    }
    
    return NextResponse.json(user.bookings);
  } catch (error) {
    console.error("Fetch Bookings Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
