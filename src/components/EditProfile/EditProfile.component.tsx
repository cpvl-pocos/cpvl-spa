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
import type { IPilot } from '@/types';

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
          "flex h-12 w-full rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 font-bold shadow-sm",
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
          "flex h-12 w-full rounded-2xl border border-slate-100 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 font-bold shadow-sm",
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

  const {
    data: pilotData,
    loading: loadingPilot,
    doFetch: fetchPilot
  } = useFetch<IPilot>({
    url: userId ? getURI(`${API.pilots}/${userId}`) : undefined,
    method: 'GET'
  });

  const { doFetch: doUpdateProfile, error: updateError } = useFetch<any>({ method: 'PATCH' });

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

    if (!isNotEmpty(name) || !hasMinLength(name, 10)) errorMessages.push('Nome completo deve ter no mínimo 10 caracteres');
    const cleanedCellphone = cellphone.replace(/\D/g, '');
    if (!isNotEmpty(cellphone) || cleanedCellphone.length < 11) errorMessages.push('Telefone deve ter no mínimo 11 dígitos');
    if (!isNotEmpty(email) || !isEmail(email)) errorMessages.push('Digite um E-mail válido');

    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      setIsSubmitting(false);
      return;
    }

    try {
      await doUpdateProfile({
        url: getURI(API.updateProfile),
        body: { name, cellphone: cleanedCellphone, email: email.trim().toLowerCase(), photoUrl: formState.photoUrl }
      });

      setSuccessMessage('Cadastro atualizado com sucesso!');
      setIsSubmitting(false);
      fetchPilot({ url: getURI(`${API.pilots}/${userId}`) });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao atualizar os dados.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setFormError(undefined);
    setErrors([]);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) return setFormError('A foto deve ter no máximo 500KB');
    if (!file.type.startsWith('image/')) return setFormError('O arquivo deve ser uma imagem');

    const reader = new FileReader();
    reader.onload = () => {
      setFormState(prev => ({ ...prev, photoUrl: reader.result as string }));
      setFormError(undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormState(prev => ({ ...prev, photoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loadingPilot) return <div className="flex justify-center p-8"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="p-0 space-y-0 animate-in fade-in duration-500 w-full max-w-4xl mx-auto overflow-y-auto max-h-[90vh] scrollbar-thin">
      <div className="relative overflow-hidden bg-slate-900 sm:rounded-[2rem] p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex items-end gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl"><UserIcon size={24} className="text-blue-400" /></div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Editar Cadastro</h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-wide uppercase">{formState.name || 'Perfil do Piloto'}</p>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-8 -mt-8 relative z-20 space-y-6 pb-10">
        {(formError || successMessage || errors.length > 0) && (
          <div className="space-y-3">
            {formError && <Alert variant="destructive" className="rounded-2xl border-none shadow-lg bg-red-50 text-red-600"><AlertCircle className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{formError}</AlertDescription></Alert>}
            {errors.map((err, i) => <Alert key={i} variant="destructive" className="rounded-2xl border-none shadow-lg bg-red-50 text-red-600"><AlertCircle className="h-4 w-4" /><AlertDescription className="font-bold text-[10px]">{err}</AlertDescription></Alert>)}
            {successMessage && <Alert className="rounded-2xl border-none shadow-lg bg-green-50 text-green-600"><CheckCircle2 className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{successMessage}</AlertDescription></Alert>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-[3rem] border-none shadow-sm bg-white/95 p-6 md:p-10">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex flex-col items-center space-y-4 shrink-0">
                <div className="relative group">
                  <Avatar className="h-32 w-32 lg:h-40 lg:w-40 ring-4 ring-primary/5 bg-slate-50 transition-transform group-hover:scale-105">
                    <AvatarImage src={formState.photoUrl} className="object-cover" /><AvatarFallback><UserIcon className="w-1/2 h-1/2" /></AvatarFallback>
                  </Avatar>
                  <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-slate-900/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><Camera className="text-white" size={28} /></label>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Button type="button" variant="outline" className="rounded-xl font-bold text-xs" asChild><label htmlFor="photo-upload" className="cursor-pointer"><Camera className="mr-2 h-4 w-4" />Alterar Foto</label></Button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
                  {formState.photoUrl && <Button type="button" variant="ghost" className="rounded-xl font-bold text-destructive text-xs" onClick={handleRemovePhoto}><Trash2 className="mr-2 h-4 w-4" />Remover</Button>}
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="space-y-1"><h3 className="text-lg font-black text-slate-800">Identificação</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Principais informações</p></div>
                <div className="space-y-4">
                  <div className="space-y-2"><Label className="font-black text-slate-500 uppercase tracking-widest text-[9px]">Nome completo</Label><Input name="name" value={formState.name} onChange={handleChange} required className="h-12 rounded-2xl bg-slate-50 font-bold" /></div>
                  <div className="space-y-2"><Label className="font-black text-slate-500 uppercase tracking-widest text-[9px]">CPF</Label><CPFMaskCustom name="cpf" value={formState.cpf} onChange={handleChange as any} disabled /></div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white/70 p-6 md:p-10">
            <div className="space-y-6">
              <div className="space-y-1"><h3 className="text-lg font-black text-slate-800">Contato</h3><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Canais de comunicação</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="font-black text-slate-500 uppercase tracking-widest text-[9px]">WhatsApp</Label><PhoneMaskCustom name="cellphone" value={formState.cellphone} onChange={handleChange as any} required /></div>
                <div className="space-y-2"><Label className="font-black text-slate-500 uppercase tracking-widest text-[9px]">E-mail</Label><Input name="email" type="email" value={formState.email} onChange={handleChange} required className="h-12 rounded-2xl bg-slate-50 font-bold" /></div>
              </div>
            </div>
          </Card>

          <div className="flex gap-4 pt-6">
            {onClose && <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black text-slate-400">DESCARTAR</Button>}
            <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black shadow-xl bg-primary hover:bg-primary/90">{isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-5 w-5" />}SALVAR ALTERAÇÕES</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
