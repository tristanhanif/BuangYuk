"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MAP_CENTER, type BankSampah } from "@/mocks/bankSampahMock";

const customIcon = L.divIcon({
  html: `
    <div style="
      width:20px;height:20px;background:#0F4C5C;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3);
      display:flex;align-items:center;justify-content:center;">
      <div style="width:6px;height:6px;background:#10B981;border-radius:50%;transform:rotate(45deg);"></div>
    </div>`,
  iconAnchor: [10, 20],
  className: "",
});

export interface BankMapProps {
  banks: BankSampah[];
  center?: [number, number];
  centerId?: string;
  zoom?: number;
}

export function BankMap({ banks, center, centerId, zoom = 12 }: BankMapProps) {
  const activeCenter = useMemo<[number, number]>(() => {
    if (centerId) {
      const found = banks.find((b) => b.id === centerId);
      if (found) return [found.lat, found.lng];
    }
    return center ?? MAP_CENTER;
  }, [centerId, center, banks]);

  return (
    <div className="h-[300px] w-full overflow-hidden rounded-xl border border-border">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {banks.map((bank) => (
          <Marker
            key={bank.id}
            position={[bank.lat, bank.lng]}
            icon={customIcon}
          >
            <Popup>
              <strong>{bank.name}</strong>
              <br />
              <span className="text-xs">{bank.address}</span>
              <br />
              <span className="text-xs">{bank.hours}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
