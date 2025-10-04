import React, { useState, useEffect } from 'react';
import { costOfDelayService } from '../services/costOfDelayService';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DataVisualization({ onBack }) {
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [projects, setProjects] = useState(['All Projects']);
  const [ticketData, setTicketData] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [completionRates, setCompletionRates] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [lowestPerformers, setLowestPerformers] = useState([]);

  useEffect(() => {
    loadProjects();
    loadTicketData();
  }, []);

  useEffect(() => {
    generateVisualizationData();
  }, [selectedProject, ticketData]);

  const loadProjects = () => {
    const allTickets = costOfDelayService.getAllTickets();
    const uniqueProjects = [...new Set(allTickets.map(ticket => ticket.project || 'Unassigned'))];
    setProjects(['All Projects', ...uniqueProjects]);
  };

  const loadTicketData = () => {
    const allTickets = costOfDelayService.getAllTickets();
    setTicketData(allTickets);
  };

  const generateVisualizationData = () => {
    const filteredTickets = selectedProject === 'All Projects' 
      ? ticketData 
      : ticketData.filter(ticket => ticket.project === selectedProject);

    // Generate progress curve data (last 30 days)
    const progressCurve = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Count tickets created by this date
      const ticketsByDate = filteredTickets.filter(ticket => {
        const createdDate = new Date(ticket.createdAt);
        return createdDate <= date;
      });
      
      // Count completed tickets by this date
      const completedByDate = ticketsByDate.filter(ticket => 
        ticket.status === 'completed' && new Date(ticket.completedAt) <= date
      );
      
      progressCurve.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: ticketsByDate.length,
        completed: completedByDate.length,
        inProgress: ticketsByDate.length - completedByDate.length
      });
    }
    
    setProgressData(progressCurve);

    // Generate completion rates by type
    const typeStats = {};
    filteredTickets.forEach(ticket => {
      if (!typeStats[ticket.ticketType]) {
        typeStats[ticket.ticketType] = { total: 0, completed: 0 };
      }
      typeStats[ticket.ticketType].total++;
      if (ticket.status === 'completed') {
        typeStats[ticket.ticketType].completed++;
      }
    });

    const completionRatesData = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      total: stats.total,
      completed: stats.completed
    }));

    setCompletionRates(completionRatesData);

    // Calculate performer stats
    const employeeStats = {};
    filteredTickets.forEach(ticket => {
      if (!employeeStats[ticket.issuedto]) {
        employeeStats[ticket.issuedto] = { 
          total: 0, 
          completed: 0, 
          avgResolutionTime: 0,
          delays: 0
        };
      }
      
      employeeStats[ticket.issuedto].total++;
      
      if (ticket.status === 'completed') {
        employeeStats[ticket.issuedto].completed++;
        if (ticket.completedAt) {
          const created = new Date(ticket.createdAt);
          const completed = new Date(ticket.completedAt);
          const resolutionTime = (completed - created) / (1000 * 60 * 60 * 24);
          employeeStats[ticket.issuedto].avgResolutionTime += resolutionTime;
        }
      }
      
      // Check for delays
      if (ticket.deadline && ticket.status !== 'completed') {
        const deadline = new Date(ticket.deadline);
        if (today > deadline) {
          employeeStats[ticket.issuedto].delays++;
        }
      }
    });

    // Calculate averages and sort performers
    const performers = Object.entries(employeeStats).map(([name, stats]) => ({
      name,
      completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
      avgResolutionTime: stats.completed > 0 ? stats.avgResolutionTime / stats.completed : 0,
      delays: stats.delays,
      total: stats.total
    }));

    // Top performers (high completion rate, low resolution time, few delays)
    const topPerformersData = performers
      .filter(p => p.total >= 2) // Only consider employees with at least 2 tickets
      .sort((a, b) => (b.completionRate + (100 - a.avgResolutionTime) + (100 - a.delays * 10)) - 
                     (a.completionRate + (100 - b.avgResolutionTime) + (100 - b.delays * 10)))
      .slice(0, 3);

    // Lowest performers
    const lowestPerformersData = performers
      .filter(p => p.total >= 2)
      .sort((a, b) => (a.completionRate + a.avgResolutionTime + a.delays * 10) - 
                     (b.completionRate + b.avgResolutionTime + b.delays * 10))
      .slice(0, 3);

    setTopPerformers(topPerformersData);
    setLowestPerformers(lowestPerformersData);
  };

  const COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Glassmorphic Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-black">FlowGuard</h1>
                <div className="h-6 w-1 rounded-sm bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400 transform rotate-12"></div>
              </div>
              <span className="text-sm text-slate-500">Data Visualization</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg transition-all duration-200"
                  aria-label="Back to Manager Dashboard"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-black mb-2">Project Analytics Dashboard</h2>
                <p className="text-slate-600">Track progress, completion rates, and team performance over time</p>
              </div>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80"
                aria-label="Select project for analytics"
              >
                {projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>
          </header>

          {/* Progress Curve Chart */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
            <h3 className="text-xl font-bold text-black mb-6">Progress Over Time</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#16a34a" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#15803d" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#2563eb" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#totalGradient)"
                    name="Total Tickets"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#progressGradient)"
                    name="Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Completion Rates and Performer Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Completion Rates by Type */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
              <h3 className="text-xl font-bold text-black mb-6">Completion Rates by Type</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="type" 
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      formatter={(value) => [`${value.toFixed(1)}%`, 'Completion Rate']}
                    />
                    <Bar 
                      dataKey="completionRate" 
                      fill="url(#progressGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-6">
              {/* Top Performers */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="text-lg font-bold text-black mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-black">{performer.name}</p>
                          <p className="text-sm text-slate-600">{performer.total} tickets</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{performer.completionRate.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500">completion rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lowest Performers */}
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="text-lg font-bold text-black mb-4">Need Improvement</h3>
                <div className="space-y-3">
                  {lowestPerformers.map((performer, index) => (
                    <div key={performer.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-black">{performer.name}</p>
                          <p className="text-sm text-slate-600">{performer.total} tickets</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{performer.completionRate.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500">completion rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black">Total Tickets</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                {ticketData.filter(t => selectedProject === 'All Projects' || t.project === selectedProject).length}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black">Completed</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                {ticketData.filter(t => (selectedProject === 'All Projects' || t.project === selectedProject) && t.status === 'completed').length}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black">In Progress</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                {ticketData.filter(t => (selectedProject === 'All Projects' || t.project === selectedProject) && t.status !== 'completed').length}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-black">Avg. Resolution</h4>
              <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                {(() => {
                  const completedTickets = ticketData.filter(t => 
                    (selectedProject === 'All Projects' || t.project === selectedProject) && 
                    t.status === 'completed' && t.completedAt
                  );
                  if (completedTickets.length === 0) return '0';
                  
                  const avgTime = completedTickets.reduce((sum, ticket) => {
                    const created = new Date(ticket.createdAt);
                    const completed = new Date(ticket.completedAt);
                    return sum + (completed - created) / (1000 * 60 * 60 * 24);
                  }, 0) / completedTickets.length;
                  
                  return `${avgTime.toFixed(1)}d`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
