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
import { AdminPage } from './admin/AdminPage';
import { RoomsPage } from './admin/RoomsPage';
import { CustomerPage } from './customer/CustomerPage';
import { BookPage } from './customer/BookPage';

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
    <Link to="/admin/rooms" className="App-button">Go to Admin Page: Rooms</Link>

    <Link to="/customer" className="App-button">Go to Customer Page</Link>
    <Link to="/customer/book" className="App-button">Go to Customer Page: Book</Link>
    
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
            <Route path="/admin/rooms" element={<RoomsPage />} />

            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/customer/book" element={<BookPage />} />
          </Routes>
        </div>
      </Router>
    </ApolloProvider>
  );
}

export default App;
