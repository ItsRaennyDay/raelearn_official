"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  courseId: string;
  courseTitle: string;
  isFree: boolean;
  isEnrolled: boolean;
  isLoggedIn: boolean;
  fullWidth?: boolean;
}

export default function EnrollButton({
  courseId,
  isFree,
  isEnrolled,
  isLoggedIn,
  fullWidth = false,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cls = [
    "font-bold text-sm px-6 py-3 rounded-xl transition-colors",
    fullWidth ? "w-full" : "",
    "bg-[#2A5230] text-white hover:bg-[#1e3d24] disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  if (isEnrolled) {
    return (
      <button
        onClick={() => router.push("/dashboard")}
        className={cls}
      >
        Go to Dashboard →
      </button>
    );
  }

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => router.push(`/signup?next=/courses/${courseId}`)}
        className={cls}
      >
        {isFree ? "Enroll Free →" : "Sign up to enroll →"}
      </button>
    );
  }

  async function handleEnroll() {
    if (!isFree) {
      // Paid: will route to Stripe (not yet implemented)
      router.push("/pricing");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.from("enrollments").insert({
      course_id: courseId,
      source: "free",
    });
    setLoading(false);
    if (err) {
      if (err.code === "23505") {
        // Already enrolled — just go to dashboard
        router.push("/dashboard");
        return;
      }
      setError("Enrollment failed. Please try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <button onClick={handleEnroll} disabled={loading} className={cls}>
        {loading ? "Enrolling…" : isFree ? "Enroll Free →" : "Purchase →"}
      </button>
      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
    </div>
  );
}
