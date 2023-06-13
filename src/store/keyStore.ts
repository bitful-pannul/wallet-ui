import create, { SetState } from "zustand"

export interface KeyStore {
  keys: { [address: string]: string };
  addKey: (address: string, key: string) => void;
  setKeyStore: SetState<KeyStore>;
}

export const useKeyStore = create<KeyStore>((set, get) => ({
  keys: {},
  addKey: (address: string, key: string) => {
    const { keys } = get()
    keys[address] = key
    set({ keys })
  },
  setKeyStore: set,
}))
