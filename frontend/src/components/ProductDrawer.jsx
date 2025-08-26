import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';

const UPDATE_DEMAND = gql`
  mutation UpdateDemand($id: ID!, $demand: Int!) {
    updateDemand(id: $id, demand: $demand) {
      id
      demand
    }
  }
`;

const TRANSFER_STOCK = gql`
  mutation TransferStock($id: ID!, $from: String!, $to: String!, $qty: Int!) {
    transferStock(id: $id, from: $from, to: $to, qty: $qty) {
      id
      stock
    }
  }
`;

function ProductDrawer({ product, onClose }) {
  const [demand, setDemand] = useState(product.demand);
  const [toWarehouse, setToWarehouse] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);

  const [updateDemand] = useMutation(UPDATE_DEMAND, {
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: gql`query { products { id name sku warehouse stock demand } }` }],
  });
  const [transferStock] = useMutation(TRANSFER_STOCK, {
    onError: (err) => setError(err.message),
    refetchQueries: [{ query: gql`query { products { id name sku warehouse stock demand } }` }],
  });

  const getStatus = (p) => {
    if (p.stock < 0 || p.demand < 0) return 'Invalid';
    if (p.stock > p.demand) return 'Healthy';
    if (p.stock === p.demand) return 'Low';
    return 'Critical';
  };

  const handleUpdateDemand = (e) => {
    e.preventDefault();
    if (demand < 0) {
      setError('Demand cannot be negative');
      return;
    }
    updateDemand({ variables: { id: product.id, demand } });
    setError(null);
  };

  const handleTransferStock = (e) => {
    e.preventDefault();
    if (qty <= 0 || qty > product.stock) {
      setError('Invalid quantity');
      return;
    }
    transferStock({ variables: { id: product.id, from: product.warehouse, to: toWarehouse, qty } });
    setError(null);
  };

  return (
    <div className="fixed top-0 right-[384px] h-full w-96 bg-white shadow-2xl p-6 transition-transform duration-300 ease-in-out transform translate-x-full z-10" style={{ transform: product ? 'translate-x-0' : 'translate-x-full' }} role="dialog" aria-label="Product Details">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer">✕</button>
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="space-y-2 mb-6">
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>SKU:</strong> {product.sku}</p>
        <p><strong>Warehouse:</strong> {product.warehouse}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>Demand:</strong> {product.demand}</p>
        <p><strong>Status:</strong> {getStatus(product)}</p>
      </div>

      <form onSubmit={handleUpdateDemand} className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Update Demand</h3>
        <div className="flex space-x-2">
          <input
            type="number"
            value={demand}
            onChange={(e) => setDemand(parseInt(e.target.value, 10) || 0)}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Demand"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:cursor-pointer">Update</button>
        </div>
      </form>

      <form onSubmit={handleTransferStock}>
        <h3 className="text-lg font-semibold mb-2">Transfer Stock</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <p className="p-2 bg-gray-100 rounded-md">{product.warehouse}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <select
              value={toWarehouse}
              onChange={(e) => setToWarehouse(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="To Warehouse"
            >
              <option value="">Select Warehouse</option>
              {['BLR-A', 'PNQ-C', 'DEL-B'].filter(w => w !== product.warehouse).map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
              min="1"
              max={product.stock}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Quantity"
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:cursor-pointer">Transfer</button>
        </div>
      </form>
    </div>
  );
}

export default ProductDrawer;