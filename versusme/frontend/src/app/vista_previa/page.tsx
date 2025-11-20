import { Suspense } from "react";
import VistaPreviaContent from "./VistaPreviaContent";

export default function VistaPreviaPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Cargando vista previa...</div>}>
      <VistaPreviaContent />
    </Suspense>
  );
}
