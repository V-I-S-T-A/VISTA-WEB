import apiClient from "../lib/axios";
import { API_ENDPOINTS } from "../config/api";

export const driveService = {
  async getConnection() {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVE.CONNECTION);
    return data; // { connected: false } or { connected: true, ...connection fields }
  },

  async startAuth(mode = "existing") {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVE.AUTH_START, {
      params: { mode },
    });
    return data; // { authorization_url }
  },

  async completeAuth({ code, state, scope }) {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVE.AUTH_CALLBACK, {
      params: { code, state, scope },
    });
    return data;
  },

  async listFolders(search = "") {
    const { data } = await apiClient.get(API_ENDPOINTS.DRIVE.FOLDERS, {
      params: search ? { search } : {},
    });
    return data; // { folders: [{ id, name }, ...] }
  },

  async selectFolder({ folder_id, folder_name }) {
    const { data } = await apiClient.post(API_ENDPOINTS.DRIVE.FOLDER_SELECT, {
      folder_id,
      folder_name,
    });
    return data;
  },

  async createFolder(folder_name) {
    const { data } = await apiClient.post(API_ENDPOINTS.DRIVE.FOLDER_CREATE, {
      folder_name,
    });
    return data;
  },

  async disconnect() {
    const { data } = await apiClient.post(API_ENDPOINTS.DRIVE.DISCONNECT);
    return data;
  },
};
