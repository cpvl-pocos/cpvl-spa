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
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500 w-full max-w-4xl mx-auto">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <UserIcon size={28} className="text-blue-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight font-['Flamenco']">Editar Cadastro</h2>
            <p className="text-slate-400 font-bold text-sm tracking-wide">
              {formState.name ? `Piloto: ${formState.name}` : 'Gerenciamento de perfil'}
            </p>
          </div>
        </div>
      </div>

      {(formError || successMessage || errors.length > 0) && (
        <div className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="rounded-2xl border-none shadow-xl bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold">{formError}</AlertDescription>
            </Alert>
          )}
          {errors.map((err, i) => (
            <Alert key={i} variant="destructive" className="rounded-2xl border-none shadow-xl bg-red-50 text-red-600 py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold text-xs leading-relaxed">{err}</AlertDescription>
            </Alert>
          ))}
          {successMessage && (
            <Alert className="rounded-2xl border-none shadow-xl bg-green-50 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="font-bold">{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl p-4 sm:p-8">
          {/* Photo upload section */}
          <div className="flex flex-col items-center space-y-5 mb-8 sm:mb-10 pb-6 sm:pb-8 border-b border-slate-100">
            <div className="relative group">
              <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-primary/20 bg-muted shadow-xl transition-all group-hover:scale-105">
                <AvatarImage src={formState.photoUrl} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary">
                  <UserIcon size={48} />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                <Camera className="text-white" size={32} />
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-10 font-bold border-slate-200 shadow-sm"
                asChild
              >
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="mr-2 h-4 w-4" />
                  {formState.photoUrl ? 'Alterar Foto' : 'Adicionar Foto'}
                </label>
              </Button>

              {formState.photoUrl && (
                <Button
                  type="button"
                  variant="destructive"
                  className="rounded-xl h-10 font-bold shadow-sm shadow-destructive/20"
                  onClick={handleRemovePhoto}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </Button>
              )}
            </div>
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
              Tamanho máximo: 500KB
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-3 lg:col-span-2">
              <Label htmlFor="name" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Nome completo</Label>
              <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="cpf" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">CPF</Label>
              <CPFMaskCustom
                id="cpf"
                name="cpf"
                value={formState.cpf}
                onChange={handleChange as any}
                placeholder="000.000.000-00"
                disabled
              />
              <p className="text-[10px] font-bold text-slate-400 ml-1">
                O CPF não pode ser alterado.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="cellphone" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Telefone</Label>
              <PhoneMaskCustom
                id="cellphone"
                name="cellphone"
                value={formState.cellphone}
                onChange={handleChange as any}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold"
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-8 border-t border-slate-100">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:min-w-[120px] rounded-2xl h-14 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 order-2 sm:order-1"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:ml-auto sm:flex-1 sm:max-w-[280px] rounded-2xl h-14 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-3 h-5 w-5" />
                SALVANDO...
              </>
            ) : (
              <>
                <Save className="mr-3 h-5 w-5" />
                SALVAR ALTERAÇÕES
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
