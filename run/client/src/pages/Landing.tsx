import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Terminal, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black overflow-hidden relative font-body">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 pointer-events-none mix-blend-screen" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      
      {/* Navigation */}
      <nav className="relative z-20 px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-2xl font-display font-bold tracking-widest">SENTINEL</span>
        </div>
        <Button 
          variant="outline" 
          className="border-primary text-primary hover:bg-primary hover:text-black font-mono tracking-wider transition-all duration-300"
          onClick={() => window.location.href = "/api/login"}
        >
          SYSTEM LOGIN
        </Button>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 mb-6 border border-primary/30 rounded-full bg-primary/10 text-primary text-xs font-mono tracking-widest">
            AI-POWERED SECURITY PROTOCOLS ACTIVE
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
            AUTONOMOUS <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">SMART CONTRACT</span>
            <br/> AUDITING
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-xl font-mono leading-relaxed">
            Deploy Gemini 3 Flash agents to scan, analyze, and exploit vulnerabilities in your Web2 & Web3 infrastructure before adversaries do.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-black hover:bg-white text-lg px-8 py-6 font-bold font-display tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              onClick={() => window.location.href = "/api/login"}
            >
              INITIALIZE SCAN
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 font-mono"
            >
              VIEW DEMO
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 group">
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <Terminal className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold">Automated PoC Generation</h3>
            <p className="text-gray-400 leading-relaxed">
              Our agents don't just find bugs; they prove them. Receive ready-to-execute Proof of Concept code for every vulnerability.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold">Real-time Analysis</h3>
            <p className="text-gray-400 leading-relaxed">
              Powered by Gemini 3 Flash, audits execute in seconds, not days. Continuous monitoring for your critical infrastructure.
            </p>
          </div>

          <div className="space-y-4 group">
            <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center border border-primary/30 group-hover:bg-primary/20 transition-colors">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-display font-bold">Multi-Chain Support</h3>
            <p className="text-gray-400 leading-relaxed">
              Native support for Solidity, Rust, and Move. Whether it's Ethereum, Solana, or Sui, we have you covered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
