import React from "react";

const CategoryFilter = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: "all", label: "✨ All Products" },
    { id: "milk", label: "🥛 Milk & Curd" },
    { id: "ghee", label: "🧈 Ghee & Butter" },
    { id: "sweets", label: "🍦 Sweets & Dessert" },
  ];

  return (
    <div className="lp-product-filters-wrapper">
      <div className="lp-product-filters">
        {filters.map((filterObj) => (
          <button
            key={filterObj.id}
            className={`lp-filter-btn ${activeFilter === filterObj.id ? "active" : ""}`}
            onClick={() => setActiveFilter(filterObj.id)}
          >
            {filterObj.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
