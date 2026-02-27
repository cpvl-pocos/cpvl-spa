import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { IMaskInput } from 'react-imask';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import {
  isEmail,
  isNotEmpty,
  isEqualToOtherValue,
  hasMinLength,
  hasTwoWords
} from '@/util/validation';
import { Users, ArrowLeft } from "lucide-react";
import bgImage from "@/assets/images/hero_02.jpg";

interface IInsertBody {
  name: string;
  cpf: string;
  cellphone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeStatute: boolean;
  agreeRI: boolean;
  agreeLGPD: boolean;
  username?: string;
}

const initialState: IInsertBody = {
  name: '',
  cpf: '',
  cellphone: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeStatute: false,
  agreeRI: false,
  agreeLGPD: false
};

export const Signup: React.FC = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState<IInsertBody>(initialState);
  const [errors, setErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    doFetch: doAddPilot,
    data,
    error,
    loading,
    clearError
  } = useFetch<any>({ method: 'POST' });

  const stripNonDigits = (value: string) => value.replace(/\D/g, '');

  useEffect(() => {
    if (!data) return;

    setIsSubmitting(false); // Libera o botão
    setSuccessMessage('Ok! Aguarde um e-mail de confirmação do seu cadastro!');
    setFormState(initialState);

    const timeout = setTimeout(() => {
      navigate('/');
    }, 6000); // Aguarda 6 segundos

    return () => clearTimeout(timeout);
  }, [data, navigate]);

  // 🔍 Trata erros da API
  useEffect(() => {
    if (!error) return;

    setIsSubmitting(false);

    setFormError(error!.message || 'Erro ao criar usuário');
  }, [error]);

  const handleSubmit = async () => {
    setErrors([]);
    setFormError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    const {
      name,
      cpf,
      cellphone,
      email,
      password,
      confirmPassword,
      agreeStatute,
      agreeRI,
      agreeLGPD
    } = formState;

    const errorMessages: string[] = [];

    // Nome
    const trimmedName = name.trim();
    if (!isNotEmpty(trimmedName)) {
      errorMessages.push('Nome completo é obrigatório');
    } else if (!hasTwoWords(trimmedName)) {
      errorMessages.push('Digite seu nome e sobrenome');
    } else if (!hasMinLength(trimmedName, 10)) {
      errorMessages.push('Nome completo deve ter no mínimo 10 caracteres');
    }

    // CPF
    if (!isNotEmpty(cpf)) {
      errorMessages.push('CPF é obrigatório');
    } else if (stripNonDigits(cpf).length !== 11) {
      errorMessages.push('CPF deve ter exatamente 11 dígitos');
    }

    // Telefone
    if (!isNotEmpty(cellphone)) {
      errorMessages.push('Telefone é obrigatório');
    } else if (stripNonDigits(cellphone).length < 11) {
      errorMessages.push('Telefone deve ter no mínimo 11 dígitos');
    }

    // Email
    if (!isNotEmpty(email)) {
      errorMessages.push('E-mail é obrigatório');
    } else if (!isEmail(email)) {
      errorMessages.push('Digite um E-mail válido');
    }

    // Senha
    if (!isNotEmpty(password)) {
      errorMessages.push('Senha é obrigatória');
    } else if (!hasMinLength(password, 6)) {
      errorMessages.push('Senha deve ter no mínimo 6 caracteres');
    }

    // Confirmação de Senha
    if (!isNotEmpty(confirmPassword)) {
      errorMessages.push('Confirmação de senha é obrigatória');
    } else if (!isEqualToOtherValue(password, confirmPassword)) {
      errorMessages.push('A confirmação da senha não coincide');
    }

    // Checkboxes
    if (!agreeStatute)
      errorMessages.push('Você deve concordar com o Estatuto CPVL');
    if (!agreeRI)
      errorMessages.push('Você deve concordar com o Regimento Interno CPVL');
    if (!agreeLGPD)
      errorMessages.push('Você deve concordar com os termos da LGPD');

    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      setIsSubmitting(false);
      return;
    }

    // limpar valores
    const cleanedCpf = stripNonDigits(cpf);
    const cleanedCellphone = stripNonDigits(cellphone);
    const normalizedEmail = String(email).trim().toLowerCase();
    const username = normalizedEmail.split('@')[0];

    const payload: IInsertBody = {
      ...formState,
      cpf: cleanedCpf,
      cellphone: cleanedCellphone,
      email: normalizedEmail,
      username
    };

    try {
      await doAddPilot({
        url: getURI(API.userAdd),
        body: payload,
        method: 'POST'
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao enviar os dados.');
    }
  };

  const handleReset = () => {
    setFormState(initialState);
    setErrors([]);
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    setFormError(undefined);
    setErrors([]);
    clearError();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 py-12">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] scale-110 animate-slow-zoom"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/45 via-slate-900/45 to-slate-950/35 backdrop-blur-[2px]" />

      <div className="relative z-20 w-full max-w-lg px-4 animate-fade-in-up">
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
              Cadastre-se
            </CardTitle>
            <CardDescription className="text-white/60 font-body text-base">
              Preencha os campos abaixo para criar sua conta.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {formError && (
              <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200 animate-shake">
                <AlertDescription>{formError}</AlertDescription>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-200">
                <AlertDescription>{successMessage}</AlertDescription>
              </div>
            )}

            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white/80 text-sm font-medium ml-1">Nome completo</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpf" className="text-white/80 text-sm font-medium ml-1">CPF</Label>
                  <CPFMaskCustom
                    id="cpf"
                    name="cpf"
                    value={formState.cpf}
                    onChange={handleChange as any}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cellphone" className="text-white/80 text-sm font-medium ml-1">Telefone</Label>
                  <PhoneMaskCustom
                    id="cellphone"
                    name="cellphone"
                    value={formState.cellphone}
                    onChange={handleChange as any}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80 text-sm font-medium ml-1">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/80 text-sm font-medium ml-1">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/80 text-sm font-medium ml-1">Confirme a senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formState.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 focus:ring-primary focus:border-primary transition-all duration-300"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="agreeStatute"
                    name="agreeStatute"
                    checked={formState.agreeStatute}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: 'agreeStatute',
                          type: 'checkbox',
                          checked: !!checked
                        }
                      } as any)
                    }
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="agreeStatute" className="text-sm font-normal text-white/70 group-hover:text-white transition-colors">
                    Li e concordo com o{' '}
                    <a
                      href="/docs/EstatutoCPVL_2023.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:font-bold transition-all"
                    >
                      Estatuto
                    </a>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="agreeRI"
                    name="agreeRI"
                    checked={formState.agreeRI}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: 'agreeRI',
                          type: 'checkbox',
                          checked: !!checked
                        }
                      } as any)
                    }
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="agreeRI" className="text-sm font-normal text-white/70 group-hover:text-white transition-colors">
                    Li e concordo com o{' '}
                    <a
                      href="/docs/RegimentoInternoCPVL_2024.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:font-bold transition-all"
                    >
                      Regimento Interno
                    </a>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="agreeLGPD"
                    name="agreeLGPD"
                    checked={formState.agreeLGPD}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: {
                          name: 'agreeLGPD',
                          type: 'checkbox',
                          checked: !!checked
                        }
                      } as any)
                    }
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <Label htmlFor="agreeLGPD" className="text-sm font-normal text-white/70 group-hover:text-white transition-colors">
                    Li e concordo com a{' '}
                    <a
                      href="/docs/lgpd_cpvl.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white underline hover:font-bold transition-all"
                    >
                      LGPD
                    </a>
                  </Label>
                </div>
              </div>

              {/* Lista de erros */}
              {errors.length > 0 && (
                <div className="mt-2 space-y-2">
                  {errors.map((err, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-2 text-xs text-red-200 animate-shake">
                      <AlertDescription>{err}</AlertDescription>
                    </div>
                  ))}
                </div>
              )}

              {/* Botões */}
              <div className="mt-6 flex flex-col gap-3">
                <Button
                  className="w-full h-11 text-base font-bold bg-primary hover:bg-white/10 hover:text-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  type="submit"
                  disabled={loading || isSubmitting}
                >
                  {loading || isSubmitting ? (
                    <>
                      <Spinner className="mr-2" />
                      Cadastrando...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 border-white/10 text-primary hover:bg-white/10 hover:text-white transition-all duration-300 cursor-pointer"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Limpar Campos
                </Button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-white font-body">
              Já tem conta?{' '}
              <Link to="/login" className="text-white/75 hover:underline font-medium transition-colors">
                Faça login
              </Link>
            </p>
          </CardContent>
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
    </div>
  );
};

/* ----------------------------------------------------
     Máscaras (mantidas iguais, funcionando)
---------------------------------------------------- */

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
}

const CPFMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CPFMaskCustom(props, ref) {
    const { onChange, id, placeholder, required, value, ...other } = props;
    return (
      <IMaskInput
        {...other}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        mask="000.000.000-00"
        inputRef={ref}
        className={cn(
          'bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-all duration-300 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[1px]',
          'aria-invalid:border-destructive'
        )}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
      />
    );
  }
);

const PhoneMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function PhoneMaskCustom(props, ref) {
    const { onChange, id, placeholder, required, value, ...other } = props;
    return (
      <IMaskInput
        {...other}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        mask="(00) 00000-0000"
        inputRef={ref}
        className={cn(
          'bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-all duration-300 outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-[1px]',
          'aria-invalid:border-destructive'
        )}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
      />
    );
  }
);
