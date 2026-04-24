import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { IMaskInput } from 'react-imask';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { cn } from '@/lib/utils';
import { Save, Eraser, Info, HeartPulse, CheckCircle2, AlertCircle } from 'lucide-react';
import type { IEmergencyContact, IPilot } from '@/types';

interface EmergencyContactProps {
  userId: number;
  userName?: string;
  onClose?: () => void;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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

export const EmergencyContact: React.FC<EmergencyContactProps> = ({
  userId,
  userName,
  onClose
}) => {
  const [formState, setFormState] = useState<Omit<IEmergencyContact, 'id' | 'userId'>>({
    bloodType: '',
    emergencyPhone: '',
    emergencyContactName: '',
    allergies: ''
  });
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: existingData,
    loading: loadingExisting,
    doFetch: fetchExisting
  } = useFetch<IEmergencyContact>({
    url: getURI(`${API.emergencyContacts}/${userId}`),
    method: 'GET'
  });

  const { doFetch: doSave, error: saveError } = useFetch<IEmergencyContact>({ method: 'POST' });

  useEffect(() => {
    if (existingData) {
      setFormState({
        bloodType: existingData.bloodType || '',
        emergencyPhone: existingData.emergencyPhone || '',
        emergencyContactName: existingData.emergencyContactName || '',
        allergies: existingData.allergies || ''
      });
    }
  }, [existingData]);

  useEffect(() => {
    if (saveError) {
      setIsSubmitting(false);
      setFormError(saveError.message || 'Erro ao salvar dados');
    }
  }, [saveError]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    try {
      await doSave({
        url: getURI(API.emergencyContacts),
        body: { userId, ...formState }
      });
      setSuccessMessage('Dados de emergência salvos com sucesso!');
      setIsSubmitting(false);
      fetchExisting({ url: getURI(`${API.emergencyContacts}/${userId}`) });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao salvar os dados.');
    }
  };

  const handleClear = () => {
    setFormState({ bloodType: '', emergencyPhone: '', emergencyContactName: '', allergies: '' });
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setFormError(undefined);
  };

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, bloodType: value }));
    setFormError(undefined);
  };

  const { data: pilotData } = useFetch<IPilot>({
    url: userId ? getURI(`${API.pilots}/${userId}`) : undefined,
    method: 'GET',
    immediate: !userName
  });

  const displayName = userName || (pilotData ? `${pilotData.firstName} ${pilotData.lastName}` : '');

  if (loadingExisting) return <div className="flex justify-center p-8"><Spinner className="h-8 w-8" /></div>;

  return (
    <div className="p-0 space-y-0 animate-in fade-in duration-500 w-full max-w-4xl mx-auto overflow-y-auto max-h-[90vh] scrollbar-thin">
      <div className="relative overflow-hidden bg-slate-900 sm:rounded-[2rem] p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-3">
          <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl w-fit"><HeartPulse size={24} className="text-orange-400" /></div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Contato de Emergência</h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-wide uppercase">{displayName || 'Gerenciamento de contatos'}</p>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-8 -mt-8 relative z-20 space-y-6 pb-10">
        {(formError || successMessage) && (
          <div className="space-y-4">
            {formError && <Alert variant="destructive" className="rounded-2xl border-none shadow-xl bg-orange-50 text-orange-600"><AlertCircle className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{formError}</AlertDescription></Alert>}
            {successMessage && <Alert className="rounded-2xl border-none shadow-xl bg-green-50 text-green-600"><CheckCircle2 className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{successMessage}</AlertDescription></Alert>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white/90 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Tipo Sanguíneo</Label>
                <Select value={formState.bloodType} onValueChange={handleSelectChange}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 font-bold"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl">{BLOOD_TYPES.map(t => <SelectItem key={t} value={t} className="rounded-xl font-bold py-3">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Telefone de Emergência</Label><PhoneMaskCustom name="emergencyPhone" value={formState.emergencyPhone || ''} onChange={handleChange as any} /></div>
              <div className="md:col-span-2 space-y-2"><Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Nome do Contato</Label><Input name="emergencyContactName" value={formState.emergencyContactName || ''} onChange={handleChange} placeholder="Ex: Pai, Mãe, Cônjuge" className="h-12 rounded-2xl bg-slate-50 font-bold" /></div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2 px-1"><Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Alergias / Observações</Label><Info size={14} className="text-slate-400" /></div>
                <Textarea name="allergies" rows={4} value={formState.allergies || ''} onChange={handleChange} placeholder="Descreva aqui observações importantes para sua saúde em caso de emergência" className="resize-none rounded-2xl bg-slate-50 font-bold p-4 text-sm" />
              </div>
            </div>
          </Card>

          <div className="flex gap-4 pt-6">
            <div className="flex gap-3 flex-1">
              {onClose && <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black text-slate-400">CANCELAR</Button>}
              <Button type="button" variant="outline" onClick={handleClear} disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black border-slate-200 text-slate-500"><Eraser className="mr-2 h-4 w-4" />LIMPAR</Button>
            </div>
            <Button type="submit" disabled={isSubmitting} className="flex-1 max-w-[240px] rounded-2xl h-12 font-black shadow-xl">{isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-5 w-5" />}SALVAR DADOS</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
