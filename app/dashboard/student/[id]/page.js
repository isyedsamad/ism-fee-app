"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  X,
  CheckCircle2,
  Clock,
  IndianRupee,
  CalendarDays,
  User,
  GraduationCap,
  Wallet,
  ArrowDownCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";

export default function StudentDetail() {
  const { id } = useParams();
  const { user, loading, setLoading } = useAuth();

  const [student, setStudent] = useState(null);
  const [duesList, setDuesList] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [show, setShow] = useState(false);

  const [amount, setAmount] = useState("");
  const [nextDate, setNextDate] = useState("");

  const studentRef = doc(db, "students", id);

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  const load = async () => {
    const s = await getDoc(studentRef);
    setStudent({ docId: s.id, ...s.data() });

    const d = await getDocs(collection(studentRef, "due_dates"));
    setDuesList(
      d.docs
        .map((x) => ({ id: x.id, ...x.data() }))
        .sort((a, b) => b.date.seconds - a.date.seconds)
    );

    const p = await getDocs(collection(studentRef, "payment_history"));
    setPaymentHistory(
      p.docs
        .map((x) => ({ id: x.id, ...x.data() }))
        .sort((a, b) => b.paymentDate.seconds - a.paymentDate.seconds)
    );
    setLoading(false);
  };

  const newDue = student
    ? Math.max(student.dues - Number(amount || 0), 0)
    : 0;

  const getLatestDueDoc = async () => {
    const q = query(
        collection(studentRef, "due_dates"),
        orderBy("date", "desc"),
        limit(1)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    return {
        id: snap.docs[0].id,
        ...snap.docs[0].data(),
    };
    };

  const makePayment = async () => {
    if(Number(newDue) > 0 && nextDate == '') {
        alert('Please select Next Due Date!'); 
        return;
    }
    setLoading(true);

    // 1️⃣ Mark all pending dues as paid
    // await Promise.all(
    //   duesList
    //     .filter((d) => !d.isPaid)
    //     .map((d) =>
    //       updateDoc(doc(studentRef, "due_dates", d.id), { isPaid: true })
    //     )
    // );

    if(amount != '' && Number(amount) > 0) {
        const latestDue = await getLatestDueDoc();
        // ✅ Mark ONLY latest due as paid
        if (latestDue && !latestDue.isPaid) {
            await updateDoc(
            doc(studentRef, "due_dates", latestDue.id),
            { isPaid: true }
            );
        }
    }

    if(Number(newDue) > 0) {
        // 2️⃣ Add new due date
        await addDoc(collection(studentRef, "due_dates"), {
        date: Timestamp.fromDate(new Date(nextDate)),
        dues: newDue,
        isPaid: false,
        createdAt: serverTimestamp(),
        setBy: { uid: user.uid, email: user.email },
        });
    }

    // 3️⃣ Payment history
    if(amount != '') {
        const payment = {
        uId: id,
        studentId: student.id,
        studentName: student.name,
        amount: Number(amount),
        paymentDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        paidBy: { uid: user.uid, email: user.email },
        };

        await addDoc(collection(studentRef, "payment_history"), payment);
        await addDoc(collection(db, "payments"), payment);
    }
    // 4️⃣ Update student master
    await updateDoc(studentRef, {
      dues: newDue,
      dues_date: nextDate != '' ? Timestamp.fromDate(new Date(nextDate)) : '',
    });

    setShow(false);
    setAmount("");
    setNextDate("");
    load();
  };

  if (!student) return null;

  return (
    <>
    {loading && (
        <Loading />
    )}
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      {/* 🔹 Student Summary Card */}
      <div className="bg-white rounded-xl shadow-md p-6 grid gap-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 capitalize">
                  {student.name}
                </h2>
                <p className="text-sm text-gray-500 font-semibold">
                  <span className="uppercase">{student.id}</span> · {student.course}
                </p>
              </div>
              <User className="text-gray-400" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Fee</p>
                <p className="font-semibold">
                  ₹{student.totalFee}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Dues</p>
                <p className="font-semibold text-red-600">
                  ₹{student.dues}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Admission Date</p>
                <p className="font-medium">
                  {student.admDate?.toDate().toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Fee Mode</p>
                <p className="font-medium">
                  {student.mode}
                </p>
              </div>
            </div>
      </div>

      {/* 🔹 Action */}
      <div className="flex justify-end">
        <button
          onClick={() => setShow(true)}
          className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-white shadow-lg hover:scale-[1.02] transition"
        >
          <ArrowDownCircle size={18} />
          Make Payment
        </button>
      </div>

      {/* 🔹 Due Timeline */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={18} />
          Due Timeline
        </h3>

        <div className="space-y-3">
          {duesList.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-gray-400 px-5 py-3"
            >
              <div className="flex items-center gap-3">
                {d.isPaid ? (
                  <CheckCircle2 className="text-green-500" />
                ) : (
                  <Clock className="text-red-500" />
                )}
                <span className="text-sm font-semibold">
                  {d.date.toDate().toDateString()}
                </span>
              </div>

              {/* <span
                className={`text-sm font-semibold ${
                  d.isPaid ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{d.dues} {d.isPaid ? "(Paid)" : "(Pending)"}
              </span> */}
            </div>
          ))}
        </div>
      </div>


      {/* 🔹 Payment History */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
          <CalendarDays size={18} />
          Payment History
        </h3>

        <div className="space-y-3">
          {paymentHistory.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-gray-400 px-5 py-3"
            >
              <div className="w-full flex items-start gap-1 text-sm flex-col">
                <span className="text-md font-semibold text-red-500">
                  {p.paymentDate.toDate().toDateString()}
                </span>
                <div className="flex-1 w-full flex justify-start items-center">
                <div className="flex-1">
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium flex gap-1 justify-start items-center">
                    <IndianRupee size={14} />{p.amount}
                    </p>
                </div>
                <div className="flex-1">
                    <p className="text-gray-500">Logged by</p>
                    <p className="font-medium capitalize">
                    {p.paidBy.email.split('@')[0]}
                    </p>
                </div>
                </div>
              </div>

              {/* <span
                className={`text-sm font-semibold ${
                  d.isPaid ? "text-green-600" : "text-red-600"
                }`}
              >
                ₹{d.dues} {d.isPaid ? "(Paid)" : "(Pending)"}
              </span> */}
            </div>
          ))}
        </div>
      </div>

      {/* 🔹 Payment Modal */}
      {show && (
        <div className="fixed inset-0 z-50 px-5 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <X
              onClick={() => setShow(false)}
              className="absolute right-5 top-6 cursor-pointer text-gray-400 hover:text-black"
            />

            <h3 className="text-md font-semibold mb-8 flex items-center gap-2">
              <IndianRupee size={18} />
              Make Payment
            </h3>

            <div className="space-y-4">
              <InfoRow label="Current Due" value={`₹${student.dues}`} />

              <input
                type="number"
                placeholder="Amount Paid"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2"
              />

              <InfoRow label="New Due" value={`₹${newDue}`} highlight />

                <div>
                <p className="text-sm font-semibold">Next Due Date</p>
              <input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-2"
              />
              </div>

              <button
                onClick={makePayment}
                className="w-full rounded-xl bg-black py-3 text-white font-medium shadow-lg hover:scale-[1.02] transition"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

/* 🔹 Small Components */

function Stat({ icon: Icon, label, value, highlight }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="flex items-center gap-2 text-gray-500 text-sm">
        <Icon size={16} />
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-semibold ${
          highlight ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-semibold ${
          highlight ? "text-red-600" : "text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
