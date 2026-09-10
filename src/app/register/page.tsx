"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Mail, Lock, User, Briefcase, Loader2, Camera, RefreshCw, Check, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { saveProvider, saveUserAccount } from "@/lib/data";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [accountType, setAccountType] = useState<"user" | "provider" | "admin">("user");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [service, setService] = useState("plumber");
  const [experience, setExperience] = useState("2");
  const [price, setPrice] = useState("450");
  const [specialization, setSpecialization] = useState(""); // For Tutors
  const [governmentId, setGovernmentId] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("Could not access camera. Please ensure you've given permission.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(dataUrl);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setIsCameraActive(false);
      }
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    startCamera();
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError("");

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;

      if (accountType === "provider" && "geolocation" in navigator) {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              latitude = pos.coords.latitude;
              longitude = pos.coords.longitude;
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 5000 }
          );
        });
      }

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: `${firstName} ${lastName}`,
          type: accountType,
          service,
          experience,
          price,
          photo,
          governmentId,
          latitude,
          longitude
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      const userData = await response.json();

      // Set current session
      localStorage.setItem("trustlink_user", JSON.stringify({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        providerId: userData.providerId || null,
        photo: photo // Store photo in session
      }));

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Registration failed:", error);
      setIsLoading(false);
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">TrustLink</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Create an account</h1>
          <p className="text-sm text-slate-600 font-medium">
            Join the community of verified professionals and users
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="flex p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setAccountType("user")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
              accountType === "user" ? "bg-white shadow text-primary" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <User className="h-4 w-4" />
            I need help
          </button>
          <button
            type="button"
            onClick={() => setAccountType("provider")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
              accountType === "provider" ? "bg-white shadow text-primary" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Briefcase className="h-4 w-4" />
            I provide services
          </button>
          <button
            type="button"
            onClick={() => setAccountType("admin")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-md transition-all",
              accountType === "admin" ? "bg-white shadow text-primary" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Shield className="h-4 w-4" />
            Admin
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-10 py-2 text-sm text-slate-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {accountType === "provider" && (
            <div className="space-y-4 py-4 border-y border-slate-100 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-bold text-slate-800 leading-none">
                Profile Photo (Required for Providers)
              </label>
              
              <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden shadow-inner group">
                {photo ? (
                  <div className="relative w-full h-full">
                    <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={retakePhoto}
                        className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/40 transition-all"
                      >
                        <RefreshCw className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <Check className="h-4 w-4" />
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover mirror"
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                      <button 
                        type="button"
                        onClick={capturePhoto}
                        className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all border-4 border-slate-200"
                      >
                        <div className="h-10 w-10 bg-primary rounded-full" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                    <div className="p-4 bg-slate-800 rounded-full">
                      <Camera className="h-8 w-8" />
                    </div>
                    <button 
                      type="button"
                      onClick={startCamera}
                      className="text-sm font-bold bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90 transition-all shadow-md"
                    >
                      Turn on Camera
                    </button>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Device camera required</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
          )}

          {accountType === "provider" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="governmentId">
                  Government ID (required for verification)
                </label>
                <input
                  id="governmentId"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  placeholder="ID number or document URL"
                  required
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="service">
                  Service Category
                </label>
                <select
                  id="service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                >
                  <option value="plumber">Plumber</option>
                  <option value="electrician">Electrician</option>
                  <option value="pest-control">Pest Control</option>
                  <option value="home-tutor">Home Tutor</option>
                </select>
              </div>
              
              {service === "home-tutor" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="specialization">
                    What will you teach? (Subjects, Grade level)
                  </label>
                  <input
                    id="specialization"
                    placeholder="e.g., Class 10th Math & Physics"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="experience">
                    Experience (Years)
                  </label>
                  <input
                    id="experience"
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-800 leading-none" htmlFor="price">
                    Price per Hour (₹)
                  </label>
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="px-8 text-center text-sm text-gray-500">
          <Link href="/login" className="hover:text-primary underline underline-offset-4">
            Already have an account? Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}