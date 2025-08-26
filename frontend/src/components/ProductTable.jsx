import React, { memo, useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { GET_PRODUCTS } from "../gql/queries";

function getStatus(p) {
  const stock = Number(p?.stock ?? 0);
  const demand = Number(p?.demand ?? 0);
  if (Number.isNaN(stock) || Number.isNaN(demand)) return "Invalid";
  if (stock < 0 || demand < 0) return "Invalid";
  if (stock > demand) return "Healthy";
  if (stock === demand) return "Low";
  return "Critical";
}

function getStatusColor(status) {
  switch (status) {
    case "Healthy":
      return "bg-green-200 text-green-800";
    case "Low":
      return "bg-yellow-200 text-yellow-800";
    case "Critical":
      return "bg-red-200 text-red-800";
    case "Invalid":
    default:
      return "bg-gray-200 text-gray-800";
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case "Healthy":
      return "🟢";
    case "Low":
      return "🟡";
    case "Critical":
      return "🔴";
    case "Invalid":
    default:
      return "⚠️";
  }
}

function SkeletonRow() {
  return (
    <tr className="border-t">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="p-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function ProductTable({
  search,
  warehouseFilter,
  statusFilter,
  page,
  setPage,
  onRowClick,
  pageSize = 10,
}) {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: {
      search,
      // If your API expects null/undefined to mean “no filter”, avoid sending "All"
      status: statusFilter === "All" ? null : statusFilter,
      warehouse: warehouseFilter === "All" ? null : warehouseFilter,
    },
    fetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
  });

  if (error) {
    return (
      <p className="p-4 text-red-600">
        Error loading products: {error.message}
      </p>
    );
  }

  const products = data?.products ?? [];

  // Precompute status once, also normalize numeric display
  const rows = useMemo(
    () =>
      products.map((p) => {
        const stock = Number(p.stock ?? 0);
        const demand = Number(p.demand ?? 0);
        return { ...p, stock, demand, status: getStatus({ stock, demand }) };
      }),
    [products]
  );

  const { totalPages, paginated } = useMemo(() => {
    const totalPagesCalc = Math.max(1, Math.ceil(rows.length / pageSize));
    const current = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (current - 1) * pageSize;
    const end = start + pageSize;
    return {
      totalPages: totalPagesCalc,
      paginated: rows.slice(start, end),
    };
  }, [rows, page, pageSize]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-700">Product</th>
            <th className="p-3 text-left font-semibold text-gray-700">SKU</th>
            <th className="p-3 text-left font-semibold text-gray-700">Warehouse</th>
            <th className="p-3 text-left font-semibold text-gray-700">Stock</th>
            <th className="p-3 text-left font-semibold text-gray-700">Demand</th>
            <th className="p-3 text-left font-semibold text-gray-700">Status</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <>
              {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">
                No products found.
              </td>
            </tr>
          ) : (
            paginated.map((p) => {
              const rowTint = p.status === "Critical" ? "bg-red-50" : "";
              return (
                <tr
                  key={p.id}
                  className={`border-t ${rowTint} hover:bg-gray-50 cursor-pointer`}
                  onClick={() => onRowClick && onRowClick(p)}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && onRowClick) {
                      e.preventDefault();
                      onRowClick(p);
                    }
                  }}
                  tabIndex={0}
                >
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.sku}</td>
                  <td className="p-3">{p.warehouse}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">{p.demand}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        p.status
                      )}`}
                    >
                      {getStatusEmoji(p.status)} {p.status}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {!loading && totalPages > 1 && (
        <nav className="flex justify-center items-center gap-2 py-4">
          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            className="px-3 py-2 rounded-md bg-white text-gray-600 border border-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            aria-label="Previous page"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
            <button
              key={pn}
              type="button"
              onClick={() => setPage(pn)}
              className={`px-3 py-2 rounded-md ${
                page === pn
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 border border-gray-300"
              }`}
              aria-current={page === pn ? "page" : undefined}
            >
              {pn}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            className="px-3 py-2 rounded-md bg-white text-gray-600 border border-gray-300 disabled:opacity-50"
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            ›
          </button>
        </nav>
      )}
    </div>
  );
}

export default memo(ProductTable);
export { ProductTable };
