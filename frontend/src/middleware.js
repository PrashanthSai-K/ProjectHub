import { NextResponse } from 'next/server';
import { getUserRole } from './lib/auth';
import { UserService } from './services/user-service';

export async function middleware(request) {
    const path = request.nextUrl.pathname;

    // Bypass for static assets and API routes
    if (path.startsWith('/_next/static') || path.startsWith('/api/')) {
        return NextResponse.next();
    }
    const isUserOrAdminRoute = path.startsWith('/user') || path.startsWith('/admin')

    // If not a user or admin route, allow it to continue
    if (!isUserOrAdminRoute) {
        return NextResponse.next();
    }


    const isLoginPath = path === '/login' || path === '/';
        
     if (isLoginPath) {
         const token = request.cookies.get('token')?.value;
        const user = await getUserRole(token)
       if(!user) return NextResponse.next()
        if (user.role === 'Admin') {
                const userData = await UserService.getUserData(token);
                 const userJSON = JSON.stringify(userData);
                const response = NextResponse.redirect(new URL('/admin/dashboard', request.url));
                    response.headers.set('set-cookie', `user=${userJSON}; path=/; HttpOnly`);
                 return response
        }
          if (user.role === 'User') {
              const userData = await UserService.getUserData(token);
               const userJSON = JSON.stringify(userData);
               const response =  NextResponse.redirect(new URL('/user/dashboard', request.url));
                 response.headers.set('set-cookie', `user=${userJSON}; path=/; HttpOnly`);
                return response;
           }
           return NextResponse.next();
    }

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