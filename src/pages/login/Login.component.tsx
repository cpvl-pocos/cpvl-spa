import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Users, Lock, Mail, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import useFetch from "@/hooks/useFetch";
import { API, getURI } from "@/services/getURI";
import bgImage from "@/assets/images/hero_01.jpg";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useLocalStorage(
    (import.meta.env.VITE_LOGGED_KEY || "CPVL_USER_IS_LOGGED") as string,
    false
  );
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const { doFetch, loading, error, clearError } = useFetch<any>({
    method: "POST",
  });

  useEffect(() => {
    if (isLogged) {
      navigate("/dashboard");
    }
  }, [isLogged, navigate]);

  const handleLogin = async () => {
    console.log('Login attempt with:', { email, password });
    clearError();
    setFeedback(null);

    const result = await doFetch({
      url: getURI(API.login),
      body: { username: email, password },
    });

    if (result) {
      setIsLogged(true);
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    if (isForgotLoading || loading) return;

    if (!email || !email.includes("@")) {
      setFeedback({
        message: "No campo Usuário ou E-mail, digite seu E-MAIL para recuperar a senha.",
        type: "error",
      });
      return;
    }

    setIsForgotLoading(true);
    setFeedback(null);
    clearError();

    try {
      const response = await fetch(getURI(API.forgotPassword), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (response.ok) {
        setFeedback({
          message: "E-mail de recuperação enviado! Verifique sua caixa de entrada.",
          type: "success",
        });
      } else {
        setFeedback({
          message: result.message || "Erro ao solicitar recuperação.",
          type: "error",
        });
      }
    } catch (err) {
      setFeedback({
        message: "Erro de conexão com o servidor.",
        type: "error",
      });
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 animate-slow-zoom"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/45 via-slate-900/45 to-slate-950/35 backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-md px-4 animate-fade-in-up">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="group mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300 text-sm font-medium"
        >
          <div className="p-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Voltar para o site
        </button>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden glassmorphism">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30">
              <Users size={32} />
            </div>
            <CardTitle className="text-3xl font-heading font-bold text-white tracking-tight">
              Área do Associado
            </CardTitle>
            <CardDescription className="text-white/60 font-body text-base">
              Identifique-se para acessar sua conta
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form id="login-form" action={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium ml-1">Usuário ou E-mail</Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                    <Mail size={18} />
                  </div>
                  <Input
                    id="email"
                    type="text"
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password" className="text-white/80 text-sm font-medium">Senha</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isForgotLoading}
                    className="text-xs text-white/80 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isForgotLoading ? "Solicitando..." : "Esqueceu a senha?"}
                  </button>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 pl-10 h-12 focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200 animate-shake">
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{error.message || "Erro ao realizar login. Verifique suas credenciais."}</p>
                </div>
              )}

              {feedback && (
                <div className={`flex items-center gap-3 rounded-lg border p-3 text-sm animate-fade-in ${feedback.type === "success"
                  ? "border-green-500/50 bg-green-500/10 text-green-200"
                  : feedback.type === "error"
                    ? "border-red-500/50 bg-red-500/10 text-red-200"
                    : "border-blue-500/50 bg-blue-500/10 text-blue-200"
                  }`}>
                  <AlertCircle size={18} className="shrink-0" />
                  <p>{feedback.message}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar no Sistema"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-white/5 bg-white/5 px-6 py-4">
            <p className="text-center text-sm text-white font-body">
              Ainda não é associado?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-white/75 hover:underline font-medium transition-colors cursor-pointer"
              >
                Cadastre-se.
              </button>
            </p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-xs text-white/60 font-body">
          © {new Date().getFullYear()} Clube Poçoscaldense de Vôo Livre. Todos os direitos reservados.
        </p>
      </div>

      <style>{`
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 30s infinite ease-in-out;
        }
        .glassmorphism {
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div >
  );
};
