import axios from 'axios';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { api } from './services/auth-service';
import { getUserRole } from './lib/auth';
import { UserService } from './services/user-service';

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const isLoginPath = path === '/login' || path === '/';

    if (path.startsWith('/_next/static')) {
        return NextResponse.next();
    }

    // Handling the login page
    if (isLoginPath) {
        const token = request.cookies.get('token')?.value;
        if (token) {
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Handle routes that require authentication
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    let user;
    try {
        user = await getUserRole(token);
    } catch (error) {
        console.error("Error fetching user role:", error);
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (!user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check for admin routes
    if (path.startsWith('/admin') && user.role != 'Admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

    // Check for user routes
    if (path.startsWith('/user') && user.role !== 'User') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const userCookie = request.cookies.get('user')?.value;
    
    if (!userCookie) {
        const userData = await UserService.getUserData(token);
        const userJSON = JSON.stringify(userData);
        const response = NextResponse.next();
        response.headers.set('set-cookie', `user=${userJSON}; path=/; HttpOnly`);
        return response
    }

    return NextResponse.next();
}