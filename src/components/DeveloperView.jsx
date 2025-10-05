import React, { useState, useEffect } from 'react';
import { costOfDelayService } from '../services/costOfDelayService';
import { salaryService } from '../services/salaryService';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder } from '@react-three/drei';

export default function DeveloperView({ onBack }) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [teamGarden, setTeamGarden] = useState([]);
  const [showThankYou, setShowThankYou] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState(null);

  useEffect(() => {
    // Load employees when component mounts
    setEmployees(salaryService.getAllEmployees());
    // Load completed tasks count from localStorage
    const savedCompleted = localStorage.getItem('completedTasks');
    if (savedCompleted) {
      setCompletedTasks(parseInt(savedCompleted));
      generateGarden(parseInt(savedCompleted));
    }
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      loadAssignedTickets();
    }
  }, [selectedEmployee]);


  const loadAssignedTickets = () => {
    const allTickets = costOfDelayService.getAllTickets();
    const employeeTickets = allTickets.filter(ticket => 
      ticket.issuedto === selectedEmployee && ticket.status !== 'completed'
    );
    setAssignedTickets(employeeTickets);
  };

  const markTaskAsDone = (ticketId) => {
    if (window.confirm('Mark this task as completed?')) {
      // Find the task being completed
      const completedTask = assignedTickets.find(ticket => ticket.id === ticketId);
      
      // Mark ticket as completed in the service
      costOfDelayService.completeTicket(ticketId);
      
      // Update local state
      setAssignedTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setCompletedTasks(prev => {
        const newCount = prev + 1;
        localStorage.setItem('completedTasks', newCount.toString());
        generateGarden(newCount);
        return newCount;
      });
      
      // Show thank you message
      setLastCompletedTask(completedTask);
      setShowThankYou(true);
      
      // Hide thank you message after 3 seconds
      setTimeout(() => {
        setShowThankYou(false);
        setLastCompletedTask(null);
      }, 3000);
    }
  };


  const generateGarden = (completedCount) => {
    const garden = [];
    for (let i = 0; i < completedCount; i++) {
      garden.push({
        id: i,
        x: (Math.random() - 0.5) * 8,
        z: (Math.random() - 0.5) * 8,
        scale: 0.5 + Math.random() * 0.5,
        type: Math.random() > 0.5 ? 'flower' : 'tree',
        color: ['#dc2626', '#f97316', '#eab308', '#22c55e'][Math.floor(Math.random() * 4)]
      });
    }
    setTeamGarden(garden);
  };

  // 3D Garden Components
  const Flower = ({ position, scale, color }) => (
    <group position={position} scale={scale}>
      <Cylinder args={[0.1, 0.1, 0.8]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Sphere args={[0.2]} position={[0, 0.8, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Sphere args={[0.15]} position={[-0.15, 0.7, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Sphere args={[0.15]} position={[0.15, 0.7, 0]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Sphere args={[0.15]} position={[0, 0.7, -0.15]}>
        <meshStandardMaterial color={color} />
      </Sphere>
      <Sphere args={[0.15]} position={[0, 0.7, 0.15]}>
        <meshStandardMaterial color={color} />
      </Sphere>
    </group>
  );

  const Tree = ({ position, scale, color }) => (
    <group position={position} scale={scale}>
      <Cylinder args={[0.2, 0.3, 1.2]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      <Sphere args={[0.8]} position={[0, 1.4, 0]}>
        <meshStandardMaterial color="#22c55e" />
      </Sphere>
      <Sphere args={[0.6]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#16a34a" />
      </Sphere>
    </group>
  );


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
              <span className="text-sm text-slate-500">Developer Portal</span>
            </div>
            
            <div className="flex items-center space-x-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100/50 rounded-lg transition-all duration-200"
                  aria-label="Back to Role Selection"
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
            <h2 className="text-3xl font-bold text-black mb-2">Developer Dashboard</h2>
            <p className="text-slate-600">Select your profile and manage your assigned tasks</p>
          </header>

          {/* Employee Selection */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
            <h3 className="text-xl font-bold text-black mb-4">Select Developer Profile</h3>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white/80"
              aria-label="Select developer profile"
            >
              <option value="">Choose your profile...</option>
              {employees.map(employee => (
                <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
          </div>

          {/* Team Garden Visualization - Always Visible */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Team Garden 🌱</h3>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
                  {completedTasks} Tasks Completed
                </p>
                <p className="text-sm text-slate-600">Each task grows our garden!</p>
              </div>
            </div>
            <div className="h-64 rounded-lg overflow-hidden bg-gradient-to-b from-green-50 to-blue-50 relative">
              <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <OrbitControls enableZoom={false} enablePan={false} />
                
                {/* Ground */}
                <Box args={[20, 0.1, 20]} position={[0, -0.5, 0]}>
                  <meshStandardMaterial color="#8B4513" />
                </Box>
                
                {/* Garden Elements */}
                {teamGarden.map((plant) => (
                  plant.type === 'flower' ? (
                    <Flower 
                      key={plant.id} 
                      position={[plant.x, 0, plant.z]} 
                      scale={plant.scale}
                      color={plant.color}
                    />
                  ) : (
                    <Tree 
                      key={plant.id} 
                      position={[plant.x, 0, plant.z]} 
                      scale={plant.scale}
                      color={plant.color}
                    />
                  )
                ))}
              </Canvas>
              {completedTasks === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🌱</span>
                    </div>
                    <p className="text-slate-600 font-medium">No tasks completed yet</p>
                    <p className="text-sm text-slate-500">Complete your first task to start growing the garden!</p>
                  </div>
                </div>
              )}
              
              {/* Thank You Message Overlay */}
              {showThankYou && lastCompletedTask && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 border border-red-200 rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-white text-xl">🎉</span>
                      </div>
                      <h4 className="text-lg font-bold text-black mb-2">Great Job!</h4>
                      <p className="text-slate-700 text-sm">
                        Thank you for completing<br/>
                        <span className="font-semibold text-red-600">{lastCompletedTask.id}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-2">The garden is growing! 🌱</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Tasks */}
          {selectedEmployee && (
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-slate-200/50">
              <h3 className="text-xl font-bold text-black mb-6">
                Tasks Assigned to {selectedEmployee}
              </h3>
              
              {assignedTickets.length > 0 ? (
                <div className="space-y-4">
                  {assignedTickets.map((ticket, index) => (
                    <div key={ticket.id || index} className="border border-slate-200/50 rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-yellow-100 text-black">
                              {ticket.ticketType}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {ticket.severity}
                            </span>
                            {ticket.project && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {ticket.project}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-black mb-2">{ticket.id}</h4>
                          <p className="text-slate-600 mb-3">{ticket.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-slate-600">Manager:</span>
                              <p className="text-black">{ticket.issuerName}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Department:</span>
                              <p className="text-black">{ticket.issuerDepartment || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Deadline:</span>
                              <p className="text-black">
                                {ticket.deadline ? new Date(ticket.deadline).toLocaleDateString() : 'No deadline'}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-slate-600">Created:</span>
                              <p className="text-black">
                                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 flex flex-col items-center">
                          <button
                            onClick={() => markTaskAsDone(ticket.id)}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white rounded-lg hover:from-red-700 hover:to-yellow-500 transition-all duration-200 shadow-sm font-medium mb-2"
                            aria-label={`Mark task ${ticket.id} as completed`}
                          >
                            🌱 Mark as Done
                          </button>
                          <p className="text-xs text-slate-500 text-center">Complete this task<br/>to grow the garden!</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">No tasks assigned yet</h4>
                  <p className="text-slate-600">Select your profile above to see assigned tasks, or wait for your manager to assign new tasks.</p>
                </div>
              )}
            </div>
          )}

          {/* Motivation Message */}
          {selectedEmployee && completedTasks > 0 && (
            <div className="mt-8 bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 p-6 rounded-xl border border-red-200/50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h4 className="font-semibold text-black">Keep Growing the Garden!</h4>
                  <p className="text-slate-600">
                    You've completed {completedTasks} task{completedTasks !== 1 ? 's' : ''}! 
                    Each completed task helps our team garden flourish. Keep up the excellent work!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
