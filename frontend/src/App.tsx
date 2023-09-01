import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link
} from 'react-router-dom';
import './App.css';

import { LoginPage } from './LoginPage'
import { client } from './apolloClient';
import { ApolloProvider } from '@apollo/client';

const HomePage: React.FC = () => (
  <div className="App-header">
    <Link to="/login" className="App-button">Go to Login Page</Link>
  </div>
);

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
