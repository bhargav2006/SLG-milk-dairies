import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import branchService from "../services/branchService";
import { useAuth } from "./AuthContext";

const BranchContext = createContext(null);
const NO_BRANCHES = []; // stable empty array so memos below don't re-run every render

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState(
    localStorage.getItem("dairy_selected_branch") || "all"
  );

  // Branches almost never change: cache for 10 minutes instead of re-fetching on every page
  const { data: branches = NO_BRANCHES, isFetching: loadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => branchService.getBranches(),
    enabled: !!user,
    staleTime: 10 * 60_000,
  });

  // Call this after creating / editing / deleting a branch
  const refreshBranches = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
    [queryClient]
  );

  useEffect(() => {
    if (selectedBranch) {
      localStorage.setItem("dairy_selected_branch", selectedBranch);
    }
  }, [selectedBranch]);

  // Determine effective active branch for the logged in user
  const currentBranch = React.useMemo(() => {
    if (!user) return null;
    if (user.role === "accountant" || user.role === "branch_admin") {
      return user.branch || branches.find((b) => b.isMain) || null;
    }
    // Admin role
    if (selectedBranch !== "all") {
      return branches.find((b) => b._id === selectedBranch) || null;
    }
    return null; // All branches
  }, [user, branches, selectedBranch]);

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranch,
        setSelectedBranch,
        currentBranch,
        loadingBranches,
        refreshBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error("useBranch must be used within a BranchProvider");
  }
  return context;
};
