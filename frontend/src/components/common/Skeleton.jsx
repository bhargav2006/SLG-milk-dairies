import React from "react";

export const Skeleton = ({ className, style }) => {
  return <div className={`skeleton ${className}`} style={style} />;
};

export const CardSkeleton = () => {
  return (
    <div className="product-card" style={{ height: "240px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <Skeleton className="skeleton-text" style={{ width: "80px", height: "20px" }} />
        <Skeleton className="skeleton-text" style={{ width: "60px", height: "14px" }} />
      </div>
      <Skeleton className="skeleton-title" style={{ width: "70%", height: "22px" }} />
      <div style={{ flexGrow: 1, marginTop: "8px" }}>
        <Skeleton className="skeleton-text" style={{ width: "95%" }} />
        <Skeleton className="skeleton-text" style={{ width: "80%" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "8px", borderTop: "1px solid var(--color-border)" }}>
        <Skeleton className="skeleton-text" style={{ width: "60px", height: "24px" }} />
        <div style={{ display: "flex", gap: "6px" }}>
          <Skeleton className="skeleton-text" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
          <Skeleton className="skeleton-text" style={{ width: "32px", height: "32px", borderRadius: "8px" }} />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <div style={{ width: "100%", padding: "16px" }}>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        {Array(cols)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} style={{ height: "20px", flex: 1 }} />
          ))}
      </div>
      {Array(rows)
        .fill(0)
        .map((_, r) => (
          <div key={r} style={{ display: "flex", gap: "16px", padding: "12px 0", borderBottom: "1px solid var(--color-border)" }}>
            {Array(cols)
              .fill(0)
              .map((_, c) => (
                <Skeleton key={c} style={{ height: "16px", flex: 1 }} />
              ))}
          </div>
        ))}
    </div>
  );
};

export const StatsSkeleton = ({ count = 4 }) => {
  return (
    <div className="dashboard-grid">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "60%" }}>
              <Skeleton style={{ height: "14px", width: "80%" }} />
              <Skeleton style={{ height: "28px", width: "60%" }} />
            </div>
            <Skeleton style={{ width: "50px", height: "50px", borderRadius: "12px" }} />
          </div>
        ))}
    </div>
  );
};
