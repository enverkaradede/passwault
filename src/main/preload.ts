// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  // Authentication API
  auth: {
    login: (username: string, password: string) => 
      ipcRenderer.invoke('auth:login', username, password),
    
    getUser: (userId: number) => 
      ipcRenderer.invoke('auth:get-user', userId),
    
    createUser: (username: string, password: string) => 
      ipcRenderer.invoke('auth:create-user', username, password),
    
    updatePassword: (userId: number, newPassword: string) => 
      ipcRenderer.invoke('auth:update-password', userId, newPassword),
  },
  // Password management API
  passwords: {
    add: (passwordData: any) => 
      ipcRenderer.invoke('passwords:add', passwordData),
    
    getAll: (userId: number) => 
      ipcRenderer.invoke('passwords:get-all', userId),
    
    getById: (passwordId: number, userId: number) => 
      ipcRenderer.invoke('passwords:get-by-id', passwordId, userId),
    
    update: (passwordData: any) => 
      ipcRenderer.invoke('passwords:update', passwordData),
    
    delete: (passwordId: number, userId: number) => 
      ipcRenderer.invoke('passwords:delete', passwordId, userId),
    
    search: (userId: number, searchTerm: string) => 
      ipcRenderer.invoke('passwords:search', userId, searchTerm),
    
    // New method for decrypting passwords
    decrypt: (encryptedPassword: string) => 
      ipcRenderer.invoke('passwords:decrypt', encryptedPassword),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
