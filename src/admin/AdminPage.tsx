import { useEffect, useState } from 'react';
import { getServerMessage } from '../api';

function AdminPage() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    getServerMessage()
      .then(data => {
        setMessage(data.message);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default AdminPage;