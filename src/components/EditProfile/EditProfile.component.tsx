import React, { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { IMaskInput } from 'react-imask';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { isEmail, isNotEmpty, hasMinLength } from '@/util/validation';
import { Camera, Trash2, User as UserIcon } from 'lucide-react';

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
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          props.disabled && "bg-muted text-muted-foreground"
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Editar Cadastro
        </h2>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo upload section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-2 ring-offset-2 ring-primary/20 bg-muted">
              <AvatarImage src={formState.photoUrl} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary">
                <UserIcon size={40} />
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={24} />
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

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
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
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleRemovePhoto}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Tamanho máximo: 500KB
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <CPFMaskCustom
              id="cpf"
              name="cpf"
              value={formState.cpf}
              onChange={handleChange as any}
              placeholder="000.000.000-00"
              disabled
            />
            <p className="text-[10px] text-muted-foreground ml-1">
              O CPF não pode ser alterado.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cellphone">Telefone</Label>
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
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              required
            />
          </div>
        </div>

        {/* Error list */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <Alert key={i} variant="destructive" className="py-2">
                <AlertDescription className="text-xs">{err}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="sm:w-32"
            >
              Cancelar
            </Button>
          )}
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
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
