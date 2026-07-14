import React from "react";

const CategoryFilter = ({ activeFilter, setActiveFilter, filters = [] }) => {
  return (
    <div className="lp-product-filters-wrapper">
      <div className="lp-product-filters">
        {filters.map((filterObj) => (
          <button
            key={filterObj.id}
            className={`lp-filter-btn ${activeFilter === filterObj.id ? "active" : ""}`}
            onClick={() => setActiveFilter(filterObj.id)}
            type="button">
            {filterObj.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
