import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "axios";
import { clearToken } from "../utils/authToken.js";
import "../style.css";

export function LogoutButton({ collapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // State Cleanup: clear token, user_role, and school_id
    clearToken();
    
    // Axios Integration: clear Authorization header globally so no further API calls can be made
    delete axios.defaults.headers.common['Authorization'];

    // Navigation: redirect to /login immediately
    navigate("/login", { replace: true });
  };

  return (
    <button 
      onClick={handleLogout}
      className="nav-item"
      style={{ 
        width: "100%", 
        background: "transparent", 
        border: "none", 
        textAlign: "left",
        cursor: "pointer",
        color: "#ef4444", // Redish tint for logout to differentiate from standard nav items, while fitting the white/clean theme
      }}
      title={collapsed ? "Logout" : undefined}
    >
      <LogOut className="nav-icon" size={20} style={{ color: "#ef4444" }} />
      {!collapsed && <span className="nav-label" style={{ color: "#ef4444" }}>Logout</span>}
    </button>
  );
}
