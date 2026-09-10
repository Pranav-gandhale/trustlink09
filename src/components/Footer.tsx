import Link from "next/link";
import { Twitter, Facebook, Instagram, Linkedin, Apple, Play } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#f3f4f6] pt-16 pb-8 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          
          {/* Company */}
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-6">Company</h3>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><Link href="#" className="hover:text-primary transition-colors">About us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Investor Relations</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms & conditions</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Anti-discrimination policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-6">For customers</h3>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><Link href="#" className="hover:text-primary transition-colors">UC reviews</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Categories near you</Link></li>
              <li>
                <a href="mailto:trustlinksupport@gmail.com" className="hover:text-primary transition-colors">
                  Contact us
                </a>
                <p className="text-xs text-slate-400 mt-1">trustlinksupport@gmail.com</p>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-6">For professionals</h3>
            <ul className="space-y-4 text-sm font-medium text-slate-600">
              <li><Link href="/login" className="hover:text-primary transition-colors">Register as a professional</Link></li>
            </ul>
          </div>

          {/* Social Links & Apps */}
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-6">Social links</h3>
            <div className="flex gap-4 mb-8">
              <Link href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-primary hover:border-primary transition-all">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>

            <div className="space-y-3">
              <button className="w-48 h-12 bg-black text-white rounded-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors">
                <Apple className="h-6 w-6 fill-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none mb-1 text-slate-300">Download on the</p>
                  <p className="text-sm font-bold leading-none">App Store</p>
                </div>
              </button>
              <button className="w-48 h-12 bg-black text-white rounded-lg flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors">
                <Play className="h-5 w-5 fill-white" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none mb-1 text-slate-300">Get it on</p>
                  <p className="text-sm font-bold leading-none">Google Play</p>
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-500 font-medium">
          <p className="mb-1">* As on December 31, 2024</p>
          <p>© Copyright 2026 TrustLink Technologies India Limited. All rights reserved. | CIN: L74140DL2014PLC274413</p>
        </div>
      </div>
    </footer>
  );
}
