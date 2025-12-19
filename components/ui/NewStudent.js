"use client";
import { useEffect, useState } from "react";
import Loading from './Loading';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export default function NewStudent() {
    const router = useRouter();
    const { user, loading, logout, setLoading } = useAuth();
    const [form, setForm] = useState({
        id: "",
        name: "",
        course: "",
        totalFee: "",
        mode: "",
        time: "",
        mobile: '',
        admDate: new Date(),
        admFee: "",
        dues: "",
        dueDate: "",
    });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const studentRef = await addDoc(collection(db, "students"), {
            id: form.id.toLowerCase(),
            name: form.name.toLowerCase(),
            course: form.course,
            mobile: form.mobile,
            batchtime: form.time,
            totalFee: Number(form.totalFee),
            admFee: Number(form.admFee),
            dues: Number(form.dues),
            dues_date: Timestamp.fromDate(new Date(form.dueDate)),
            mode: form.mode,
            admDate: Timestamp.fromDate(new Date(form.admDate)),
            createdAt: serverTimestamp(),
            addedBy: {
                uid: user.uid,
                email: user.email,
            },
            });

            // 2️⃣ Add due date sub-collection
            await addDoc(collection(studentRef, "due_dates"), {
            date: Timestamp.fromDate(new Date(form.dueDate)),
            isPaid: false,
            dues: Number(form.dues),
            createdAt: serverTimestamp(),
            setBy: {
                uid: user.uid,
                email: user.email,
            },
            });

            // 3️⃣ Initial payment history (admission fee)
            const paymentData = {
            uId: studentRef.id,
            studentId: form.id.toLowerCase(),
            studentName: form.name.toLowerCase(),
            amount: Number(form.admFee),
            paymentDate: serverTimestamp(),
            createdAt: serverTimestamp(),
            paidBy: {
                uid: user.uid,
                email: user.email,
            },
            };
            await addDoc(collection(studentRef, "payment_history"), paymentData);
            await addDoc(collection(db, "payments"), paymentData);
            alert("Student added successfully");
            router.refresh();
        } catch (err) {
            alert(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        const total = Number(form.totalFee) || 0;
        const adm = Number(form.admFee) || 0;
        setForm((prev) => ({
        ...prev,
        dues: total - adm,
        }));
  }, [form.totalFee, form.admFee]);
  return (
    <>
    {loading && (
        <Loading />
    )}
    <div className='py-5 bg-gray-200 px-5 flex justify-center items-start'>
        <div className='pb-6 bg-white rounded-lg w-full max-w-lg flex justify-center items-center flex-col gap-5'>
        <div className="bg-(--primary) w-full flex justify-center items-center py-5 rounded-t-lg">
            <h1 className='font-semibold text-md text-white'>Add New Student</h1>
        </div>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 px-6">

        {/* Student ID */}
        <div>
        <p className="text-sm font-semibold">Student ID</p>
        <input
          type="text"
          name="id"
          value={form.id}
          onChange={handleChange}
          placeholder="Student ID"
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>

        {/* Name */}
        <div>
        <p className="text-sm font-semibold">Student Name</p>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Student Name"
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>

        <div>
        <p className="text-sm font-semibold">Student Mobile</p>
        <input
          type="number"
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Student Mobile Number"
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>

        <div>
        <p className="text-sm font-semibold">Student Batch Time</p>
        <input
          type="time"
          name="batchtime"
          value={form.time}
          onChange={handleChange}
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>

        {/* Course */}
        <div>
        <p className="text-sm font-semibold">Course</p>
        <select
          name="course"
          value={form.course}
          onChange={handleChange}
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        >
          <option value="">Select Course</option>
          <option value="DCA">DCA</option>
          <option value="DCA with Tally">DCA with Tally</option>
          <option value="ADCA">ADCA</option>
          <option value="Tally">Tally</option>
          <option value="Office">Office</option>
          <option value="AutoCAD">AutoCAD</option>
          <option value="DFA">DFA</option>
          <option value="Web Designing">Web Designing</option>
          <option value="Excel">Excel</option>
        </select>
        </div>

        {/* Total Fee */}
        <div>
        <p className="text-sm font-semibold">Total Fee</p>
        <input
          type="number"
          name="totalFee"
          value={form.totalFee}
          onChange={handleChange}
          placeholder="Total Fee"
          className="w-full rounded-md border-2 border-green-300 px-4 py-2 text-sm"
        />
        </div>

        {/* Payment Mode */}
        <div>
        <p className="text-sm font-semibold">Payment Mode</p>
        <select
          name="mode"
          value={form.mode}
          onChange={handleChange}
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        >
          <option value="">Payment Mode</option>
          <option value="One Time">One Time</option>
          <option value="One Month">One Month</option>
          <option value="Two Months">Two Months</option>
          <option value="Three Months">Three Months</option>
          <option value="Six Months">Six Months</option>
          <option value="1 Year">One Year</option>
        </select>
        </div>

        {/* Admission Fee */}
        <div>
        <p className="text-sm font-semibold">Adm Fee Deposited</p>
        <input
          type="number"
          name="admFee"
          value={form.admFee}
          onChange={handleChange}
          placeholder="Fee - 1st Installment"
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>

        {/* Dues */}
        <div>
        <p className="text-sm font-semibold">Fee Due</p>
        <input
          type="number"
          name="dues"
          disabled
          value={form.dues}
          onChange={handleChange}
          placeholder="Remaining Dues"
          className="w-full rounded-md border-2 border-red-300 px-4 py-2 text-sm"
        />
        </div>

        {/* Due Date */}
        <div>
        <p className="text-sm font-semibold">Due Date</p>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="w-full rounded-md border-2 border-gray-200 px-4 py-2 text-sm"
        />
        </div>
      </form>
      <div className="">
            <button
                onClick={handleSubmit}
                className="mt-2 w-full rounded-md bg-black py-2 px-5 text-sm font-medium text-white hover:bg-gray-900"
            >
                Save Student
            </button>
        </div>
    </div>
    </div>
    </>
  );
}
