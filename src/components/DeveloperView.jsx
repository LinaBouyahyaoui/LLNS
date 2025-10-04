import React from 'react';

export default function DeveloperView({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Developer Portal</h1>
            <p className="text-sm text-slate-500 mt-1">Your development workspace and ticket management interface.</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Back to Role Selection
          </button>
        </div>

        {/* Placeholder Content */}
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Developer Portal Coming Soon</h2>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            This is a placeholder for the developer interface. Future features will include:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Assigned Tickets</h3>
                <p className="text-sm text-slate-600">View and manage tickets assigned to you</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Progress Tracking</h3>
                <p className="text-sm text-slate-600">Track your work progress and time spent</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Code Integration</h3>
                <p className="text-sm text-slate-600">Connect with your development environment</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-slate-800">Team Collaboration</h3>
                <p className="text-sm text-slate-600">Communicate with team members and stakeholders</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
