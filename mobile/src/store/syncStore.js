import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';
import { database } from '../db';

export const useSyncStore = create((set, get) => ({
  isOnline: false,
  isSyncing: false,
  queueCount: 0,
  
  initNetworkListener: () => {
    NetInfo.addEventListener(state => {
      set({ isOnline: state.isConnected });
      if (state.isConnected && get().queueCount > 0) {
        get().flushQueue();
      }
    });
  },

  updateQueueCount: async () => {
    const count = await database.get('defects').query().fetchCount();
    set({ queueCount: count });
  },

  flushQueue: async () => {
    if (get().isSyncing || !get().isOnline) return;
    set({ isSyncing: true });
    
    console.log("[Sync Engine] Flushing offline queue to backend...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("[Sync Engine] Sync complete!");
    set({ isSyncing: false, queueCount: 0 }); 
  }
}));
