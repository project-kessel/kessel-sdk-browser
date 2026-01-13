import { useState } from 'react';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import SingleResourceCheck from './components/demos/SingleResourceCheck';
import BulkSameRelation from './components/demos/BulkSameRelation';
import BulkNestedRelations from './components/demos/BulkNestedRelations';
import ConditionalRendering from './components/demos/ConditionalRendering';
import ResourceFiltering from './components/demos/ResourceFiltering';
import ErrorHandling from './components/demos/ErrorHandling';
import LoadingStates from './components/demos/LoadingStates';
import ConsistencyTokens from './components/demos/ConsistencyTokens';
import './App.css';

function App() {
  const [activeDemo, setActiveDemo] = useState('single');

  return (
    <AccessCheck.Provider
      baseUrl=""  // Empty since MSW intercepts locally
      apiPath="/api/inventory/v1beta2"
    >
      <Layout>
        <Navigation activeDemo={activeDemo} onSelectDemo={setActiveDemo} />
        <main className="main">
          {activeDemo === 'single' && <SingleResourceCheck />}
          {activeDemo === 'bulk-same' && <BulkSameRelation />}
          {activeDemo === 'bulk-nested' && <BulkNestedRelations />}
          {activeDemo === 'conditional' && <ConditionalRendering />}
          {activeDemo === 'filtering' && <ResourceFiltering />}
          {activeDemo === 'errors' && <ErrorHandling />}
          {activeDemo === 'loading' && <LoadingStates />}
          {activeDemo === 'consistency' && <ConsistencyTokens />}
        </main>
      </Layout>
    </AccessCheck.Provider>
  );
}

export default App;
