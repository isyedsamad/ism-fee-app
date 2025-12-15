"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  IndianRupee,
  Calendar,
  School,
  Building2,
} from "lucide-react";

export default function page() {
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    total: 0,
    bmore: 0,
    dav: 0,
    mahadeva: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, [month]);

  const fetchPayments = async () => {
    setLoading(true);

    const start = new Date(`${month}-01T00:00:00`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const q = query(
      collection(db, "payments"),
      where("paymentDate", ">=", Timestamp.fromDate(start)),
      where("paymentDate", "<", Timestamp.fromDate(end))
    );

    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    let total = 0,
      bmore = 0,
      dav = 0,
      mahadeva = 0;

    data.forEach((p) => {
      total += p.amount;
      const firstChar = p.studentId?.[0]?.toLowerCase();

      if (firstChar === "b") bmore += p.amount;
      if (firstChar === "d") dav += p.amount;
      if (firstChar === "m") mahadeva += p.amount;
    });

    setTotals({ total, bmore, dav, mahadeva });
    setPayments(data);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Monthly Payments
        </h1>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
          <Calendar size={18} />
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="outline-none text-sm"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Collection"
          value={totals.total}
          icon={IndianRupee}
        />
        <StatCard
          title="BMore Fee"
          value={totals.bmore}
          icon={School}
        />
        <StatCard
          title="DAV Fee"
          value={totals.dav}
          icon={Building2}
        />
        <StatCard
          title="Mahadeva Fee"
          value={totals.mahadeva}
          icon={School}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Student ID</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Paid By</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {!loading && payments.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500"
                >
                  No payments found
                </td>
              </tr>
            )}

            {payments.map((p) => (
              <tr
                key={p.id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  {p.paymentDate.toDate().toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-semibold uppercase">
                  {p.studentId}
                </td>
                <td className="px-4 py-3 capitalize font-semibold">{p.studentName}</td>
                <td className="px-4 py-3 text-gray-600 capitalize">
                  {p.paidBy?.email?.split("@")[0]}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  ₹{p.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* 🔹 Reusable Card */
function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg flex items-center gap-4 hover:shadow-xl transition">
      <div className="h-12 w-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold">₹{value}</p>
      </div>
    </div>
  );
}
