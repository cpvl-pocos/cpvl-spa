import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import {
  FileUp,
  Trash2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Save,
  Eraser,
  IdCard,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ILicenseData {
  id?: number;
  userId: number;
  civl?: string;
  pilotLevel?: string;
  cbvlExpiration?: string;
  imgCbvl?: string;
  anacExpiration?: string;
  imgAnac?: string;
  status?: string;
}

interface LicenseDataProps {
  userId: number;
  userName?: string;
  onClose?: () => void;
}

const PILOT_LEVELS = ['I', 'II', 'III', 'IV', 'V'];

export const LicenseData: React.FC<LicenseDataProps> = ({
  userId,
  userName,
  onClose
}) => {
  const [formState, setFormState] = useState<
    Omit<ILicenseData, 'id' | 'userId'>
  >({
    civl: '',
    pilotLevel: '',
    cbvlExpiration: '',
    imgCbvl: '',
    anacExpiration: '',
    imgAnac: '',
    status: ''
  });
  const [formError, setFormError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: existingData,
    loading: loadingExisting,
    doFetch: fetchExisting
  } = useFetch<ILicenseData>({
    url: getURI(`${API.licenseData}/${userId}`),
    method: 'GET'
  });

  const { doFetch: doSave, error: saveError } = useFetch<ILicenseData>({
    method: 'POST'
  });

  useEffect(() => {
    if (existingData) {
      setFormState({
        civl: existingData.civl || '',
        pilotLevel: existingData.pilotLevel || '',
        cbvlExpiration: existingData.cbvlExpiration
          ? existingData.cbvlExpiration.split('T')[0]
          : '',
        imgCbvl: existingData.imgCbvl || '',
        anacExpiration: existingData.anacExpiration
          ? existingData.anacExpiration.split('T')[0]
          : '',
        imgAnac: existingData.imgAnac || '',
        status: existingData.status || ''
      });
    }
  }, [existingData]);

  useEffect(() => {
    if (saveError) {
      setIsSubmitting(false);
      setFormError(saveError.message || 'Erro ao salvar dados');
    }
  }, [saveError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(undefined);
    setSuccessMessage(undefined);
    setIsSubmitting(true);

    try {
      await doSave({
        url: getURI(API.licenseData),
        method: 'POST',
        body: {
          userId,
          ...formState
        }
      });
      setSuccessMessage('Dados de licença salvos com sucesso!');
      setIsSubmitting(false);

      // Re-fetch to get updated data
      fetchExisting({
        url: getURI(`${API.licenseData}/${userId}`),
        method: 'GET'
      });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao salvar os dados.');
    }
  };

  const handleClear = () => {
    setFormState({
      civl: '',
      pilotLevel: '',
      cbvlExpiration: '',
      imgCbvl: '',
      anacExpiration: '',
      imgAnac: '',
      status: ''
    });
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      pilotLevel: value
    }));
    setFormError(undefined);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imgCbvl' | 'imgAnac'
  ) => {
    const files = e.target.files;
    const file = files && files.length > 0 ? files[0] : null;
    if (!file) return;

    // Validate file size (max 2MB for documents)
    if (file.size > 2 * 1024 * 1024) {
      setFormError('O arquivo deve ter no máximo 2MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFormError('O arquivo deve ser uma imagem (JPG, PNG) ou PDF');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormState((prev) => ({
        ...prev,
        [field]: reader.result as string
      }));
      setFormError(undefined);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (field: 'imgCbvl' | 'imgAnac') => {
    setFormState((prev) => ({
      ...prev,
      [field]: ''
    }));
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
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="text-sm font-bold text-muted-foreground animate-pulse">Carregando documentação...</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-8 animate-in fade-in duration-500">
      {/* Dynamic Header */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
              <ShieldCheck size={28} className="text-primary-foreground" />
            </div>
            {formState.status && (
              <Badge
                variant={formState.status === 'Confirmado' ? 'success' : 'warning'}
                className="h-8 px-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg"
              >
                {formState.status === 'Confirmado' ? (
                  <CheckCircle2 size={12} className="mr-1.5" />
                ) : (
                  <AlertCircle size={12} className="mr-1.5" />
                )}
                {formState.status === 'Confirmado' ? 'Validado' : 'Em Análise'}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight font-['Flamenco']">Documentação</h2>
            <p className="text-slate-400 font-bold text-sm tracking-wide">
              {displayName ? `Piloto: ${displayName}` : 'Gerenciamento de licenças'}
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
        {/* General Info Card */}
        <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="civl" className="font-black text-slate-700 uppercase tracking-widest text-[10px]">CIVL ID Global</Label>
                <a
                  href="https://civlcomps.org/"
                  target="_blank"
                  rel="noopener"
                  className="text-[10px] text-primary hover:underline font-black flex items-center gap-1 transition-all hover:gap-1.5"
                >
                  <Globe size={10} />
                  CONSULTAR
                  <ChevronRight size={10} />
                </a>
              </div>
              <Input
                id="civl"
                name="civl"
                value={formState.civl || ''}
                onChange={handleChange}
                placeholder="Ex: 123456"
                className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="pilotLevel" className="font-black text-slate-700 uppercase tracking-widest text-[10px] px-1">Nível de Habilitação</Label>
              <Select
                value={formState.pilotLevel}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="pilotLevel" className="h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus:ring-primary/20 font-bold">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                  {PILOT_LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="rounded-xl font-bold py-3">
                      Nível {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* CBVL Card */}
          <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden group">
            <div className="h-1.5 w-full bg-primary/20 group-hover:bg-primary transition-all duration-500" />
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <IdCard size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Carteirinha CBVL</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Documento 01</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="cbvlExpiration" className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Data de Expiração</Label>
                  <Input
                    id="cbvlExpiration"
                    name="cbvlExpiration"
                    type="date"
                    value={formState.cbvlExpiration || ''}
                    onChange={handleChange}
                    className="h-12 rounded-2xl border-slate-100 bg-white font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Anexo do Documento</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex-1 h-12 rounded-2xl border-slate-100 font-bold transition-all relative overflow-hidden group/btn",
                        formState.imgCbvl ? "bg-primary/5 border-primary/20 text-primary" : "hover:border-primary/20 hover:bg-primary/5"
                      )}
                      asChild
                    >
                      <label className="cursor-pointer">
                        <FileUp className="mr-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-1" />
                        {formState.imgCbvl ? 'Substituir' : 'Enviar Documento'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'imgCbvl')}
                        />
                      </label>
                    </Button>
                    {formState.imgCbvl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-12 w-12 rounded-2xl shadow-lg shadow-destructive/10"
                        onClick={() => handleRemoveFile('imgCbvl')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {formState.imgCbvl && (
                    <div className="flex items-center gap-2 px-1 text-green-600 animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 size={12} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Anexado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* ANAC Card */}
          <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] bg-white/80 backdrop-blur-xl overflow-hidden group">
            <div className="h-1.5 w-full bg-slate-200 group-hover:bg-slate-400 transition-all duration-500" />
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 shadow-inner">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 tracking-tight">Carteirinha ANAC</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Documento 02</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="anacExpiration" className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Data de Expiração</Label>
                  <Input
                    id="anacExpiration"
                    name="anacExpiration"
                    type="date"
                    value={formState.anacExpiration || ''}
                    onChange={handleChange}
                    className="h-12 rounded-2xl border-slate-100 bg-white font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-wider ml-1">Anexo do Documento</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "flex-1 h-12 rounded-2xl border-slate-100 font-bold transition-all relative overflow-hidden group/btn",
                        formState.imgAnac ? "bg-slate-100 border-slate-300 text-slate-900" : "hover:border-slate-300 hover:bg-slate-100"
                      )}
                      asChild
                    >
                      <label className="cursor-pointer">
                        <FileUp className="mr-2 h-4 w-4 transition-transform group-hover/btn:-translate-y-1" />
                        {formState.imgAnac ? 'Substituir' : 'Enviar Documento'}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(e, 'imgAnac')}
                        />
                      </label>
                    </Button>
                    {formState.imgAnac && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="h-12 w-12 rounded-2xl shadow-lg shadow-destructive/10"
                        onClick={() => handleRemoveFile('imgAnac')}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  {formState.imgAnac && (
                    <div className="flex items-center gap-2 px-1 text-slate-600 animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 size={12} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Anexado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-8 border-t border-slate-100">
          <div className="flex gap-3 flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={isSubmitting}
              className="flex-1 rounded-2xl h-14 font-black border-slate-200 text-slate-500 hover:text-primary hover:bg-primary/5"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Limpar Campos
            </Button>
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 rounded-2xl h-14 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                Voltar
              </Button>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:max-w-[240px] rounded-2xl h-14 font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
