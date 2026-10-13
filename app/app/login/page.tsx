import { Suspense } from "react";
import { LoginView } from "@/ui/LoginView";

export default function LoginPage() {
  // LoginView lee ?mode=signup con useSearchParams(); en una ruta estática
  // Next pide un límite de Suspense para eso.
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
