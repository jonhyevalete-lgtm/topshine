import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, LayoutDashboard } from "lucide-react";
import logo from "@/assets/logo.png";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-premium via-premium-light to-premium">
      <nav className="border-b border-gold/20 bg-premium/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="TopShine" className="h-12 w-auto" />
            </Link>
            
            <div className="flex gap-2">
              <Button
                variant={location.pathname === "/" ? "secondary" : "ghost"}
                asChild
                className="text-gold hover:text-gold-dark hover:bg-premium-light"
              >
                <Link to="/">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Início
                </Link>
              </Button>
              
              <Button
                variant={location.pathname === "/clientes" ? "secondary" : "ghost"}
                asChild
                className="text-gold hover:text-gold-dark hover:bg-premium-light"
              >
                <Link to="/clientes">
                  <Users className="mr-2 h-4 w-4" />
                  Clientes
                </Link>
              </Button>
              
              <Button
                variant={location.pathname === "/admin" ? "secondary" : "ghost"}
                asChild
                className="text-gold hover:text-gold-dark hover:bg-premium-light"
              >
                <Link to="/admin">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Administração
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
