import React, { useEffect, useMemo, useState } from "react"
import { useQuery } from "@apollo/client/react"
import {
  Chart,
  FilterBar,
  KpiCard,
  ProductTable,
  ProductDrawer,
} from "../components"
import { GET_WAREHOUSES, GET_KPIS } from "../gql/queries"

function RangeToggle({ value, onChange, options = ["7d", "14d", "30d"] }) {
  return (
    <div className="flex space-x-2">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              "px-4 py-2 rounded-md font-medium cursor-pointer border",
              active
                ? "bg-blue-600 border-blue-700 text-white"
                : "bg-white text-gray-600 border-gray-300 hover:bg-blue-300 hover:border-blue-400 hover:text-white",
            ].join(" ")}
            aria-pressed={active}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Dashboard() {
  const [range, setRange] = useState("7d");
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [search, warehouseFilter, statusFilter]);

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

  const warehouses = warehousesData?.warehouses ?? [];
  const warehouseCodes = useMemo(
    () =>
      Array.from(
        new Set(
          warehouses
            .map((w) => String(w?.code ?? "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [warehouses]
  );

  const kpis = kpisData?.kpis ?? [];

  const { totalStock, totalDemand, fillRate, chartData } = useMemo(() => {
    const source = selectedProduct
      ? [{ stock: selectedProduct.stock, demand: selectedProduct.demand }]
      : kpis;

    const stockSum = source.reduce((s, x) => s + (x?.stock ?? 0), 0);
    const demandSum = source.reduce((s, x) => s + (x?.demand ?? 0), 0);
    const rate =
      demandSum > 0
        ? ((Math.min(stockSum, demandSum) / demandSum) * 100).toFixed(1)
        : "0.0";

    const chart = kpis.map((k, i) => ({
      day: `Day ${i + 1}`,
      stock: k.stock,
      demand: k.demand,
    }));

    return {
      totalStock: stockSum,
      totalDemand: demandSum,
      fillRate: rate,
      chartData: chart,
    };
  }, [kpis, selectedProduct]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen relative">
      <div className="flex sm:flex-row flex-col justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SupplySight</h1>
        <RangeToggle value={range} onChange={setRange} />
      </div>

      {(warehousesError || kpisError) && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 text-red-700 p-3">
          Error loading dashboard data. Please try again later.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard title="Total Stock" value={totalStock} />
        <KpiCard title="Total Demand" value={totalDemand} />
        <KpiCard title="Fill Rate" value={`${fillRate}%`} />
      </div>

      <div className="relative">
        {kpisLoading ? (
          <div className="bg-white p-4 rounded-lg shadow mb-6 w-full h-[300px] animate-pulse" />
        ) : (
          <Chart data={chartData} title="Stock vs Demand Trend" height={300} />
        )}
      </div>

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

      {selectedProduct && (
        <ProductDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          warehouses={warehouseCodes}
        />
      )}

      {(warehousesLoading || kpisLoading) && (
        <div className="fixed bottom-4 right-4 w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin opacity-80" />
      )}
    </div>
  );
}

export default Dashboard;
