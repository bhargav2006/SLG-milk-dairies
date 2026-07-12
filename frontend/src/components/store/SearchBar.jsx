import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ searchQuery, setSearchQuery, searchSuggestions = null, onSuggestionClick }) => {
  return (
    <div className="lp-search-bar-container">
      <div className="lp-search-box-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search fresh milk, curd, ghee..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="lp-store-search"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="clear-search-btn">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Renders suggestions ONLY if data is supplied by backend */}
      {searchSuggestions && searchSuggestions.length > 0 && (
        <div className="lp-search-suggestions-dropdown">
          {searchSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className="lp-suggestion-row"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <Search size={14} className="lp-suggest-icon" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
