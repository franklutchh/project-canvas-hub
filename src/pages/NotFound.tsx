import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Compass, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradient */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, transparent 70%)',
          }}
        />
        
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(225 12% 20%) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Floating orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl animate-pulse"
          style={{ background: 'hsl(var(--primary) / 0.1)' }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse"
          style={{ 
            background: 'hsl(280 70% 50% / 0.08)',
            animationDelay: '1s',
          }}
        />
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-lg mx-auto animate-fade-in">
        {/* Floating compass icon */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-xl border border-white/[0.08] shadow-glow animate-float"
            style={{
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <div className="flex items-center justify-center h-full">
              <Compass className="h-10 w-10 text-primary animate-spin-slow" style={{ animationDuration: '8s' }} />
            </div>
          </div>
        </div>
        
        {/* 404 number with gradient */}
        <h1 
          className="text-[120px] md:text-[160px] font-bold leading-none tracking-tighter mb-4"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--muted-foreground)) 50%, hsl(var(--primary)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>
        
        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Parece que você se aventurou em território desconhecido. 
          A página que você procura pode ter sido movida ou não existe mais.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="glass-card border-white/[0.08] hover:bg-white/[0.05] gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-glow gap-2"
          >
            <Home className="h-4 w-4" />
            Ir ao Dashboard
          </Button>
        </div>
        
        {/* Path hint */}
        <p className="mt-8 text-xs text-muted-foreground/60 font-mono">
          {location.pathname}
        </p>
      </div>
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
