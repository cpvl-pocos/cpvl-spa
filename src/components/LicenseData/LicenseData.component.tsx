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
import type { ILicenseData, IPilot } from '@/types';

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
  const [formState, setFormState] = useState<Omit<ILicenseData, 'id' | 'userId'>>({
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

  const { doFetch: doSave, error: saveError } = useFetch<ILicenseData>({ method: 'POST' });

  useEffect(() => {
    if (existingData) {
      setFormState({
        civl: existingData.civl || '',
        pilotLevel: existingData.pilotLevel || '',
        cbvlExpiration: existingData.cbvlExpiration?.split('T')[0] || '',
        imgCbvl: existingData.imgCbvl || '',
        anacExpiration: existingData.anacExpiration?.split('T')[0] || '',
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
        body: { userId, ...formState }
      });
      setSuccessMessage('Dados de licença salvos com sucesso!');
      setIsSubmitting(false);
      fetchExisting({ url: getURI(`${API.licenseData}/${userId}`) });
    } catch (err) {
      setIsSubmitting(false);
      setFormError('Falha ao salvar os dados.');
    }
  };

  const handleClear = () => {
    setFormState({ civl: '', pilotLevel: '', cbvlExpiration: '', imgCbvl: '', anacExpiration: '', imgAnac: '', status: '' });
    setFormError(undefined);
    setSuccessMessage(undefined);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    setFormError(undefined);
  };

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({ ...prev, pilotLevel: value }));
    setFormError(undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'imgCbvl' | 'imgAnac') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setFormError('O arquivo deve ter no máximo 2MB');
    
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) return setFormError('O arquivo deve ser uma imagem ou PDF');

    const reader = new FileReader();
    reader.onload = () => {
      setFormState(prev => ({ ...prev, [field]: reader.result as string }));
      setFormError(undefined);
    };
    reader.readAsDataURL(file);
  };

  const { data: pilotData } = useFetch<IPilot>({
    url: userId ? getURI(`${API.pilots}/${userId}`) : undefined,
    method: 'GET',
    immediate: !userName
  });

  const displayName = userName || (pilotData ? `${pilotData.firstName} ${pilotData.lastName}` : '');

  if (loadingExisting) return <div className="flex justify-center p-12"><Spinner className="h-10 w-10" /></div>;

  return (
    <div className="p-0 space-y-0 animate-in fade-in duration-500 w-full max-w-4xl mx-auto overflow-y-auto max-h-[90vh] scrollbar-thin">
      <div className="relative overflow-hidden bg-slate-900 sm:rounded-[2rem] p-6 md:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl"><ShieldCheck size={24} className="text-primary-foreground" /></div>
            {formState.status && (
              <Badge variant={formState.status === 'Confirmado' ? 'success' : 'warning'} className="px-3 rounded-full font-black uppercase tracking-widest text-[9px] shadow-lg">
                {formState.status === 'Confirmado' ? <CheckCircle2 size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                {formState.status === 'Confirmado' ? 'Validado' : 'Em Análise'}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight">Documentação</h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-wide uppercase">{displayName || 'Gerenciamento de licenças'}</p>
          </div>
        </div>
      </div>

      <div className="px-3 md:px-8 -mt-8 relative z-20 space-y-6 pb-10">
        {(formError || successMessage) && (
          <div className="space-y-4">
            {formError && <Alert variant="destructive" className="rounded-2xl border-none shadow-xl bg-red-50 text-red-600"><AlertCircle className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{formError}</AlertDescription></Alert>}
            {successMessage && <Alert className="rounded-2xl border-none shadow-xl bg-green-50 text-green-600"><CheckCircle2 className="h-4 w-4" /><AlertDescription className="font-bold text-xs">{successMessage}</AlertDescription></Alert>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white/90 p-6 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1"><Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">CIVL ID Global</Label><a href="https://civlcomps.org/" target="_blank" rel="noopener" className="text-[9px] text-primary font-black flex items-center gap-1 transition-all">CONSULTAR <ChevronRight size={10} /></a></div>
                <Input name="civl" value={formState.civl || ''} onChange={handleChange} placeholder="Ex: 123456" className="h-12 rounded-2xl bg-slate-50 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700 uppercase tracking-widest text-[9px]">Nível de Habilitação</Label>
                <Select value={formState.pilotLevel} onValueChange={handleSelectChange}>
                  <SelectTrigger className="h-12 rounded-2xl bg-slate-50 font-bold"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl">{PILOT_LEVELS.map(l => <SelectItem key={l} value={l} className="rounded-xl font-bold py-3">Nível {l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {['CBVL', 'ANAC'].map((type) => {
              const field = type === 'CBVL' ? 'imgCbvl' : 'imgAnac';
              const dateField = type === 'CBVL' ? 'cbvlExpiration' : 'anacExpiration';
              const isCbvl = type === 'CBVL';
              return (
                <Card key={type} className="rounded-[2.5rem] border-none shadow-sm bg-white/90 overflow-hidden group">
                  <div className={cn("h-1 w-full transition-colors duration-500", isCbvl ? "bg-primary/20 group-hover:bg-primary" : "bg-slate-200 group-hover:bg-slate-400")} />
                  <div className="p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shadow-inner", isCbvl ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600")}>{isCbvl ? <IdCard size={20} /> : <FileText size={20} />}</div>
                      <div><h3 className="font-black text-slate-900 text-sm md:text-base">Carteirinha {type}</h3><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Documento {isCbvl ? '01' : '02'}</p></div>
                    </div>
                    <div className="space-y-5">
                      <div className="space-y-2"><Label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Data de Expiração</Label><Input name={dateField} type="date" value={formState[dateField as keyof typeof formState] || ''} onChange={handleChange} className="h-11 rounded-xl border-slate-100 bg-slate-50/30 font-bold" /></div>
                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Anexo do Documento</Label>
                        <div className="flex items-center gap-3">
                          <Button type="button" variant="outline" className={cn("flex-1 h-11 rounded-xl border-slate-100 font-bold transition-all relative text-xs", formState[field] ? "bg-primary/5 border-primary/20 text-primary" : "hover:bg-primary/5")} asChild><label className="cursor-pointer"><FileUp className="mr-2 h-4 w-4" />{formState[field] ? 'Substituir' : 'Enviar Documento'}<input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileUpload(e, field)} /></label></Button>
                          {formState[field] && <Button type="button" variant="destructive" size="icon" className="h-11 w-11 rounded-xl" onClick={() => setFormState(prev => ({ ...prev, [field]: '' }))}><Trash2 className="h-4 w-4" /></Button>}
                        </div>
                        {formState[field] && <div className="flex items-center gap-2 text-green-600 animate-in fade-in"><CheckCircle2 size={12} strokeWidth={3} /><span className="text-[9px] font-black uppercase tracking-widest">Anexado</span></div>}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-4 pt-6">
            <div className="flex gap-3 flex-1">
              {onClose && <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black text-slate-400">VOLTAR</Button>}
              <Button type="button" variant="outline" onClick={handleClear} disabled={isSubmitting} className="flex-1 rounded-2xl h-12 font-black border-slate-200 text-slate-500"><Eraser className="mr-2 h-4 w-4" />LIMPAR</Button>
            </div>
            <Button type="submit" disabled={isSubmitting} className="flex-1 max-w-[240px] rounded-2xl h-12 font-black shadow-xl">{isSubmitting ? <Spinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-5 w-5" />}SALVAR DADOS</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
