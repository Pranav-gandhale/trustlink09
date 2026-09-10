"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingBag, Star, ShieldCheck, ChevronLeft, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/Footer";

import { PRODUCTS } from "@/lib/shop-data";

export default function ShopPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100/50 to-transparent -z-10" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl -z-10" />

      <header className="h-16 border-b border-white/50 bg-white/80 backdrop-blur-md flex items-center px-6 sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-orange-600" />
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Shop & Install</h1>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">The Ultimate Convenience</span>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Buy the product, we'll handle the rest.</h2>
          <p className="text-lg text-slate-600 font-medium">
            Purchase premium fixtures at great prices. We will automatically dispatch an Elite-rated technician to your home to install it perfectly.
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product, i) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ y: -5 }}
              className="group flex flex-col overflow-hidden rounded-3xl border-2 border-white bg-white/80 backdrop-blur-md hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-900/10 transition-all duration-300"
            >
              <div className="h-56 w-full overflow-hidden bg-white p-4">
                <img 
                  src={product.img} 
                  alt={product.name} 
                  className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-400 ml-1">(4.9)</span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight mb-2">{product.name}</h3>
                <p className="text-sm font-medium text-slate-500 mb-4 flex-1">{product.description}</p>
                
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 mb-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Product Price</span>
                    <span className="font-bold text-slate-900">{formatCurrency(product.productPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Installation Fee</span>
                    <span className="font-bold text-slate-900">{formatCurrency(product.installPrice)}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-700 text-xs uppercase tracking-wide">Total Combo</span>
                    <span className="font-black text-orange-600 text-lg">{formatCurrency(product.productPrice + product.installPrice)}</span>
                  </div>
                </div>

                <button 
                  className="w-full rounded-xl bg-slate-900 hover:bg-orange-600 px-4 py-3 text-sm font-black text-white shadow-md transition-colors flex items-center justify-center gap-2"
                  onClick={() => router.push(`/shop/checkout/${product.id}`)}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Buy & Install Bundle
                </button>
              </div>
              <div className="bg-emerald-50 px-4 py-2 border-t border-emerald-100 flex items-center justify-center gap-2">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Installed by Elite Provider</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
