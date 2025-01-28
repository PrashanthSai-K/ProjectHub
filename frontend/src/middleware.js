import axios from 'axios';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { api } from './services/auth-service';
import { getUserRole } from './lib/auth';

export async function middleware(request) {

    const path = request.nextUrl.pathname;
    const isLoginPath = path === '/login' || path === '/';

    // Read the token from cookies
    const token = request.cookies.get('token')?.value; 

    // Redirect login page for authenticated user
    if (isLoginPath) {
        if (token) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const  user  = await getUserRole(token);

    if(!user){
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

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/user/:path*', '/dashboard/:path*'],
};
