import React, { useState, useEffect } from "react";
import branchService from "../services/branchService";
import { useToast } from "../context/ToastContext";
import { useBranch } from "../context/BranchContext";
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Star,
  Phone,
  MapPin,
  Tag,
  Search,
} from "lucide-react";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    phone: "",
    isMain: false,
  });

  const { showSuccess, showError } = useToast();
  const { refreshBranches } = useBranch();

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await branchService.getBranches();
      setBranches(data);
    } catch (error) {
      showError(error.response?.data?.message || "Failed to load store branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address || "",
        phone: branch.phone || "",
        isMain: branch.isMain || false,
      });
    } else {
      setEditingBranch(null);
      setFormData({
        name: "",
        code: "",
        address: "",
        phone: "",
        isMain: branches.length === 0, // default true if first branch
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      showError("Branch name and code are required");
      return;
    }

    try {
      if (editingBranch) {
        await branchService.updateBranch(editingBranch._id, formData);
        showSuccess(`Branch '${formData.name}' updated successfully`);
      } else {
        await branchService.createBranch(formData);
        showSuccess(`Branch '${formData.name}' created successfully`);
      }
      setShowModal(false);
      loadBranches();
      refreshBranches();
    } catch (error) {
      showError(error.response?.data?.message || "Operation failed");
    }
  };

  const handleToggleDeactivate = async (branch) => {
    if (branch.isMain) {
      showError("Cannot deactivate the Main Branch");
      return;
    }
    try {
      await branchService.updateBranch(branch._id, { isActive: !branch.isActive });
      showSuccess(`Branch '${branch.name}' status updated`);
      loadBranches();
      refreshBranches();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to update branch status");
    }
  };

  const handleSetMain = async (branch) => {
    try {
      await branchService.updateBranch(branch._id, { isMain: true });
      showSuccess(`'${branch.name}' is now the Main Branch for customer shop!`);
      loadBranches();
      refreshBranches();
    } catch (error) {
      showError(error.response?.data?.message || "Failed to set Main Branch");
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.address && b.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ padding: "8px 0" }}>
      {/* Top Header Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "#0F172A", margin: "0 0 4px 0" }}>
            Store Branches Management
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.88rem", margin: 0 }}>
            Manage multiple dairy store locations, stock isolation, and assign branch staff.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          style={{
            background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            padding: "10px 18px",
            fontWeight: "600",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)",
          }}
        >
          <Plus size={18} /> Add New Branch
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "20px", position: "relative", maxWidth: "420px" }}>
        <Search
          size={18}
          style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
        />
        <input
          type="text"
          placeholder="Search by branch name, code or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 42px",
            borderRadius: "10px",
            border: "1px solid #E2E8F0",
            fontSize: "0.9rem",
            outline: "none",
            background: "#FFFFFF",
          }}
        />
      </div>

      {/* Branch Cards Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#64748B" }}>
          Loading store branches...
        </div>
      ) : filteredBranches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", background: "#FFFFFF", borderRadius: "14px", border: "1px solid #E2E8F0" }}>
          <Building2 size={48} style={{ color: "#CBD5E1", marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 6px 0", color: "#334155" }}>No branches found</h3>
          <p style={{ margin: 0, color: "#64748B", fontSize: "0.88rem" }}>
            Click "Add New Branch" above to create your first store location.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredBranches.map((branch) => (
            <div
              key={branch._id}
              style={{
                background: "#FFFFFF",
                borderRadius: "14px",
                border: branch.isMain ? "2px solid #3B82F6" : "1px solid #E2E8F0",
                padding: "20px",
                boxShadow: branch.isMain ? "0 8px 24px rgba(59, 130, 246, 0.12)" : "0 2px 8px rgba(0, 0, 0, 0.04)",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0F172A" }}>
                        {branch.name}
                      </h3>
                      {branch.isMain && (
                        <span
                          style={{
                            background: "#EFF6FF",
                            color: "#2563EB",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            border: "1px solid #BFDBFE",
                          }}
                        >
                          <Star size={12} fill="#2563EB" /> MAIN
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#64748B", background: "#F1F5F9", padding: "2px 6px", borderRadius: "4px", marginTop: "4px", inlineFlex: "true" }}>
                      CODE: {branch.code}
                    </span>
                  </div>

                  <span
                    style={{
                      background: branch.isActive ? "#ECFDF5" : "#FEF2F2",
                      color: branch.isActive ? "#059669" : "#DC2626",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      padding: "4px 10px",
                      borderRadius: "20px",
                    }}
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "16px 0", fontSize: "0.85rem", color: "#475569" }}>
                  {branch.address && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <MapPin size={16} style={{ color: "#94A3B8", marginTop: "2px", flexShrink: 0 }} />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Phone size={16} style={{ color: "#94A3B8", flexShrink: 0 }} />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div
                style={{
                  borderTop: "1px solid #F1F5F9",
                  paddingTop: "14px",
                  marginTop: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {!branch.isMain ? (
                  <button
                    onClick={() => handleSetMain(branch)}
                    style={{
                      background: "transparent",
                      color: "#2563EB",
                      border: "none",
                      fontSize: "0.8rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      padding: "0",
                    }}
                  >
                    ⭐ Set as Main Branch
                  </button>
                ) : (
                  <span style={{ fontSize: "0.78rem", color: "#64748B" }}>Storefront Default</span>
                )}

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => handleOpenModal(branch)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      padding: "6px 10px",
                      cursor: "pointer",
                      color: "#475569",
                    }}
                    title="Edit Branch"
                  >
                    <Edit2 size={16} />
                  </button>

                  {!branch.isMain && (
                    <button
                      onClick={() => handleToggleDeactivate(branch)}
                      style={{
                        background: branch.isActive ? "#FEF2F2" : "#ECFDF5",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        color: branch.isActive ? "#DC2626" : "#059669",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                      }}
                    >
                      {branch.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: "700", color: "#0F172A" }}>
              {editingBranch ? "Edit Branch Details" : "Create New Store Branch"}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Branch Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Branch 2 - Downtown Parlour"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Branch Code (Used for Invoice Prefix: e.g. BR2) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. BR2 or DOWNTOWN"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Store Address
                </label>
                <textarea
                  placeholder="Street address, city, landmark..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.9rem",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#334155", marginBottom: "6px" }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="Contact phone number..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <input
                  type="checkbox"
                  id="isMain"
                  checked={formData.isMain}
                  onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <label htmlFor="isMain" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#334155", cursor: "pointer" }}>
                  Set as Main Branch (Used for online customer website)
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#F1F5F9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#2563EB",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontWeight: "600",
                    fontSize: "0.88rem",
                    cursor: "pointer",
                  }}
                >
                  {editingBranch ? "Save Changes" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Branches;
