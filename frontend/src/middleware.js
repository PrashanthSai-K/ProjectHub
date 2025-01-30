import { NextResponse } from 'next/server';
import { getUserRole } from './lib/auth';
import { UserService } from './services/user-service';

export async function middleware(request) {
    const path = request.nextUrl.pathname;
    const isLoginPath = path === '/login' || path === '/';

    if (
        path.startsWith('/_next/') || 
        path.startsWith('/static/') || 
        path.startsWith('/favicon.ico') || 
        path.startsWith('/images/') || 
        path.startsWith('/api/') 
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (isLoginPath) {
        const user = await getUserRole(token);
        if (!user) return NextResponse.next();

        if (user.role === 'Admin') {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        if (user.role === 'User') {
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
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

    if (path.startsWith('/admin') && user.role !== 'Admin') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

    if (path.startsWith('/user') && user.role !== 'User') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const userCookie = request.cookies.get('user')?.value;
    if (!userCookie) {
        const userData = await UserService.getUserData(token);
        const userJSON = JSON.stringify(userData);
        const response = NextResponse.next();
        response.headers.set('set-cookie', `user=${userJSON}; path=/; HttpOnly`);
        return response;
    }

    return NextResponse.next();
}
