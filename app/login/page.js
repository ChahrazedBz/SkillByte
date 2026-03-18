"use client";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      
      // ← get profile to check role THEN redirect
      const profile = await api.get("/profile/");
      if (profile.data.role === "instructor") {
        router.push("/dashboard/instructor");
      } else {
        router.push("/");
      }
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-white">
            Skill<span className="text-cyan-400">Byte</span>
          </Link>
          <p className="text-slate-400 mt-2">Welcome back! Sign in to continue</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password" required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-600 font-semibold hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}