"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "",
    email: "", password: "", role: "student"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/api/register/", form);
      Cookies.set("access_token", res.data.access, { expires: 1 });
      Cookies.set("refresh_token", res.data.refresh, { expires: 7 });
      toast.success("Account created! Welcome to SkillByte 🎉");
      if (form.role === "instructor") {
        router.push("/dashboard/instructor");
      } else {
        router.push("/");
      }
    } catch (err) {
      const msg = err.response?.data?.email?.[0] || err.response?.data?.detail || "Registration failed";
      toast.error(msg);
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
          <p className="text-slate-400 mt-2">Create your account and start learning</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <input type="text" required value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <input type="text" required value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input type="password" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">I want to join as</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setForm({ ...form, role: "student" })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    form.role === "student"
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                  <div className="text-2xl mb-1">🎓</div>
                  <div className={`font-bold text-sm ${form.role === "student" ? "text-cyan-700" : "text-slate-700"}`}>Student</div>
                  <div className="text-xs text-slate-400 mt-1">Learn new skills</div>
                </button>
                <button type="button" onClick={() => setForm({ ...form, role: "instructor" })}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    form.role === "instructor"
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}>
                  <div className="text-2xl mb-1">👨‍🏫</div>
                  <div className={`font-bold text-sm ${form.role === "instructor" ? "text-cyan-700" : "text-slate-700"}`}>Instructor</div>
                  <div className="text-xs text-slate-400 mt-1">Teach & earn</div>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-lg">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-cyan-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}