import { useState, useCallback, useMemo } from "react";
import { calculateCO2Saved, calculateEarnings, calculatePoints } from "@/lib/utils";
import { EMISSION_FACTORS, PRICE_PER_KG, POINTS_PER_KG, UNIT_CONVERSIONS } from "@/lib/constants";
import { WasteInput } from "@/types/waste";

interface UseWasteCalculatorReturn {
  items: WasteInput[];
  addItem: (item: Omit<WasteInput, "standardizedWeightKg" | "estimatedEarnings" | "estimatedCO2Saved" | "estimatedPoints">) => void;
  updateItem: (index: number, updates: Partial<WasteInput>) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
  totals: {
    totalWeightKg: number;
    totalEarnings: number;
    totalCO2Saved: number;
    totalPoints: number;
  };
}

export function useWasteCalculator(): UseWasteCalculatorReturn {
  const [items, setItems] = useState<WasteInput[]>([]);

  const calculateItem = useCallback((item: Omit<WasteInput, "standardizedWeightKg" | "estimatedEarnings" | "estimatedCO2Saved" | "estimatedPoints">): WasteInput => {
    const unitConversion = UNIT_CONVERSIONS[item.unit];
    const standardizedWeightKg = item.quantity * unitConversion.toKg;
    const estimatedEarnings = calculateEarnings(item.categoryId, standardizedWeightKg);
    const estimatedCO2Saved = calculateCO2Saved(item.categoryId, standardizedWeightKg);
    const estimatedPoints = calculatePoints(item.categoryId, standardizedWeightKg);

    return {
      ...item,
      standardizedWeightKg,
      estimatedEarnings,
      estimatedCO2Saved,
      estimatedPoints,
    };
  }, []);

  const addItem = useCallback((item: Omit<WasteInput, "standardizedWeightKg" | "estimatedEarnings" | "estimatedCO2Saved" | "estimatedPoints">) => {
    const calculatedItem = calculateItem(item);
    setItems((prev) => [...prev, calculatedItem]);
  }, [calculateItem]);

  const updateItem = useCallback((index: number, updates: Partial<WasteInput>) => {
    setItems((prev) => {
      const newItems = [...prev];
      const updatedItem = { ...newItems[index], ...updates };
      newItems[index] = calculateItem(updatedItem as Omit<WasteInput, "standardizedWeightKg" | "estimatedEarnings" | "estimatedCO2Saved" | "estimatedPoints">);
      return newItems;
    });
  }, [calculateItem]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearItems = useCallback(() => {
    setItems([]);
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalWeightKg: acc.totalWeightKg + item.standardizedWeightKg,
        totalEarnings: acc.totalEarnings + item.estimatedEarnings,
        totalCO2Saved: acc.totalCO2Saved + item.estimatedCO2Saved,
        totalPoints: acc.totalPoints + item.estimatedPoints,
      }),
      { totalWeightKg: 0, totalEarnings: 0, totalCO2Saved: 0, totalPoints: 0 }
    );
  }, [items]);

  return { items, addItem, updateItem, removeItem, clearItems, totals };
}