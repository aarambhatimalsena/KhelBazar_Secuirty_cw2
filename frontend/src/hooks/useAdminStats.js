// src/hooks/useAdminStats.js
import { useQuery } from "@tanstack/react-query";
import { getAdminStats } from "../services/adminService";

const useAdminStats = () => {
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: getAdminStats,
  });
};

export default useAdminStats;
