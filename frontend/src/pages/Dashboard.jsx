import React, { useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import KpiCard from "../components/KpiCards";
import ProductTable from "../components/ProductTable";
import ProductDrawer from "../components/ProductDrawer";
import FilterBar from "../components/FilterBar";
import Chart from "../components/Chart";

const GET_WAREHOUSES = gql`
  query GetWarehouses {
    warehouses {
      code
    }
  }
`;

const GET_KPIS = gql`
  query GetKPIs($range: String!) {
    kpis(range: $range) {
      stock
      demand
    }
  }
`;

function Dashboard() {
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const {
    loading: warehousesLoading,
    error: warehousesError,
    data: warehousesData,
  } = useQuery(GET_WAREHOUSES);
  const {
    loading: kpisLoading,
    error: kpisError,
    data: kpisData,
  } = useQuery(GET_KPIS, { variables: { range } });

  if (warehousesError || kpisError)
    return (
      <p className="p-4 text-red-600">
        Error loading dashboard data. Please try again later.
      </p>
    );

  if (warehousesLoading || kpisLoading)
    return (
      <div className="p-4 flex justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );

  const warehouses = warehousesData?.warehouses || [];
  const kpis = kpisData?.kpis || [];

  const totalStock = selectedProduct
    ? selectedProduct.stock
    : kpis.reduce((sum, k) => sum + k.stock, 0);
  const totalDemand = selectedProduct
    ? selectedProduct.demand
    : kpis.reduce((sum, k) => sum + k.demand, 0);
  const fillRate =
    totalDemand > 0
      ? ((Math.min(totalStock, totalDemand) / totalDemand) * 100).toFixed(1)
      : 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SupplySight</h1>
        <div className="flex space-x-2">
          {["7d", "14d", "30d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-md font-medium cursor-pointer hover:bg-blue-300 hover:border-blue-400 hover:text-white ${
                range === r
                  ? "bg-blue-600 border border-blue-700 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Total Stock" value={totalStock} />
        <KpiCard title="Total Demand" value={totalDemand} />
        <KpiCard title="Fill Rate" value={`${fillRate}%`} />
      </div>

      <Chart
        data={kpis.map((k, i) => ({
          day: `Day ${i + 1}`,
          stock: k.stock,
          demand: k.demand,
        }))}
      />

      <FilterBar
        search={search}
        setSearch={setSearch}
        warehouseFilter={warehouseFilter}
        setWarehouseFilter={setWarehouseFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        warehouses={warehouses}
      />

      <ProductTable
        search={search}
        warehouseFilter={warehouseFilter}
        statusFilter={statusFilter}
        page={page}
        setPage={setPage}
        onRowClick={setSelectedProduct}
      />

      {selectedProduct && Object.keys(selectedProduct).length && (
        <ProductDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;
