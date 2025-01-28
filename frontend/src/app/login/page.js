// app/login/page.tsx
"use client";
import { useState } from "react";
import Cookies from 'js-cookie';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      // Save the token in cookies
      Cookies.set('token', response.token, {
        expires: 7, 
        secure: true, 
        sameSite: 'strict',
      });
      const user = await api.get("/auth/me", response.token);      
      Cookies.set('user', JSON.stringify(user.user), {
        expires: 7, 
        secure: true,
        sameSite: 'strict', 
      });
      // Redirect to the dashboard
      if(user?.user.role === "Admin"){
        router.push('/admin/dashboard');
      }
      if(user?.user.role === "User"){
        router.push('/user/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `${error.message}`,
        variant: "destructive",
      });
      console.error("Login failed", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <Toaster />
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">ProjectHub</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your projects
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <h3 className="text-xl font-semibold text-center text-gray-700">
              Welcome back
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/80"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Sign up
              </a>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-gray-600">
          By signing in, you agree to our{" "}
          <a href="#" className="font-medium text-primary hover:text-primary/80">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-primary hover:text-primary/80">
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  );
}