// src/pages/LicenseReview/LicenseReview.component.tsx
import { useState, useCallback } from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useFetch } from '@/hooks';
import { API, getURI } from '@/services';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';


interface ILicensePending {
  userId: number;
  civl: string;
  pilotLevel: string;
  cbvlExpiration: string;
  imgCbvl: string;
  anacExpiration: string;
  imgAnac: string;
  status: string;
  user: {
    username: string;
    email?: string;
  };
  pilot: {
    firstName: string;
    lastName: string;
  };
}

export const LicenseReview = () => {
  const [selectedData, setSelectedData] = useState<ILicensePending | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<'CBVL' | 'ANAC' | null>(null);
  const [openReview, setOpenReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = useCallback(() => setZoom(prev => Math.min(prev + 0.25, 3)), []);
  const handleZoomOut = useCallback(() => setZoom(prev => Math.max(prev - 0.25, 0.5)), []);
  const handleZoomReset = useCallback(() => setZoom(1), []);

  const {
    data: pending,
    loading,
    doFetch: refreshPending
  } = useFetch<ILicensePending[]>({
    url: getURI(`${API.licenseData}/pending`),
    method: 'GET'
  });

  const { doFetch: doConfirm } = useFetch<any>({
    method: 'PATCH'
  });

  const { doFetch: doReject } = useFetch<any>({
    method: 'PATCH'
  });

  const handleOpenReview = (item: ILicensePending, docType: 'CBVL' | 'ANAC') => {
    setSelectedData(item);
    setSelectedDocType(docType);
    setOpenReview(true);
  };

  const handleConfirm = async (userId: number) => {
    try {
      await doConfirm({
        url: getURI(`${API.licenseData}/${userId}/confirm`),
        method: 'PATCH'
      });
      setSuccessMsg('Documentação confirmada com sucesso!');
      setOpenReview(false);
      refreshPending({
        url: getURI(`${API.licenseData}/pending`),
        method: 'GET'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao confirmar documentação.');
    }
  };

  const handleReject = async (userId: number, docType: 'CBVL' | 'ANAC') => {
    try {
      await doReject({
        url: getURI(`${API.licenseData}/${userId}/reject`),
        method: 'PATCH',
        body: { docType }
      });

      setSuccessMsg('Documentação rejeitada e email enviado ao piloto!');
      setOpenReview(false);
      refreshPending({
        url: getURI(`${API.licenseData}/pending`),
        method: 'GET'
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao rejeitar documentação.');
    }
  };

  if (loading && !pending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Spinner className="w-12 h-12 text-primary" />
        <p className="text-slate-400 font-bold animate-pulse">Carregando documentos pendentes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-6 md:p-8 animate-in fade-in duration-700">
      <div className="sticky top-0 z-50 bg-slate-50/90 backdrop-blur-md px-4 py-3 -mx-4 border-b border-slate-100 sm:relative sm:top-auto sm:z-auto sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:border-none flex items-center gap-3 sm:gap-4 transition-all duration-300">
        <div className="p-2 sm:p-3 bg-white/80 border border-slate-100 rounded-xl shadow-sm">
          <FileText className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 truncate">
            Revisão de Documentos
          </h1>
          <p className="text-slate-500 font-medium text-[10px] sm:text-base truncate">Análise e validação de licenças CBVL e ANAC</p>
        </div>
      </div>

      {(successMsg || errorMsg) && (
        <div className="space-y-3">
          {successMsg && (
            <Alert variant="default" className="bg-green-50 border-none shadow-lg text-green-700 rounded-2xl animate-in slide-in-from-top-2">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle className="font-bold">Sucesso</AlertTitle>
              <AlertDescription className="font-medium text-xs sm:text-sm">{successMsg}</AlertDescription>
              <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="absolute right-2 top-2 text-green-700 hover:bg-green-100 cursor-pointer">×</Button>
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="destructive" className="border-none shadow-lg rounded-2xl animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Erro</AlertTitle>
              <AlertDescription className="font-medium text-xs sm:text-sm">{errorMsg}</AlertDescription>
              <Button variant="ghost" size="sm" onClick={() => setErrorMsg('')} className="absolute right-2 top-2 text-red-700 hover:bg-red-50 cursor-pointer">×</Button>
            </Alert>
          )}
        </div>
      )}

      <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl overflow-hidden rounded-4xl sm:rounded-4xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest pl-6">Piloto</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest hidden sm:table-cell">Nível</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-center">CIVL</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-center">Documento</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-center hidden sm:table-cell">Expiração</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-center">Status</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-right pr-6">Verificar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!pending || pending.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400 font-medium italic">
                    Nenhum documento pendente no momento.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((item) => [
                  <TableRow key={`${item.userId}-cbvl`} className="group hover:bg-primary/1 border-slate-50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-tight text-sm sm:text-base">
                          {item.pilot ? `${item.pilot.firstName} ${item.pilot.lastName}` : 'N/A'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
                            @{(item.user && item.user.username) || 'N/A'}
                          </span>
                          <Badge variant="secondary" className="sm:hidden h-4 rounded-md font-bold bg-slate-100 text-slate-500 border-none px-1.5 text-[8px]">
                            {item.pilotLevel}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="rounded-lg font-bold bg-slate-100 text-slate-600 border-none px-3">
                        {item.pilotLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary text-sm">{item.civl}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10 rounded-md px-1.5 h-6 font-black">CBVL</Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500 font-medium hidden sm:table-cell">
                      {item.cbvlExpiration ? new Date(item.cbvlExpiration).toLocaleDateString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.imgCbvl ? (
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 rounded-md px-1.5 h-6 font-bold border-none">Enviado</Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 rounded-md px-1.5 h-6 font-bold border-none">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenReview(item, 'CBVL')}
                        className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>,
                  <TableRow key={`${item.userId}-anac`} className="group hover:bg-primary/1 border-slate-50 transition-colors">
                    <TableCell className="py-4 pl-6">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 leading-tight text-sm sm:text-base">
                          {item.pilot ? `${item.pilot.firstName} ${item.pilot.lastName}` : 'N/A'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">
                            @{(item.user && item.user.username) || 'N/A'}
                          </span>
                          <Badge variant="secondary" className="sm:hidden h-4 rounded-md font-bold bg-slate-100 text-slate-500 border-none px-1.5 text-[8px]">
                            {item.pilotLevel}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="rounded-lg font-bold bg-slate-100 text-slate-600 border-none px-3">
                        {item.pilotLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-primary text-sm">{item.civl}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 rounded-md px-1.5 h-6 font-black">ANAC</Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-slate-500 font-medium hidden sm:table-cell">
                      {item.anacExpiration ? new Date(item.anacExpiration).toLocaleDateString('pt-BR') : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.imgAnac ? (
                        <Badge className="bg-green-50 text-green-600 hover:bg-green-50 rounded-md px-1.5 h-6 font-bold border-none">Enviado</Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 rounded-md px-1.5 h-6 font-bold border-none">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenReview(item, 'ANAC')}
                        className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110 cursor-pointer"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ])
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 flex flex-col border-none shadow-2xl rounded-2xl sm:rounded-[40px] bg-white overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} className="text-primary" />
              Revisar Documentação
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-bold text-sm truncate">
              {selectedData?.pilot?.firstName} {selectedData?.pilot?.lastName} • CIVL: {selectedData?.civl} • {selectedDocType}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto px-6 py-4">
            {selectedData && selectedDocType && (
              <div className="space-y-8 sm:space-y-10 pb-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                      <Badge className="bg-primary hover:bg-primary rounded-md px-1.5 h-6">{selectedDocType}</Badge>
                      Carteirinha {selectedDocType}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-2">
                        Exp: {new Date(selectedDocType === 'CBVL' ? selectedData.cbvlExpiration : selectedData.anacExpiration).toLocaleDateString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomOut}
                        disabled={zoom <= 0.5}
                        className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-[10px] font-bold text-slate-500 min-w-9 text-center">
                        {Math.round(zoom * 100)}%
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomIn}
                        disabled={zoom >= 3}
                        className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleZoomReset}
                        disabled={zoom === 1}
                        className="h-7 w-7 rounded-lg text-slate-500 hover:text-slate-700 cursor-pointer"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-2xl sm:rounded-3xl border-2 border-slate-50 bg-slate-50/50 overflow-hidden min-h-[400px] sm:min-h-[500px] flex items-center justify-center relative group">
                    {(selectedDocType === 'CBVL' ? selectedData.imgCbvl : selectedData.imgAnac) ? (
                      (selectedDocType === 'CBVL' ? selectedData.imgCbvl : selectedData.imgAnac).startsWith('data:application/pdf') ? (
                        <iframe src={selectedDocType === 'CBVL' ? selectedData.imgCbvl : selectedData.imgAnac} className="w-full h-[400px] sm:h-[500px] rounded-xl" title={`PDF ${selectedDocType}`} />
                      ) : (
                        <div className="overflow-auto max-h-[400px] sm:max-h-[500px] w-full flex items-center justify-center">
                          <img
                            src={selectedDocType === 'CBVL' ? selectedData.imgCbvl : selectedData.imgAnac}
                            alt={selectedDocType}
                            className="rounded-xl transition-transform duration-200"
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                          />
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-300">
                        <XCircle className="w-10 h-10" />
                        <p className="font-bold text-xs">Sem documento</p>
                      </div>
                    )}
                  </div>
                </div>

                <Alert className="bg-amber-50 border-none shadow-sm text-amber-900 rounded-2xl sm:rounded-3xl">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="font-black text-sm sm:text-base">Verificação</AlertTitle>
                  <AlertDescription className="text-[11px] sm:text-sm font-medium">
                    Certifique-se de que os nomes, números e validades coincidem.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-3 sm:p-4 pt-2 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-2 items-center sm:justify-between shrink-0">
            <Button variant="ghost" onClick={() => setOpenReview(false)} className="w-full sm:w-auto rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-slate-600 order-2 sm:order-1 h-9 cursor-pointer">
              Fechar
            </Button>
            <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
              <Button onClick={() => selectedData && handleReject(selectedData.userId, selectedDocType || 'CBVL')} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-black px-4 sm:px-6 rounded-xl sm:rounded-2xl h-9 sm:h-10 shadow-lg shadow-red-100 flex items-center justify-center gap-2 cursor-pointer">
                <XCircle className="w-4 h-4" /> Rejeitar
              </Button>
              <Button onClick={() => selectedData && handleConfirm(selectedData.userId)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black px-6 sm:px-8 rounded-xl sm:rounded-2xl h-9 sm:h-10 shadow-lg shadow-green-100 flex items-center justify-center gap-2 cursor-pointer">
                <CheckCircle2 className="w-4 h-4" /> Confirmar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
