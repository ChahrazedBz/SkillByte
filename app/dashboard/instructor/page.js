"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

export default function InstructorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: [],
    duration: "",
    duration_unit: "hours",
    price: "0.00",
    level: "Beginner",
    certified: false,
    video_url: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "instructor") { router.push("/dashboard"); return; }
    fetchCourses();
    api.get("/api/categories/").then((r) => setCategories(r.data)).catch(() => {});
  }, [user, loading]);

  const fetchCourses = () => {
    // fetch ALL courses including unapproved for instructor
    api.get("/api/courses/all/")
      .then((r) => {
        const mine = r.data.filter(
          (c) => c.instructor === user.first_name + " " + user.last_name
        );
        setCourses(mine);
      })
      .catch(() => {
        // fallback to normal endpoint
        api.get("/api/courses/").then((r) => {
          const mine = r.data.filter(
            (c) => c.instructor === user.first_name + " " + user.last_name
          );
          setCourses(mine);
        }).finally(() => setDataLoading(false));
      })
      .finally(() => setDataLoading(false));
  };

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // use FormData to support file upload
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("duration_unit", form.duration_unit);
      formData.append("price", parseFloat(form.price).toFixed(2));
      formData.append("level", form.level);
      formData.append("certified", form.certified);
      if (form.duration) formData.append("duration", parseInt(form.duration));
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      form.category.forEach((id) => formData.append("category", id));

      await api.post("/api/courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Course submitted for review! Admin will approve it soon 🎉");
      setShowForm(false);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setForm({
        title: "", description: "", category: [],
        duration: "", duration_unit: "hours",
        price: "0.00", level: "Beginner", certified: false,
        video_url: "",
      });
      fetchCourses();
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach((e) => toast.error(Array.isArray(e) ? e[0] : e));
      } else {
        toast.error("Failed to create course");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryToggle = (catId) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(catId)
        ? prev.category.filter((c) => c !== catId)
        : [...prev.category, catId],
    }));
  };

  const handleDelete = async (cid) => {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/api/courses/${cid}/`);
      toast.success("Course deleted");
      fetchCourses();
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Instructor Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage your courses</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-cyan-400 transition-all">
            {showForm ? "✕ Cancel" : "+ New Course"}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "My Courses", value: courses.length, icon: "📚" },
            { label: "Approved", value: courses.filter(c => c.is_approved).length, icon: "✅" },
            { label: "Pending", value: courses.filter(c => !c.is_approved).length, icon: "⏳" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Create Course Form */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-2">Create New Course</h2>
            <p className="text-slate-500 text-sm mb-6">Your course will be reviewed by admin before going live.</p>

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Title *</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Complete Python Bootcamp"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What will students learn in this course?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all resize-none" />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Course Thumbnail</label>
                <div className="flex items-start gap-4">
                  {thumbnailPreview ? (
                    <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                      <img src={thumbnailPreview} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 flex-shrink-0">
                      🖼️
                    </div>
                  )}
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={handleThumbnail} id="thumbnail-input" className="hidden" />
                    <label htmlFor="thumbnail-input"
                      className="inline-block cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all">
                      Choose Image
                    </label>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG. Recommended: 1280x720px</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button key={cat.id} type="button" onClick={() => handleCategoryToggle(cat.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        form.category.includes(cat.id)
                          ? "bg-cyan-500 text-white border-cyan-500"
                          : "bg-white text-slate-700 border-slate-200 hover:border-cyan-300"
                      }`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                  <input type="number" min="1" value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Unit</label>
                  <select value={form.duration_unit}
                    onChange={(e) => setForm({ ...form, duration_unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all bg-white">
                    <option value="hours">Hours</option>
                    <option value="minutes">Minutes</option>
                  </select>
                </div>
              </div>

              {/* Price + Level */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price ($)</label>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00 for free"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Level</label>
                  <select value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all bg-white">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              {/* Certificate — proper checkbox */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input type="checkbox" id="certified" checked={form.certified}
                  onChange={(e) => setForm({ ...form, certified: e.target.checked })}
                  className="w-5 h-5 rounded accent-cyan-500 cursor-pointer" />
                <label htmlFor="certified" className="text-sm font-medium text-slate-700 cursor-pointer">
                  🏆 This course includes a Certificate of Completion
                </label>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full bg-cyan-500 text-white font-bold py-4 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-lg">
                {submitting ? "Submitting for review..." : "Submit Course for Review 🚀"}
              </button>
            </form>
          </div>
        )}

        {/* My Courses List */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">My Courses</h2>
          {dataLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white h-24 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-slate-500 mb-2">No courses yet</p>
              <p className="text-slate-400 text-sm">Click "+ New Course" above to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.cid} className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📚</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{course.title}</h3>
                      {course.is_approved ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">✓ Approved</span>
                      ) : (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">⏳ Pending Review</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>📚 {course.lesson_count} lessons</span>
                      <span>📊 {course.level}</span>
                      <span className={`font-semibold ${parseFloat(course.price) === 0 ? "text-green-600" : "text-slate-700"}`}>
                        {parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/courses/${course.cid}`}
                      className="text-xs border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
                      View
                    </Link>
                    <Link href={`/dashboard/instructor/lessons/${course.cid}`}
                      className="text-xs border border-cyan-200 text-cyan-600 px-3 py-2 rounded-lg hover:bg-cyan-50 transition-all">
                      + Lessons
                    </Link>
                    <button onClick={() => handleDelete(course.cid)}
                      className="text-xs border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-all">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}