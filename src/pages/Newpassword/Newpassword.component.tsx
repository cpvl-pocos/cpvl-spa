// src/pages/Newpassword/Newpassword.component.tsx
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { KeyRound, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { API, getURI } from '@/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Newpassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (!password || !confirmPassword) {
      return setError('Preencha os campos corretamente.');
    }
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem.');
    }
    if (!token) {
      return setError('Token de recuperação ausente.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(getURI(API.resetPassword), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(result.message || 'Erro ao redefinir senha.');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, token, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-in fade-in duration-700">
      <Card className="w-full max-w-md border-none shadow-[0_20px_60px_rgba(0,0,0,0.1)] rounded-[32px] overflow-hidden bg-white/80 backdrop-blur-xl">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center pt-10 px-8 pb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
            <KeyRound className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900 font-['Flamenco']">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            Digite e confirme sua nova senha de acesso abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-10">
          {success ? (
            <Alert variant="default" className="bg-green-50 border-green-100 text-green-700 rounded-2xl py-6 animate-in zoom-in-95">
              <ShieldCheck className="h-5 w-5" />
              <AlertTitle className="font-bold">Senha Redefinida!</AlertTitle>
              <AlertDescription className="font-medium text-sm">
                Sua senha foi atualizada com sucesso. Redirecionando para o login em instantes...
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nova Senha</Label>
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary/20 transition-all text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within:bg-primary transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Confirmar Senha</Label>
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary/20 transition-all text-lg"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-200 group-focus-within:bg-primary transition-colors" />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-2xl py-4 border-none shadow-lg shadow-red-50 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-bold text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all group overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      Confirmar Alteração
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
