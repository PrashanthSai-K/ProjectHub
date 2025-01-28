import { api } from '@/services/auth-service';
import axios from 'axios';
import Cookies from 'js-cookie';

export function getToken() {
    return Cookies.get('token'); // Read token from cookies
}

export async function getUserRole(token) {

    if (!token) {
        return null;
    }

    try {
        const { data } = await axios.get('http://localhost:4500/api/auth/me',{
            headers : {
                Authorization : `Bearer ${token}`
            }
        });
    
    return data?.user;
} catch (error) {
    console.error('Error fetching user role:', error);
    return null;
}
}
