"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  Calendar,
  IndianRupee,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FeeDuePage() {
  const router = useRouter();
  const {loading, setLoading} = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showOverdue, setShowOverdue] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [selectedDate, showOverdue]);

//   const fetchStudents = async () => {
//     const q = query(collection(db, "students"));
//     const snap = await getDocs(q);

//     const data = await Promise.all(
//       snap.docs.map(async (doc) => {
//         const dueSnap = await getDocs(
//           collection(db, "students", doc.id, "due_dates")
//         );

//         const dueDates = dueSnap.docs.map((d) => ({
//           id: d.id,
//           ...d.data(),
//         }));

//         return {
//           docId: doc.id,
//           ...doc.data(),
//           dueDates,
//         };
//       })
//     );

//     setStudents(data);
//   };

const fetchStudents = async () => {
    setLoading(true);

    const startOfDay = new Date(`${selectedDate}T00:00:00`);
    const endOfDay = new Date(`${selectedDate}T23:59:59`);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);

    const dateTimestamp = Timestamp.fromDate(
      new Date(`${selectedDate}T00:00:00`)
    );

    let q;

    if (showOverdue) {
      // dues_date <= selected date
      q = query(
        collection(db, "students"),
        where("dues_date", "<=", dateTimestamp),
        orderBy("dues_date", "asc")
      );
    } else {
      // dues_date == selected date
      q = query(
        collection(db, "students"),
        where("dues_date", ">=", startTimestamp),
        where("dues_date", "<=", endTimestamp)
        );
    }

    const snap = await getDocs(q);

    const data = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const dueSnap = await getDocs(
          query(collection(db, "students", docSnap.id, "due_dates"), orderBy('date', 'desc'))
        );

        return {
          docId: docSnap.id,
          ...docSnap.data(),
          dueDates: dueSnap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })),
        };
      })
    );

    setStudents(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">
          Fee Due Students
        </h1>

        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-md border-2 border-gray-200 px-3 py-2 text-sm"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOverdue}
              onChange={(e) => setShowOverdue(e.target.checked)}
            />
            Show Overdue
          </label>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {students.map((s) => (
          <div
            key={s.docId}
            className="rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-xl"
          >
            {/* Student Info */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {s.name}
                </h2>
                <p className="text-sm text-gray-500 font-semibold">
                  <span className="uppercase">{s.id}</span> · {s.course}
                </p>
              </div>
              <User className="text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Fee</p>
                <p className="font-semibold">
                  ₹{s.totalFee}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Dues</p>
                <p className="font-semibold text-red-600">
                  ₹{s.dues}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Admission Date</p>
                <p className="font-medium">
                  {s.admDate?.toDate().toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Fee Mode</p>
                <p className="font-medium">
                  {s.mode}
                </p>
              </div>
            </div>

            {/* Due Dates */}
            <div className="mt-5 space-y-2 rounded-xl">
                <p className="text-gray-700 text-sm font-semibold">Fee Due History</p>
              {s.dueDates.map((d) => {
                const dueDate = d.date?.toDate();
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} />
                      {dueDate?.toLocaleDateString()}
                    </div>

                    <span
                      className={`flex items-center gap-1 text-xs font-medium ${
                        d.isPaid
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {d.isPaid ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                      {d.isPaid ? "Paid" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Action */}
            <button
              onClick={() =>
                router.push(`/dashboard/student/${s.docId}`)
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              <IndianRupee size={16} />
              Make Payment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
