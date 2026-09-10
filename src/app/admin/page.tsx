"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ShieldAlert, ShieldCheck, CheckCircle, XCircle, Search, Clock, FileText, User, MapPin } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [pendingProviders, setPendingProviders] = useState<any[]>([]);
  const [verifiedProviders, setVerifiedProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("trustlink_user");
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user.role !== "ADMIN") {
        router.push("/dashboard");
      } else {
        setCurrentUser(user);
        fetchProviders(user.email);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const fetchProviders = async (email: string) => {
    try {
      const res = await fetch(`/api/admin/providers?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.pending) {
        setPendingProviders(data.pending);
        setVerifiedProviders(data.verified || []);
      }
    } catch (err) {
      console.error("Error fetching providers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (providerId: string, action: "APPROVE" | "REJECT") => {
    if (!currentUser) return;
    
    // Optimistic UI update or simple loading state
    setActionLoading(providerId);

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          providerId,
          action
        })
      });

      const data = await res.json();
      if (data.success) {
        // Remove from pending
        const verified = pendingProviders.find(p => p.id === providerId);
        setPendingProviders(prev => prev.filter(p => p.id !== providerId));
        
        if (action === "APPROVE" && verified) {
          setVerifiedProviders(prev => [verified, ...prev]);
        }
      } else {
        alert(data.error || "Failed to perform action");
      }
    } catch (err) {
      console.error("Action error:", err);
      alert("Something went wrong");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin text-primary">
          <Shield className="h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 border-b bg-slate-900 text-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-6 w-6 text-orange-500" />
          <h1 className="text-lg font-black tracking-tight">TrustLink Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full">
            {currentUser?.email}
          </span>
          <Link href="/dashboard" className="text-sm font-bold hover:text-orange-400 transition-colors">
            Exit Admin
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-bold mb-1">Pending KYC Reviews</p>
              <h3 className="text-3xl font-black text-slate-900">{pendingProviders.length}</h3>
            </div>
            <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-bold mb-1">Verified Platform Providers</p>
              <h3 className="text-3xl font-black text-slate-900">{verifiedProviders.length}</h3>
            </div>
            <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Pending Reviews Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              KYC Verification Queue
            </h2>
          </div>

          {pendingProviders.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <ShieldCheck className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900">Queue is empty</h3>
              <p className="text-slate-500 font-medium mt-2">All providers have been verified!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingProviders.map(provider => (
                <div key={provider.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 flex flex-col">
                  {/* Header */}
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-white/10 rounded-full border-2 border-white/20 overflow-hidden shrink-0">
                        {provider.user.photo ? (
                          <img src={provider.user.photo} alt="Face" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-8 w-8 m-auto mt-3 text-white/50" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-black">{provider.user.name}</h3>
                        <p className="text-sm font-medium text-slate-400 capitalize bg-white/10 inline-block px-2 py-0.5 rounded mt-1">
                          {provider.serviceType.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rate</p>
                      <p className="font-black text-lg">{formatCurrency(provider.price)}/hr</p>
                    </div>
                  </div>

                  {/* Body - Verification Info */}
                  <div className="p-6 space-y-6 flex-1">
                    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex gap-4 items-start">
                      <div className="bg-orange-200 text-orange-700 p-2 rounded-xl shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Aadhaar / Government ID</p>
                        <p className="font-black text-slate-900 text-lg tracking-widest font-mono">
                          {provider.governmentId || "NOT PROVIDED"}
                        </p>
                        <p className="text-xs text-orange-700 mt-2 font-medium">
                          Check if the photo above matches the official records for this Aadhaar Number.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="border border-slate-100 p-3 rounded-xl">
                        <span className="text-slate-500 font-medium block">Experience</span>
                        <span className="font-bold text-slate-900">{provider.experience} Years</span>
                      </div>
                      <div className="border border-slate-100 p-3 rounded-xl">
                        <span className="text-slate-500 font-medium block">Email</span>
                        <span className="font-bold text-slate-900 truncate block">{provider.user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                      onClick={() => handleAction(provider.id, "REJECT")}
                      disabled={actionLoading === provider.id}
                      className="flex-1 py-3 bg-white border-2 border-rose-200 text-rose-600 font-black rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="h-5 w-5" />
                      Reject Fake
                    </button>
                    <button
                      onClick={() => handleAction(provider.id, "APPROVE")}
                      disabled={actionLoading === provider.id}
                      className="flex-1 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Verify & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
