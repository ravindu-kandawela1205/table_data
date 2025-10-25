import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocalUser = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  email: string;
  phone?: string;
};

type State = {
  users: LocalUser[];
  addUser: (u: Omit<LocalUser, "id">) => void;
  updateUser: (id: number, u: Omit<LocalUser, "id">) => void;
  removeUser: (id: number) => void;
  clearAll: () => void;
  _nextId: number;
};

export const useLocalUsers = create<State>()(persist(
  (set, get) => ({
    users: [],
    _nextId: 1,
    addUser: (u) =>
      set((s) => ({
        users: [...s.users, { ...u, id: s._nextId }],
        _nextId: s._nextId + 1,
      })),
    updateUser: (id, u) =>
      set((s) => ({
        users: s.users.map((x) => (x.id === id ? { ...u, id } : x)),
      })),
    removeUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),
    clearAll: () => set({ users: [], _nextId: 1 }),
  }),
  {
    name: "local-users-storage",
  }
));
