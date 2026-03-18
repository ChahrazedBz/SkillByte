"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [progressMap, setProgressMap] = useState({});
  const [showPayment, setShowPayment] = useState(false);
  const [payMethod, setPayMethod] = useState("card");
  const [paying, setPaying] = useState(false);
  const [payForm, setPayForm] = useState({ name: "", card: "", expiry: "", cvv: "", paypal: "" });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);

  const fetchProgress = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/api/progress/");
      const map = {};
      const completed = new Set();
      res.data.forEach((p) => {
        map[p.lesson_id] = p;
        if (p.completed) completed.add(p.lesson_id);
      });
      setProgressMap(map);
      setCompletedLessons(completed);
    } catch {}
  }, [user]);

  useEffect(() => {
    api.get(`/api/courses/${id}/`)
      .then((r) => { setCourse(r.data); setActiveLesson(r.data.lessons?.[0] || null); })
      .catch(() => toast.error("Course not found"))
      .finally(() => setLoading(false));

    if (user) {
      api.get("/api/enrollments/")
        .then((r) => setEnrolled(r.data.some((e) => e.course === id)))
        .catch(() => {});
      api.get(`/api/ratings/?course=${id}`)
        .then((r) => {
          const mine = r.data.find((rev) => rev.student === String(user.id));
          if (mine) setUserReview(mine);
        }).catch(() => {});
      fetchProgress();
    }
  }, [id, user, fetchProgress]);

  const isInstructor = user && course &&
    user.first_name + " " + user.last_name === course.instructor;

  const progressPercent = course?.lessons?.length
    ? Math.round((completedLessons.size / course.lessons.length) * 100)
    : 0;

  const isCourseCompleted = progressPercent === 100;

  const toggleLessonComplete = async (lesson) => {
    if (!enrolled || isInstructor) return;
    const existing = progressMap[lesson.id];
    try {
      if (existing) {
        await api.patch(`/api/progress/${existing.id}/`, {
          lesson_id: lesson.id,
          completed: !existing.completed,
        });
      } else {
        await api.post("/api/progress/", {
          lesson_id: lesson.id,
          completed: true,
        });
      }
      await fetchProgress();
    } catch { toast.error("Failed to update progress"); }
  };

  const handleEnrollClick = () => {
    if (!user) { toast.error("Please login to enroll"); router.push("/login"); return; }
    setShowPayment(true);
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setPaying(true);
    try {
      if (parseFloat(course.price) > 0) await new Promise((r) => setTimeout(r, 1500));
      await api.post("/api/enrollments/", { course: id });
      setEnrolled(true);
      setShowPayment(false);
      toast.success("Enrolled successfully! 🎉");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Enrollment failed.");
    } finally { setPaying(false); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await api.post("/api/ratings/", {
        course: id, rating: reviewForm.rating, review: reviewForm.review,
      });
      toast.success("Review submitted! ⭐");
      setUserReview(res.data);
      setShowReviewForm(false);
      const updated = await api.get(`/api/courses/${id}/`);
      setCourse(updated.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally { setSubmittingReview(false); }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch")) return `https://www.youtube.com/embed/${url.split("v=")[1]?.split("&")[0]}`;
    if (url.includes("youtu.be/")) return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]?.split("?")[0]}`;
    if (url.includes("vimeo.com/")) return `https://player.vimeo.com/video/${url.split("vimeo.com/")[1]}`;
    return url;
  };

  const isDirectVideo = (url) => url?.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  if (!course) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="flex flex-col items-center justify-center py-40">
        <div className="text-6xl mb-4">😕</div>
        <p className="text-xl font-bold text-slate-700">Course not found</p>
        <Link href="/courses" className="mt-4 text-cyan-600 hover:underline">Browse all courses</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#0F172A] to-[#1E3A5F] text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {course.category?.map((c) => (
              <span key={c} className="bg-cyan-400/20 text-cyan-300 text-sm px-3 py-1 rounded-full">{c}</span>
            ))}
            <span className="bg-white/10 text-slate-300 text-sm px-3 py-1 rounded-full">{course.level}</span>
          </div>
          <h1 className="text-4xl font-black mb-4 max-w-3xl leading-tight">{course.title}</h1>
          <p className="text-slate-300 text-lg max-w-2xl mb-6">{course.description}</p>
          <div className="flex flex-wrap gap-6 text-slate-300 text-sm">
            <span>👤 {course.instructor}</span>
            <span>📚 {course.lesson_count} lessons</span>
            {course.duration && <span>⏱ {course.duration} {course.duration_unit}</span>}
            {course.average_rating && <span>⭐ {course.average_rating} ({course.review_count} reviews)</span>}
            {course.certified && <span className="text-cyan-300 font-semibold">🏆 Certificate included</span>}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {enrolled && !isInstructor && (
        <div className="bg-white border-b border-slate-100 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">Your Progress</span>
              <span className="text-sm font-bold text-cyan-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">
                {completedLessons.size} of {course.lessons?.length} lessons completed
              </span>
              {isCourseCompleted && course.certified && (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                  🏆 Certificate Available!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-8">
        <main className="flex-1 space-y-6 min-w-0">

          {/* Video Player */}
          {activeLesson && (
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
              {activeLesson.video_url ? (
                <div className="aspect-video bg-black">
                  {isDirectVideo(activeLesson.video_url) ? (
                    <video key={activeLesson.video_url} controls className="w-full h-full"
                      src={activeLesson.video_url} />
                  ) : (
                    <iframe key={getEmbedUrl(activeLesson.video_url)}
                      src={getEmbedUrl(activeLesson.video_url)}
                      className="w-full h-full" allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      title={activeLesson.title} />
                  )}
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <div className="text-6xl mb-3">📖</div>
                    <p className="font-medium">No video for this lesson</p>
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-slate-900">{activeLesson.title}</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-cyan-50 text-cyan-600 px-3 py-1 rounded-full font-medium">
                      Lesson {activeLesson.order}
                    </span>
                    {enrolled && !isInstructor && (
                      <button onClick={() => toggleLessonComplete(activeLesson)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                          completedLessons.has(activeLesson.id)
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}>
                        {completedLessons.has(activeLesson.id) ? "✓ Completed" : "Mark Complete"}
                      </button>
                    )}
                  </div>
                </div>
                {activeLesson.content && (
                  <p className="text-slate-500 text-sm leading-relaxed">{activeLesson.content}</p>
                )}
                {activeLesson.resources && (
                  <a href={activeLesson.resources} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-cyan-600 text-sm font-medium hover:underline">
                    📎 Download Resources
                  </a>
                )}

                {/* Prev / Next */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <button onClick={() => {
                    const prev = course.lessons.find(l => l.order === activeLesson.order - 1);
                    if (prev) setActiveLesson(prev);
                  }} disabled={activeLesson.order === 1}
                    className="flex-1 border border-slate-200 text-slate-600 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    ← Previous
                  </button>
                  <button onClick={() => {
                    const next = course.lessons.find(l => l.order === activeLesson.order + 1);
                    if (next) setActiveLesson(next);
                  }} disabled={activeLesson.order === course.lessons.length}
                    className="flex-1 bg-cyan-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-cyan-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lessons List */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Course Content</h3>
                <p className="text-slate-500 text-sm mt-0.5">{course.lesson_count} lessons</p>
              </div>
              {enrolled && !isInstructor && (
                <span className="text-xs bg-cyan-50 text-cyan-600 px-3 py-1.5 rounded-full font-semibold">
                  {completedLessons.size}/{course.lessons?.length} done
                </span>
              )}
            </div>
            {course.lessons?.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No lessons added yet.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {course.lessons?.map((lesson) => (
                  <button key={lesson.id} onClick={() => setActiveLesson(lesson)}
                    className={`w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-all ${
                      activeLesson?.id === lesson.id ? "bg-cyan-50 border-l-4 border-cyan-400" : ""
                    }`}>
                    {/* Completion indicator */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      completedLessons.has(lesson.id)
                        ? "bg-green-400 text-white"
                        : activeLesson?.id === lesson.id
                          ? "bg-cyan-400 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}>
                      {completedLessons.has(lesson.id) ? "✓" : lesson.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        completedLessons.has(lesson.id) ? "text-slate-400 line-through" : "text-slate-800"
                      }`}>{lesson.title}</p>
                      {lesson.duration && (
                        <p className="text-slate-400 text-xs mt-0.5">{lesson.duration} {lesson.duration_unit}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {lesson.video_url && <span className="text-xs bg-blue-50 text-blue-500 px-2 py-0.5 rounded-full">▶</span>}
                      {lesson.resources && <span className="text-xs bg-green-50 text-green-500 px-2 py-0.5 rounded-full">📎</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Student Reviews</h3>
                {course.average_rating && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-3xl font-black text-slate-900">{course.average_rating}</span>
                    <div>
                      <div className="text-yellow-400 text-sm">
                        {"★".repeat(Math.round(course.average_rating))}
                        {"☆".repeat(5 - Math.round(course.average_rating))}
                      </div>
                      <p className="text-xs text-slate-400">{course.review_count} reviews</p>
                    </div>
                  </div>
                )}
              </div>
              {enrolled && !isInstructor && !userReview && (
                <button onClick={() => setShowReviewForm(!showReviewForm)}
                  className="bg-cyan-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-cyan-400 transition-all text-sm">
                  {showReviewForm ? "✕ Cancel" : "✏️ Write Review"}
                </button>
              )}
            </div>

            {/* User's existing review */}
            {userReview && (
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-cyan-600 mb-2">Your Review</p>
                <div className="text-yellow-400 text-sm mb-1">
                  {"★".repeat(userReview.rating)}{"☆".repeat(5 - userReview.rating)}
                </div>
                {userReview.review && <p className="text-slate-600 text-sm">{userReview.review}</p>}
              </div>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-slate-50 rounded-xl p-5 mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Your Rating</label>
                  <div className="flex gap-2 items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-3xl transition-transform hover:scale-110 ${
                          star <= reviewForm.rating ? "text-yellow-400" : "text-slate-200"
                        }`}>★</button>
                    ))}
                    <span className="ml-2 text-sm text-slate-500">
                      {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewForm.rating]}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Your Review (optional)</label>
                  <textarea value={reviewForm.review}
                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                    placeholder="Share your experience with this course..."
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all resize-none" />
                </div>
                <button type="submit" disabled={submittingReview}
                  className="bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-sm">
                  {submittingReview ? "Submitting..." : "Submit Review ⭐"}
                </button>
              </form>
            )}

            {/* Reviews List */}
            {!course.ratings?.length ? (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">⭐</div>
                <p>No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {course.ratings?.map((r, i) => (
                  <div key={i} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-sm flex-shrink-0">
                        {r.student_name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 text-sm">{r.student_name}</p>
                        <div className="text-yellow-400 text-xs">
                          {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {r.created_at?.split("T")[0]}
                      </span>
                    </div>
                    {r.review && (
                      <p className="text-slate-500 text-sm leading-relaxed ml-12">{r.review}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden sticky top-20">
            {course.thumbnail_url && (
              <img src={course.thumbnail_url} alt={course.title} className="w-full h-44 object-cover" />
            )}
            <div className="p-6">
              <div className="text-4xl font-black mb-4">
                {parseFloat(course.price) === 0
                  ? <span className="text-green-600">Free</span>
                  : <span className="text-slate-900">${course.price}</span>}
              </div>

              {isInstructor ? (
                <div className="bg-slate-50 border border-slate-200 text-slate-600 text-center py-3 rounded-xl font-semibold mb-4 text-sm">
                  📋 You created this course
                </div>
              ) : enrolled ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-center py-3 rounded-xl font-semibold mb-4">
                  ✓ You&apos;re enrolled
                </div>
              ) : (
                <button onClick={handleEnrollClick}
                  className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all mb-4 text-lg">
                  {parseFloat(course.price) === 0 ? "Enroll for Free" : `Enroll — $${course.price}`}
                </button>
              )}

              {/* Course info */}
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3"><span>📚</span><span>{course.lesson_count} lessons</span></div>
                {course.duration && (
                  <div className="flex items-center gap-3"><span>⏱</span><span>{course.duration} {course.duration_unit}</span></div>
                )}
                <div className="flex items-center gap-3"><span>📊</span><span>{course.level}</span></div>
                <div className="flex items-center gap-3"><span>👤</span><span>{course.instructor}</span></div>
                {course.certified && (
                  <div className="flex items-center gap-3"><span>🏆</span><span>Certificate of completion</span></div>
                )}
              </div>

              {/* Progress in sidebar */}
              {enrolled && !isInstructor && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Progress</span>
                    <span className="font-bold text-cyan-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  {isCourseCompleted && course.certified && (
                    <button className="w-full mt-3 bg-amber-400 text-amber-900 font-bold py-2.5 rounded-xl hover:bg-amber-300 transition-all text-sm">
                      🏆 Download Certificate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">
                {parseFloat(course.price) === 0 ? "Confirm Enrollment" : "Complete Payment"}
              </h3>
              <button onClick={() => setShowPayment(false)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none">✕</button>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt={course.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{course.title}</p>
                <p className="text-2xl font-black text-cyan-600 mt-0.5">
                  {parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
                </p>
              </div>
            </div>

            {parseFloat(course.price) === 0 ? (
              <form onSubmit={handlePayment}>
                <button type="submit" disabled={paying}
                  className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-lg">
                  {paying ? "Enrolling..." : "Confirm Free Enrollment"}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setPayMethod("card")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      payMethod === "card"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 text-slate-600"
                    }`}>💳 Credit Card</button>
                  <button type="button" onClick={() => setPayMethod("paypal")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      payMethod === "paypal"
                        ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                        : "border-slate-200 text-slate-600"
                    }`}>🅿 PayPal</button>
                </div>

                {payMethod === "card" ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Cardholder Name</label>
                      <input type="text" required value={payForm.name}
                        onChange={(e) => setPayForm({ ...payForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Card Number</label>
                      <input type="text" required value={payForm.card}
                        onChange={(e) => setPayForm({ ...payForm, card: e.target.value })}
                        placeholder="1234 5678 9012 3456" maxLength={19}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry</label>
                        <input type="text" required value={payForm.expiry}
                          onChange={(e) => setPayForm({ ...payForm, expiry: e.target.value })}
                          placeholder="MM/YY" maxLength={5}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">CVV</label>
                        <input type="password" required value={payForm.cvv}
                          onChange={(e) => setPayForm({ ...payForm, cvv: e.target.value })}
                          placeholder="•••" maxLength={4}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">PayPal Email</label>
                    <input type="email" required value={payForm.paypal}
                      onChange={(e) => setPayForm({ ...payForm, paypal: e.target.value })}
                      placeholder="you@paypal.com"
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                )}

                <p className="text-xs text-slate-400 text-center">
                  🔒 Your payment info is secure and encrypted
                </p>
                <button type="submit" disabled={paying}
                  className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-lg">
                  {paying ? "Processing..." : `Pay $${course.price}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}