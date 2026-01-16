import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="scanline" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <Card className="w-full max-w-md mx-4 bg-card border-destructive/50 shadow-[0_0_50px_rgba(255,0,0,0.2)]">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-24 w-24 text-destructive animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-display font-bold text-destructive tracking-widest">404</h1>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white font-mono">SIGNAL LOST</h2>
            <p className="text-sm text-muted-foreground font-mono">
              The requested coordinates do not exist in the current sector.
            </p>
          </div>

          <Link href="/" className="block">
            <button className="w-full py-3 bg-destructive/10 border border-destructive/50 text-destructive hover:bg-destructive/20 font-mono tracking-widest uppercase transition-colors">
              Return to Base
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
