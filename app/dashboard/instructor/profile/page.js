"use client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function InstructorProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({
    first_name: "", last_name: "", email: "", country: ""
  });
  const [instructorProfile, setInstructorProfile] = useState({
    bio: "", expertise: "", linkdin: "", instegram: "", facebook: ""
  });
  const [profileImg, setProfileImg] = useState(null);
  const [profileImgPreview, setProfileImgPreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvName, setCvName] = useState("");
  const [savingBasic, setSavingBasic] = useState(false);
  const [savingInstructor, setSavingInstructor] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");
  const [passwordForm, setPasswordForm] = useState({
    old_password: "", new_password: "", confirm_password: ""
  });

  useEffect(() => {
    if (loading) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "instructor") { router.push("/dashboard"); return; }
    fetchData();
  }, [user, loading]);

  const fetchData = async () => {
    try {
      const res = await api.get("/profile/");
      setProfile(res.data);
      if (res.data.profile_img) setProfileImgPreview(res.data.profile_img);
    } catch {}

    try {
      const iRes = await api.get("/instructor-profile/");
      setInstructorProfile(iRes.data);
      if (iRes.data.cv) setCvName("CV uploaded ✓");
    } catch {}

    setDataLoading(false);
  };

  const handleBasicSave = async (e) => {
    e.preventDefault();
    setSavingBasic(true);
    try {
      const formData = new FormData();
      formData.append("first_name", profile.first_name || "");
      formData.append("last_name", profile.last_name || "");
      formData.append("country", profile.country || "");
      if (profileImg) formData.append("profile_img", profileImg);
      await api.patch("/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Basic info updated! ✅");
    } catch { toast.error("Failed to update"); }
    finally { setSavingBasic(false); }
  };

  const handleInstructorSave = async (e) => {
    e.preventDefault();
    setSavingInstructor(true);
    try {
      const formData = new FormData();
      formData.append("bio", instructorProfile.bio || "");
      formData.append("expertise", instructorProfile.expertise || "");
      formData.append("linkdin", instructorProfile.linkdin || "");
      formData.append("instegram", instructorProfile.instegram || "");
      formData.append("facebook", instructorProfile.facebook || "");
      if (cvFile) formData.append("cv", cvFile);

      await api.patch("/instructor-profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Instructor profile updated! ✅");
    } catch { toast.error("Failed to update instructor profile"); }
    finally { setSavingInstructor(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("Passwords don't match"); return;
    }
    setSavingPassword(true);
    try {
      await api.patch("/change_password/", {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed! ✅");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.old_password?.[0] || "Failed to change password");
    } finally { setSavingPassword(false); }
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
      <div className="max-w-3xl mx-auto px-6 py-10">

        <Link href="/dashboard/instructor"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 text-sm font-medium mb-6 transition-colors">
          ← Back to Dashboard
        </Link>

        {/* Profile Header Card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-3xl flex-shrink-0">
            {profileImgPreview
              ? <img src={profileImgPreview} alt="profile" className="w-full h-full object-cover" />
              : user?.first_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-slate-900">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">{profile.email}</p>
            {instructorProfile.expertise && (
              <p className="text-slate-400 text-xs mt-1">🎯 {instructorProfile.expertise}</p>
            )}
            <span className="inline-block mt-2 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              👨‍🏫 Instructor
            </span>
          </div>
          <button onClick={logout}
            className="border border-slate-200 text-slate-500 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition-all flex-shrink-0">
            Sign Out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { key: "basic", label: "👤 Basic Info" },
            { key: "instructor", label: "🎓 Instructor Info" },
            { key: "password", label: "🔒 Password" },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Basic Information</h2>

            {/* Profile photo */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
                {profileImgPreview
                  ? <img src={profileImgPreview} alt="profile" className="w-full h-full object-cover" />
                  : user?.first_name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <input type="file" accept="image/*" id="profile-img" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) { setProfileImg(file); setProfileImgPreview(URL.createObjectURL(file)); }
                  }} />
                <label htmlFor="profile-img"
                  className="cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all">
                  Change Photo
                </label>
                <p className="text-xs text-slate-400 mt-1.5">JPG or PNG, max 2MB</p>
              </div>
            </div>

            <form onSubmit={handleBasicSave} className="space-y-4">
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
              <button type="submit" disabled={savingBasic}
                className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50">
                {savingBasic ? "Saving..." : "Save Basic Info"}
              </button>
            </form>
          </div>
        )}

        {/* Instructor Info Tab */}
        {activeTab === "instructor" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Instructor Information</h2>
            <p className="text-slate-500 text-sm mb-5">This info is shown to students on your profile.</p>

            <form onSubmit={handleInstructorSave} className="space-y-5">

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Bio</label>
                <textarea value={instructorProfile.bio || ""}
                  onChange={(e) => setInstructorProfile({ ...instructorProfile, bio: e.target.value })}
                  placeholder="Tell students about yourself, your experience, and what you teach..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none" />
              </div>

              {/* Expertise */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expertise / Skills</label>
                <input value={instructorProfile.expertise || ""}
                  onChange={(e) => setInstructorProfile({ ...instructorProfile, expertise: e.target.value })}
                  placeholder="e.g. Python, Machine Learning, Web Development"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-600">Social Links</label>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 text-lg w-6 flex-shrink-0">in</span>
                  <input value={instructorProfile.linkdin || ""}
                    onChange={(e) => setInstructorProfile({ ...instructorProfile, linkdin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-pink-500 text-lg w-6 flex-shrink-0">📸</span>
                  <input value={instructorProfile.instegram || ""}
                    onChange={(e) => setInstructorProfile({ ...instructorProfile, instegram: e.target.value })}
                    placeholder="https://instagram.com/yourprofile"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-500 text-lg w-6 flex-shrink-0">f</span>
                  <input value={instructorProfile.facebook || ""}
                    onChange={(e) => setInstructorProfile({ ...instructorProfile, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourprofile"
                    className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </div>
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">CV / Resume</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept=".pdf,.doc,.docx" id="cv-file" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) { setCvFile(file); setCvName(file.name); }
                    }} />
                  <label htmlFor="cv-file"
                    className="cursor-pointer bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 transition-all flex-shrink-0">
                    Upload CV
                  </label>
                  <span className={`text-sm ${cvName ? "text-green-600 font-medium" : "text-slate-400"}`}>
                    {cvName || "No file chosen"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">PDF, DOC, or DOCX accepted</p>
              </div>

              <button type="submit" disabled={savingInstructor}
                className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50">
                {savingInstructor ? "Saving..." : "Save Instructor Info"}
              </button>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Current Password</label>
                <input type="password" required value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">New Password</label>
                <input type="password" required value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm New Password</label>
                <input type="password" required value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              </div>
              {passwordForm.new_password && passwordForm.confirm_password &&
                passwordForm.new_password !== passwordForm.confirm_password && (
                <p className="text-xs text-red-500 font-medium">⚠ Passwords do not match</p>
              )}
              <button type="submit" disabled={savingPassword}
                className="w-full bg-cyan-500 text-white font-bold py-3 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50">
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}