import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSettingsStore = create(
  persist(
    (set) => ({
      allowEdit: true,
      allowDelete: true,
      toggleAllowEdit: () => set((state) => ({ allowEdit: !state.allowEdit })),
      toggleAllowDelete: () => set((state) => ({ allowDelete: !state.allowDelete })),
      setAllowEdit: (val) => set({ allowEdit: val }),
      setAllowDelete: (val) => set({ allowDelete: val }),
    }),
    {
      name: 'b-microfinance-settings', // unique name
    }
  )
)
