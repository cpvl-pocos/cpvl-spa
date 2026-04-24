// src/pages/Pilots/Pilots.component.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Mail,
  Phone,
  User,
  Trash2,
  ChevronRight,
  Search,
  Filter,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import { SearchField } from '@/components/SearchField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatPhone, normalizeString } from '@/util/format';
import type { IPilot } from '@/types';

export const Pilots = () => {
  const [pilots, setPilots] = useState<IPilot[]>([]);
  const [statusType, setStatusType] = useState<'statusCadastral' | 'statusPayment'>('statusCadastral');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pilotToDelete, setPilotToDelete] = useState<IPilot | null>(null);

  const navigate = useNavigate();

  const {
    data: pilotsData,
    error: pilotsError,
    loading: loadingPilots
  } = useFetch<IPilot[]>({ url: getURI(API.pilots) });

  const { data: pilotsPaymentData } = useFetch<IPilot[]>({ url: getURI(API.statusPayment) });
  const { data: statusCadastralData } = useFetch<string[]>({ url: getURI(API.validStatusCadastral) });
  const { data: statusPaymentData } = useFetch<string[]>({ url: getURI(API.validStatusPayment) });

  // Sync pilots based on statusType
  useEffect(() => {
    const currentData = statusType === 'statusCadastral' ? pilotsData : pilotsPaymentData;
    setPilots(Array.isArray(currentData) ? currentData : []);
  }, [statusType, pilotsData, pilotsPaymentData]);

  // Sync status options
  useEffect(() => {
    const rawOptions = statusType === 'statusCadastral' ? statusCadastralData : statusPaymentData;
    if (Array.isArray(rawOptions) && rawOptions.length > 0) {
      const normalized = rawOptions.map(s => String(s).trim());
      setStatusOptions(normalized);
      
      // Set default filter
      if (statusType === 'statusPayment') {
        const confirmOption = normalized.find(o => o.toLowerCase() === 'confirmar');
        setStatusFilter(confirmOption || normalized[0] || '');
      } else {
        setStatusFilter(normalized[0] || '');
      }
    } else {
      setStatusOptions([]);
      setStatusFilter('');
    }
  }, [statusType, statusCadastralData, statusPaymentData]);

  // Derived filtered and sorted pilots
  const filteredPilots = useMemo(() => {
    let result = [...pilots];
    const filterNorm = normalizeString(statusFilter);
    const searchNorm = normalizeString(searchTerm);

    if (statusFilter) {
      result = result.filter(p => normalizeString(p.status) === filterNorm);

      if (filterNorm === 'confirmado') {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        result = result.filter(
          p => Number(p.ref_month) === currentMonth && String(p.ref_year) === String(currentYear)
        );
      }
    }

    if (searchTerm) {
      result = result.filter(p => {
        const fullName = normalizeString(`${p.firstName || ''} ${p.lastName || ''}`);
        return fullName.includes(searchNorm) || 
               normalizeString(p.cpf).includes(searchNorm) || 
               normalizeString(p.email).includes(searchNorm);
      });
    }

    return result.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });
  }, [statusFilter, pilots, searchTerm]);

  useEffect(() => {
    if (pilotsError) setActionError(pilotsError.message || 'Erro ao carregar pilotos');
  }, [pilotsError]);

  const handleToggleSelection = useCallback((userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  }, []);

  const { doFetch: doBatchUpdate } = useFetch<any>({ method: 'PATCH' });
  const { doFetch: doDeletePayment } = useFetch<any>({ method: 'DELETE' });

  const handleBulkAction = async (status: string) => {
    setIsBulkLoading(true);
    setActionError(null);
    try {
      await doBatchUpdate({
        url: getURI(API.pilots + '/batch-status'),
        body: { userIds: selectedUserIds, status }
      });
      setActionMessage(`Sucesso: ${selectedUserIds.length} piloto(s) atualizado(s).`);
      setSelectedUserIds([]);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao processar ação em lote');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!pilotToDelete) return;
    setIsDeletingPayment(true);
    setActionError(null);

    try {
      const userConfirmPayments = pilots.filter(
        p => p.userId === pilotToDelete.userId && p.status?.toLowerCase() === 'confirmar'
      );

      await Promise.all(userConfirmPayments.map(payment => 
        doDeletePayment({
          url: `${getURI(API.deletePaymentMonthly)}/${payment.userId}/${payment.ref_year}/${payment.ref_month}`
        })
      ));

      setActionMessage(`Sucesso! ${userConfirmPayments.length} pagamento(s) removido(s).`);
      setDeleteModalOpen(false);
      setPilotToDelete(null);
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao remover pagamentos');
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const confirmPaymentsCount = useMemo(() => 
    pilotToDelete ? pilots.filter(p => p.userId === pilotToDelete.userId && p.status?.toLowerCase() === 'confirmar').length : 0
  , [pilotToDelete, pilots]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
            <DialogTitle className="text-xl font-black text-orange-600">Não confirmar pagamento?</DialogTitle>
            <DialogDescription className="text-slate-600 py-4">
              Tem certeza que deseja <span className="font-bold text-slate-900">não confirmar</span> o pagamento de:
              <span className="text-primary font-black text-lg block mt-2">
                {pilotToDelete?.firstName} {pilotToDelete?.lastName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-4">
            <p className="text-amber-700 text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              ⚠️ Será removido {confirmPaymentsCount} {confirmPaymentsCount === 1 ? 'registro' : 'registros'}
            </p>
            <p className="text-amber-600 text-[11px] mt-1">Esta ação não pode ser desfeita.</p>
          </div>

          <DialogFooter className="flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl px-8 font-bold">Cancelar</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeletingPayment} className="rounded-xl px-8 font-black">
              {isDeletingPayment ? 'Removendo...' : `Remover ${confirmPaymentsCount}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
              <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-bold">Pilotos</span>
            </nav>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Gestão de Pilotos</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-white shadow-sm">
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              <button onClick={() => setStatusType('statusCadastral')} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", statusType === 'statusCadastral' ? "bg-white text-primary shadow-sm" : "text-slate-500")}>Cadastral</button>
              <button onClick={() => setStatusType('statusPayment')} className={cn("px-4 py-2 rounded-lg text-xs font-black transition-all", statusType === 'statusPayment' ? "bg-white text-primary shadow-sm" : "text-slate-500")}>Pagamento</button>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-6" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-none bg-transparent font-bold focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status} className="font-medium rounded-lg mx-1">{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary" />
            <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Buscar..." fullWidth className="pl-12 h-14 rounded-2xl" />
          </div>

          {statusType === 'statusCadastral' && normalizeString(statusFilter) === 'pendente' && selectedUserIds.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white font-black">{selectedUserIds.length}</Badge>
                <span className="font-bold text-primary">Pilotos selecionados</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUserIds([])}>Cancelar</Button>
                <Button onClick={() => handleBulkAction('filiado')} disabled={isBulkLoading} className="bg-green-600 hover:bg-green-700">Autorizar</Button>
                <Button variant="destructive" onClick={() => handleBulkAction('Excluído')} disabled={isBulkLoading}>Recusar</Button>
              </div>
            </div>
          )}

          {actionMessage && <Badge className="bg-green-50 text-green-700 border-green-100 w-full py-2">{actionMessage}</Badge>}
          {actionError && <Badge variant="destructive" className="w-full py-2">{actionError}</Badge>}
        </div>

        <div className="space-y-4">
          {loadingPilots ? (
            <div className="flex flex-col items-center py-20 gap-4"><Spinner className="w-12 h-12" /><p className="text-slate-400 font-bold">Carregando...</p></div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2">
                <span className="text-slate-500 font-bold text-sm">{filteredPilots.length} resultados</span>
              </div>

              {filteredPilots.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPilots.map((pilot, idx) => (
                    <Card key={`${pilot.userId}-${idx}`} className="group relative overflow-hidden hover:scale-[1.01] hover:shadow-xl transition-all rounded-2xl cursor-pointer" onClick={() => navigate('/dashboard/pilots/' + pilot.userId)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        {statusType === 'statusCadastral' && normalizeString(statusFilter) === 'pendente' && (
                          <div onClick={e => e.stopPropagation()}><Checkbox checked={selectedUserIds.includes(pilot.userId)} onCheckedChange={() => handleToggleSelection(pilot.userId)} className="w-6 h-6" /></div>
                        )}
                        <Avatar className="h-16 w-16 border-4 border-slate-50"><AvatarImage src={pilot.photoUrl} className="object-cover" /><AvatarFallback><User /></AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="text-lg font-black truncate">{pilot.firstName} {pilot.lastName}</h3>
                            {statusType === 'statusPayment' && <Badge variant="outline" className="text-[10px]">Ref: {pilot.ref_month}/{pilot.ref_year}</Badge>}
                          </div>
                          <div className="flex gap-4 text-slate-400 text-xs font-medium">
                            <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{formatPhone(pilot.cellphone)}</div>
                            <div className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" />{pilot.email}</div>
                          </div>
                        </div>
                        {statusType === 'statusPayment' && normalizeString(statusFilter) === 'confirmar' ? (
                          <div onClick={e => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => { setPilotToDelete(pilot); setDeleteModalOpen(true); }} className="text-orange-400"><Trash2 /></Button>
                          </div>
                        ) : <ChevronRight className="w-5 h-5 text-slate-300" />}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-20 bg-slate-50/50 rounded-3xl border border-dashed"><Filter className="w-12 h-12 text-slate-200 mb-4" /><p className="text-slate-400 font-bold">Nenhum piloto encontrado.</p></div>
              )}
            </>
          )}
        </div>
      </div>

      <button aria-label="add-pilot" className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-2xl bg-primary text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-all group overflow-hidden">
        <Plus className="relative z-10 w-8 h-8 font-black" />
      </button>
    </div>
  );
};

export default Pilots;
