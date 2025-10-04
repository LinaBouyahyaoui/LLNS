import React, { useState, useEffect } from 'react';
import { costOfDelayService } from '../services/costOfDelayService';
import { salaryService } from '../services/salaryService';

export default function CostOfDelay({ onBack }) {
  const [costData, setCostData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    // Load employees when component mounts
    setEmployees(salaryService.getAllEmployees());
    
    // Calculate initial cost data
    calculateCosts();
  }, []);

  const calculateCosts = async () => {
    setLoading(true);
    try {
      const result = await costOfDelayService.processOverdueTickets();
      setCostData(result.costData);
      setNotifications(result.notifications);
    } catch (error) {
      console.error('Error calculating costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeDailyCost = (employeeName) => {
    return salaryService.getDailyCost(employeeName);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Cost of Delay Dashboard</h1>
              <p className="text-slate-600 mt-2">Track and manage the cost of delayed tickets</p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Back to Ticket Triage
              </button>
            )}
          </div>
        </header>

        {/* Summary Cards */}
        {costData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800">Total Overdue Tickets</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{costData.overdueTickets.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800">Total Delay Cost</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(costData.totalCost)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800">Managers Notified</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{costData.managerCosts.length}</p>
            </div>
          </div>
        )}

        {/* Employee Daily Cost Lookup */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Employee Daily Cost Lookup</h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an employee...</option>
                {employees.map(employee => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Daily Cost</p>
              <p className="text-2xl font-bold text-green-600">
                {selectedEmployee ? formatCurrency(getEmployeeDailyCost(selectedEmployee)) : '$0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Manager Cost Breakdown */}
        {costData && costData.managerCosts.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Manager Cost Breakdown</h2>
            <div className="space-y-4">
              {costData.managerCosts.map((manager, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-800">{manager.managerName}</h3>
                      <p className="text-sm text-slate-600">{manager.managerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{formatCurrency(manager.totalCost)}</p>
                      <p className="text-sm text-slate-600">{manager.tickets.length} overdue tickets</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-slate-700 mb-2">Overdue Tickets:</h4>
                    <div className="space-y-2">
                      {manager.tickets.map((ticket, ticketIndex) => (
                        <div key={ticketIndex} className="bg-slate-50 p-3 rounded border-l-4 border-red-400">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-slate-800">Assigned to: {ticket.issuedTo}</p>
                              <p className="text-sm text-slate-600">Delay: {ticket.delayDays} day(s)</p>
                              <p className="text-sm text-slate-600 mt-1">{ticket.description}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-slate-600">Daily: {formatCurrency(ticket.dailyCost)}</p>
                              <p className="font-semibold text-red-600">Total: {formatCurrency(ticket.delayCost)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {manager.managerEmail && (
                    <button
                      onClick={() => sendTestEmail(manager)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send Email Notification
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue Tickets List */}
        {costData && costData.overdueTickets.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">All Overdue Tickets</h2>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Ticket ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Assigned To</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Manager</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Delay Days</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Daily Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Total Cost</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {costData.overdueTickets.map((ticket, index) => (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="px-4 py-3 text-sm text-slate-800">{ticket.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{ticket.issuedto}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{ticket.issuerName}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-semibold">{ticket.delayDays}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{formatCurrency(ticket.dailyCost)}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-semibold">{formatCurrency(ticket.delayCost)}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">{ticket.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Overdue Tickets */}
        {costData && costData.overdueTickets.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Overdue Tickets</h2>
            <p className="text-slate-600">All tickets are on track! No delay costs incurred.</p>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={calculateCosts}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Calculating...' : 'Refresh Cost Calculation'}
          </button>
        </div>
      </div>
    </div>
  );
}
