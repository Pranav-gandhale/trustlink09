"use client";

import { useState, useEffect } from "react";
import { calculateTrustScore } from "./trust-score";

export interface Provider {
  id: number;
  name: string;
  service: string;
  specialization?: string; // New: Specific subject or service detail
  experience: number;
  price: number;
  distance: string;
  image: string;
  recentFeedback: string;
  metrics: {
    isIdentityVerified: boolean;
    isBackgroundChecked: boolean;
    hasCertifications: boolean;
    totalHires: number;
    repeatHireCount: number;
    disputeResolutionRate: number;
    averageRating: number;
    responseTimeMinutes: number;
    yearsExperience: number;
  };
}

export interface Booking {
  id: string;
  providerId: number;
  providerName: string;
  date: string;
  time: string;
  hours: number;
  amount: number;
  status: "Escrow" | "Completed" | "Disputed";
  timestamp: number;
}

export interface UserAccount {
  email: string;
  password?: string; // In a real app, this would be hashed
  name: string;
  type: "user" | "provider";
}

const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: "Arjun Sharma",
    service: "Plumber",
    experience: 8,
    metrics: {
      isIdentityVerified: true,
      isBackgroundChecked: true,
      hasCertifications: true,
      totalHires: 124,
      repeatHireCount: 45,
      disputeResolutionRate: 0.98,
      averageRating: 4.9,
      responseTimeMinutes: 15,
      yearsExperience: 8,
    },
    price: 450,
    distance: "1.2 km away",
    image: "https://i.pravatar.cc/150?u=male_arjun",
    recentFeedback: "Arjun was very professional and fixed the leak quickly.",
  },
  {
    id: 2,
    name: "Pranav Patil",
    service: "Electrician",
    experience: 12,
    metrics: {
      isIdentityVerified: true,
      isBackgroundChecked: true,
      hasCertifications: true,
      totalHires: 89,
      repeatHireCount: 22,
      disputeResolutionRate: 1.0,
      averageRating: 4.8,
      responseTimeMinutes: 25,
      yearsExperience: 12,
    },
    price: 600,
    distance: "2.5 km away",
    image: "https://i.pravatar.cc/150?u=male_pranav",
    recentFeedback: "Pranav did a great job installing the new light fixtures.",
  },
  {
    id: 3,
    name: "Rohan Gupta",
    service: "Math Tutor",
    experience: 5,
    metrics: {
      isIdentityVerified: true,
      isBackgroundChecked: false,
      hasCertifications: true,
      totalHires: 45,
      repeatHireCount: 30,
      disputeResolutionRate: 0.95,
      averageRating: 4.7,
      responseTimeMinutes: 45,
      yearsExperience: 5,
    },
    price: 350,
    distance: "0.8 km away",
    image: "https://i.pravatar.cc/150?u=male_rohan",
    recentFeedback: "Rohan is an excellent tutor, my son's grades improved.",
  },
];

export function getProviders(): Provider[] {
  if (typeof window === "undefined") return DEFAULT_PROVIDERS;
  const saved = localStorage.getItem("trustlink_providers");
  if (!saved) return DEFAULT_PROVIDERS;
  try {
    const parsed = JSON.parse(saved);
    return [...DEFAULT_PROVIDERS, ...parsed];
  } catch {
    return DEFAULT_PROVIDERS;
  }
}

export function saveProvider(provider: Omit<Provider, "id" | "distance" | "metrics">) {
  const newProvider: Provider = {
    ...provider,
    id: Date.now(),
    distance: "Near you",
    image: provider.image || `https://i.pravatar.cc/150?u=${provider.name}`,
    metrics: {
      isIdentityVerified: true, // Verification is done during registration
      isBackgroundChecked: false, // New providers haven't been checked yet
      hasCertifications: false, // New providers haven't been verified yet
      totalHires: 0, // Starts at zero baseline
      repeatHireCount: 0,
      disputeResolutionRate: 1.0, // Clean slate
      averageRating: 0, // No ratings yet
      responseTimeMinutes: 60, // Slower starting response time baseline
      yearsExperience: provider.experience,
    }
  };
  const current = getProviders().filter(p => !DEFAULT_PROVIDERS.find(dp => dp.id === p.id));
  localStorage.setItem("trustlink_providers", JSON.stringify([...current, newProvider]));
}

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("trustlink_bookings");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function addBooking(booking: Omit<Booking, "timestamp" | "status">) {
  const newBooking: Booking = {
    ...booking,
    status: "Escrow",
    timestamp: Date.now(),
  };
  const current = getBookings();
  localStorage.setItem("trustlink_bookings", JSON.stringify([newBooking, ...current]));
}

export function getUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("trustlink_accounts");
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveUserAccount(user: UserAccount) {
  const current = getUsers();
  // Check if user already exists
  const existingIndex = current.findIndex(u => u.email === user.email);
  if (existingIndex > -1) {
    current[existingIndex] = user;
  } else {
    current.push(user);
  }
  localStorage.setItem("trustlink_accounts", JSON.stringify(current));
}