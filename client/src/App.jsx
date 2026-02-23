import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import FeedbackForm from "./components/FeedbackForm";
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      // 1. Decode locally for immediate UI update (optional, but good for speed)
      // const decoded = jwtDecode(credentialResponse.credential); 

      // 2. Send token to Backend for Verification & Account Creation
      const response = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Backend Verified User:", data.user);
        setUser(data.user); // Save the user from OUR database to state
      } else {
        console.error("Backend Auth Failed:", data.message);
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleLoginError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="card">
      <h1>Mess Feedback System 🍔</h1>

      {!user ? (
        <div className="login-container">
          <p>Please sign in with your college email.</p>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
        </div>
      ) : (
        <div className="welcome-container">
          <div className="user-info">
            <img src={user.picture || "https://via.placeholder.com/50"} alt="Profile" style={{ borderRadius: '50%', width: '50px' }} />
            <div>
              <h2>Welcome, {user.name}! 👋</h2>
              <p className="vendor-badge">Assigned Mess: <strong>{user.assignedVendor}</strong></p>
            </div>
          </div>

          <hr />

          <FeedbackForm user={user} />

          <button className="logout-btn" onClick={() => setUser(null)}>Logout</button>
        </div>
      )}
    </div>
  )
}

export default App
