"use client";

import StatCard from '@/components/StatCard';
import { columns } from '@/components/table/columns';
import { DataTable } from '@/components/table/DataTable';
import { getRecentAppointmentList } from '@/lib/actions/appointment.actions';
import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const Admin = () => {
  const [appointments, setAppointments] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      const data = await getRecentAppointmentList();
      setAppointments(data);
    };

    fetchAppointments();
  }, []);

  if (!appointments) return (
    <div className="flex items-center justify-center h-screen w-full">
      <Image 
        src="/assets/icons/loader.svg" 
        alt="loader" 
        width={40} 
        height={40} 
        className="animate-spin" 
      />
    </div>
  );

  // Filter appointments based on patient name
  const filteredAppointments = appointments.documents.filter((appointment: any) =>
    appointment.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <Link href="/" className="cursor-pointer">
          <Image
            src="/assets/icons/logo-full.svg"
            height={32}
            width={162}
            alt="logo"
            className="h-8 w-fit"
          />
        </Link>

        <p className="text-16-semibold">Admin Dashboard</p>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Welcome 👋</h1>
          <p className="text-dark-700">
            Start the day with managing new appointments
          </p>
        </section>

        <section className="admin-stat">
          <StatCard
            type="appointments"
            count={appointments.scheduledCount}
            label="Scheduled appointments"
            icon={"/assets/icons/appointments.svg"}
          />
          <StatCard
            type="pending"
            count={appointments.pendingCount}
            label="Pending appointments"
            icon={"/assets/icons/pending.svg"}
          />
          <StatCard
            type="cancelled"
            count={appointments.cancelledCount}
            label="Cancelled appointments"
            icon={"/assets/icons/cancelled.svg"}
          />
        </section>

        <div className="w-full space-y-6">
          <div className="flex items-center gap-3 rounded-md border border-dark-500 bg-dark-400 px-4 py-3 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <Search className="text-dark-600" size={24} />
            <input
              type="text"
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-white outline-none placeholder:text-dark-600"
            />
          </div>
          <DataTable columns={columns} data={filteredAppointments} />
        </div>
      </main>
    </div>
  );
};

export default Admin;
