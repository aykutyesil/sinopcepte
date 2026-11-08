import type { Item, LoadState, Pharmacy } from "@/lib/types";
import type { WeatherNow } from "@/lib/weather";
import { WeatherCard } from "./WeatherCard";
import { PharmacyCard } from "./PharmacyCard";
import { TaxiCard } from "./TaxiCard";
import { CourierCard } from "./CourierCard";

// Legacy sağ sabit radar paneli (index.html:224-311), yalnız lg ve üstü.

export function RightRail({
  weather,
  pharmacy,
  pharmacyState,
  items,
  itemsState,
}: {
  weather: WeatherNow | null;
  pharmacy: Pharmacy | null;
  pharmacyState: LoadState;
  items: readonly Item[];
  itemsState: LoadState;
}) {
  // Parity P10: taksi/kurye listeleri artık HTML'e yazılı değil, item verisinden türetilir.
  const taxis = items.filter((i) => i.category === "taksi");
  const couriers = items.filter((i) => i.category === "tekel");

  return (
    <aside className="hidden lg:block w-80 shrink-0 p-6 space-y-6 sticky top-0 h-screen overflow-y-auto no-scrollbar">
      <WeatherCard weather={weather} />
      <PharmacyCard pharmacy={pharmacy} state={pharmacyState} />
      <TaxiCard taxis={taxis} state={itemsState} />
      <CourierCard couriers={couriers} state={itemsState} />
    </aside>
  );
}

