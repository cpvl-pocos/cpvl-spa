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
import { Spinner } from '@/components/ui/spinner';
import { IMaskInput } from 'react-imask';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { cn } from '@/lib/utils';
import { Save, Eraser, Info } from 'lucide-react';

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
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Contato de Emergência
        </h2>
        {displayName && (
          <p className="text-sm font-medium text-muted-foreground">
            {displayName}
          </p>
        )}
      </div>

      {(formError || successMessage) && (
        <div className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-top-1">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo Sanguíneo</Label>
            <Select
              value={formState.bloodType}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="bloodType" className="w-full">
                <SelectValue placeholder="Selecione o tipo sanguíneo" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
            <PhoneMaskCustom
              id="emergencyPhone"
              name="emergencyPhone"
              value={formState.emergencyPhone || ''}
              onChange={handleChange as any}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="emergencyContactName">Nome do Contato de Emergência</Label>
            <Input
              id="emergencyContactName"
              name="emergencyContactName"
              value={formState.emergencyContactName || ''}
              onChange={handleChange}
              placeholder="Ex: Nome da esposa, pai, etc."
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="allergies">Alergias / Medicamentos Alérgicos</Label>
              <Info size={14} className="text-muted-foreground" />
            </div>
            <Textarea
              id="allergies"
              name="allergies"
              rows={4}
              value={formState.allergies || ''}
              onChange={handleChange}
              placeholder="Descreva aqui se possui alguma alergia ou medicamentos que não pode tomar"
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Limpar
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none sm:w-32"
              >
                Cancelar
              </Button>
            )}
          </div>
          <Button
            type="submit"
            className="sm:ml-auto sm:w-40 font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Dados
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
