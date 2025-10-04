import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import TicketTriageInterface from './TicketTriageInterface';
import DeveloperView from './components/DeveloperView';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  const handleRoleSelect = (role) => {
    if (role === 'manager') {
      setCurrentView('manager');
    } else if (role === 'developer') {
      setCurrentView('developer');
    }
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  switch (currentView) {
    case 'manager':
      return <TicketTriageInterface onBack={handleBackToLanding} />;
    case 'developer':
      return <DeveloperView onBack={handleBackToLanding} />;
    default:
      return <LandingPage onRoleSelect={handleRoleSelect} />;
  }
}

export default App;
