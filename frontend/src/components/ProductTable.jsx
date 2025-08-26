import { useQuery } from '@apollo/client/react';
import { gql } from "@apollo/client";

const GET_PRODUCTS = gql`
  query GetProducts($search: String, $status: String, $warehouse: String) {
    products(search: $search, status: $status, warehouse: $warehouse) {
      id
      name
      sku
      warehouse
      stock
      demand
    }
  }
`;

function ProductTable({ search, warehouseFilter, statusFilter, page, setPage, onRowClick }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { search, status: statusFilter, warehouse: warehouseFilter },
  });

  if (error) return <p className="p-4 text-red-600">Error loading products: {error.message}</p>;
  if (loading) return <div className="p-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

  const products = data?.products || [];
  const pageSize = 10;
  const totalPages = Math.ceil(products.length / pageSize);
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  const getStatus = (p) => {
    if (p.stock < 0 || p.demand < 0) return 'Invalid';
    if (p.stock > p.demand) return 'Healthy';
    if (p.stock === p.demand) return 'Low';
    return 'Critical';
  };
  const getStatusColor = (status) => ({
    Healthy: 'bg-green-200 text-green-800',
    Low: 'bg-yellow-200 text-yellow-800',
    Critical: 'bg-red-200 text-red-800',
    Invalid: 'bg-gray-200 text-gray-800',
  }[status] || 'bg-gray-200 text-gray-800');

  const getStatusEmoji = (status) => ({
    Healthy: '🟢',
    Low: '🟡',
    Critical: '🔴',
    Invalid: '⚠️',
  }[status] || '⚠️');

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
      <table className="w-full" role="grid">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">Product</th>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">SKU</th>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">Warehouse</th>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">Stock</th>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">Demand</th>
            <th className="p-3 text-left font-semibold text-gray-700" role="columnheader">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProducts.length === 0 ? (
            <tr><td colSpan="6" className="p-4 text-center text-gray-500">No products found.</td></tr>
          ) : paginatedProducts.map((p) => {
            const status = getStatus(p);
            const rowTint = status === 'Critical' ? 'bg-red-50' : '';
            return (
              <tr
                key={p.id}
                className={`border-t ${rowTint} hover:bg-gray-50 cursor-pointer`}
                onClick={() => {onRowClick(p); console.log(p)}}
                role="row"
              >
                <td className="p-3" role="cell">{p.name}</td>
                <td className="p-3" role="cell">{p.sku}</td>
                <td className="p-3" role="cell">{p.warehouse}</td>
                <td className="p-3" role="cell">{p.stock}</td>
                <td className="p-3" role="cell">{p.demand}</td>
                <td className="p-3" role="cell">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusEmoji(status)} {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pn) => (
            <button
              key={pn}
              onClick={() => setPage(pn)}
              className={`px-4 py-2 rounded-md ${page === pn ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}
            >
              {pn}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductTable;