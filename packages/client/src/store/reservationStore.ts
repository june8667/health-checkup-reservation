import { create } from 'zustand';
import type { Package, PackageItem, PatientInfo } from '@health-checkup/shared';

interface SelectedItem extends PackageItem {
  selected: boolean;
}

interface ReservationState {
  selectedPackage: Package | null;
  selectedItems: SelectedItem[];
  selectedDate: Date | null;
  selectedTime: string | null;
  patientInfo: PatientInfo | null;
  memo: string;
  setSelectedPackage: (pkg: Package | null) => void;
  setSelectedItems: (items: SelectedItem[]) => void;
  toggleSelectedItem: (itemName: string) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setPatientInfo: (info: PatientInfo | null) => void;
  setMemo: (memo: string) => void;
  getSelectedItemsTotal: () => number;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set, get) => ({
  selectedPackage: null,
  selectedItems: [],
  selectedDate: null,
  selectedTime: null,
  patientInfo: null,
  memo: '',
  setSelectedPackage: (selectedPackage) => set({ selectedPackage, selectedItems: [] }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
  toggleSelectedItem: (itemName) => set((state) => ({
    selectedItems: state.selectedItems.map((item) =>
      item.name === itemName ? { ...item, selected: !item.selected } : item
    ),
  })),
  setSelectedDate: (selectedDate) => set({ selectedDate, selectedTime: null }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setPatientInfo: (patientInfo) => set({ patientInfo }),
  setMemo: (memo) => set({ memo }),
  getSelectedItemsTotal: () => {
    const { selectedItems } = get();
    return selectedItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + (item.price || 0), 0);
  },
  reset: () =>
    set({
      selectedPackage: null,
      selectedItems: [],
      selectedDate: null,
      selectedTime: null,
      patientInfo: null,
      memo: '',
    }),
}));
