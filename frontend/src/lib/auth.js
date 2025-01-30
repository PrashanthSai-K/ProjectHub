import { api } from '@/services/auth-service';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4500"}/api/auth/me`; 


export function getToken() {
    return Cookies.get('token'); // Read token from cookies
}

export async function getUserRole(token) {

    if (!token) {
        return null;
    }

    try {
        const { data } = await axios.get(API_BASE_URL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return data?.user;
    } catch (error) {
        // console.error('Error fetching user role:', "so sadd raah", error);
        return null;
    }
}
