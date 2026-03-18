"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ManageLessonsPage() {
  const { courseId } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [resourceFile, setResourceFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    video_url: "",
    duration: "",
    duration_unit: "minutes",
    order: 1,
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "instructor") { router.push("/dashboard"); return; }
    fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/api/courses/${courseId}/`),
        api.get(`/api/lessons/?course=${courseId}`),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      // set default order to next available
      setForm((prev) => ({ ...prev, order: lessonsRes.data.length + 1 }));
    } catch {
      toast.error("Failed to load course data");
    } finally {
      setDataLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      content: "",
      video_url: "",
      duration: "",
      duration_unit: "minutes",
      order: lessons.length + 1,
    });
    setResourceFile(null);
    setEditingLesson(null);
    setShowForm(false);
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      duration: lesson.duration || "",
      duration_unit: lesson.duration_unit || "minutes",
      order: lesson.order,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("course", courseId);
      formData.append("title", form.title);
      formData.append("content", form.content);
      formData.append("video_url", form.video_url);
      formData.append("order", form.order);
      formData.append("duration_unit", form.duration_unit);
      if (form.duration) formData.append("duration", parseInt(form.duration));
      if (resourceFile) formData.append("resources", resourceFile);

      if (editingLesson) {
        await api.patch(`/api/lessons/${editingLesson.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson updated! ✅");
      } else {
        await api.post("/api/lessons/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Lesson added! ✅");
      }

      resetForm();
      fetchData();
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach((e) =>
          toast.error(Array.isArray(e) ? e[0] : e)
        );
      } else {
        toast.error("Failed to save lesson");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await api.delete(`/api/lessons/${lessonId}/`);
      toast.success("Lesson deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete lesson");
    }
  };

  // ── Loading ───────────────────────────────────────────────────
  if (loading || dataLoading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Back link */}
        <Link href="/dashboard/instructor"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 text-sm font-medium mb-6 transition-colors">
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Manage Lessons</h1>
            {course && (
              <p className="text-slate-500 mt-1 text-sm">
                Course: <span className="font-semibold text-slate-700">{course.title}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="bg-cyan-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-cyan-400 transition-all flex-shrink-0"
          >
            {showForm && !editingLesson ? "✕ Cancel" : "+ Add Lesson"}
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Lessons", value: lessons.length, icon: "📚" },
            { label: "With Video", value: lessons.filter(l => l.video_url).length, icon: "▶️" },
            { label: "With Resources", value: lessons.filter(l => l.resources).length, icon: "📎" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-black text-slate-900">{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Add / Edit Lesson Form */}
        {showForm && (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 mb-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-6">
              {editingLesson ? "Edit Lesson" : "Add New Lesson"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Title + Order */}
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Lesson Title *
                  </label>
                  <input type="text" required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Introduction to Variables"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Order</label>
                  <input type="number" min="1" required value={form.order}
                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Lesson Description
                </label>
                <textarea value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="What will students learn in this lesson?"
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all resize-none" />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Video URL
                </label>
                <input type="url" value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                {form.video_url && (
                  <p className="text-xs text-green-600 mt-1 font-medium">✓ Video URL added</p>
                )}
              </div>

              {/* Resource File */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Resource File (PDF, ZIP, etc.)
                </label>
                <div className="flex items-center gap-3">
                  <input type="file" id="resource-file"
                    onChange={(e) => setResourceFile(e.target.files[0])}
                    className="hidden" />
                  <label htmlFor="resource-file"
                    className="cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all">
                    Choose File
                  </label>
                  {resourceFile ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>📎 {resourceFile.name}</span>
                      <button type="button" onClick={() => setResourceFile(null)}
                        className="text-red-400 hover:text-red-600 text-xs">✕</button>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">No file chosen</span>
                  )}
                </div>
              </div>

              {/* Duration + Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                  <input type="number" min="1" value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g. 15"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Unit</label>
                  <select value={form.duration_unit}
                    onChange={(e) => setForm({ ...form, duration_unit: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all bg-white">
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-lg">
                  {submitting
                    ? "Saving..."
                    : editingLesson ? "Update Lesson ✅" : "Add Lesson ✅"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-6 border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-50 transition-all">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lessons List */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Lessons ({lessons.length})
          </h2>

          {lessons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-slate-500 font-medium mb-1">No lessons yet</p>
              <p className="text-slate-400 text-sm">Click "+ Add Lesson" to create your first lesson</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id}
                    className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-cyan-200 transition-all">

                    {/* Order badge */}
                    <div className="w-10 h-10 bg-cyan-50 border border-cyan-100 rounded-xl flex items-center justify-center font-black text-cyan-600 flex-shrink-0">
                      {lesson.order}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate">{lesson.title}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {lesson.duration && (
                          <span className="text-xs text-slate-400">
                            ⏱ {lesson.duration} {lesson.duration_unit}
                          </span>
                        )}
                        {lesson.video_url && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            ▶ Video
                          </span>
                        )}
                        {lesson.resources && (
                          <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                            📎 Resources
                          </span>
                        )}
                        {lesson.content && (
                          <span className="text-xs text-slate-400 truncate max-w-xs">
                            {lesson.content.substring(0, 60)}...
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(lesson)}
                        className="text-xs border border-slate-200 text-slate-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all font-medium">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDelete(lesson.id)}
                        className="text-xs border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 transition-all font-medium">
                        🗑 Delete
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