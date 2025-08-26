function FilterBar({ search, setSearch, warehouseFilter, setWarehouseFilter, statusFilter, setStatusFilter, warehouses }) {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
      <input
        type="text"
        placeholder="Search by name, SKU, ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Search"
      />
      <select
        value={warehouseFilter}
        onChange={(e) => setWarehouseFilter(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Warehouse Filter"
      >
        <option value="All">All Warehouses</option>
        {warehouses.map((w) => (
          <option key={w.code} value={w.code}>{w.code}</option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        aria-label="Status Filter"
      >
        <option value="All">All Statuses</option>
        <option value="Healthy">Healthy</option>
        <option value="Low">Low</option>
        <option value="Critical">Critical</option>
      </select>
    </div>
  );
}

export default FilterBar;