"use client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [profile, setProfile] = useState({
    first_name: "", last_name: "", country: ""
  });
  const [instructorProfile, setInstructorProfile] = useState({
    bio: "", expertise: "", linkdin: "", instegram: "", facebook: ""
  });
  const [profileImg, setProfileImg] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }

    // redirect instructor to their dashboard
    if (user.role === "instructor") {
      router.push("/dashboard/instructor");
      return;
    }

    api.get("/api/enrollments/").then((r) => setEnrollments(r.data)).catch(() => {});
    api.get("/profile/").then((r) => {
      setProfile(r.data);
      if (r.data.profile_img) setProfileImgPreview(r.data.profile_img);
    }).finally(() => setDataLoading(false));
  }, [user, loading]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("first_name", profile.first_name || "");
      formData.append("last_name", profile.last_name || "");
      formData.append("country", profile.country || "");
      if (profileImg) formData.append("profile_img", profileImg);

      await api.patch("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated! ✅");
    } catch { toast.error("Update failed"); }
    finally { setSavingProfile(false); }
  };

  if (loading || dataLoading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center py-40">
        <div className="animate-spin w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
            {profileImgPreview
              ? <img src={profileImgPreview} alt="profile" className="w-full h-full object-cover" />
              : user.first_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">
              Welcome back, {user.first_name} 👋
            </h1>
            <p className="text-slate-500 mt-0.5">Student Dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Enrolled Courses", value: enrollments.length, icon: "📚" },
            { label: "Completed", value: 0, icon: "✅" },
            { label: "Certificates", value: 0, icon: "🏆" },
            { label: "Hours Learned", value: 0, icon: "⏱" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-slate-100 text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {["courses", "profile"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {tab === "courses" ? "📚 My Courses" : "👤 My Profile"}
            </button>
          ))}
        </div>

        {/* My Courses Tab */}
        {activeTab === "courses" && (
          <div>
            {enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-slate-500 mb-4 font-medium">No courses enrolled yet</p>
                <Link href="/courses" className="bg-cyan-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-cyan-400 transition-all">
                  Browse Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <Link key={e.id} href={`/courses/${e.course}`}>
                    <div className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-cyan-200 transition-all flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">📖</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">Course ID: {e.course}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Enrolled {new Date(e.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-cyan-600 text-xs font-semibold flex-shrink-0">Continue →</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl">
            <div className="bg-white rounded-2xl border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h2>

              {/* Profile image */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
                  {profileImgPreview
                    ? <img src={profileImgPreview} alt="profile" className="w-full h-full object-cover" />
                    : user.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <input type="file" accept="image/*" id="profile-img" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileImg(file);
                        setProfileImgPreview(URL.createObjectURL(file));
                      }
                    }} />
                  <label htmlFor="profile-img"
                    className="cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all">
                    Change Photo
                  </label>
                  <p className="text-xs text-slate-400 mt-2">JPG or PNG, max 2MB</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name</label>
                    <input value={profile.first_name || ""}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name</label>
                    <input value={profile.last_name || ""}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                  <input value={profile.email || ""} disabled
                    className="w-full px-4 py-3 border border-slate-100 rounded-xl text-slate-400 text-sm bg-slate-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Country</label>
                  <input value={profile.country || ""}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="e.g. Algeria"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={savingProfile}
                    className="flex-1 bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50">
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" onClick={logout}
                    className="px-6 border border-slate-200 text-slate-600 font-medium py-3 rounded-xl hover:bg-slate-50 transition-all">
                    Sign Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}