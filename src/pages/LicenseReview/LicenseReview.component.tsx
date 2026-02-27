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
    <div className="flex flex-col gap-6 p-4 md:p-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
          <FileText className="text-primary w-8 h-8" />
          Revisão de Documentos
        </h1>
        <p className="text-slate-500 font-medium">Análise e validação de licenças CBVL e ANAC</p>
      </div>

      {successMsg && (
        <Alert variant="default" className="bg-green-50 border-green-100 text-green-700 rounded-2xl animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle className="font-bold">Sucesso</AlertTitle>
          <AlertDescription className="font-medium">{successMsg}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={() => setSuccessMsg('')} className="absolute right-2 top-2 text-green-700 hover:bg-green-100">×</Button>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive" className="rounded-2xl animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-bold">Erro</AlertTitle>
          <AlertDescription className="font-medium">{errorMsg}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={() => setErrorMsg('')} className="absolute right-2 top-2 text-red-700 hover:bg-red-50">×</Button>
        </Alert>
      )}

      <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] bg-white/70 backdrop-blur-xl overflow-hidden rounded-[32px]">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-bold text-slate-700 h-14">Piloto</TableHead>
              <TableHead className="font-bold text-slate-700 h-14">Nível</TableHead>
              <TableHead className="font-bold text-slate-700 h-14 text-center">CIVL</TableHead>
              <TableHead className="font-bold text-slate-700 h-14 text-right">Ações</TableHead>
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
                <TableRow key={item.userId} className="group hover:bg-primary/[0.02] border-slate-50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 leading-tight">
                        {item.pilot ? `${item.pilot.firstName} ${item.pilot.lastName}` : 'N/A'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">
                        @{(item.user && item.user.username) || 'N/A'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-lg font-bold bg-slate-100 text-slate-600 border-none px-3">
                      {item.pilotLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-primary">{item.civl}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenReview(item)}
                      className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all group-hover:scale-110"
                    >
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Review Dialog */}
      <Dialog open={openReview} onOpenChange={setOpenReview}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 flex flex-col border-none shadow-2xl rounded-[40px] bg-white overflow-hidden">
          <DialogHeader className="p-8 pb-4 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-left">
                <DialogTitle className="text-2xl font-black tracking-tight">Revisar Documentação</DialogTitle>
                <DialogDescription className="font-bold text-slate-400">
                  {selectedData?.pilot?.firstName} {selectedData?.pilot?.lastName} • CIVL: {selectedData?.civl}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-8 py-4">
            {selectedData && (
              <div className="space-y-10 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* CBVL Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <Badge className="bg-primary hover:bg-primary rounded-md px-1.5 h-6">CBVL</Badge>
                        Carteirinha CBVL
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        Exp: {new Date(selectedData.cbvlExpiration).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rounded-3xl border-2 border-slate-50 bg-slate-50/50 overflow-hidden min-h-[400px] flex items-center justify-center relative group">
                      {selectedData.imgCbvl ? (
                        selectedData.imgCbvl.startsWith('data:application/pdf') ? (
                          <iframe src={selectedData.imgCbvl} className="w-full h-[400px] rounded-2xl" title="PDF CBVL" />
                        ) : (
                          <img src={selectedData.imgCbvl} alt="CBVL" className="max-w-full h-auto object-contain rounded-2xl" />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <XCircle className="w-12 h-12" />
                          <p className="font-bold">Nenhuma imagem enviada</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ANAC Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="font-black text-slate-900 flex items-center gap-2">
                        <Badge className="bg-primary hover:bg-primary rounded-md px-1.5 h-6">ANAC</Badge>
                        Carteirinha ANAC
                      </h3>
                      <span className="text-xs font-bold text-slate-400">
                        Exp: {new Date(selectedData.anacExpiration).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="rounded-3xl border-2 border-slate-50 bg-slate-50/50 overflow-hidden min-h-[400px] flex items-center justify-center relative group">
                      {selectedData.imgAnac ? (
                        selectedData.imgAnac.startsWith('data:application/pdf') ? (
                          <iframe src={selectedData.imgAnac} className="w-full h-[400px] rounded-2xl" title="PDF ANAC" />
                        ) : (
                          <img src={selectedData.imgAnac} alt="ANAC" className="max-w-full h-auto object-contain rounded-2xl" />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                          <XCircle className="w-12 h-12" />
                          <p className="font-bold">Nenhuma imagem enviada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 border-amber-100 text-amber-900 rounded-3xl">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="font-black">Verificação Importante</AlertTitle>
                  <AlertDescription className="text-sm font-medium">
                    Certifique-se de que os nomes, números e as datas de validade nas imagens coincidem com os dados cadastrados. Documentos ilegíveis devem ser recusados.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </ScrollArea>

          <DialogFooter className="p-8 pt-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between sm:justify-between">
            <Button variant="ghost" onClick={() => setOpenReview(false)} className="rounded-2xl font-bold text-slate-400 hover:text-slate-600">
              Fechar Janela
            </Button>
            <div className="flex gap-3">
              <Button onClick={() => selectedData && handleConfirm(selectedData.userId)} className="bg-green-600 hover:bg-green-700 text-white font-black px-10 rounded-2xl h-14 shadow-xl shadow-green-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Confirmar Documentação
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
