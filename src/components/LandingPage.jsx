import React from 'react';

export default function LandingPage({ onRoleSelect }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-6">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="flex justify-center items-center mb-6 space-x-4">
              <h1 className="text-6xl font-extrabold text-black tracking-tight">
                FlowGuard
              </h1>
              {/* Gradient Slash */}
              <div className="h-14 w-2 rounded-sm bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400 transform rotate-12 translate-y-1"></div>
            </div>

            <h2 className="text-2xl font-semibold text-slate-700 mb-6">
              Your Ticket Management System
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-2">
              Welcome to HPS ticket management system.
            </p>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Please select your role to continue.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-2xl mx-auto">
            {/* Manager Card */}
            <div
              onClick={() => onRoleSelect('manager')}
              className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-10 border border-slate-200 hover:border-slate-300"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:from-red-200 group-hover:to-yellow-200 transition-colors">
                  <svg
                    className="w-10 h-10 text-red-500 group-hover:text-yellow-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                  Manager
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Triage, classify, prioritize, and route incoming tickets.
                </p>
                <div className="mt-8">
                  <span className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg text-base font-medium group-hover:from-red-700 group-hover:to-yellow-500 transition-colors">
                    Access Manager Dashboard
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            {/* Developer Card */}
            <div
              onClick={() => onRoleSelect('developer')}
              className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-10 border border-slate-200 hover:border-slate-300"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:from-red-200 group-hover:to-yellow-200 transition-colors">
                  <svg
                    className="w-10 h-10 text-yellow-600 group-hover:text-red-600 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">
                  Developer
                </h3>
                <p className="text-slate-600 text-base leading-relaxed">
                  Access assigned tickets, track progress, and manage workflow.
                </p>
                <div className="mt-8">
                  <span className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg text-base font-medium group-hover:from-red-700 group-hover:to-yellow-500 transition-colors">
                    Access Developer Portal
                    <svg
                      className="w-5 h-5 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-slate-200 bg-slate-50">
        <p className="text-sm text-slate-500">
          HPS • Professional Ticket Management System
        </p>
      </footer>
    </div>
  );
}
