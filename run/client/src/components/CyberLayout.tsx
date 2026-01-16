import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Shield, LayoutDashboard, LogOut, Terminal, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CyberLayoutProps {
  children: ReactNode;
}

export function CyberLayout({ children }: CyberLayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0, 240, 255, 0.3) 1px, transparent 0)',
             backgroundSize: '40px 40px' 
           }} 
      />
      <div className="scanline"></div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/50 bg-black/40 backdrop-blur-md z-10 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all" />
              <Activity className="w-3 h-3 text-destructive absolute bottom-0 right-0 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-widest text-white">SENTINEL</h1>
              <span className="text-xs text-primary font-mono tracking-[0.2em]">AI.SEC.OPS</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard">
            <Button 
              variant="ghost" 
              className={`w-full justify-start gap-3 font-mono text-sm uppercase tracking-wide
                ${location === "/dashboard" 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-50">
            System
          </div>
          <div className="px-4 py-2 font-mono text-xs text-primary/70 border border-primary/20 rounded bg-primary/5">
            <p>STATUS: ONLINE</p>
            <p>NODES: ACTIVE</p>
            <p>VERSION: 2.4.0</p>
          </div>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center border border-primary/50">
              <Terminal className="w-4 h-4 text-primary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white font-mono">{user?.firstName || 'Operator'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
            DISCONNECT
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
