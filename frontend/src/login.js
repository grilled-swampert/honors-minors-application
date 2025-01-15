import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Navigate, useLocation, useParams } from "react-router-dom";
import kjscelogo from "../src/pages/photos-logos/KJSCE-logo.png";
import trustImg from "../src/pages/photos-logos/Trust.svg";
import "./login.css";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();

  const redirectUser = useCallback(
    (role, branch, studentId) => {
      console.log("Redirecting user:", role, branch, studentId);
      switch (role) {
        case "admin":
          navigate("/admin");
          break;
        case "faculty":
          navigate(`/faculty/${branch}/dashboard`);
          break;
        case "student":
          navigate(`/student/${studentId}/dashboard`);
          break;
        default:
          setError("Invalid user role");
          setLoading(false);
      }
    },
    [navigate]
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();

            if (userData.role) {
              if (userData.firstLogin) {
                await handlePasswordReset();
                return;
              }
              redirectUser(userData.role, userData.branch, userData.studentId);
            } else {
              setError("User role not defined");
            }
          } else {
            console.warn("[WARNING] User data not found for UID:", user.uid);
            setError("User data not found");
          }
        } catch (error) {
          console.error("[ERROR] Error fetching user data:", error);
          setError("Error fetching user data");
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [redirectUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Sign out error:", error);
      setError("Error signing out");
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset the password.");
      return;
    }

    try {
      // Send the password reset email
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setError(null);

      // Fetch user data to check the role
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();

        // Check if the user is a student
        if (userData.role === "student") {
          // Update `firstLogin` to false for students
          await updateDoc(userDocRef, { firstLogin: false });
          console.log("First login updated to false for student");
        }
      } else {
        console.error("User document not found in Firestore");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Error sending password reset email. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="loader-spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    );
  }

  return (
    <div className="login-main">
      <header>
        <div className="login-navbar">
          <img className="logo" src={kjscelogo} alt="KJSCE Logo" />
          <img src={trustImg} alt="Trust Logo" className="trust" />
        </div>
      </header>

      <div className="login-content">
        <div className="login-box">
          <div className="login-box-header">Honors & Minors Application</div>
          {user ? (
            <div>
              <p>Logged in as: {user.email}</p>
              <button onClick={handleSignOut}>Sign Out</button>
            </div>
          ) : (
            <form
              onSubmit={handleLogin}
              className="loginForm"
              autoComplete="off"
            >
              <p>Username</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                autoComplete="new-email"
                id="username"
                className="username-input"
              />
              <p>Password</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="new-password"
                id="password"
                className="password-input"
              />
              <div
                className="forget"
                onClick={handlePasswordReset}
                style={{ cursor: "pointer" }}
              >
                <u>Forgot Password?</u>
              </div>
              <button type="submit" disabled={loading} id="login-button-text">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          )}
          {resetEmailSent && (
            <p style={{ color: "green" }}>
              Password reset email sent. Please check your inbox.
            </p>
          )}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
      </div>
    </div>
  );
};

async function addUserToDatabase(
  email,
  password,
  role,
  branch = null,
  studentId = null
) {
  try {
    console.log({
      email,
      role,
      branch,
      studentId,
    });

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      role: role,
      branch: branch,
      studentId: studentId,
      firstLogin: role === "student",
    });
    await signOut(auth);
  } catch (error) {
    console.error("Error adding user: ", error);
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
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const fetchedUserData = docSnap.data();
            setUserData(fetchedUserData);
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
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

  if (
    userData.role === "faculty" &&
    params.branch &&
    params.branch !== userData.branch
  ) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (
    userData.role === "student" &&
    params.studentId &&
    params.studentId !== userData.studentId
  ) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export { Login, addUserToDatabase, PrivateRoute };
export default Login;
