import { useForge } from './hooks/useForge';
import HomeScreen from './screens/HomeScreen';
import ScenarioScreen from './screens/ScenarioScreen';
import DebriefScreen from './screens/DebriefScreen';

export default function App() {
  const {
    screen,
    activeScenario,
    messages,
    isTyping,
    isGeneratingDebrief,
    debrief,
    error,
    debriefError,
    startScenario,
    sendUserMessage,
    endScenario,
    retryDebrief,
    retryLastMessage,
    resetApp,
  } = useForge();

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0B' }}>
      {screen === 'home' && (
        <HomeScreen onStart={startScenario} />
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
    </div>
  );
}
