import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Navigate, useLocation ,useParams} from 'react-router-dom';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const redirectUser = useCallback((role, branch, studentId) => {
    console.log('Redirecting user:', role, branch, studentId);
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'faculty':
        navigate(`/faculty/${branch}/dashboard`);
        break;
      case 'student':
        // Replace 'studentId' with the actual ID if needed
        navigate(`/student/${studentId}/dashboard`);
        break;
      default:
        setError('Invalid user role');
        setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.role) {
              redirectUser(userData.role, userData.branch, userData.studentId);
            } else {
              setError('User role not defined');
            }
          } else {
            setError('User data not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setError('Error fetching user data');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [redirectUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Error signing out');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Login</h2>
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <form onSubmit={handleLogin} autoComplete="off">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="new-email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="new-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

async function addUserToDatabase(email, password, role, branch = null, studentId = null) {
  try {
    console.log({
      email,
      role,
      branch,
      studentId
    });
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: role,
      branch: branch,
      studentId: studentId
    });
    console.log('User added successfully');
    // Sign out the user after adding to the database
    await signOut(auth);
    console.log('User signed out after creation');
  } catch (error) {
    console.error('Error adding user: ', error);
  }
}
const PrivateRoute = ({ children, allowedRoles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const fetchedUserData = docSnap.data();
            setUserData(fetchedUserData);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for faculty branch
  if (userData.role === 'faculty' && params.branch && params.branch !== userData.branch) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Check for student ID
  if (userData.role === 'student' && params.studentId && params.studentId !== userData.studentId) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};


export { Login, addUserToDatabase, PrivateRoute };
export default Login;

// Uncomment this line to add a new user
// addUserToDatabase('admin@hm.com', 'admin1', 'admin');
// addUserToDatabase('rai@hm.com', 'raibranch', 'faculty', 'rai');
// addUserToDatabase('extc@hm.com', 'extc02', 'faculty', 'extc');
// addUserToDatabase('aids@hm.com', 'aids03', 'faculty', 'aids');
// addUserToDatabase('comp@hm.com', 'comp04', 'faculty', 'comp');
// addUserToDatabase('csbs@hm.com', 'csbs05', 'faculty', 'csbs');
// addUserToDatabase('vdt@hm.com', 'vdt006', 'faculty', 'vdt');
// addUserToDatabase('it@hm.com', 'it0007', 'faculty', 'it');
// addUserToDatabase('excp@hm.com', 'excp08', 'faculty', 'excp');
// addUserToDatabase('mech@hm.com', 'mech09', 'faculty', 'mech');
// addUserToDatabase('vlsi@hm.com', 'vlsi10', 'faculty', 'vlsi');
// addUserToDatabase('s.ranadive@somaiya.edu', 'password123', 'student', 'excp', '670df9871426a210709bfe38');
// addUserToDatabase('vighnesh.palande@somaiya.edu', 'password123', 'student', 'excp', '670df9871426a210709bfe3a');
// addUserToDatabase('umang@somaiya.edu', 'password123', 'student', 'excp', '670df9871426a210709bfe36');
