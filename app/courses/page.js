"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import CourseCard from "@/components/CourseCard";
import api from "@/lib/api";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("All");
  const [category, setCategory] = useState(searchParams.get("category") || "All");

  useEffect(() => {
    api.get("/api/categories/").then((r) => setCategories(r.data)).catch(() => {});
    api.get("/api/courses/")
      .then((r) => setCourses(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "All" || c.level === level;
    const matchCat = category === "All" || c.category?.includes(category);
    return matchSearch && matchLevel && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-4">All Courses</h1>
          <p className="text-slate-300 mb-6">Discover {courses.length}+ courses to boost your career</p>
          <input
            type="text"
            placeholder="Search courses or instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-xl px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Level</h3>
            <div className="space-y-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => setLevel(l)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${level === l ? "bg-cyan-50 text-cyan-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Category</h3>
            <div className="space-y-2">
              <button onClick={() => setCategory("All")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === "All" ? "bg-cyan-50 text-cyan-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                All Categories
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setCategory(cat.name)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${category === cat.name ? "bg-cyan-50 text-cyan-700 font-semibold" : "text-slate-600 hover:bg-slate-50"}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Course Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-500 text-sm">{filtered.length} courses found</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-72 animate-pulse"></div>)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold">No courses found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((course) => <CourseCard key={course.cid} course={course} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}