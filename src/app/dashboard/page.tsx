"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle, ShieldCheck, Upload, Compass, Navigation2, MessageSquare, Wrench, Settings } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";

type Booking = {
  id: string;
  serviceType: string;
  fixedPrice: number;
  bookingType: string;
  holdAmount: number;
  finalQuote: number | null;
  quoteNotes: string | null;
  customerApprovalStatus: "PENDING" | "APPROVED" | "REJECTED";
  address: string | null;
  issueDescription: string | null;
  status:
    | "PENDING"
    | "INSPECTION_REQUESTED"
    | "ESCROW_HELD"
    | "QUOTE_SUBMITTED"
    | "QUOTE_APPROVED"
    | "QUOTE_REJECTED"
    | "WORK_COMPLETED"
    | "RELEASED"
    | "DISPUTED"
    | "COMPLETED";
  completionPhoto: string | null;
  createdAt: string;
};

type Provider = {
  id: string;
  serviceType: string;
  price: number;
  isVerified: boolean;
  status: string;
  governmentId: string | null;
  user?: { name: string; email: string };
};

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [photoByBooking, setPhotoByBooking] = useState<Record<string, string>>({});
  const [quoteByBooking, setQuoteByBooking] = useState<Record<string, string>>({});
  const [quoteNotesByBooking, setQuoteNotesByBooking] = useState<Record<string, string>>({});

  const isAdmin = currentUser?.role === "ADMIN";
  const isProvider = currentUser?.role === "PROVIDER";
  const isCustomer = currentUser?.role === "CUSTOMER";

  const pendingProviders = useMemo(
    () => providers.filter((provider) => !provider.isVerified),
    [providers]
  );

  const loadProviders = async () => {
    const response = await fetch("/api/providers");
    if (!response.ok) return;
    setProviders(await response.json());
  };

  const loadBookings = async (email: string, role: string) => {
    const response = await fetch(`/api/bookings?email=${email}&role=${role}`);
    if (!response.ok) return;
    setBookings(await response.json());
  };

  useEffect(() => {
    const raw = localStorage.getItem("trustlink_user");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setCurrentUser(parsed);
    void loadProviders();
    void loadBookings(parsed.email, parsed.role || "CUSTOMER");
  }, []);

  const logout = () => {
    localStorage.removeItem("trustlink_user");
    window.location.href = "/";
  };

  const verifyProvider = async (providerId: string) => {
    const response = await fetch("/api/providers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, isVerified: true, status: "VERIFIED" }),
    });
    if (response.ok) {
      await loadProviders();
    }
  };

  const releasePayment = async (bookingId: string) => {
    const response = await fetch("/api/bookings/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    if (response.ok && currentUser) {
      await loadBookings(currentUser.email, currentUser.role);
    } else {
      const error = await response.json();
      alert(error.error || "Unable to release payment");
    }
  };

  const uploadAfterPhoto = async (bookingId: string) => {
    const photoUrl = photoByBooking[bookingId];
    if (!photoUrl) {
      alert("Please choose an image first.");
      return;
    }
    const response = await fetch("/api/bookings/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, photoUrl }),
    });
    if (response.ok && currentUser) {
      await loadBookings(currentUser.email, currentUser.role);
    }
  };

  const submitQuote = async (bookingId: string) => {
    if (!currentUser?.email) return;
    const quoteValue = Number(quoteByBooking[bookingId] || "0");
    if (!quoteValue || quoteValue <= 0) {
      alert("Enter a valid quote amount.");
      return;
    }

    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SUBMIT_QUOTE",
        bookingId,
        providerEmail: currentUser.email,
        finalQuote: quoteValue,
        quoteNotes: quoteNotesByBooking[bookingId] || "",
      }),
    });

    if (response.ok && currentUser) {
      await loadBookings(currentUser.email, currentUser.role);
    } else {
      const error = await response.json();
      alert(error.error || "Failed to submit quote");
    }
  };

  const decideQuote = async (bookingId: string, approve: boolean) => {
    if (!currentUser?.email) return;
    const response = await fetch("/api/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "CUSTOMER_DECISION",
        bookingId,
        customerEmail: currentUser.email,
        finalQuote: approve ? 1 : 0,
        quoteNotes: approve ? "APPROVE" : "REJECT",
      }),
    });
    if (response.ok && currentUser) {
      await loadBookings(currentUser.email, currentUser.role);
    } else {
      const error = await response.json();
      alert(error.error || "Failed to update decision");
    }
  };

  const handlePhotoSelection = (bookingId: string, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoByBooking((prev) => ({ ...prev, [bookingId]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) {
    return <div className="min-h-screen bg-slate-50 p-8">Please login to view dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute top-48 -left-24 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl space-y-8"
      >
        {/* Trust Banner */}
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 p-8 text-white shadow-xl shadow-indigo-900/20 border border-white/10"
        >
          <div className="absolute -right-10 -bottom-10 opacity-10">
            <ShieldCheck className="h-64 w-64" />
          </div>
          <p className="text-xs font-black tracking-widest text-indigo-300 uppercase mb-2">Trust Banner</p>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Escrow keeps your money protected</h1>
          <p className="text-indigo-100 max-w-2xl text-lg font-medium">
            Funds stay locked in escrow and are only released after work is done and approved.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/10">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
            <p className="text-xs font-bold text-indigo-50">
              Razorpay test mode: use card <span className="font-mono bg-white/20 px-1 rounded">4111 1111 1111 1111</span>
            </p>
          </div>
        </motion.div>

        {/* Welcome & Actions */}
        <div className="rounded-3xl border border-white bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back, {currentUser.name}</h2>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">Role: {currentUser.role}</p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 md:flex md:flex-wrap gap-4">
            <Link href="/">
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-sm font-bold text-slate-800 transition-colors">
                <Compass className="h-4 w-4" /> Home
              </motion.button>
            </Link>
            <Link href="/map">
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-3 text-sm font-bold text-white shadow-md shadow-slate-900/20 transition-colors">
                <Navigation2 className="h-4 w-4" /> Open Live Map
              </motion.button>
            </Link>
            <Link href="/assistant">
              <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 transition-colors">
                <MessageSquare className="h-4 w-4" /> AI Assistant
              </motion.button>
            </Link>
            {!isProvider && (
              <Link href="/map">
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-colors">
                  <Wrench className="h-4 w-4" /> Find Technicians
                </motion.button>
              </Link>
            )}
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={logout} className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-transparent px-5 py-3 text-sm font-bold text-slate-600 transition-colors">
              <Settings className="h-4 w-4" /> Logout
            </motion.button>
          </div>
          
          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-sm font-medium text-blue-800 flex items-start gap-3">
             <div className="mt-0.5"><ShieldCheck className="h-5 w-5 text-blue-600" /></div>
             <div>
              {isProvider
                ? "Provider flow: wait for inspection bookings, submit quote, upload completion proof, then payment is released by customer."
                : "Customer flow: open map → pick provider → pay inspection hold → approve quote → release payment after completion."}
             </div>
          </div>
        </div>

        {/* Services */}
        <div className="rounded-3xl border border-white bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Services on TrustLink</h3>
          <p className="text-slate-600 mt-1 font-medium">
            Book trusted local professionals for common home and learning needs.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[
              { type: "Plumber", desc: "Leaks, blocked drains, flush repair, fittings.", img: "/images/service_plumber_1777318135946.png" },
              { type: "Electrician", desc: "Switch/socket, fan, MCB trips, wiring issues.", img: "/images/service_electrician_1777318160650.png" },
              { type: "Pest Control", desc: "Cockroach, ants, termite inspection & treatment.", img: "/images/service_pest_control_1777318181274.png" },
              { type: "Home Tutor", desc: "Trial sessions, revision, homework support.", img: "/images/service_tutor_1777318234349.png" },
            ].map((service, i) => (
              <Link href={`/services/${service.type}`} key={service.type}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-2xl border-2 border-slate-100 bg-white hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300"
                >
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={service.img} 
                      alt={service.type} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 relative bg-white">
                    <div className="absolute -top-6 right-5 h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg border-4 border-white transform transition-transform group-hover:scale-110">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <p className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight">{service.type}</p>
                    <p className="text-sm font-medium text-slate-600 mt-1">{service.desc}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trust Score Education */}
        <div className="rounded-3xl border border-white bg-white/80 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">The TrustLink Guarantee</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="font-bold text-emerald-900 mb-1">100% Identity Verified</p>
              <p className="text-sm text-emerald-700">Every provider undergoes strict government ID and background checks before joining.</p>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100">
              <p className="font-bold text-blue-900 mb-1">Escrow Protection</p>
              <p className="text-sm text-blue-700">Your money is held safely in escrow. We only release it when you approve the completed work.</p>
            </div>
            <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="font-bold text-indigo-900 mb-1">Elite Trust Scores</p>
              <p className="text-sm text-indigo-700">Providers are ranked strictly by repeat hires and dispute-free history, not fake 5-star reviews.</p>
            </div>
          </div>
        </div>

        {/* Shop & Install Banner */}
        <div className="rounded-3xl border border-white bg-gradient-to-r from-orange-50 to-rose-50 p-8 shadow-xl shadow-orange-900/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="bg-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">New Feature</span>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Shop & Install Bundle</h3>
              <p className="text-slate-700 mt-2 font-medium max-w-xl">
                Don't want the hassle of buying parts and finding a pro separately? Buy premium fixtures directly from us and get an Elite-rated technician automatically assigned to install it tomorrow!
              </p>
            </div>
            <Link href="/shop">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="whitespace-nowrap rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/30">
                Browse Storefront
              </motion.button>
            </Link>
          </div>
        </div>

        {isAdmin && (
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="text-lg font-bold">Admin Privileges: Provider Verification</h3>
            <p className="mb-4 text-sm text-slate-600">
              As administrator, you can approve providers and unlock booking access.
            </p>
            {pendingProviders.length === 0 ? (
              <p className="text-sm text-slate-500">No pending providers.</p>
            ) : (
              <div className="space-y-3">
                {pendingProviders.map((provider) => (
                  <div key={provider.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-semibold">{provider.user?.name || provider.id}</p>
                      <p className="text-xs text-slate-600">
                        {provider.serviceType} | Gov ID: {provider.governmentId || "Missing"}
                      </p>
                    </div>
                    <button
                      onClick={() => verifyProvider(provider.id)}
                      className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Verify Provider
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="mb-4 text-lg font-bold">Bookings</h3>
          {bookings.length === 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-500">No bookings yet.</p>
              {isProvider ? (
                <p className="text-xs text-slate-600">
                  You are logged in as provider. Bookings appear here when customers book your inspection from the map.
                </p>
              ) : (
                <Link href="/map" className="inline-flex rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
                  Book Your First Inspection
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{booking.serviceType}</p>
                      <p className="text-xs text-slate-600">{formatDate(booking.createdAt)}</p>
                      {booking.address && <p className="text-xs text-slate-500">Address: {booking.address}</p>}
                      {booking.issueDescription && (
                        <p className="text-xs text-slate-500">Issue: {booking.issueDescription}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(booking.fixedPrice)}</p>
                      <p className="text-xs text-slate-600">{booking.status}</p>
                    </div>
                  </div>

                  {booking.completionPhoto && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                      <img src={booking.completionPhoto} alt="After work proof" className="h-14 w-14 rounded-md object-cover" />
                      <p className="text-xs text-slate-600">After photo uploaded by provider</p>
                    </div>
                  )}

                  {booking.bookingType === "INSPECTION" && (
                    <div className="mt-3 rounded-md bg-blue-50 border border-blue-100 p-2 text-xs text-blue-700">
                      Hold: {formatCurrency(booking.holdAmount || booking.fixedPrice)} | Quote:{" "}
                      {booking.finalQuote ? formatCurrency(booking.finalQuote) : "Pending"}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {isProvider && (booking.status === "ESCROW_HELD" || booking.status === "INSPECTION_REQUESTED") && (
                      <>
                        <input
                          type="number"
                          min={1}
                          placeholder="Repair quote"
                          value={quoteByBooking[booking.id] || ""}
                          onChange={(event) =>
                            setQuoteByBooking((prev) => ({ ...prev, [booking.id]: event.target.value }))
                          }
                          className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                        />
                        <input
                          type="text"
                          placeholder="Quote notes"
                          value={quoteNotesByBooking[booking.id] || ""}
                          onChange={(event) =>
                            setQuoteNotesByBooking((prev) => ({ ...prev, [booking.id]: event.target.value }))
                          }
                          className="rounded-lg border px-3 py-2 text-xs font-semibold text-slate-900 bg-white"
                        />
                        <button
                          onClick={() => submitQuote(booking.id)}
                          className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          Submit Quote
                        </button>
                      </>
                    )}

                    {isProvider && booking.status === "QUOTE_APPROVED" && (
                      <>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold">
                          <Upload className="h-3 w-3" />
                          Upload After Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handlePhotoSelection(booking.id, event.target.files?.[0])}
                          />
                        </label>
                        <button
                          onClick={() => uploadAfterPhoto(booking.id)}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
                        >
                          Submit Completion Proof
                        </button>
                      </>
                    )}

                    {isCustomer && booking.status === "QUOTE_SUBMITTED" && (
                      <>
                        <button
                          onClick={() => decideQuote(booking.id, true)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          Approve Quote
                        </button>
                        <button
                          onClick={() => decideQuote(booking.id, false)}
                          className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white"
                        >
                          Reject Quote
                        </button>
                      </>
                    )}

                    {isCustomer && (booking.status === "WORK_COMPLETED" || booking.status === "QUOTE_APPROVED") && (
                      <button
                        onClick={() => releasePayment(booking.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Release Payment
                      </button>
                    )}

                    {booking.status === "RELEASED" && (
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Escrow Released
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
      <Footer />
    </div>
  );
}
