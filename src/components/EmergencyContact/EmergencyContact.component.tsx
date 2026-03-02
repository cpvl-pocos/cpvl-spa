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

interface IEmergencyContact {
  id?: number;
  userId: number;
  bloodType?: string;
  emergencyPhone?: string;
  emergencyContactName?: string;
  allergies?: string;
}

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

export const EmergencyContact: React.FC<EmergencyContactProps> = ({
  userId,
  userName,
  onClose
}) => {
  const [formState, setFormState] = useState<
    Omit<IEmergencyContact, 'id' | 'userId'>
  >({
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

  const { doFetch: doSave, error: saveError } = useFetch<IEmergencyContact>({
    method: 'POST'
  });

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
        method: 'POST',
        body: {
          userId,
          ...formState
        }
      });
      setSuccessMessage('Dados de emergência salvos com sucesso!');
      setIsSubmitting(false);

      // Re-fetch to get updated data
      fetchExisting({
        url: getURI(`${API.emergencyContacts}/${userId}`),
        method: 'GET'
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao salvar os dados.');
    }
  };

  const handleClear = () => {
    setFormState({
      bloodType: '',
      emergencyPhone: '',
      emergencyContactName: '',
      allergies: ''
    });
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value
    }));
    setFormError(undefined);
  };

  const handleSelectChange = (value: string) => {
    setFormState((prev) => ({
      ...prev,
      bloodType: value
    }));
    setFormError(undefined);
  };

  const { data: pilotData } = useFetch<any>({
    url: userId ? getURI(`${API.pilots}/${userId}`) : undefined,
    method: 'GET'
  });

  const displayName = pilotData
    ? `${pilotData.firstName} ${pilotData.lastName}`
    : userName;

  if (loadingExisting) {
    return (
      <div className="flex justify-center p-8">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <HeartPulse size={28} className="text-red-400" />
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight font-['Flamenco']">Contato de Emergência</h2>
            <p className="text-slate-400 font-bold text-sm tracking-wide">
              {displayName ? `Piloto: ${displayName}` : 'Gerenciamento de contatos'}
            </p>
          </div>
        </div>
      </div>

      {(formError || successMessage) && (
        <div className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="rounded-2xl border-none shadow-xl bg-red-50 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-bold">{formError}</AlertDescription>
            </Alert>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            <div className="space-y-3">
              <Label htmlFor="bloodType" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Tipo Sanguíneo</Label>
              <Select
                value={formState.bloodType}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="bloodType" className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  {BLOOD_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="rounded-xl font-bold py-3">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="emergencyPhone" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Telefone de Emergência</Label>
              <PhoneMaskCustom
                id="emergencyPhone"
                name="emergencyPhone"
                value={formState.emergencyPhone || ''}
                onChange={handleChange as any}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <Label htmlFor="emergencyContactName" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Nome do Contato de Emergência</Label>
              <Input
                id="emergencyContactName"
                name="emergencyContactName"
                value={formState.emergencyContactName || ''}
                onChange={handleChange}
                placeholder="Ex: Nome da esposa, pai, etc."
                className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Label htmlFor="allergies" className="font-black text-slate-700 uppercase tracking-widest text-[10px]">Alergias / Medicamentos Alérgicos</Label>
                <Info size={14} className="text-slate-400" />
              </div>
              <Textarea
                id="allergies"
                name="allergies"
                rows={4}
                value={formState.allergies || ''}
                onChange={handleChange}
                placeholder="Descreva aqui se possui alguma alergia ou medicamentos que não pode tomar"
                className="resize-none rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold p-4"
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-8 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 order-2 sm:order-1">
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:flex-1 rounded-2xl h-14 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 order-2 sm:order-1"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSubmitting}
              className="w-full sm:flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:text-primary hover:bg-primary/5 order-1 sm:order-2"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:flex-1 sm:max-w-[240px] rounded-2xl h-14 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-3 h-5 w-5" />
                SALVANDO...
              </>
            ) : (
              <>
                <Save className="mr-3 h-5 w-5" />
                SALVAR DADOS
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
