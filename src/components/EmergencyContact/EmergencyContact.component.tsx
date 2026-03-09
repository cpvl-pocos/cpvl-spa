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
    <div className="p-0 space-y-0 animate-in fade-in duration-500 w-full max-w-4xl mx-auto overflow-y-auto max-h-[90vh] sm:max-h-[85vh] scrollbar-thin scrollbar-thumb-slate-200">
      {/* Dynamic Header - Refined for all sizes */}
      <div className="relative overflow-hidden bg-slate-900 sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-8 text-white shadow-2xl mx-0 sm:mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
              <HeartPulse size={20} className="text-red-400 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-['Flamenco']">Contato de Emergência</h2>
            <p className="text-slate-400 font-bold text-[9px] sm:text-[10px] tracking-wide uppercase">
              {displayName ? `Piloto: ${displayName}` : 'Gerenciamento de contatos'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-6 md:px-8 mt-4 sm:mt-6 md:-mt-8 relative z-20 space-y-6 pb-10">
        {(formError || successMessage) && (
          <div className="space-y-4">
            {formError && (
              <Alert variant="destructive" className="rounded-xl sm:rounded-2xl border-none shadow-xl bg-red-50 text-red-600 py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-bold text-xs sm:text-sm">{formError}</AlertDescription>
              </Alert>
            )}
            {successMessage && (
              <Alert className="rounded-xl sm:rounded-2xl border-none shadow-xl bg-green-50 text-green-600 py-3">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="font-bold text-xs sm:text-sm">{successMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <Card className="rounded-2xl sm:rounded-[2.5rem] border-none shadow-[0_15px_40px_rgba(0,0,0,0.04)] bg-white/90 backdrop-blur-xl p-5 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-3">
                <Label htmlFor="bloodType" className="font-black text-slate-700 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">Tipo Sanguíneo</Label>
                <Select
                  value={formState.bloodType}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="bloodType" className="h-12 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-100 shadow-sm focus:ring-primary/20 font-bold text-sm">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                    {BLOOD_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="rounded-xl font-bold py-3 text-sm">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="emergencyPhone" className="font-black text-slate-700 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">Telefone de Emergência</Label>
                <PhoneMaskCustom
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formState.emergencyPhone || ''}
                  onChange={handleChange as any}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <Label htmlFor="emergencyContactName" className="font-black text-slate-700 uppercase tracking-widest text-[9px] sm:text-[10px] px-1">Nome do Contato de Emergência</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formState.emergencyContactName || ''}
                  onChange={handleChange}
                  placeholder="Ex: Nome da esposa, pai, etc."
                  className="h-12 rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-100 shadow-sm focus:ring-primary/20 font-bold text-sm"
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Label htmlFor="allergies" className="font-black text-slate-700 uppercase tracking-widest text-[9px] sm:text-[10px]">Alergias / Medicamentos Alérgicos</Label>
                  <Info size={14} className="text-slate-400" />
                </div>
                <Textarea
                  id="allergies"
                  name="allergies"
                  rows={4}
                  value={formState.allergies || ''}
                  onChange={handleChange}
                  placeholder="Descreva aqui se possui alguma alergia ou medicamentos que não pode tomar"
                  className="resize-none rounded-xl sm:rounded-2xl bg-slate-50/50 border-slate-100 shadow-sm focus:ring-primary/20 font-bold p-4 text-sm"
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 order-2 sm:order-1">
              {onClose && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:flex-1 rounded-xl h-10 sm:h-12 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 order-2 sm:order-1 text-xs"
                >
                  CANCELAR
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isSubmitting}
                className="w-full sm:flex-1 rounded-xl h-10 sm:h-12 font-black border-slate-200 text-slate-500 hover:text-primary hover:bg-primary/5 order-1 sm:order-2 text-xs"
              >
                <Eraser className="mr-2 h-4 w-4" />
                LIMPAR
              </Button>
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 sm:max-w-[240px] rounded-xl h-10 sm:h-12 font-black text-sm sm:text-base shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] order-1 sm:order-2"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  SALVANDO...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  SALVAR DADOS
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
