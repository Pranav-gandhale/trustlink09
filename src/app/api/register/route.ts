import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name, type, service, experience, price, photo, governmentId, latitude, longitude } =
      await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const normalizedType = String(type || "user").toLowerCase();

    const user = await prisma.user.create({
      data: {
        email,
        password, // In a real app, hash this
        name,
        photo: typeof photo === "string" ? photo : null,
        role:
          normalizedType === "provider"
            ? "PROVIDER"
            : normalizedType === "admin"
              ? "ADMIN"
              : "CUSTOMER",
      },
    });

    let providerId: string | null = null;
    if (normalizedType === "provider") {
      const baseLat = 18.4855;
      const baseLng = 74.0211;
      const jitter = () => (Math.random() - 0.5) * 0.06; // ~3-4km-ish
      const resolvedLat = typeof latitude === "number" ? latitude : baseLat + jitter();
      const resolvedLng = typeof longitude === "number" ? longitude : baseLng + jitter();

      const provider = await prisma.provider.create({
        data: {
          userId: user.id,
          serviceType: service || "Plumber",
          experience: parseInt(experience) || 0,
          price: parseFloat(price) || 0,
          status: "PENDING_REVIEW",
          isVerified: false,
          governmentId: governmentId || null,
          latitude: resolvedLat,
          longitude: resolvedLng,
        },
      });
      providerId = provider.id;
    }

    return NextResponse.json({ 
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      photo: photo,
      providerId
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
