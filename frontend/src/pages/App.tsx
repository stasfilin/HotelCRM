import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate
} from 'react-router-dom';
import '../App.css';

import { LoginPage } from './LoginPage';
import { client } from '../apolloClient';
import { ApolloProvider } from '@apollo/client';
import { isLoggedIn } from '../utils/auth';
import RegisterPage from './RegisterPage';
import { AdminPage } from './AdminPage';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="App-header">
    <Link to="/login" className="App-button">Go to Login Page</Link>
    <Link to="/register" className="App-button">Go to Register Page</Link>
    <Link to="/admin" className="App-button">Go to Admin Page</Link>
    </div>
  );
};

export function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
