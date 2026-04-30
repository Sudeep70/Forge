import { Routes, Route, useNavigate } from 'react-router-dom';
import { useForge } from './hooks/useForge.js';
import HomeScreen from './screens/HomeScreen.jsx';
import ScenarioScreen from './screens/ScenarioScreen.jsx';
import DebriefScreen from './screens/DebriefScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import History from './pages/History.jsx';

export default function App() {
  const navigate = useNavigate();
  const {
    screen,
    activeScenario,
    messages,
    isTyping,
    isGeneratingDebrief,
    debrief,
    error,
    debriefError,
    user,
    sessions,
    isLoadingSessions,
    authError,
    startScenario,
    startCustomScenario,
    login,
    logout,
    sendUserMessage,
    endScenario,
    retryDebrief,
    retryLastMessage,
    resetApp,
    setScreen,
  } = useForge();

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <Routes>
        <Route path="/history" element={<History onBack={() => { setScreen('home'); navigate('/'); }} />} />
        <Route path="/" element={
          <>
            {screen === 'home' && (
              <HomeScreen 
                onStart={startScenario} 
                onStartCustom={startCustomScenario}
                user={user}
                sessions={sessions}
                login={login}
                logout={logout}
                authError={authError}
                setScreen={setScreen}
              />
            )}

            {screen === 'dashboard' && (
              <DashboardScreen 
                sessions={sessions}
                onBack={() => setScreen('home')}
              />
            )}

            {screen === 'scenario' && (
              <ScenarioScreen
                scenario={activeScenario}
                messages={messages}
                isTyping={isTyping}
                error={error}
                onSend={sendUserMessage}
                onEnd={endScenario}
                onRetry={retryLastMessage}
              />
            )}

            {screen === 'debrief' && (
              <DebriefScreen
                debrief={debrief}
                isLoading={isGeneratingDebrief}
                error={debriefError}
                onRetry={retryDebrief}
                onReset={resetApp}
                scenario={activeScenario}
              />
            )}
          </>
        } />
      </Routes>
    </div>
  );
}
