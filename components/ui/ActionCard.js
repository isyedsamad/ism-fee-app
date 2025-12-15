"use client";

import { UserPlus, IndianRupee, Search } from "lucide-react";
import Link from "next/link";

const cards = [
  {
    title: "Add Student",
    desc: "Register a new student into the system",
    icon: UserPlus,
    bg: "from-indigo-500 to-indigo-600",
    link: "/dashboard/new-student"
  },
  {
    title: "Check Fee Due",
    desc: "View students with pending fee payments",
    icon: IndianRupee,
    bg: "from-rose-500 to-rose-600",
    link: "/dashboard/check-fee"
  },
  {
    title: "Search Student",
    desc: "Quickly find a student by name or ID",
    icon: Search,
    bg: "from-emerald-500 to-emerald-600",
    link: "/dashboard/search"
  },
];

export default function ActionCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link href={card.link} key={i}><div
            key={i}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* Gradient glow */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 transition group-hover:opacity-10`}
            />

            <div className="relative z-10">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${card.bg} text-white shadow-md`}
              >
                <Icon size={22} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {card.title}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {card.desc}
              </p>
            </div>
          </div>
          </Link>
        );
      })}
    </div>
  );
}
