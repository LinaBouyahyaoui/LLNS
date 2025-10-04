import React, { useState, useEffect } from 'react';
import { costOfDelayService } from '../services/costOfDelayService';
import { salaryService } from '../services/salaryService';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CostOfDelay({ onBack }) {
  const [costData, setCostData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [chartData, setChartData] = useState([]);
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [projects, setProjects] = useState(['All Projects']);

  useEffect(() => {
    // Load employees when component mounts
    setEmployees(salaryService.getAllEmployees());
    
    // Load projects from tickets
    loadProjects();
    
    // Calculate initial cost data
    calculateCosts();
  }, []);

  useEffect(() => {
    // Regenerate chart data when cost data or selected project changes
    generateChartData();
  }, [costData, selectedProject]);

  const calculateCosts = () => {
    setLoading(true);
    try {
      const result = costOfDelayService.calculateCostOfDelay();
      setCostData(result);
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = () => {
    const allTickets = costOfDelayService.getAllTickets();
    const uniqueProjects = [...new Set(allTickets.map(ticket => ticket.project || 'Unassigned'))];
    setProjects(['All Projects', ...uniqueProjects]);
  };

  const generateChartData = () => {
    if (!costData || costData.overdueTickets.length === 0) {
      setChartData([]);
      return;
    }

    // Filter tickets by selected project
    const filteredTickets = selectedProject === 'All Projects' 
      ? costData.overdueTickets 
      : costData.overdueTickets.filter(ticket => ticket.project === selectedProject);

    if (filteredTickets.length === 0) {
      setChartData([]);
      return;
    }

    // Find earliest deadline
    const deadlines = filteredTickets.map(ticket => new Date(ticket.deadline));
    const earliestDeadline = new Date(Math.min(...deadlines));
    const today = new Date();
    
    // Generate data points from earliest deadline to today
    const data = [];
    const currentDate = new Date(earliestDeadline);
    
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      let cumulativeCost = 0;
      
      // Calculate cumulative cost for this date
      filteredTickets.forEach(ticket => {
        const ticketDeadline = new Date(ticket.deadline);
        if (currentDate >= ticketDeadline) {
          const daysDelayed = Math.ceil((currentDate - ticketDeadline) / (1000 * 60 * 60 * 24));
          cumulativeCost += ticket.dailyCost * daysDelayed;
        }
      });
      
      data.push({
        date: dateStr,
        cost: cumulativeCost,
        displayDate: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setChartData(data);
  };

  const getEmployeeDailyCost = (employeeName) => {
    return salaryService.getDailyCost(employeeName);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount);
  };

  const deleteTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      costOfDelayService.removeTicket(ticketId);
      loadProjects(); // Reload projects list
      calculateCosts(); // Recalculate costs after deletion
    }
  };

  const sendTestEmail = async (managerData) => {
    try {
      const notification = await costOfDelayService.sendManagerNotification(managerData);
      alert(`Email sent to ${notification.recipient}\n\nSubject: ${notification.subject}\n\nContent:\n${notification.emailContent}`);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Check console for details.');
    }
  };

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
              <span className="text-sm text-slate-500">Cost of Delay Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg transition-all duration-200"
                  aria-label="Back to Ticket Triage"
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
            <h2 className="text-3xl font-bold text-black mb-2">Cost of Delay Dashboard</h2>
            <p className="text-slate-600">Track and manage the cost of delayed tickets in Moroccan Dirham (MAD)</p>
          </header>

          {/* Summary Cards */}
          {costData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-black">Total Overdue Tickets</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                  {costData.overdueTickets.length}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-black">Total Delay Cost</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                  {formatCurrency(costData.totalCost)}
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
                <h3 className="text-lg font-semibold text-black">Managers Notified</h3>
                <p className="text-3xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent mt-2">
                  {costData.managerCosts.length}
                </p>
              </div>
            </div>
          )}

          {/* Chart Visualization */}
          {chartData.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-black">Cost Accumulation Over Time</h3>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80"
                  aria-label="Select project for chart"
                >
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                        <stop offset="50%" stopColor="#f97316" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0.3}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis 
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K MAD`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        backdropFilter: 'blur(10px)'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        formatCurrency(value), 
                        'Cumulative Cost'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#dc2626"
                      strokeWidth={2}
                      fill="url(#costGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-200/50 text-center mb-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">No Data Available</h3>
              <p className="text-slate-600">
                {selectedProject === 'All Projects' 
                  ? 'No overdue tickets found for cost tracking.' 
                  : `No overdue tickets found for project "${selectedProject}".`}
              </p>
            </div>
          )}

          {/* Employee Daily Cost Lookup */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
            <h2 className="text-xl font-bold text-black mb-4">Employee Daily Cost Lookup</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  aria-label="Select employee for daily cost lookup"
                >
                  <option value="">Select an employee...</option>
                  {employees.map(employee => (
                    <option key={employee} value={employee}>{employee}</option>
                  ))}
                </select>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-600">Daily Cost</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                  {selectedEmployee ? formatCurrency(getEmployeeDailyCost(selectedEmployee)) : '0,00 MAD'}
                </p>
              </div>
            </div>
          </div>

          {/* Manager Cost Breakdown */}
          {costData && costData.managerCosts.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
              <h2 className="text-xl font-bold text-black mb-4">Manager Cost Breakdown</h2>
              <div className="space-y-4">
                {costData.managerCosts.map((manager, index) => (
                  <div key={index} className="border border-slate-200/50 rounded-xl p-4 bg-white/50 backdrop-blur-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-black">{manager.managerName}</h3>
                        <p className="text-sm text-slate-600">{manager.managerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                          {formatCurrency(manager.totalCost)}
                        </p>
                        <p className="text-sm text-slate-600">{manager.tickets.length} overdue tickets</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-black mb-2">Overdue Tickets:</h4>
                      <div className="space-y-2">
                        {manager.tickets.map((ticket, ticketIndex) => (
                          <div key={ticketIndex} className="bg-slate-50/80 p-3 rounded-lg border-l-4 border-gradient-to-b from-red-500 to-yellow-400">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-black">Assigned to: {ticket.issuedTo}</p>
                                <p className="text-sm text-slate-600">Delay: {ticket.delayDays} day(s)</p>
                                <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-sm text-slate-600">Daily: {formatCurrency(ticket.dailyCost)}</p>
                                <p className="font-semibold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                                  Total: {formatCurrency(ticket.delayCost)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {manager.managerEmail && (
                      <button
                        onClick={() => sendTestEmail(manager)}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg hover:from-red-700 hover:to-yellow-500 transition-all duration-200 shadow-sm"
                        aria-label={`Send email notification to ${manager.managerName}`}
                      >
                        Send Email Notification
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

         

          {/* No Overdue Tickets */}
          {costData && costData.overdueTickets.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-slate-200/50 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-black mb-2">No Overdue Tickets</h2>
              <p className="text-slate-600">All tickets are on track! No delay costs incurred.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
