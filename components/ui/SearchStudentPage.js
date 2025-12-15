"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle, UserSearch } from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SearchStudentPage() {
  const router = useRouter();

  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!studentId.trim()) {
      setError("Please enter Student ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const q = query(
        collection(db, "students"),
        where("id", "==", studentId.toLowerCase().trim())
      );

      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Student ID not found");
      } else {
        const docId = snap.docs[0].id;
        router.push(`/dashboard/student/${docId}`);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <UserSearch size={20} />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">
            Search Student
          </h1>
        </div>

        {/* Input */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-10 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search Student"}
        </button>

        {/* Hint */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Search using the official Student ID
        </p>
      </div>
    </div>
  );
}
