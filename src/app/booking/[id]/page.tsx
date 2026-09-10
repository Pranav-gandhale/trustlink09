"use client";

import { useState, useEffect } from "react";
import { 
  Shield, Calendar, Clock, CreditCard, 
  CheckCircle, ArrowRight, ChevronLeft,
  Lock, Info, AlertCircle, Loader2, MapPin, Wrench
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { getTaskCatalog } from "@/lib/task-catalog";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [bookingId, setBookingId] = useState("");
  const [selectedTaskCode, setSelectedTaskCode] = useState("");

  useEffect(() => {
    const userJson = localStorage.getItem("trustlink_user");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }

    const fetchProvider = async () => {
      try {
        const response = await fetch("/api/providers");
        if (response.ok) {
          const providers = await response.json();
          const p = providers.find((p: any) => p.id === params.id);
          setProvider(p);
        }
      } catch (err) {
        console.error("Failed to fetch provider:", err);
      }
    };

    fetchProvider();
  }, [params.id]);

  if (!provider) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-slate-600 font-bold">Loading provider details...</p>
      </div>
    </div>
  );

  const tasks = getTaskCatalog(provider.serviceType || "");
  const selectedTask = tasks.find((task) => task.code === selectedTaskCode) || null;

  const inspectionFee = Number(selectedTask?.fixedPrice || provider.price || 0);
  const platformFee = 29;
  const holdAmount = inspectionFee + platformFee;

  const handlePayment = async () => {
    if (!currentUser) {
      alert("Please login to book a service");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create Booking & Razorpay Order
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: provider.id,
          customerEmail: currentUser.email,
          serviceType: provider.serviceType,
          taskCode: selectedTask?.code || null,
          taskTitle: selectedTask?.title || null,
          bookingType: "INSPECTION",
          inspectionFee,
          issueDescription,
          address,
          amount: holdAmount,
          date,
          time
        }),
      });

      const bookingData = await bookingResponse.json();

      if (bookingData.error) {
        throw new Error(bookingData.error);
      }
      setBookingId(bookingData.bookingId);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: bookingData.amount,
        currency: bookingData.currency,
        name: "TrustLink Escrow",
        description: `Booking for ${provider.user?.name}`,
        order_id: bookingData.orderId,
        handler: async function (response: any) {
          console.log("Payment Success:", response);
          
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingData.bookingId
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setIsLoading(false);
              setStep(3);
            } else {
              alert("Payment verification failed. Please contact support.");
              setIsLoading(false);
            }
          } catch (err) {
            console.error("Verification error:", err);
            setIsLoading(false);
          }
        },
        prefill: {
          name: currentUser?.name || "User",
          email: currentUser?.email || "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Something went wrong with the payment. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <header className="h-16 border-b bg-white flex items-center px-6 sticky top-0 z-10">
        <Link href="/dashboard" className="p-2 -ml-2 text-gray-400 hover:text-gray-600">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div className="ml-4">
          <h1 className="text-lg font-bold text-slate-900">Book {provider.user?.name}</h1>
          <p className="text-xs text-slate-600">{provider.serviceType}</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-slate-200"
          )} />
          <div className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-slate-200"
          )} />
          <div className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step >= 3 ? "bg-primary" : "bg-slate-200"
          )} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <div className="bg-white border rounded-xl p-6 shadow-sm space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                  <Calendar className="h-5 w-5 text-primary" />
                    Schedule inspection visit
                </h2>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Home Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Flat/House no, area, city"
                      className="w-full border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Task (Fixed price)</label>
                  <select
                    value={selectedTaskCode}
                    onChange={(event) => setSelectedTaskCode(event.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                  >
                    <option value="">General inspection (provider base fee)</option>
                    {tasks.map((task) => (
                      <option key={task.code} value={task.code}>
                        {task.title} - {formatCurrency(task.fixedPrice)}
                      </option>
                    ))}
                  </select>
                  {selectedTask && (
                    <p className="text-xs text-slate-600">{selectedTask.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800">Problem description</label>
                  <div className="relative">
                    <Wrench className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows={3}
                      placeholder="Explain the issue for technician inspection"
                      className="w-full border border-slate-200 rounded-lg py-3 pl-10 pr-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Date</label>
                    <input 
                      type="date" 
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Start Time</label>
                    <input 
                      type="time" 
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none bg-slate-50"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  disabled={!date || !time || !address || !issueDescription}
                  onClick={() => setStep(2)}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue to Escrow Hold
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                    <Lock className="h-5 w-5 text-primary" />
                    Secure Escrow Payment
                  </h2>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    This is an inspection hold. Technician visits, inspects, and submits repair quote for your approval.
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-bold">
                  Razorpay test mode: use card number 4111 1111 1111 1111 for demo success.
                </p>

                <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
                  <p className="text-sm text-slate-700 font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    Payment happens in Razorpay checkout after you tap the button below.
                  </p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handlePayment}
                  disabled={isLoading || !provider?.isVerified}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>Pay {formatCurrency(holdAmount)} into Escrow Hold</>
                    )}
                  </button>
                  {!provider?.isVerified && (
                    <p className="text-center text-xs text-amber-700 mt-3 font-bold">
                      Booking is disabled until provider verification is complete.
                    </p>
                  )}
                  <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3" />
                    Payment secured by TrustLink Escrow Protection
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white border rounded-xl p-8 shadow-sm text-center space-y-6">
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                  <p className="text-gray-500">
                    Your inspection hold of {formatCurrency(holdAmount)} is safely in escrow.
                  </p>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Booking ID:</span>
                  <span className="font-bold text-slate-900">{bookingId || "Generated"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Date:</span>
                  <span className="font-bold text-slate-900">{date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Time:</span>
                  <span className="font-bold text-slate-900">{time}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Next: provider visits your home, inspects issue, then submits a final quote on dashboard.
                </p>
                <Link 
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Return to Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4 text-slate-900">Price Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Inspection fee</span>
                  <span className="font-bold text-slate-900">{formatCurrency(inspectionFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Platform fee</span>
                  <span className="font-bold text-slate-900">{formatCurrency(platformFee)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between text-lg font-bold">
                  <span className="text-slate-900">Escrow hold</span>
                  <span className="text-primary">{formatCurrency(holdAmount)}</span>
                </div>
              </div>
              <div className="mt-6 flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700">
                  TrustLink protection: If the provider doesn't show up or the work is subpar, you can file a dispute before releasing funds.
                </p>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">About Provider</h3>
              <div className="flex items-center gap-3">
                <img src={`https://i.pravatar.cc/150?u=${provider.id}`} className="h-10 w-10 rounded-full" alt="" />
                <div>
                  <p className="text-sm font-bold">{provider.user?.name || "Provider"}</p>
                  <p className="text-xs text-gray-500">Verified Professional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}