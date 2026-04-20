"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { forgotPassword, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-scale-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mt-2">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <Link href="/login" className="inline-block mt-6 text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your email to receive a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" isLoading={loading} className="w-full">
          Send reset link
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
