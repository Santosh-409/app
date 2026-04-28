import { Outlet } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <TrendingUp className="h-8 w-8" />
          </div>
          <span className="text-2xl font-bold">PortfolioMate</span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Smart Investment Tracking for Everyone
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Track your stocks, mutual funds, crypto, and more. Get real-time insights 
            and make informed investment decisions.
          </p>
          
          <div className="flex gap-8 pt-4">
            <div>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-primary-foreground/70">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold">$50M+</div>
              <div className="text-sm text-primary-foreground/70">Assets Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold">99.9%</div>
              <div className="text-sm text-primary-foreground/70">Uptime</div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-primary-foreground/60">
          © 2024 PortfolioMate. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold">PortfolioMate</span>
          </div>
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
