import Link from "next/link";

const LEVEL_COLORS = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-amber-100 text-amber-700",
  Advanced: "bg-red-100 text-red-700",
};

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course.cid}`}>
      <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-cyan-200 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
        {/* Thumbnail */}
        <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
          {course.thumbnail_url ? (
            <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">📚</div>
          )}
          <span className="absolute top-3 left-3 bg-slate-900/80 text-white text-xs px-2 py-1 rounded-lg font-medium">
            {course.category?.[0] || "Course"}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Instructor */}
          <p className="text-xs text-slate-400 mb-1">{course.instructor}</p>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm leading-snug mb-3 line-clamp-2 flex-1">
            {course.title}
          </h3>

          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <span>📚 {course.lesson_count} lessons</span>
            {course.duration && <span>· ⏱ {course.duration}h</span>}
          </div>

          {/* Level badge */}
          <span className={`self-start text-xs px-2 py-1 rounded-lg font-medium mb-3 ${LEVEL_COLORS[course.level] || "bg-slate-100 text-slate-600"}`}>
            {course.level}
          </span>

          {/* Price row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className={`font-black text-lg ${parseFloat(course.price) === 0 ? "text-green-600" : "text-slate-900"}`}>
              {parseFloat(course.price) === 0 ? "Free" : `$${course.price}`}
            </span>
            <span className="text-cyan-600 text-xs font-semibold group-hover:underline">View Details →</span>
          </div>
        </div>
      </div>
    </Link>
  );
}