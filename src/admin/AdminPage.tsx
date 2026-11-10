import { useEffect, useState } from 'react';
import { getServerMessage } from '../api';
import { useNavigate } from "react-router-dom";
import { logout } from "../api";

function AdminPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    getServerMessage()
      .then(data => {
        setMessage(data.message);
      })
      .catch(console.error);
  }, []);

const navigate = useNavigate();

async function handleLogout() {
  try {
    await logout();
    navigate("/login", { replace: true });
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>{message}</p>
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default AdminPage;