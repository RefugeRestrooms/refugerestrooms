import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import './App.css';
import { GraphQLDemo } from './components/demo/GraphQLDemo';
import { SearchDemo } from './components/demo/SearchDemo';

function App() {
  const client = useApolloClient();
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    // Apollo Client is initialized
    setConnectionStatus('connected');
  }, [client]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Apollo Client Initialized';
      case 'error': return 'Apollo Client Error';
      default: return 'Initializing Apollo Client...';
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>REFUGE Restrooms</h1>
        <p>Safe restroom access for everyone</p>
      </header>
      <main>
        <p>React Frontend Application - Development Environment Ready</p>
        
        <div style={{ 
          padding: '10px', 
          margin: '20px 0', 
          border: `2px solid ${getStatusColor()}`,
          borderRadius: '5px',
          backgroundColor: `${getStatusColor()}20`
        }}>
          <p style={{ color: getStatusColor(), fontWeight: 'bold' }}>
            Status: {getStatusText()}
          </p>
          <p style={{ fontSize: '0.9em', color: '#666' }}>
            Cache Entities: {Object.keys(client.cache.extract() || {}).length}
          </p>
        </div>

        <SearchDemo />
        
        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid #eee' }}>
          <GraphQLDemo />
        </div>
      </main>
    </div>
  );
}

export default App;
