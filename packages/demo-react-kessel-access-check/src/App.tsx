import { useState } from 'react';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import SingleResourceCheck from './components/demos/SingleResourceCheck';
import BulkSameRelation from './components/demos/BulkSameRelation';
import BulkNestedRelations from './components/demos/BulkNestedRelations';
import WorkspaceRetrieval from './components/demos/WorkspaceRetrieval';
import './App.css';

function App() {
  const [activeDemo, setActiveDemo] = useState('single');

  return (
    <AccessCheck.Provider
      baseUrl="http://localhost:3000"  // MSW intercepts all requests locally
      apiPath="/api/kessel/v1beta2"
    >
      <Layout>
        <Navigation activeDemo={activeDemo} onSelectDemo={setActiveDemo} />
        <main className="main">
          {activeDemo === 'single' && <SingleResourceCheck />}
          {activeDemo === 'bulk-same' && <BulkSameRelation />}
          {activeDemo === 'bulk-nested' && <BulkNestedRelations />}
          {activeDemo === 'workspace' && <WorkspaceRetrieval />}
        </main>
      </Layout>
    </AccessCheck.Provider>
  );
}

export default App;
