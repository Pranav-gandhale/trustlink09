"use client";

import { useState, useEffect } from "react";
import { Shield, CreditCard, CheckCircle, ArrowRight, ChevronLeft, MapPin, Loader2, Star, Clock, Calendar, Truck } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import Script from "next/script";
import { PRODUCTS } from "@/lib/shop-data";
import { Footer } from "@/components/Footer";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  
  const product = PRODUCTS.find(p => p.id === productId);
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    const userJson = localStorage.getItem("trustlink_user");
    if (userJson) {
      setCurrentUser(JSON.parse(userJson));
    }
  }, []);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-600 font-bold">Product not found.</p>
    </div>
  );

  const totalAmount = product.productPrice + product.installPrice;

  const handlePayment = async () => {
    if (!currentUser) {
      alert("Please login to purchase");
      router.push("/login");
      return;
    }

    setIsLoading(true);
    
    try {
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: "AUTO",
          customerEmail: currentUser.email,
          serviceType: product.category,
          taskTitle: `Install ${product.name}`,
          bookingType: "BUNDLE",
          inspectionFee: 0,
          issueDescription: "E-commerce Bundle Purchase",
          address,
          amount: totalAmount,
          date,
          time
        }),
      });

      const bookingData = await bookingResponse.json();

      if (bookingData.error) {
        throw new Error(bookingData.error);
      }
      setBookingId(bookingData.bookingId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: bookingData.amount,
        currency: bookingData.currency,
        name: "TrustLink Store",
        description: `Bundle: ${product.name}`,
        order_id: bookingData.orderId,
        handler: async function (response: any) {
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
              alert("Payment verification failed.");
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
          color: "#ea580c",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/30 to-transparent -z-10" />

      <header className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="ml-4">
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Checkout</h1>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex items-center justify-center gap-4">
          <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 1 ? "bg-orange-500" : "bg-slate-200")} />
          <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 2 ? "bg-orange-500" : "bg-slate-200")} />
          <div className={cn("h-2 w-16 rounded-full transition-colors", step >= 3 ? "bg-orange-500" : "bg-slate-200")} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {step === 1 && (
              <div className="bg-white border-2 border-white rounded-3xl p-8 shadow-xl shadow-slate-200/50">
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900 tracking-tight mb-6">
                  <MapPin className="h-6 w-6 text-orange-600" />
                  Delivery & Installation Details
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-800">Delivery Address</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Flat/House no, area, city"
                        className="w-full border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Date
                      </label>
                      <input 
                        type="date" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-800 flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Start Time
                      </label>
                      <input 
                        type="time" 
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500/20 outline-none bg-slate-50"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 bg-orange-50 p-4 rounded-xl border border-orange-100 flex gap-3">
                  <Truck className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800 font-medium">
                    The product will be shipped directly to your address. The Elite provider will arrive on the scheduled date to install it.
                  </p>
                </div>

                <button 
                  disabled={!date || !time || !address}
                  onClick={() => setStep(2)}
                  className="w-full mt-8 bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Proceed to Payment
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white border-2 border-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <h2 className="text-2xl font-black flex items-center gap-2 text-slate-900 tracking-tight">
                  <Shield className="h-6 w-6 text-orange-600" />
                  Secure Payment
                </h2>
                
                <p className="text-xs text-slate-500 font-bold bg-slate-100 p-2 rounded">
                  Razorpay test mode: use card number 4111 1111 1111 1111
                </p>

                <div className="pt-4">
                  <button 
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>Pay {formatCurrency(totalAmount)} securely</>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1 font-medium">
                    <Shield className="h-3 w-3" />
                    Payments processed by Razorpay Escrow
                  </p>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white border-2 border-emerald-100 rounded-3xl p-10 shadow-xl shadow-emerald-900/10 text-center space-y-6">
                <div className="h-24 w-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Order Confirmed!</h2>
                  <p className="text-slate-600 font-medium">
                    Your {product.name} will be delivered and installed on {date}.
                  </p>
                </div>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3 mx-auto max-w-sm">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Order ID:</span>
                    <span className="font-bold text-slate-900">{bookingId || "Generated"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Assigned Pro:</span>
                    <span className="font-bold text-emerald-600">Auto-assigned Elite {product.category}</span>
                  </div>
                </div>

                <Link 
                  href="/dashboard"
                  className="inline-flex w-full max-w-sm items-center justify-center bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-colors mt-4"
                >
                  Return to Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white border-2 border-white rounded-3xl p-6 shadow-xl shadow-slate-200/50">
              <div className="h-40 w-full overflow-hidden bg-white p-2 rounded-xl border border-slate-100 mb-4">
                <img src={product.img} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
              </div>
              <h3 className="font-black text-lg mb-1 text-slate-900 tracking-tight">{product.name}</h3>
              <p className="text-xs text-slate-500 font-medium mb-6">{product.description}</p>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Product Cost</span>
                  <span className="font-bold text-slate-900">{formatCurrency(product.productPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Installation Fee</span>
                  <span className="font-bold text-slate-900">{formatCurrency(product.installPrice)}</span>
                </div>
                <div className="pt-4 mt-2 border-t border-slate-200 flex justify-between text-lg font-black">
                  <span className="text-slate-900">Total Combo</span>
                  <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
