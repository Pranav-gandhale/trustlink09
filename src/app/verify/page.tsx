"use client";

import { useState } from "react";
import { 
  Shield, Upload, FileText, CheckCircle, 
  ChevronRight, ArrowRight, Loader2, Camera,
  Fingerprint, Award, Building2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function VerificationPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState({
    idFront: false,
    idBack: false,
    license: false,
    business: false
  });
  const router = useRouter();

  const simulateUpload = (field: keyof typeof files) => {
    setIsLoading(true);
    setTimeout(() => {
      setFiles(prev => ({ ...prev, [field]: true }));
      setIsLoading(false);
    }, 800);
  };

  const handleNext = async () => {
    if (step === 1 && (!files.idFront || !files.idBack)) {
      alert("Please upload both sides of your ID");
      return;
    }
    if (step === 2 && !files.license) {
      alert("Please upload your professional license");
      return;
    }

    setIsLoading(true);
    
    if (step === 3) {
      try {
        const userJson = localStorage.getItem("trustlink_user");
        if (userJson) {
          const user = JSON.parse(userJson);
          
          // Get provider ID from API or user object
          const res = await fetch(`/api/providers?email=${user.email}`);
          const providers = await res.json();
          const provider = providers.find((p: any) => p.user.email === user.email);
          
          if (provider) {
            const response = await fetch("/api/providers", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                providerId: provider.id,
                status: "PENDING_REVIEW",
                governmentId: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=200&auto=format&fit=crop",
                businessLicense: "https://images.unsplash.com/photo-1554224155-169641357599?q=80&w=200&auto=format&fit=crop"
              }),
            });
            
            if (response.ok) {
              setIsLoading(false);
              setStep(step + 1);
              alert("Verification documents submitted! An admin will review them shortly.");
              router.push("/dashboard");
              return;
            }
          }
        }
      } catch (err) {
        console.error("Verification submission failed:", err);
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      setStep(step + 1);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">TrustLink</span>
        </Link>
        <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
          <span className={cn(step === 1 ? "font-bold text-primary" : "text-slate-600")}>Identity</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className={cn(step === 2 ? "font-bold text-primary" : "text-slate-600")}>Skills</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className={cn(step === 3 ? "font-bold text-primary" : "text-slate-600")}>Background</span>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full py-12">
        <div className="bg-white border rounded-2xl p-8 shadow-sm">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Identity Verification</h2>
                <p className="text-slate-600 font-medium">Please upload a valid government-issued ID.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  onClick={() => simulateUpload("idFront")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl transition-all group",
                    files.idFront ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                    files.idFront ? "bg-green-100" : "bg-slate-100 group-hover:bg-primary/10"
                  )}>
                    {files.idFront ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Camera className="h-6 w-6 text-slate-500 group-hover:text-primary" />}
                  </div>
                  <span className={cn("text-sm font-bold", files.idFront ? "text-green-700" : "text-slate-700")}>
                    {files.idFront ? "Front Uploaded" : "Front of ID"}
                  </span>
                </button>
                <button 
                  onClick={() => simulateUpload("idBack")}
                  className={cn(
                    "flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-xl transition-all group",
                    files.idBack ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center transition-colors",
                    files.idBack ? "bg-green-100" : "bg-slate-100 group-hover:bg-primary/10"
                  )}>
                    {files.idBack ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Camera className="h-6 w-6 text-slate-500 group-hover:text-primary" />}
                  </div>
                  <span className={cn("text-sm font-bold", files.idBack ? "text-green-700" : "text-slate-700")}>
                    {files.idBack ? "Back Uploaded" : "Back of ID"}
                  </span>
                </button>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to Skills"}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Skill Certification</h2>
                <p className="text-gray-500">Upload your professional licenses and certifications.</p>
              </div>

              <div className="space-y-4">
                <div 
                  onClick={() => simulateUpload("license")}
                  className={cn(
                    "p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors",
                    files.license ? "border-green-500 bg-green-50" : "hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    files.license ? "bg-green-100" : "bg-slate-100"
                  )}>
                    {files.license ? <CheckCircle className="h-5 w-5 text-green-600" /> : <FileText className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold", files.license ? "text-green-700" : "text-slate-900")}>Professional License</p>
                    <p className="text-xs text-gray-500">{files.license ? "File uploaded successfully" : "PDF, JPG or PNG (Max 5MB)"}</p>
                  </div>
                  {!files.license && <Upload className="h-4 w-4 text-gray-400" />}
                </div>
                <div 
                  onClick={() => simulateUpload("business")}
                  className={cn(
                    "p-4 border rounded-xl flex items-center gap-4 cursor-pointer transition-colors",
                    files.business ? "border-green-500 bg-green-50" : "hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    files.business ? "bg-green-100" : "bg-slate-100"
                  )}>
                    {files.business ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Building2 className="h-5 w-5 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-bold", files.business ? "text-green-700" : "text-slate-900")}>Business Registration</p>
                    <p className="text-xs text-gray-500">{files.business ? "File uploaded successfully" : "Optional for freelancers"}</p>
                  </div>
                  {!files.business && <Upload className="h-4 w-4 text-gray-400" />}
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue to Background"}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Background Check</h2>
                <p className="text-gray-500">Confirm your consent for a standard background check.</p>
              </div>

              <div className="p-6 bg-slate-50 border rounded-xl space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" id="consent" />
                  </div>
                  <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                    I authorize TrustLink to conduct a background check and verify my identity through third-party services. I understand this is required to maintain a high Trust Score.
                  </label>
                </div>
                <div className="flex gap-3">
                  <div className="mt-1">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" id="terms" />
                  </div>
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the Provider Terms of Service and Professional Conduct Guidelines.
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleNext}
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit for Verification"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}