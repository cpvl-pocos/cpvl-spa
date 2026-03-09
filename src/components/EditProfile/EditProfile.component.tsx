import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { IMaskInput } from 'react-imask';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { isEmail, isNotEmpty, hasMinLength } from '@/util/validation';
import { Camera, Trash2, User as UserIcon, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface IPilotData {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  cpf: string;
  cellphone: string;
  email: string;
  photoUrl?: string;
}

interface EditProfileProps {
  userId: number;
  onClose?: () => void;
}

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  value?: string;
  disabled?: boolean;
}

const PhoneMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function PhoneMaskCustom(props, ref) {
    const { onChange, id, placeholder, required, value, disabled, ...other } = props;
    return (
      <IMaskInput
        {...other}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        disabled={disabled}
        mask="(00) 00000-0000"
        inputRef={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold shadow-sm",
          props.disabled && "bg-muted"
        )}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
      />
    );
  }
);

const CPFMaskCustom = React.forwardRef<HTMLInputElement, CustomProps>(
  function CPFMaskCustom(props, ref) {
    const { onChange, id, placeholder, required, value, disabled, ...other } = props;
    return (
      <IMaskInput
        {...other}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        disabled={disabled}
        mask="000.000.000-00"
        inputRef={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold shadow-sm",
          props.disabled && "bg-slate-50 text-slate-400"
        )}
        onAccept={(value: any) =>
          onChange({ target: { name: props.name, value } })
        }
      />
    );
  }
);

export const EditProfile: React.FC<EditProfileProps> = ({
  userId,
  onClose
}) => {
  const [formState, setFormState] = useState({
    name: '',
    cpf: '',
    cellphone: '',
    email: '',
    photoUrl: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch pilot data
  const {
    data: pilotData,
    loading: loadingPilot,
    doFetch: fetchPilot
  } = useFetch<IPilotData>({
    url: userId ? getURI(`${API.pilots}/${userId}`) : undefined,
    method: 'GET'
  });

  // Update profile
  const { doFetch: doUpdateProfile, error: updateError } = useFetch<any>({
    method: 'PATCH'
  });

  // Load existing data into form
  useEffect(() => {
    if (pilotData) {
      setFormState({
        name: `${pilotData.firstName || ''} ${pilotData.lastName || ''}`.trim(),
        cpf: pilotData.cpf || '',
        cellphone: pilotData.cellphone || '',
        email: pilotData.email || '',
        photoUrl: pilotData.photoUrl || ''
      });
    }
  }, [pilotData]);

  // Handle update error
  useEffect(() => {
    if (updateError) {
      setIsSubmitting(false);
      setFormError(updateError.message || 'Erro ao atualizar cadastro');
    }
  }, [updateError]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors([]);
    setFormError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    const { name, cellphone, email } = formState;
    const errorMessages: string[] = [];

    if (!isNotEmpty(name) || !hasMinLength(name, 10)) {
      errorMessages.push('Nome completo deve ter no mínimo 10 caracteres');
    }

    const cleanedCellphone = cellphone.replace(/\D/g, '');
    if (!isNotEmpty(cellphone) || cleanedCellphone.length < 11) {
      errorMessages.push('Telefone deve ter no mínimo 11 dígitos');
    }

    if (!isNotEmpty(email) || !isEmail(email)) {
      errorMessages.push('Digite um E-mail válido');
    }

    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      setIsSubmitting(false);
      return;
    }

    try {
      await doUpdateProfile({
        url: getURI(API.updateProfile),
        method: 'PATCH',
        body: {
          name,
          cellphone: cleanedCellphone,
          email: email.trim().toLowerCase(),
          photoUrl: formState.photoUrl
        }
      });

      setSuccessMessage('Cadastro atualizado com sucesso!');
      setIsSubmitting(false);

      // Refresh data
      fetchPilot({
        url: getURI(`${API.pilots}/${userId}`),
        method: 'GET'
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao atualizar os dados.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormError(undefined);
    setErrors([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) return;

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setFormError('A foto deve ter no máximo 500KB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setFormError('O arquivo deve ser uma imagem');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        photoUrl: reader.result as string
      }));
      setFormError(undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormState((prev) => ({
      ...prev,
      photoUrl: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loadingPilot) {
    return (
      <div className="flex justify-center p-8">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-0 space-y-0 animate-in fade-in duration-500 w-full max-w-4xl mx-auto overflow-y-auto max-h-[90vh] sm:max-h-[85vh] scrollbar-thin scrollbar-thumb-slate-200">
      {/* Dynamic Header - Refined for all sizes */}
      <div className="relative overflow-hidden bg-slate-900 sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl mx-0 sm:mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl w-fit">
            <UserIcon size={20} className="text-blue-400 sm:w-6 sm:h-6" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight font-['Flamenco']">Editar Cadastro</h2>
            <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] md:text-xs tracking-wide uppercase">
              {formState.name ? `Piloto: ${formState.name}` : 'Gerenciamento de perfil'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-6 md:px-8 mt-4 sm:mt-6 md:-mt-8 relative z-20 space-y-6 pb-10">
        {(formError || successMessage || errors.length > 0) && (
          <div className="space-y-3">
            {formError && (
              <Alert variant="destructive" className="rounded-xl sm:rounded-2xl border-none shadow-lg bg-red-50 text-red-600 py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold text-xs sm:text-sm">{formError}</AlertDescription>
              </Alert>
            )}
            {errors.map((err, i) => (
              <Alert key={i} variant="destructive" className="rounded-xl sm:rounded-2xl border-none shadow-lg bg-red-50 text-red-600 py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold text-[10px] sm:text-xs leading-relaxed">{err}</AlertDescription>
              </Alert>
            ))}
            {successMessage && (
              <Alert className="rounded-xl sm:rounded-2xl border-none shadow-lg bg-green-50 text-green-600 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="font-bold text-xs sm:text-sm">{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-6">
            {/* Section 1: Photo & Identity */}
            <Card className="rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] border-none shadow-[0_10px_30px_rgba(0,0,0,0.04)] bg-white/95 backdrop-blur-xl p-5 sm:p-8 md:p-10 transition-all hover:shadow-[0_15px_45px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:items-start text-center lg:text-left">
                {/* Photo upload section */}
                <div className="flex flex-col items-center space-y-4 shrink-0">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 sm:h-32 sm:w-32 lg:h-40 lg:w-40 ring-4 ring-offset-4 ring-primary/5 bg-slate-50 shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:ring-primary/20">
                      <AvatarImage src={formState.photoUrl} className="object-cover" />
                      <AvatarFallback className="bg-slate-50 text-slate-300">
                        <UserIcon className="w-1/2 h-1/2" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                      <Camera className="text-white" size={28} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-[200px]">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl h-9 sm:h-10 font-bold border-slate-100 shadow-sm bg-slate-50/50 hover:bg-white text-[10px] sm:text-xs"
                      asChild
                    >
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Camera className="mr-2 h-4 w-4" />
                        {formState.photoUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                      </label>
                    </Button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />

                    {formState.photoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl h-9 sm:h-10 font-bold text-destructive hover:text-destructive hover:bg-red-50 text-[10px] sm:text-xs"
                        onClick={handleRemovePhoto}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover Foto
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-6 text-left">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Identificação</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Informações principais do piloto</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-black text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">Nome completo</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        placeholder="Nome completo do piloto"
                        required
                        className="h-12 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-100 shadow-inner focus:bg-white transition-all font-bold text-sm text-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="font-black text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">CPF</Label>
                      <CPFMaskCustom
                        id="cpf"
                        name="cpf"
                        value={formState.cpf}
                        onChange={handleChange as any}
                        placeholder="000.000.000-00"
                        disabled
                      />
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 ml-1">
                        Campo bloqueado para segurança.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section 2: Contact */}
            <Card className="rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] border-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl p-5 sm:p-8 md:p-10 transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] border-t border-white/20">
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">Contato</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Onde te encontramos</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
                  <div className="space-y-2">
                    <Label htmlFor="cellphone" className="font-black text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">WhatsApp / Telefone</Label>
                    <PhoneMaskCustom
                      id="cellphone"
                      name="cellphone"
                      value={formState.cellphone}
                      onChange={handleChange as any}
                      placeholder="(00) 00000-0000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-black text-slate-500 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">E-mail Pessoal</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="analógico@exemplo.com"
                      required
                      className="h-12 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-100 shadow-inner focus:bg-white transition-all font-bold text-sm text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100">
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:min-w-[140px] rounded-xl sm:rounded-2xl h-10 sm:h-12 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-95 text-xs sm:text-sm"
              >
                DESCARTAR
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:ml-auto sm:flex-1 sm:max-w-[320px] rounded-xl sm:rounded-2xl h-10 sm:h-12 font-black text-sm sm:text-base shadow-xl sm:shadow-2xl shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  ATUALIZANDO...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  SALVAR ALTERAÇÕES
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
