import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google';
import FeedbackForm from "./components/FeedbackForm";
import AdminDashboard from "./components/AdminDashboard";
import VendorPortal from "./components/VendorPortal";
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Logged in:", data.user);
        setUser(data.user);
      } else {
        alert(data.message); // Shows "Access Denied" for non-college emails
      }
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  // Render the correct view based on role
  const renderRoleView = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard user={user} />;
      case "vendor":
        return <VendorPortal user={user} />;
      default:
        return <FeedbackForm user={user} />;
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        {/* Header */}
        <div className="app-header">
          <h1>Mess Feedback 🍽️</h1>
          {!user && <p>Rate your meals. Help improve the mess.</p>}
        </div>

        {!user ? (
          /* Login Screen */
          <div className="login-container">
            <p>Sign in with your college email</p>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Login Failed")}
            />
          </div>
        ) : (
          /* Logged In */
          <div>
            {/* User Bar */}
            <div className="user-bar">
              <div className="user-bar-left">
                <img src={user.picture || "https://ui-avatars.com/api/?name=" + user.name} alt="" />
                <span>{user.name}</span>
              </div>
              <span className={`role-badge ${user.role}`}>{user.role}</span>
            </div>

            {/* Role-Based View */}
            {renderRoleView()}

            <hr />

            {/* Logout */}
            <button className="btn-danger" onClick={() => setUser(null)}>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
