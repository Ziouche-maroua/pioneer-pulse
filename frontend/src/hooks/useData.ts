import { useQuery } from "@tanstack/react-query";
import { api } from "@/data/mockData";

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: api.getStats,
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });
};

export const useActivityStatus = () => {
  return useQuery({
    queryKey: ["activityStatus"],
    queryFn: api.getActivityStatus,
  });
};


export const useProcesses = () => {
  return useQuery({
    queryKey: ["processes"],
    queryFn: api.getProcesses,
  });
};

export const useCpuGraphData = () => {
  return useQuery({
    queryKey: ["cpuGraphData"],
    queryFn: api.getCpuGraphData,
  });
};

export const useMemoryGraphData = () => {
  return useQuery({
    queryKey: ["memoryGraphData"],
    queryFn: api.getMemoryGraphData,
  });
};

export const useWelcome = () => {
  return useQuery({
    queryKey: ["welcome"],
    queryFn: api.getWelcome,
  });
};

export const useSatisfaction = () => {
  return useQuery({
    queryKey: ["satisfaction"],
    queryFn: api.getSatisfaction,
  });
};

export const useReferral = () => {
  return useQuery({
    queryKey: ["referral"],
    queryFn: api.getReferral,
  });
};

export const useCpuStats = () => {
  return useQuery({
    queryKey: ["cpuStats"],
    queryFn: api.getCpuStats,
  });
};
