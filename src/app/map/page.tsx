"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { 
  Shield, MapPin, Search, ChevronLeft, 
  Navigation, Star, CheckCircle, Verified, Loader2, List, Ticket
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { getProviders } from "@/lib/data";
import { TrustBadge } from "@/components/TrustBadge";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

// Fix for default marker icon issue in Leaflet
function MapIconFix() {
  useEffect(() => {
    let mounted = true;
    import("leaflet").then((L) => {
      if (!mounted) return;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });
    });
    return () => {
      mounted = false;
    };
  }, []);
  return null;
}

export default function MapPage() {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [providers, setProviders] = useState<any[]>([]);
  const [showList, setShowList] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const mapRef = useRef<any>(null);
  const router = useRouter();
  
  // Default to Loni Kalbhor, Pune
  const defaultPosition: [number, number] = [18.4855, 74.0211];

  const normalizedProviders = useMemo(() => {
    return (providers || []).map((p: any) => {
      const name = p?.user?.name ?? p?.name ?? "Provider";
      const serviceType = p?.serviceType ?? p?.service ?? "Service";
      const photo = p?.user?.photo ?? p?.image ?? `https://i.pravatar.cc/160?u=${encodeURIComponent(String(p?.id || name))}`;
      const price = Number(p?.price ?? 0);
      const latitude = p?.latitude;
      const longitude = p?.longitude;
      return { ...p, _name: name, _serviceType: serviceType, _photo: photo, _price: price, latitude, longitude };
    });
  }, [providers]);

  const filteredProviders = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return normalizedProviders.filter((p: any) => {
      const matchesService =
        selectedService === "ALL" ||
        String(p._serviceType || "").toLowerCase() === selectedService.toLowerCase();
      const matchesText =
        !term ||
        String(p._name || "").toLowerCase().includes(term) ||
        String(p._serviceType || "").toLowerCase().includes(term);
      return matchesService && matchesText;
    });
  }, [normalizedProviders, searchText, selectedService]);

  const fetchNearbyProviders = async (position: [number, number], serviceFilter?: string) => {
    try {
      const serviceTypeParam =
        serviceFilter && serviceFilter !== "ALL" ? `&serviceType=${encodeURIComponent(serviceFilter)}` : "";
      const response = await fetch(`/api/providers?lat=${position[0]}&lng=${position[1]}&radiusKm=20${serviceTypeParam}`);
      if (!response.ok) return;
      setProviders(await response.json());
    } catch (error) {
      console.error("Failed to load nearby providers:", error);
    }
  };

  const handleLocateUser = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          void fetchNearbyProviders(coords, selectedService);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
          // Fallback to Loni Kalbhor
          setUserLocation(defaultPosition);
          void fetchNearbyProviders(defaultPosition, selectedService);
          alert("Could not get real-time location. Showing Loni Kalbhor, Pune.");
        }
      );
    } else {
      setIsLocating(false);
      setUserLocation(defaultPosition);
      void fetchNearbyProviders(defaultPosition, selectedService);
    }
  };

  useEffect(() => {
    // Fallback data first, then replace with nearby API data once location resolves.
    setProviders(getProviders() as any[]);
    handleLocateUser();
  }, []);

  useEffect(() => {
    // refetch when service filter changes (use latest known location)
    const pos = userLocation || defaultPosition;
    void fetchNearbyProviders(pos, selectedService);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService]);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      try {
        mapRef.current.setView(userLocation, 15);
      } catch {}
    }
  }, [userLocation]);

  useEffect(() => {
    const raw = localStorage.getItem("trustlink_user");
    if (raw) setCurrentUser(JSON.parse(raw));
  }, []);

  const raiseTicket = async (provider: any) => {
    if (!currentUser?.email) {
      window.location.href = "/login";
      return;
    }
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          customerEmail: currentUser.email,
          serviceType: provider.serviceType,
          amount: 0,
          bookingType: "INSPECTION",
          inspectionFee: 0,
          issueDescription: "Inspection ticket raised from map (no payment).",
          address: "To be updated by customer",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to raise ticket");
      alert(`Ticket raised successfully. Booking ID: ${data.bookingId}`);
      window.location.href = "/dashboard";
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to raise ticket");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 overflow-hidden fixed inset-0 z-[100]">
      <MapIconFix />
      <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search provider or service..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-green-700 font-bold flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <CheckCircle className="h-3.5 w-3.5" /> Loni Kalbhor, Pune
          </div>
          <button
            onClick={() => setShowList((v) => !v)}
            className="ml-2 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50"
          >
            <List className="h-3.5 w-3.5" />
            Providers
          </button>
        </div>
      </header>

      <div className="bg-white border-b px-6 py-2 flex flex-wrap gap-2">
        {["ALL", "Plumber", "Electrician", "Pest Control", "Home Tutor"].map((s) => (
          <button
            key={s}
            onClick={() => setSelectedService(s)}
            className={
              "rounded-full px-3 py-1.5 text-xs font-bold border transition-colors " +
              (selectedService === s
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50")
            }
          >
            {s === "ALL" ? "All" : s}
          </button>
        ))}
      </div>

      <main className="flex-1 relative w-full h-full">
        {/* Real Leaflet Map */}
        <div className="absolute inset-0 z-0">
          <MapContainer 
            center={defaultPosition} 
            zoom={3} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {userLocation && (
              <>
                <Marker position={userLocation}>
                  <Popup>You are here in Loni Kalbhor</Popup>
                </Marker>
              </>
            )}

            {filteredProviders
              .filter(
                (provider) =>
                  Number.isFinite(Number(provider.latitude)) && Number.isFinite(Number(provider.longitude))
              )
              .map((p) => (
              <Marker 
                key={p.id} 
                position={[Number(p.latitude), Number(p.longitude)]}
                eventHandlers={{
                  click: () => setSelectedProvider(p),
                }}
              >
                <Popup>
                  <div className="font-bold">{p._name}</div>
                  <div className="text-xs text-primary font-bold">
                    {p._serviceType}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-10 right-6 space-y-3 z-10">
          <button 
            onClick={handleLocateUser}
            disabled={isLocating}
            className="h-14 w-14 bg-white rounded-full shadow-2xl flex items-center justify-center text-primary hover:bg-slate-50 transition-all border-2 border-primary/20 active:scale-95"
          >
            {isLocating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Navigation className="h-7 w-7 fill-current" />}
          </button>
        </div>

        {/* Provider Preview Card */}
        {selectedProvider && (
          <div className="absolute bottom-10 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-20">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-primary/10 animate-in fade-in slide-in-from-bottom-10">
              <div className="p-5 flex gap-5">
                <img 
                  src={selectedProvider._photo} 
                  className="h-24 w-24 rounded-2xl object-cover shadow-md border-2 border-slate-100" 
                  alt={selectedProvider._name} 
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-slate-900 text-xl">{selectedProvider._name}</h3>
                        <Verified className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-sm text-primary font-black uppercase tracking-wider">
                        {selectedProvider._serviceType}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {selectedProvider.distanceKm ? `${selectedProvider.distanceKm.toFixed(1)} km away` : "Nearby"}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900">{formatCurrency(selectedProvider._price)}</div>
                      <div className="flex justify-end mt-1">
                        <TrustBadge 
                          score={selectedProvider.trustScore || 50} 
                          level={selectedProvider.trustLevel || "Standard"} 
                          colorClass={selectedProvider.trustColor || "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200"} 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <Link 
                      href={`/booking/${selectedProvider.id}`}
                      className="flex-1 bg-primary text-white text-sm font-black py-3 rounded-2xl text-center hover:bg-primary/90 transition-all shadow-lg active:scale-95"
                    >
                      Book Inspection
                    </Link>
                    <button
                      onClick={() => raiseTicket(selectedProvider)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white text-sm font-black rounded-2xl hover:bg-slate-800 transition-all"
                    >
                      <Ticket className="h-4 w-4" />
                      Raise Ticket
                    </button>
                    <button 
                      onClick={() => setSelectedProvider(null)}
                      className="px-5 py-3 bg-slate-100 text-slate-700 text-sm font-black rounded-2xl hover:bg-slate-200 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showList && (
          <div className="absolute top-20 left-6 right-6 md:right-auto md:w-[420px] z-20">
            <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <p className="text-sm font-black text-slate-900">Nearby Providers</p>
                <p className="text-xs text-slate-600">{filteredProviders.length} found</p>
              </div>
              <div className="max-h-[55vh] overflow-auto p-3 space-y-2">
                {filteredProviders.map((p) => (
                  <div key={p.id} className="rounded-xl border p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={p._photo}
                          alt={p._name}
                          className="h-10 w-10 rounded-xl object-cover border"
                        />
                        <div>
                          <p className="text-sm font-black text-slate-900">{p._name}</p>
                          <p className="text-xs font-bold text-primary uppercase">{p._serviceType}</p>
                        <p className="text-[11px] text-slate-600">
                          {p.distanceKm ? `${Number(p.distanceKm).toFixed(1)} km away` : "Distance unknown"}
                        </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{formatCurrency(p._price)}</p>
                        <div className="mt-1 flex justify-end">
                          <TrustBadge 
                            score={p.trustScore || 50} 
                            level={p.trustLevel || "Standard"} 
                            colorClass={p.trustColor || "text-slate-700 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200"} 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setSelectedProvider(p)}
                        className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200"
                      >
                        View
                      </button>
                      <Link
                        href={`/booking/${p.id}`}
                        className="flex-1 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white text-center hover:bg-primary/90"
                      >
                        Book
                      </Link>
                      <button
                        onClick={() => raiseTicket(p)}
                        className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800"
                      >
                        Ticket
                      </button>
                    </div>
                  </div>
                ))}
                {filteredProviders.length === 0 && (
                  <p className="text-sm text-slate-600 p-3">No providers found. Try locating again.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}