"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import api from "@/lib/api";

const CATEGORIES = [
  { name: "Development", icon: "💻", color: "#E8F4FF" },
  { name: "Business", icon: "📊", color: "#FFF4E8" },
  { name: "Design", icon: "🎨", color: "#F4E8FF" },
  { name: "Marketing", icon: "📣", color: "#E8FFF4" },
  { name: "IT & Software", icon: "⚙️", color: "#FFE8E8" },
  { name: "Mathematics", icon: "📐", color: "#E8F0FF" },
  { name: "Chemistry", icon: "🧪", color: "#FFF8E8" },
  { name: "Language", icon: "🌐", color: "#E8FFFA" },
];

const STATS = [
  { value: "20K+", label: "Quality Courses" },
  { value: "100K+", label: "Enrolled Students" },
  { value: "500+", label: "Expert Instructors" },
  { value: "98%", label: "Satisfaction Rate" },
];

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/courses/")
      .then((res) => setCourses(res.data.slice(0, 8)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <span className="inline-flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 px-4 py-2 rounded-full text-sm font-medium">
              ✦ Learn From 20,000+ Quality Courses
            </span>
            <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight">
              Level Up
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Your Skills
              </span>
              <br />
              with SkillByte
            </h1>
            <p className="text-slate-300 text-xl max-w-lg leading-relaxed">
              Master in-demand skills with expert-led courses. Start your learning journey today and build the career you deserve.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/courses" className="bg-cyan-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-cyan-300 transition-all hover:scale-105 text-lg">
                Start Learning Now
              </Link>
              <Link href="/courses" className="border border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all text-lg">
                Browse Courses
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm">
                <div className="text-3xl font-black text-cyan-400">{s.value}</div>
                <div className="text-slate-400 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-3">Top Categories</h2>
          <p className="text-slate-500 text-lg">Explore our most popular learning paths</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/courses?category=${encodeURIComponent(cat.name)}`}>
              <div className="group flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-md transition-all cursor-pointer" style={{ backgroundColor: cat.color }}>
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-semibold text-slate-700 group-hover:text-cyan-700">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Banners */}
      <section className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-6">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] p-8 text-white">
          <p className="text-cyan-400 text-sm font-semibold mb-2">Learn together with</p>
          <h3 className="text-3xl font-black mb-3">Expert Instructors</h3>
          <p className="text-slate-300 mb-6">Get mentored by industry professionals who bring real-world experience to every lesson.</p>
          <Link href="/courses" className="inline-block bg-cyan-400 text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-cyan-300 transition-all">
            View All Courses
          </Link>
        </div>
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 p-8 border border-cyan-100">
          <p className="text-cyan-600 text-sm font-semibold mb-2">Get the skills</p>
          <h3 className="text-3xl font-black text-slate-900 mb-3">For Individuals</h3>
          <p className="text-slate-500 mb-6">Flexible learning that fits your schedule. Learn at your own pace, anytime, anywhere.</p>
          <Link href="/courses" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-700 transition-all">
            Find Your Course
          </Link>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-4xl font-black text-slate-900">Popular Courses</h2>
              <div className="h-1 w-16 bg-cyan-400 rounded mt-2"></div>
            </div>
            <Link href="/courses" className="border border-slate-300 text-slate-700 px-5 py-2 rounded-xl hover:border-cyan-400 hover:text-cyan-600 transition-all font-medium">
              View All Courses →
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.cid} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cyan-400 to-blue-500 py-20 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-black text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-cyan-50 text-xl mb-8">Join over 100,000 students already learning on SkillByte</p>
          <Link href="/register" className="bg-white text-cyan-600 font-bold px-10 py-4 rounded-xl hover:bg-cyan-50 transition-all text-lg inline-block">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-white font-black text-2xl mb-4">Skill<span className="text-cyan-400">Byte</span></div>
            <p className="text-sm">Empowering learners worldwide with quality education.</p>
          </div>
          {[
            { title: "Courses", links: ["All Courses", "Categories", "Popular", "New"] },
            { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
            { title: "Support", links: ["Help Center", "Privacy Policy", "Terms", "FAQ"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2 text-sm">
                {col.links.map((l) => <li key={l}><a href="#" className="hover:text-cyan-400 transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          © 2025 SkillByte. All rights reserved.
        </div>
      </footer>
    </div>
  );
}