import React, { useState, useEffect } from 'react';
import { costOfDelayService } from './services/costOfDelayService';
import { salaryService } from './services/salaryService';
import CostOfDelay from './components/CostOfDelay';
import DataVisualization from './components/DataVisualization';

// Professional, single-file React component using Tailwind CSS for styling.
// Default export is the component so it can be previewed in the canvas.

export default function TicketTriageInterface({ onBack }) {
  const [form, setForm] = useState({
    issuerName: '',
    issuedto: '',
    issuedtoEmail: '',
    issuerEmail: '',
    issuerDepartment: '',
    ticketType: 'Bug',
    deadline: '',
    severity: 'Medium',
    description: '',
    project: '',
  });

  const [result, setResult] = useState(null);
  const [showCostDashboard, setShowCostDashboard] = useState(false);
  const [showDataViz, setShowDataViz] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [issuedTickets, setIssuedTickets] = useState([]);
  const [projects] = useState(['Website Redesign', 'Mobile App', 'API Development', 'Database Migration', 'Security Audit']);

  useEffect(() => {
    // Load employees when component mounts
    setEmployees(salaryService.getAllEmployees());
    // Load issued tickets
    loadIssuedTickets();
  }, []);

  const loadIssuedTickets = () => {
    const allTickets = costOfDelayService.getAllTickets();
    setIssuedTickets(allTickets);
  };

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function needsMoreInfo(form) {
    const reasons = [];
    if (!form.issuerName) reasons.push('Missing issuer name.');
    if (!form.issuedto) reasons.push('Missing issued to field');
    if (!form.issuedtoEmail) reasons.push('Missing issued to Email.');
    if (!form.issuerEmail) reasons.push('Missing issuer contact (email).');
    if (!form.description || form.description.trim().length < 15) reasons.push('Description too short — please provide reproduction steps and expected behaviour.');
    if (!form.deadline) reasons.push('Missing deadline.');
    return reasons;
  }

  function classifyTicket(f) {
    // Basic deterministic classification rules. Customize as needed for hackathon.
    // Priority: 1) Missing critical info -> Request more information
    // 2) Discard if invalid/duplicate/low priority
    // 3) Forward based on keywords

    const lowerDesc = (f.description || '').toLowerCase();
    const infoIssues = needsMoreInfo(f);
    if (infoIssues.length > 0) {
      return {
        action: 'Need more information',
        reasons: infoIssues,
        forwardTo: null,
        discardReason: null,
      };
    }

    // Discard rules
    const discardReasons = [];
    // Example heuristics for discard
    if (/spam|test ticket|ignore|dummy/.test(lowerDesc)) {
      discardReasons.push('Content appears to be spam or a test ticket.');
    }
    if (/feature request.*later|low priority|wish list/.test(lowerDesc) && f.severity === 'Low') {
      discardReasons.push('Low priority feature request better tracked in product backlog.');
    }
    if (discardReasons.length > 0) {
      return {
        action: 'Discard',
        reasons: null,
        forwardTo: null,
        discardReason: discardReasons.join(' '),
      };
    }

    // Forwarding rules (keyword-based)
    const forwarding = {
      Frontend: /frontend|ui|ux|css|html|javascript|react|angular|vue/,
      Backend: /backend|server|api|database|sql|node|python|java|go|dotnet/,
      Infrastructure: /deploy|infrastructure|k8s|kubernetes|aws|azure|gcp|performance|latency/,
      Security: /security|vulnerability|xss|sql injection|sqli|auth|authorization|cve/,
      Data: /data|etl|warehouse|analytics|ml|model|dataset/,
      Product: /feature request|enhancement|improvement|product request/
    };

    for (const [team, regex] of Object.entries(forwarding)) {
      if (regex.test(lowerDesc) || (f.ticketType && team.toLowerCase() === f.ticketType.toLowerCase())) {
        return {
          action: 'Forward',
          reasons: [`Matches keywords for ${team} team.`],
          forwardTo: team,
          discardReason: null,
        };
      }
    }

    // Default triage
    // If severity is high and deadline within 3 days -> Forward to Incident Response / Frontend or Backend based on heuristics
    const daysUntilDeadline = f.deadline ? Math.ceil((new Date(f.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    if (f.severity === 'Critical' || (daysUntilDeadline !== null && daysUntilDeadline <= 3)) {
      // Choose team by simple keyword checks; fallback to "Triage" team
      const probableTeam = /frontend|ui|ux/.test(lowerDesc) ? 'Frontend' : /backend|api|database/.test(lowerDesc) ? 'Backend' : 'Triage';
      return {
        action: 'Forward',
        reasons: [
          f.severity === 'Critical' ? 'Marked as Critical.' : `Deadline within ${daysUntilDeadline} day(s).`,
          `Recommend urgent review by ${probableTeam} team.`
        ],
        forwardTo: probableTeam,
        discardReason: null,
      };
    }

    // Otherwise, keep in backlog or forward to triage
    return {
      action: 'Forward',
      reasons: ['No clear specialized team match; route to Triage team for prioritization.'],
      forwardTo: 'Triage',
      discardReason: null,
    };
  }

  function handleSubmit(e) {
    e.preventDefault();
    const classification = classifyTicket(form);
    setResult(classification);
    
    // Add ticket to cost tracking system
    if (classification.action === 'Forward' && form.deadline) {
      const ticketId = costOfDelayService.addTicket(form);
      console.log(`Ticket ${ticketId} added to cost tracking system`);
      loadIssuedTickets(); // Reload tickets list
    }
  }

  const deleteTicket = (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      costOfDelayService.removeTicket(ticketId);
      loadIssuedTickets();
    }
  };

  const getTicketStatus = (ticket) => {
    if (ticket.status === 'completed') return 'Completed';
    if (!ticket.deadline) return 'No Deadline';
    
    const today = new Date();
    const deadline = new Date(ticket.deadline);
    return today <= deadline ? 'On Time' : 'Delayed';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'On Time': return 'bg-green-100 text-green-800';
      case 'Delayed': return 'bg-red-100 text-red-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showCostDashboard) {
    return <CostOfDelay onBack={() => setShowCostDashboard(false)} />;
  }

  if (showDataViz) {
    return <DataVisualization onBack={() => setShowDataViz(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Glassmorphic Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-800">FlowGuard</h1>
                <div className="h-6 w-1 rounded-sm bg-gradient-to-b from-red-600 via-orange-500 to-yellow-400 transform rotate-12"></div>
              </div>
              <span className="text-sm text-slate-500">Manager Dashboard</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
              
              <button
                onClick={() => setShowCostDashboard(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg hover:from-red-700 hover:to-yellow-500 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Cost Dashboard
              </button>
              
              <button
                onClick={() => setShowDataViz(true)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg hover:from-red-700 hover:to-yellow-500 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Data Visualization
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <header className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ticket Triage Interface</h2>
              <p className="text-slate-600">Classify incoming tickets: discard, request more info, or forward to teams.</p>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Issuer Name</label>
                  <input 
                    name="issuerName" 
                    value={form.issuerName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                    placeholder="Full name" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Issuer Email</label>
                  <input 
                    name="issuerEmail" 
                    value={form.issuerEmail} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                    placeholder="name@example.com" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Issued to</label>
                  <select 
                    name="issuedto" 
                    value={form.issuedto} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select an employee...</option>
                    {employees.map(employee => (
                      <option key={employee} value={employee}>{employee}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Issued to Email</label>
                  <input 
                    name="issuedtoEmail" 
                    value={form.issuedtoEmail} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                    placeholder="email@example.com" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                  <input 
                    name="issuerDepartment" 
                    value={form.issuerDepartment} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                    placeholder="e.g., Sales, Ops" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Project</label>
                  <select 
                    name="project" 
                    value={form.project} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a project...</option>
                    {projects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ticket Type</label>
                  <select 
                    name="ticketType" 
                    value={form.ticketType} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option>Bug</option>
                    <option>Feature Request</option>
                    <option>Incident</option>
                    <option>Task</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Deadline</label>
                  <input 
                    type="date" 
                    name="deadline" 
                    value={form.deadline} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Severity</label>
                  <select 
                    name="severity" 
                    value={form.severity} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    rows={8} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none" 
                    placeholder="Provide detailed steps to reproduce, environment, screenshots or logs if available."
                  ></textarea>
                </div>
              </div>

              <div className="lg:col-span-2 flex justify-center gap-4 pt-6">
                <button 
                  type="submit" 
                  className="px-8 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg hover:from-red-700 hover:to-yellow-500 transition-all duration-200 shadow-lg font-medium"
                >
                  Classify Ticket
                </button>
                <button 
                  type="button" 
                  onClick={() => { 
                    setForm({ 
                      issuerName: '', 
                      issuedtoEmail: '', 
                      issuedto: '', 
                      issuerEmail: '', 
                      issuerDepartment: '', 
                      ticketType: 'Bug', 
                      deadline: '', 
                      severity: 'Medium', 
                      description: '',
                      project: ''
                    }); 
                    setResult(null); 
                  }} 
                  className="px-8 py-3 border-2 border-slate-200 text-slate-600 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Reset Form
                </button>
              </div>
            </form>

            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Classification Result</h2>

              {!result && (
                <div className="text-center py-12 bg-slate-50 rounded-xl">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">No classification yet. Fill the form and click <strong>Classify Ticket</strong>.</p>
                </div>
              )}

              {result && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-6 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Classification Action</h3>
                    <div className="mb-4">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-red-100 to-yellow-100 text-slate-800">
                        {result.action}
                      </span>
                    </div>

                    {result.discardReason && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h4 className="font-medium text-red-800 mb-2">Discard Reason</h4>
                        <p className="text-sm text-red-700">{result.discardReason}</p>
                      </div>
                    )}

                    {result.reasons && result.reasons.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-slate-800 mb-3">Rationale</h4>
                        <ul className="space-y-2">
                          {result.reasons.map((r, i) => (
                            <li key={i} className="flex items-start space-x-2 text-sm text-slate-700">
                              <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.forwardTo && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">Forward to Team</h4>
                        <p className="text-sm text-green-700">{result.forwardTo}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-6 rounded-xl border border-slate-200 bg-white">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Ticket Summary</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Issuer:</span>
                          <p className="text-slate-800">{form.issuerName || '-'}</p>
                          {form.issuerEmail && <p className="text-slate-500 text-xs">{form.issuerEmail}</p>}
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Issued to:</span>
                          <p className="text-slate-800">{form.issuedto || '-'}</p>
                          {form.issuedtoEmail && <p className="text-slate-500 text-xs">{form.issuedtoEmail}</p>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-600">Department:</span>
                          <p className="text-slate-800">{form.issuerDepartment || '-'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Type / Severity:</span>
                          <p className="text-slate-800">{form.ticketType} / {form.severity}</p>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium text-slate-600">Deadline:</span>
                        <p className="text-slate-800">{form.deadline || '-'}</p>
                      </div>
                      
                      <div className="text-sm">
                        <span className="font-medium text-slate-600">Description:</span>
                        <div className="mt-2 p-4 bg-slate-50 rounded-lg text-slate-700 whitespace-pre-wrap min-h-[100px]">
                          {form.description || '-'}
                        </div>
                      </div>
                    </div>

                    <details className="mt-6 text-sm text-slate-500">
                      <summary className="cursor-pointer font-medium hover:text-slate-700 transition-colors">How the classification works</summary>
                      <div className="mt-3 p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          This interface uses deterministic rules for the hackathon demo: it first validates whether critical fields are present, 
                          then applies discard heuristics for obvious spam or low-priority feature requests, and finally routes tickets by keyword 
                          matching to likely teams (Frontend, Backend, Infrastructure, Security, Data, Product). Rules are intentionally simple 
                          and editable in the source code to integrate with a more advanced ML model or business rules engine later.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>
              )}
            </section>

            {/* Issued Tickets List */}
            {issuedTickets.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-bold text-black mb-6">Issued Tickets</h2>
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-slate-50/80">
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Ticket ID</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Project</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Assigned To</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Type</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Deadline</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-black">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/50">
                        {issuedTickets.map((ticket, index) => {
                          const status = getTicketStatus(ticket);
                          return (
                            <tr key={ticket.id || index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm text-black font-medium">{ticket.id}</td>
                              <td className="px-6 py-4 text-sm text-black">{ticket.project || 'Unassigned'}</td>
                              <td className="px-6 py-4 text-sm text-black">{ticket.issuedto}</td>
                              <td className="px-6 py-4 text-sm text-black">{ticket.ticketType}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-black">
                                {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : 'No deadline'}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => deleteTicket(ticket.id)}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                                  aria-label={`Delete ticket ${ticket.id}`}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

