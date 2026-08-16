import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import branchService from "../services/branchService";
import { useAuth } from "./AuthContext";

const BranchContext = createContext(null);

export const BranchProvider = ({ children }) => {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(
    localStorage.getItem("dairy_selected_branch") || "all"
  );
  const [loadingBranches, setLoadingBranches] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingBranches(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (error) {
      console.error("Failed to load branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

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
        refreshBranches: fetchBranches,
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
