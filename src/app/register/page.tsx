"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Kanban, Moon, Sun, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error("Fill all fields");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) return toast.error(error);
    toast.success("Account created! Check your email to confirm.");
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--board-bg)]">
      <header className="flex items-center justify-between px-6 h-12 bg-[var(--header-bg)] border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <Kanban className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold text-foreground">TAKA</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggle}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-sm border-border shadow-none rounded-lg">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-lg font-bold text-foreground">Create account</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">Start managing your projects</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-10 text-sm" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 text-sm pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-none" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-5">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
