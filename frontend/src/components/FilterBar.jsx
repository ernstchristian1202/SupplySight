import React, { memo, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

const ALL_WAREHOUSES = "All";
const ALL_STATUSES = "All";
const STATUS_OPTIONS = [ALL_STATUSES, "Healthy", "Low", "Critical"];

function FieldLabel({ id, children }) {
  return (
    <label htmlFor={id} className="sr-only">
      {children}
    </label>
  );
}

function Select({ id, value, onChange, options, ariaLabel, className = "" }) {
  return (
    <>
      <FieldLabel id={id}>{ariaLabel}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${className}`}
        aria-label={ariaLabel}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === ALL_WAREHOUSES ? "All Warehouses" : opt === ALL_STATUSES ? "All Statuses" : opt}
          </option>
        ))}
      </select>
    </>
  );
}

function FilterBar({
  search,
  setSearch,
  warehouseFilter,
  setWarehouseFilter,
  statusFilter,
  setStatusFilter,
  warehouses = [],
  debounceMs = 250,
  className = "",
}) {
  const [query, setQuery] = useState(search || "");

  useEffect(() => {
    setQuery(search || "");
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs, setSearch]);

  const warehouseOptions = useMemo(() => {
    const codes = Array.from(
      new Set((warehouses || []).map((w) => String(w?.code || "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return [ALL_WAREHOUSES, ...codes];
  }, [warehouses]);

  const resetFilters = () => {
    setQuery("");
    setWarehouseFilter(ALL_WAREHOUSES);
    setStatusFilter(ALL_STATUSES);
    setSearch("");
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center gap-4 mb-6 ${className}`}>
      <div className="flex-1">
        <FieldLabel id="filter-search">Search by name, SKU, ID</FieldLabel>
        <input
          id="filter-search"
          type="text"
          placeholder="Search by name, SKU, ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search"
          inputMode="search"
          autoComplete="off"
        />
      </div>

      <Select
        id="filter-warehouse"
        value={warehouseFilter}
        onChange={setWarehouseFilter}
        options={warehouseOptions}
        ariaLabel="Warehouse Filter"
      />

      <Select
        id="filter-status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={STATUS_OPTIONS}
        ariaLabel="Status Filter"
      />

      <button
        type="button"
        onClick={resetFilters}
        className="p-2 px-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Reset filters"
        title="Reset filters"
      >
        Reset
      </button>
    </div>
  );
}

FilterBar.propTypes = {
  search: PropTypes.string,
  setSearch: PropTypes.func.isRequired,
  warehouseFilter: PropTypes.string.isRequired,
  setWarehouseFilter: PropTypes.func.isRequired,
  statusFilter: PropTypes.string.isRequired,
  setStatusFilter: PropTypes.func.isRequired,
  warehouses: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })
  ),
  debounceMs: PropTypes.number,
  className: PropTypes.string,
};

export default memo(FilterBar);
export { FilterBar };
