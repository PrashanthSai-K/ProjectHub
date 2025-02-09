// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from "@/services/auth-service";
import { getToken } from "@/lib/auth";


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    router.push('/login')
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

    if(user.role === 'admin') {
        router.push('/admin/dashboard')
        return
    }

    if(user.role === 'user'){
        router.push('/user/dashboard')
        return
    }

  return (
    <div>
      <h1>Welcome to the Dashboard</h1>
      <p>User ID: {user.id}</p>
      <p>User Email: {user.email}</p>
      <p>User Role: {user.role}</p>
      <button onClick={() => { localStorage.removeItem('token'); router.push('/') }}>Logout</button>
    </div>
  );
};

export default Dashboard;