// src/pages/Pilots/Pilots.component.tsx
import { useEffect, useState } from 'react';
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
  CheckCircle2,
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

interface IPilot {
  id?: number;
  userId: number;
  firstName: string;
  lastName: string;
  cpf: string;
  cellphone: string;
  email: string;
  status: string;
  agreeStatute?: boolean;
  agreeRI?: boolean;
  ref_year?: number;
  ref_month?: number;
  type?: string;
  photoUrl?: string;
}

export const Pilots = () => {
  const [pilots, setPilots] = useState<IPilot[]>([]);
  const [filteredPilots, setFilteredPilots] = useState<IPilot[]>([]);
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
  } = useFetch<IPilot[]>({
    method: 'GET',
    url: getURI(API.pilots)
  });

  const { data: pilotsPaymentData } = useFetch<IPilot[]>({
    method: 'GET',
    url: getURI(API.statusPayment)
  });

  const { data: statusCadastralData } = useFetch<string[]>({
    method: 'GET',
    url: getURI(API.validStatusCadastral)
  });

  const { data: statusPaymentData } = useFetch<string[]>({
    method: 'GET',
    url: getURI(API.validStatusPayment)
  });

  useEffect(() => {
    if (statusType === 'statusCadastral') {
      setPilots((pilotsData && Array.isArray(pilotsData)) ? pilotsData : []);
    } else {
      setPilots((pilotsPaymentData && Array.isArray(pilotsPaymentData)) ? pilotsPaymentData : []);
    }
  }, [statusType, pilotsData, pilotsPaymentData]);

  useEffect(() => {
    const normalizeRaw = (s: any) => s === null || s === undefined ? '' : String(s).trim();

    if (statusType === 'statusCadastral') {
      if (Array.isArray(statusCadastralData) && statusCadastralData.length > 0) {
        const normalized = statusCadastralData.map(normalizeRaw);
        setStatusOptions(normalized);
        setStatusFilter(normalized[0] || '');
      } else {
        setStatusOptions([]);
        setStatusFilter('');
      }
    } else {
      if (Array.isArray(statusPaymentData) && statusPaymentData.length > 0) {
        const normalized = statusPaymentData.map(normalizeRaw);
        setStatusOptions(normalized);
        const confirmOption = normalized.find((o) => o.toLowerCase() === 'confirmar');
        setStatusFilter(confirmOption || normalized[0] || '');
      } else {
        setStatusOptions([]);
        setStatusFilter('');
      }
    }
  }, [statusType, statusCadastralData, statusPaymentData]);

  useEffect(() => {
    const norm = (v: any) => v === null || v === undefined ? '' : String(v).trim().toLowerCase();
    let result = pilots || [];

    if (statusFilter && result.length > 0) {
      const filterNorm = norm(statusFilter);
      result = result.filter((p) => norm(p.status) === filterNorm);

      if (filterNorm === 'confirmado') {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        result = result.filter(
          (p) => Number(p.ref_month) === currentMonth && String(p.ref_year) === String(currentYear)
        );
      }
    }

    if (searchTerm && result.length > 0) {
      const searchNorm = norm(searchTerm);
      result = result.filter((p) => {
        const fullName = norm(`${p.firstName || ''} ${p.lastName || ''}`);
        return fullName.includes(searchNorm);
      });
    }

    const sorted = [...result].sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
      return nameA.localeCompare(nameB, 'pt-BR');
    });

    setFilteredPilots(sorted);
  }, [statusFilter, pilots, searchTerm]);

  useEffect(() => {
    if (pilotsError) {
      setActionError(pilotsError?.message || 'Erro ao carregar pilotos');
    } else {
      setActionError(null);
    }
  }, [pilotsError]);

  const handlePilotClick = (pilot: IPilot) => {
    navigate('/dashboard/pilots/' + pilot.userId);
  };

  const handleToggleSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const { doFetch: doBatchUpdate } = useFetch<any>({ method: 'PATCH' });
  const { doFetch: doDeletePayment } = useFetch<any>({ method: 'DELETE' });

  const handleBulkAction = async (status: string) => {
    setIsBulkLoading(true);
    setActionError(null);
    setActionMessage(null);

    try {
      await doBatchUpdate({
        url: getURI(API.pilots + '/batch-status'),
        method: 'PATCH',
        body: { userIds: selectedUserIds, status }
      });

      setActionMessage(`Sucesso: ${selectedUserIds.length} piloto(s) atualizado(s).`);
      setSelectedUserIds([]);
      window.location.reload();
    } catch (err: any) {
      setActionError(err.message || 'Erro ao processar ação em lote');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleDeletePayment = (pilot: IPilot) => {
    if (!pilot.ref_year || !pilot.ref_month) {
      setActionError('Informações de pagamento incompletas');
      return;
    }
    setPilotToDelete(pilot);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pilotToDelete) return;
    setIsDeletingPayment(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const userConfirmPayments = pilots.filter(
        (p) => p.userId === pilotToDelete.userId && p.status?.toLowerCase() === 'confirmar'
      );

      let totalDeleted = 0;
      for (const payment of userConfirmPayments) {
        if (!payment.ref_year || !payment.ref_month) continue;
        await doDeletePayment({
          url: `${getURI(API.deletePaymentMonthly)}/${payment.userId}/${payment.ref_year}/${payment.ref_month}`,
          method: 'DELETE'
        });
        totalDeleted++;
      }

      setActionMessage(`Sucesso! ${totalDeleted} pagamento(s) removido(s).`);
      const recordsToDeleteSet = new Set(userConfirmPayments.map(p => `${p.userId}-${p.ref_year}-${p.ref_month}`));

      setFilteredPilots(prev => prev.filter(p => !recordsToDeleteSet.has(`${p.userId}-${p.ref_year}-${p.ref_month}`)));
      setPilots(prev => prev.filter(p => !recordsToDeleteSet.has(`${p.userId}-${p.ref_year}-${p.ref_month}`)));
      setDeleteModalOpen(false);
      setPilotToDelete(null);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao remover pagamentos');
    } finally {
      setIsDeletingPayment(false);
    }
  };

  const confirmPaymentsCount = pilotToDelete
    ? pilots.filter(p => p.userId === pilotToDelete.userId && p.status?.toLowerCase() === 'confirmar').length
    : 0;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-black text-red-600">Não confirmar pagamento?</DialogTitle>
            <DialogDescription className="text-slate-600 py-4">
              Tem certeza que deseja <span className="font-bold text-slate-900">não confirmar</span> o pagamento de:
              <br />
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
            <p className="text-amber-600 text-[11px] mt-1">
              Esta ação não pode ser desfeita. O(s) registro(s) será(ão) permanentemente removido(s).
            </p>
          </div>

          <DialogFooter className="flex-row gap-2 justify-center sm:justify-center">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} className="rounded-xl px-8 font-bold border-slate-200">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeletingPayment} className="rounded-xl px-8 font-black shadow-lg shadow-red-200">
              {isDeletingPayment ? 'Removendo...' : `Remover ${confirmPaymentsCount}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Page Layout */}
      <div className="flex flex-col gap-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-sm font-medium text-muted-foreground/60">
              <button onClick={() => navigate('/dashboard')} className="hover:text-primary transition-colors">Dashboard</button>
              <ChevronRight className="w-3 h-3" />
              <span className="text-primary font-bold">Pilotos</span>
            </nav>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Gestão de Pilotos</h1>
              <p className="text-slate-500 font-medium">Controle cadastral e financeiro da base de pilotos</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-white shadow-sm">
            <div className="flex bg-slate-100/80 p-1 rounded-xl">
              <button
                onClick={() => setStatusType('statusCadastral')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black transition-all",
                  statusType === 'statusCadastral' ? "bg-white text-primary shadow-sm" : "text-slate-500"
                )}
              >
                Cadastral
              </button>
              <button
                onClick={() => setStatusType('statusPayment')}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-black transition-all",
                  statusType === 'statusPayment' ? "bg-white text-primary shadow-sm" : "text-slate-500"
                )}
              >
                Pagamento
              </button>
            </div>

            <Separator orientation="vertical" className="hidden sm:block h-6" />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] border-none bg-transparent font-bold focus:ring-0">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-none shadow-2xl">
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} className="font-medium focus:bg-primary/5 focus:text-primary rounded-lg mx-1">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search & Bulk Actions */}
        <div className="flex flex-col gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por nome, CPF ou email..."
              fullWidth
              className="pl-12 h-14 bg-white border-slate-100 hover:border-primary/20 focus:border-primary/30 transition-all rounded-2xl shadow-sm text-lg font-medium"
            />
          </div>

          {/* Bulk Action Bar */}
          {statusType === 'statusCadastral' && statusFilter.toLowerCase() === 'pendente' && selectedUserIds.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary text-white text-md px-3 py-1 rounded-full font-black">
                  {selectedUserIds.length}
                </Badge>
                <span className="font-bold text-primary">Pilotos selecionados para ação em lote</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedUserIds([])} className="rounded-xl font-bold bg-white/50">Cancelar</Button>
                <Button onClick={() => handleBulkAction('filiado')} disabled={isBulkLoading} className="rounded-xl bg-green-600 hover:bg-green-700 font-bold gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Autorizar
                </Button>
                <Button variant="destructive" onClick={() => handleBulkAction('Excluído')} disabled={isBulkLoading} className="rounded-xl font-bold">
                  Recusar
                </Button>
              </div>
            </div>
          )}

          {/* Messages */}
          {actionMessage && <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 font-bold py-2 px-4 rounded-xl block text-center animate-out fade-out duration-1000">{actionMessage}</Badge>}
          {actionError && <Badge variant="destructive" className="font-bold py-2 px-4 rounded-xl block text-center">{actionError}</Badge>}
        </div>

        {/* Pilots List Content */}
        <div className="space-y-4">
          {loadingPilots ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Spinner className="w-12 h-12 text-primary" />
              <p className="text-slate-400 font-bold animate-pulse">Carregando base de pilotos...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2">
                <span className="text-slate-500 font-bold text-sm">
                  {filteredPilots.length} {filteredPilots.length === 1 ? 'resultado' : 'resultados'}
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Total Database: {pilotsData?.length || 0}
                </div>
              </div>

              {filteredPilots.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPilots.map((pilot, index) => (
                    <Card
                      key={`${pilot.userId}-${pilot.ref_year}-${pilot.ref_month}-${index}`}
                      className="group relative overflow-hidden transition-all hover:scale-[1.01] hover:shadow-xl border-slate-100 hover:border-primary/20 bg-white shadow-sm rounded-2xl cursor-pointer"
                      onClick={() => handlePilotClick(pilot)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        {statusType === 'statusCadastral' && statusFilter.toLowerCase() === 'pendente' && (
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedUserIds.includes(pilot.userId)}
                              onCheckedChange={() => handleToggleSelection(pilot.userId)}
                              className="w-6 h-6 rounded-lg border-slate-200"
                            />
                          </div>
                        )}

                        <Avatar className="h-16 w-16 border-4 border-slate-50 group-hover:border-primary/10 transition-all shadow-sm">
                          <AvatarImage src={pilot.photoUrl} alt={pilot.firstName} className="object-cover" />
                          <AvatarFallback className="bg-slate-100 text-slate-400">
                            <User className="w-8 h-8" />
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">
                              {pilot.firstName} {pilot.lastName}
                            </h3>
                            {statusType === 'statusPayment' && (
                              <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-100 px-2">
                                Ref: {pilot.ref_month}/{pilot.ref_year}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
                              <Phone className="w-3 h-3" />
                              <span>{pilot.cellphone}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{pilot.email}</span>
                            </div>
                          </div>
                        </div>

                        {statusType === 'statusPayment' && statusFilter.toLowerCase() === 'confirmar' ? (
                          <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePayment(pilot)}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                        )}
                      </CardContent>
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <Filter className="w-12 h-12 text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold">Nenhum piloto encontrado com os filtros atuais.</p>
                  <Button variant="link" onClick={() => { setStatusFilter(''); setSearchTerm(''); }} className="mt-2 text-primary">Limpar filtros</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating Add Action */}
      <button
        aria-label="add-pilot"
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center hover:scale-110 hover:shadow-primary/40 active:scale-95 transition-all group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Plus className="relative z-10 w-8 h-8 font-black" />
      </button>
    </div>
  );
};

export default Pilots;
