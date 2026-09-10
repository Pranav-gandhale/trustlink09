import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateTrustScore, getTrustLevel, getTrustColor, ProviderMetrics } from "@/lib/trust-score";

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const email = searchParams.get("email");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radiusKm = Number(searchParams.get("radiusKm") || "15");
    const serviceType = searchParams.get("serviceType");

    let whereClause: any = {};
    if (verifiedOnly) {
      whereClause.isVerified = true;
    }
    if (email) {
      whereClause.user = { email: email };
    }
    if (serviceType) {
      whereClause.serviceType = serviceType;
    }

    const providers = await prisma.provider.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            photo: true,
          }
        }
      }
    });

    const mapProviderWithTrust = (p: any) => {
      const metrics: ProviderMetrics = {
        isIdentityVerified: p.isVerified,
        isBackgroundChecked: p.isBackgroundChecked || false,
        hasCertifications: p.hasCertifications || false,
        totalHires: p.totalHires || 0,
        repeatHireCount: p.repeatHireCount || 0,
        disputeResolutionRate: p.disputeResolutionRate ?? 1.0,
        averageRating: p.averageRating || 0,
        responseTimeMinutes: p.responseTimeMinutes || 60,
        yearsExperience: p.experience || 0,
      };
      
      const trustScore = calculateTrustScore(metrics);
      
      return {
        ...p,
        trustScore,
        trustLevel: getTrustLevel(trustScore),
        trustColor: getTrustColor(trustScore)
      };
    };

    const providersWithTrust = providers.map(mapProviderWithTrust);

    if (lat && lng) {
      const userLat = Number(lat);
      const userLng = Number(lng);
      const nearby = providersWithTrust
        .filter((provider) => provider.latitude !== null && provider.longitude !== null)
        .map((provider) => ({
          ...provider,
          distanceKm: distanceKm(userLat, userLng, provider.latitude as number, provider.longitude as number),
        }))
        .filter((provider) => provider.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm);

      return NextResponse.json(nearby);
    }

    return NextResponse.json(providersWithTrust);
  } catch (error) {
    console.error("Fetch providers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { providerId, isVerified, status, governmentId, businessLicense, latitude, longitude } = await req.json();
    
    const updateData: any = {};
    if (isVerified !== undefined) updateData.isVerified = isVerified;
    if (status !== undefined) updateData.status = status;
    if (governmentId !== undefined) updateData.governmentId = governmentId;
    if (businessLicense !== undefined) updateData.businessLicense = businessLicense;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;

    const provider = await prisma.provider.update({
      where: { id: providerId },
      data: updateData,
    });
    return NextResponse.json(provider);
  } catch (error) {
    console.error("PATCH Provider Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
