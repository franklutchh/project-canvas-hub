import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PremiumLoader } from '@/components/ui/premium-loader';
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {/* Background gradient */}
        <div 
          className="fixed inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, hsl(265 85% 60% / 0.15) 0%, transparent 50%)',
          }}
        />
        <PremiumLoader size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: AuthFormData) => {
    setError(null);
    const result = isLogin
      ? await signIn(data.email, data.password)
      : await signUp(data.email, data.password);

    if (result.error) {
      if (result.error.message.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login.');
      } else if (result.error.message.includes('Invalid login')) {
        setError('Email ou senha incorretos.');
      } else {
        setError(result.error.message);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, hsl(265 85% 60% / 0.12) 0%, transparent 50%)',
        }}
      />
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(225 12% 15%) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />
      
      <Card className="w-full max-w-md glass-premium animate-scale-in relative overflow-hidden">
        {/* Top glow accent */}
        <div 
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(265 85% 60% / 0.5), transparent)',
          }}
        />
        
        <CardHeader className="text-center pb-8 pt-8">
          {/* Animated Logo */}
          <div className="mx-auto mb-6 relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-glow animate-pulse-glow">
              <span className="text-2xl font-bold text-white">DC</span>
            </div>
            {/* Glow ring */}
            <div 
              className="absolute inset-0 rounded-2xl animate-pulse-ring"
              style={{
                background: 'radial-gradient(circle, hsl(265 85% 60% / 0.3) 0%, transparent 70%)',
                transform: 'scale(1.5)',
              }}
            />
          </div>
          
          <CardTitle className="text-2xl font-bold gradient-premium">DevClient Pro</CardTitle>
          <CardDescription className="text-muted-foreground mt-2">
            {isLogin ? 'Bem-vindo de volta! Entre na sua conta' : 'Crie sua conta para começar'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="seu@email.com"
                  className="pl-11"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="pl-11"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive backdrop-blur-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium group" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar Conta'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/[0.08]" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-sm text-muted-foreground">ou</span>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Criar conta
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
