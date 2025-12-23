import { ThemeToggle } from "@/components/theme-toggle";
import { Zap } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      <header className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </header>
      
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">ZFORCE DMS</h1>
            <p className="text-sm text-muted-foreground">
              Electric Vehicle Dealership Management
            </p>
          </div>
        </div>
        
        {children}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur-sm">
        <div className="container flex h-12 items-center justify-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground" data-testid="link-terms">
            Terms of Service
          </a>
          <span>|</span>
          <a href="#" className="hover:text-foreground" data-testid="link-privacy">
            Privacy Policy
          </a>
          <span>|</span>
          <span>ZFORCE Motors Pvt. Ltd.</span>
        </div>
      </footer>
    </div>
  );
}
