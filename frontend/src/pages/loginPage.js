import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailPasswordLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      routeUser();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      routeUser();
    } catch (err) {
      setError(err.message);
    }
  };

  const routeUser = () => {
    const userRole = getUserRole(auth.currentUser.email); // Function to get the role of the user based on email.
    if (userRole === 'admin') {
      navigate('/admin');
    } else if (userRole === 'faculty') {
      navigate('/facLandingpage');
    } else if (userRole === 'student') {
      navigate('/stuLandingPage');
    }
    else{
      navigate('/');
    }
  };

  // Dummy function to get user role based on email
  const getUserRole = (email) => {
    if (email.includes('admin')) return 'admin';
    if (email.includes('faculty')) return 'faculty';
    if (email.includes('student') )return 'student';
  };

  return (
    <div className = 'login-main'>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className = 'login-body'>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleEmailPasswordLogin}>Login with Email & Password</button>
      </div>
      <div>
        <button onClick={handleGoogleLogin}>Login with Google</button>
      </div>
    </div>
  );
};

export default LoginPage;