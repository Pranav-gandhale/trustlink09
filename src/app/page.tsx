"use client";

import { Shield, Star, MapPin, CheckCircle2, ChevronRight, Search, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-slate-900">TrustLink</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4" href="#how-it-works">
            How it Works
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4" href="/assistant">
            AI Assistant
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            href="/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-2 items-center">
              <div className="flex flex-col items-center lg:items-start space-y-4 text-center lg:text-left">
                <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900 drop-shadow-sm">
                  Reliable Local Services You Can <span className="text-primary">Actually</span> Trust
                </h1>
                <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl font-medium">
                  No more fake reviews. TrustLink uses a proprietary Trust Score algorithm to connect you with verified local professionals.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <form className="flex space-x-2" onSubmit={handleSearch}>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 text-slate-900 shadow-sm"
                      placeholder="What service do you need?"
                      type="text"
                    />
                  </div>
                  <button type="submit" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90">
                    Find Help
                  </button>
                </form>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-4 relative">
                <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-[3rem] -z-10" />
                {[
                  { title: "Plumber", img: "/images/service_plumber_1777318135946.png", delay: 0 },
                  { title: "Electrician", img: "/images/service_electrician_1777318160650.png", delay: 0.1 },
                  { title: "Pest Control", img: "/images/service_pest_control_1777318181274.png", delay: 0.2 },
                  { title: "Home Tutor", img: "/images/service_tutor_1777318234349.png", delay: 0.3 }
                ].map((service, i) => (
                  <motion.div 
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: service.delay, duration: 0.5 }}
                    className={`relative overflow-hidden rounded-3xl border-2 border-white bg-white shadow-xl group ${i % 2 === 1 ? 'mt-8' : ''}`}
                  >
                    <img 
                      src={service.img} 
                      alt={service.title} 
                      className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex items-end p-5">
                      <p className="text-white font-black text-lg tracking-tight">{service.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-slate-950 transition-colors">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Verified Identity</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Every provider undergoes strict KYC and background checks.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-accent">
                  <Star className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Trust Score</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Dynamic scoring based on performance, repeat hires, and dispute history.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hyper-Local</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Real-time mapping helps you find providers right in your neighborhood.</p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center">
                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Fixed Tasks</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Choose common tasks like “Kitchen Sink Leak Fix” with upfront pricing.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}