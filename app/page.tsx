'use client';

import Link from "next/link";
import Image from "next/image";
import { MdChildCare, MdElderly, MdSupervisorAccount, MdChevronRight, MdVerifiedUser } from "react-icons/md";

export default function Home() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col p-6 relative overflow-hidden">
        {/* Background blur elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Header */}
        <header className="relative z-10 pt-10 pb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
            <Image 
              src="/asterix_logo.svg" 
              alt="Asterix" 
              width={64} 
              height={64}
            />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Asterix
          </h1>
          <p className="text-slate-500 font-medium">
            Learn to stay safe online.
          </p>
        </header>

        {/* Main content */}
        <main className="relative z-10 space-y-4 flex-grow">
          {/* Kids Learning */}
          <Link href="/auth/signup?role=kids">
            <button className="w-full text-left group transition-all duration-300 active:scale-95">
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/40 flex items-center gap-5 border border-slate-100 transition-all">
                <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 transition-colors">
                  <MdChildCare className="text-3xl text-amber-500 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">Kids</h3>
                  <p className="text-sm text-slate-500 leading-tight">Fun Games and Challenges</p>
                </div>
                <MdChevronRight className="text-3xl text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          </Link>

          {/* Elderly Protection */}
          <Link href="/auth/signup?role=elderly">
            <button className="w-full text-left group transition-all duration-300 active:scale-95">
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/40 flex items-center gap-5 border border-slate-100 transition-all">
                <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 transition-colors">
                  <MdElderly className="text-3xl text-emerald-500 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">Elderly</h3>
                  <p className="text-sm text-slate-500 leading-tight">Fun Games and Challenges</p>
                </div>
                <MdChevronRight className="text-3xl text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          </Link>

          {/* Caregiver Hub */}
          <Link href="/auth/signup?role=caregiver">
            <button className="w-full text-left group transition-all duration-300 active:scale-95">
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/40 flex items-center gap-5 border border-slate-100 transition-all">
                <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                  <MdSupervisorAccount className="text-3xl text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-slate-900 mb-0.5">Caregiver</h3>
                  <p className="text-sm text-slate-500 leading-tight">Monitor the progress of your loved ones .</p>
                </div>
                <MdChevronRight className="text-3xl text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            </button>
          </Link>
        </main>

        {/* Footer */}
        <footer className="relative z-10 py-10 text-center">
          <p className="text-slate-500 mb-3 text-sm font-medium">Already have an account?</p>
          <Link href="/auth/login">
            <button className="text-blue-600 font-bold bg-blue-50 px-6 py-2 rounded-xl hover:bg-blue-100 transition-all">
              Sign In to Asterix
            </button>
          </Link>
          <div className="mt-8 flex items-center justify-center gap-2 opacity-50">
            <MdVerifiedUser className="text-xs" />
            <span className="text-[10px] uppercase tracking-widest font-bold">Encrypted &amp; Secure</span>
          </div>
        </footer>

        {/* Bottom indicator */}
        <div className="w-32 h-1 bg-slate-300 rounded-full mx-auto mb-2 mt-4"></div>
      </div>
    </div>
  );
}
