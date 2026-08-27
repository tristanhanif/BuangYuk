"use client";

import { WasteInputForm } from "@/components/forms/WasteInputForm";

export default function InputSampahPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Setor Sampah</h1>
        <p className="text-muted-foreground">
          Catat sampahmu, lihat estimasi pendapatan & dampak karbon
        </p>
      </div>
      <WasteInputForm />
    </div>
  );
}
