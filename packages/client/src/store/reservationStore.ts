import { create } from 'zustand';
import type { Package, PatientInfo } from '@health-checkup/shared';

interface ReservationState {
  selectedPackage: Package | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  patientInfo: PatientInfo | null;
  memo: string;
  setSelectedPackage: (pkg: Package | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  setPatientInfo: (info: PatientInfo | null) => void;
  setMemo: (memo: string) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedPackage: null,
  selectedDate: null,
  selectedTime: null,
  patientInfo: null,
  memo: '',
  setSelectedPackage: (selectedPackage) => set({ selectedPackage }),
  setSelectedDate: (selectedDate) => set({ selectedDate, selectedTime: null }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setPatientInfo: (patientInfo) => set({ patientInfo }),
  setMemo: (memo) => set({ memo }),
  reset: () =>
    set({
      selectedPackage: null,
      selectedDate: null,
      selectedTime: null,
      patientInfo: null,
      memo: '',
    }),
}));
