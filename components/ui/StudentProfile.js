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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, CheckCircle, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [dues, setDues] = useState([]);
  const [show, setShow] = useState(false);
  const [amount, setAmount] = useState("");
  const [nextDate, setNextDate] = useState("");

  const studentRef = doc(db, "students", id);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const s = await getDoc(studentRef);
    setStudent(s.data());

    const d = await getDocs(collection(studentRef, "due_dates"));
    setDues(d.docs.map((x) => ({ id: x.id, ...x.data() })));
  };

  const makePayment = async () => {
    // Mark old dues paid
    dues
      .filter((d) => !d.isPaid)
      .forEach((d) =>
        updateDoc(doc(studentRef, "due_dates", d.id), {
          isPaid: true,
        })
      );

    const newDues = student.dues - Number(amount);

    // New due
    await addDoc(collection(studentRef, "due_dates"), {
      date: Timestamp.fromDate(new Date(nextDate)),
      dues: newDues,
      isPaid: false,
      createdAt: serverTimestamp(),
      setBy: { uid: user.uid, email: user.email },
    });

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

    await updateDoc(studentRef, {
      dues: newDues,
      dues_date: Timestamp.fromDate(new Date(nextDate)),
    });

    setShow(false);
    load();
  };

  if (!student) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h2 className="text-xl font-semibold">{student.name}</h2>
        <p>ID: {student.id}</p>
        <p>Course: {student.course}</p>
        <p className="text-red-600">Dues: ₹{student.dues}</p>

        <button
          onClick={() => setShow(true)}
          className="mt-4 bg-black text-white px-4 py-2 rounded-md"
        >
          Make Payment
        </button>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Due Timeline</h3>
          {dues.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 text-sm mb-2"
            >
              {d.isPaid ? (
                <CheckCircle className="text-green-500" size={16} />
              ) : (
                <Clock className="text-red-500" size={16} />
              )}
              <span>
                {d.date.toDate().toDateString()} — ₹{d.dues}
              </span>
            </div>
          ))}
        </div>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 relative">
            <X
              className="absolute top-3 right-3 cursor-pointer"
              onClick={() => setShow(false)}
            />

            <h3 className="font-semibold mb-3">Make Payment</h3>

            <p>Current Due: ₹{student.dues}</p>

            <input
              placeholder="Amount Paid"
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border px-3 py-2 mt-2 rounded-md"
            />

            <input
              type="date"
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full border px-3 py-2 mt-2 rounded-md"
            />

            <button
              onClick={makePayment}
              className="w-full bg-black text-white mt-4 py-2 rounded-md"
            >
              Save Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
