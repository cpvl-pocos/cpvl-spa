import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivateRoutes } from "@/components/PrivateRoute/";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router";
import NotFound from "./pages/NotFound.tsx";
import { Login } from "./pages/login/";
import { Signup } from "./pages/signup";
import { Dashboard, DashboardHome } from "./containers/Dashboard/";
import { DataPanel } from "./pages/DataPanel/";
import { EmergencyContactPage } from "./pages/EmergencyContactPage/";
import { LicenseReview } from "./pages/LicenseReview/";
import { Newpassword } from "./pages/Newpassword/";
import { PilotDetails } from "./pages/PilotDetails/";
import { Pilots } from "./pages/Pilots/";
import { StatusList } from "./pages/StatusList/";
import { PaymentMonthly } from "./components/PaymentMonthly/";
import { Footer } from "./components/Footer/";
import { Hero } from "./components/Hero/";
import { Diretoria } from "./components/Diretoria/";
import { Documentos } from "./components/Documentos/";
import { EspacoAereo } from "./components/EspacoAereo/";
import { Header } from "./components/Header/";
import { Historia } from "./components/Historia/";
import { Home } from "./pages/Home/";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/header" element={<Header />} />
          <Route path="/hero" element={<Hero />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/diretoria" element={<Diretoria />} />
          <Route path="/espacoAereo" element={<EspacoAereo />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/footer" element={<Footer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/newpassword" element={<Newpassword />} />

          <Route element={<PrivateRoutes />}>
            <Route path="dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="datapanel" element={<DataPanel />} />
              <Route path="pilots" element={<Pilots />} />
              <Route path="pilots/:userId" element={<PilotDetails />} />
              <Route path="status-list" element={<StatusList />} />
              <Route
                path="emergency-contact"
                element={<EmergencyContactPage />}
              />
              <Route path="license-review" element={<LicenseReview />} />

              <Route path="paymentMonthly" element={<PaymentMonthly />}>
                <Route path=":userId" element={<PaymentMonthly />} />
                <Route
                  path="confirmPayment/:userId"
                  element={<PaymentMonthly />}
                />
              </Route>
              <Route path="*" element={<DashboardHome />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App
