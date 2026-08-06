import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driveService } from "../services/driveService";

export const useDriveConnection = () =>
  useQuery({
    queryKey: ["drive-connection"],
    queryFn: () => driveService.getConnection(),
    staleTime: 60 * 1000,
    retry: false,
  });

export const useStartDriveAuth = () =>
  useMutation({
    mutationFn: (mode) => driveService.startAuth(mode),
  });

export const useCompleteDriveAuth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => driveService.completeAuth(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
    },
  });
};

export const useDriveFolders = (search = "") =>
  useQuery({
    queryKey: ["drive-folders", search],
    queryFn: () => driveService.listFolders(search),
    staleTime: 30 * 1000,
  });

export const useSelectDriveFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => driveService.selectFolder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
    },
  });
};

export const useCreateDriveFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (folderName) => driveService.createFolder(folderName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
    },
  });
};

export const useDisconnectDrive = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => driveService.disconnect(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drive-connection"] });
    },
  });
};
