// src/pages/LicenseReview/LicenseReview.component.tsx
import { useState } from 'react';
import {
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldCheck,
  AlertCircle
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
  };
  pilot: {
    firstName: string;
    lastName: string;
  };
}

export const LicenseReview = () => {
  const [selectedData, setSelectedData] = useState<ILicensePending | null>(null);
  const [openReview, setOpenReview] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleOpenReview = (item: ILicensePending) => {
    setSelectedData(item);
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
              <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="absolute right-2 top-2 text-green-700 hover:bg-green-100">×</Button>
            </Alert>
          )}

          {errorMsg && (
            <Alert variant="destructive" className="border-none shadow-lg rounded-2xl animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Erro</AlertTitle>
              <AlertDescription className="font-medium text-xs sm:text-sm">{errorMsg}</AlertDescription>
              <Button variant="ghost" size="sm" onClick={() => setErrorMsg('')} className="absolute right-2 top-2 text-red-700 hover:bg-red-50">×</Button>
            </Alert>
          )}
        </div>
      )}

      <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] bg-white/70 backdrop-blur-xl overflow-hidden rounded-[2rem] sm:rounded-[32px]">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest pl-6">Piloto</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest hidden sm:table-cell">Nível</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-center">CIVL</TableHead>
                <TableHead className="font-black text-slate-700 h-14 text-[10px] uppercase tracking-widest text-right pr-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!pending || pending.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-400 font-medium italic">
                    Nenhum documento pendente no momento.
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((item) => (
                  <TableRow key={item.userId} className="group hover:bg-primary/[0.01] border-slate-50 transition-colors">
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
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenReview(item)}
                        className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110"
                      >
                        <Eye className="w-5 h-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Review Dialog */}
      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent className="sm:max-w-4xl max-h-[95vh] p-0 flex flex-col border-none shadow-2xl rounded-2xl sm:rounded-[40px] bg-white overflow-hidden">
          <DialogHeader className="p-5 sm:p-8 pb-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="text-left min-w-0">
                <DialogTitle className="text-lg sm:text-2xl font-black tracking-tight truncate">Revisar Documentação</DialogTitle>
                <DialogDescription className="font-bold text-slate-400 text-[10px] sm:text-sm truncate">
                  {selectedData?.pilot?.firstName} {selectedData?.pilot?.lastName} • CIVL: {selectedData?.civl}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-5 sm:px-8 py-4">
            {selectedData && (
              <div className="space-y-8 sm:space-y-10 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {/* CBVL Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                        <Badge className="bg-primary hover:bg-primary rounded-md px-1.5 h-6">CBVL</Badge>
                        Carteirinha CBVL
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">
                        Exp: {new Date(selectedData.cbvlExpiration).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rounded-2xl sm:rounded-3xl border-2 border-slate-50 bg-slate-50/50 overflow-hidden min-h-[300px] sm:min-h-[400px] flex items-center justify-center relative group">
                      {selectedData.imgCbvl ? (
                        selectedData.imgCbvl.startsWith('data:application/pdf') ? (
                          <iframe src={selectedData.imgCbvl} className="w-full h-[300px] sm:h-[400px] rounded-xl" title="PDF CBVL" />
                        ) : (
                          <img src={selectedData.imgCbvl} alt="CBVL" className="max-w-full h-auto object-contain rounded-xl" />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <XCircle className="w-10 h-10" />
                          <p className="font-bold text-xs">Sem imagem</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ANAC Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-black text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                        <Badge className="bg-primary hover:bg-primary rounded-md px-1.5 h-6">ANAC</Badge>
                        Carteirinha ANAC
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400">
                        Exp: {new Date(selectedData.anacExpiration).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rounded-2xl sm:rounded-3xl border-2 border-slate-50 bg-slate-50/50 overflow-hidden min-h-[300px] sm:min-h-[400px] flex items-center justify-center relative group">
                      {selectedData.imgAnac ? (
                        selectedData.imgAnac.startsWith('data:application/pdf') ? (
                          <iframe src={selectedData.imgAnac} className="w-full h-[300px] sm:h-[400px] rounded-xl" title="PDF ANAC" />
                        ) : (
                          <img src={selectedData.imgAnac} alt="ANAC" className="max-w-full h-auto object-contain rounded-xl" />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <XCircle className="w-10 h-10" />
                          <p className="font-bold text-xs">Sem imagem</p>
                        </div>
                      )}
                    </div>
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

          <DialogFooter className="p-5 sm:p-8 pt-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center sm:justify-between">
            <Button variant="ghost" onClick={() => setOpenReview(false)} className="w-full sm:w-auto rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-slate-600 order-2 sm:order-1 h-12">
              Fechar
            </Button>
            <Button onClick={() => selectedData && handleConfirm(selectedData.userId)} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-black px-6 sm:px-10 rounded-xl sm:rounded-2xl h-12 sm:h-14 shadow-lg shadow-green-100 flex items-center justify-center gap-2 order-1 sm:order-2">
              <CheckCircle2 className="w-5 h-5" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
