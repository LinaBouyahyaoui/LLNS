import React, { useEffect } from 'react';
import Splinechar from './Splinechar';
import Spline from '@splinetool/react-spline';

export default function LandingPage({ onRoleSelect }) {

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between relative overflow-hidden">
      {/* Background 3D Scene (extends under footer too) */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Splinechar />
      </div>

      {/* Header - Fixed at top */}
      <div className="relative z-10 pt-8 px-6">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-4">
            <h1 className="text-6xl font-extrabold text-black tracking-tight drop-shadow-lg">
              FlowGuard
            </h1>
            <div className="h-14 w-2 rounded-sm bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400 transform rotate-12 translate-y-1 drop-shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-grow flex items-center justify-center px-6 pt-40">
        <div className="max-w-3xl w-full">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 max-w-2xl mx-auto">
            {/* Manager Card */}
            <div
              onClick={() => onRoleSelect('manager')}
              className="group cursor-pointer bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 border border-slate-200/50 hover:border-slate-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-red-200 group-hover:to-yellow-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-red-500 group-hover:text-yellow-500 transition-colors"
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
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  Manager
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Triage, classify, prioritize, and route incoming tickets with advanced analytics.
                </p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg text-base font-medium group-hover:from-red-700 group-hover:to-yellow-500 transition-colors">
                    Access Manager Portal
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
              className="group cursor-pointer bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-4 border border-slate-200/50 hover:border-slate-300"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:from-red-200 group-hover:to-yellow-200 transition-colors">
                  <svg
                    className="w-8 h-8 text-yellow-600 group-hover:text-red-600 transition-colors"
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
                <h3 className="text-xl font-semibold text-slate-800 mb-3">
                  Developer
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Access assigned tickets, track progress, and grow your team garden.
                </p>
                <div className="mt-4">
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
      <footer className="relative z-10 text-center py-6 border-t border-slate-200/50 bg-slate-50/70 backdrop-blur-sm">
        <p className="text-sm text-slate-500 drop-shadow-sm">
          HPS • Professional Ticket Management System
        </p>
      </footer>
    </div>
  );
}