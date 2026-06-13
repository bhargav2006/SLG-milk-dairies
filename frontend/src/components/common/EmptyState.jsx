import React from "react";
import { Inbox } from "lucide-react";

const EmptyState = ({ title = "No Data Found", subtitle = "Try adjusting your filters or search terms.", icon: Icon }) => {
  return (
    <div className="empty-state">
      {Icon ? (
        <Icon size={48} color="var(--color-text-secondary)" style={{ opacity: 0.5 }} />
      ) : (
        <Inbox size={48} color="var(--color-text-secondary)" style={{ opacity: 0.5 }} />
      )}
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-subtitle">{subtitle}</p>
    </div>
  );
};

export default EmptyState;
