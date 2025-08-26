import { useState, useEffect, useMemo, useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import { TRANSFER_STOCK, UPDATE_DEMAND } from '../gql/mutations'
import { GET_PRODUCTS } from '../gql/queries'

function safeInt(value, fallback = 0) {
  const n = parseInt(value, 10)
  return Number.isFinite(n) ? n : fallback
}

function getStatus(p) {
  if (!p) return "-"
  const { stock, demand } = p
  if (stock < 0 || demand < 0) return "Invalid"
  if (stock > demand) return "Healthy"
  if (stock === demand) return "Low"
  return "Critical"
}

function ProductDrawer({ product, onClose, warehouses = [] }) {
  const open = Boolean(product)

  const [demand, setDemand] = useState(product?.demand ?? 0)
  const [toWarehouse, setToWarehouse] = useState("")
  const [qty, setQty] = useState(1)
  const [error, setError] = useState(null)

  useEffect(() => {
    setDemand(product?.demand ?? 0)
    setToWarehouse("")
    setQty(1)
    setError(null)
  }, [product])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === "Escape" && onClose?.()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const availableDestinations = useMemo(() => {
    const list = (warehouses || []).map(String)
    return product ? list.filter((w) => w !== product.warehouse) : list
  }, [warehouses, product])

  const [runUpdateDemand, { loading: updating }] = useMutation(UPDATE_DEMAND, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onError: (err) => setError(err.message),
  })

  const [runTransferStock, { loading: transferring }] = useMutation(TRANSFER_STOCK, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onError: (err) => setError(err.message),
  })

  const handleUpdateDemand = useCallback(
    async (e) => {
      e.preventDefault()
      if (!product) return

      const d = safeInt(demand, 0)
      if (d < 0) {
        setError("Demand cannot be negative")
        return
      }

      try {
        setError(null);
        await runUpdateDemand({ variables: { id: product.id, demand: d } });
      } catch (_) {
        console.warn("Update demand failed")
      }
    },
    [demand, product, runUpdateDemand]
  )

  const handleTransferStock = useCallback(
    async (e) => {
      e.preventDefault()
      if (!product) return

      const q = safeInt(qty, 1)
      if (!toWarehouse) {
        setError("Please select a destination warehouse")
        return
      }
      if (q <= 0 || q > product.stock) {
        setError("Invalid quantity")
        return
      }

      try {
        setError(null)
        await runTransferStock({
          variables: {
            id: product.id,
            from: product.warehouse,
            to: toWarehouse,
            qty: q,
          },
        })

        setQty(1)
        setToWarehouse("")
      } catch (_) {
        console.warn("Transfer stock failed")
      }
    },
    [product, qty, toWarehouse, runTransferStock]
  );

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Product Details"
        className={[
          "fixed top-0 right-0 h-full w-96 bg-white shadow-2xl p-6",
          "transition-transform duration-300 ease-in-out z-50",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 hover:cursor-pointer"
          aria-label="Close"
          title="Close"
          type="button"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 break-words">
          {product?.name}
        </h2>

        {error && (
          <p className="text-red-600 mb-4" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-2 mb-6 text-sm">
          <p>
            <strong>ID:</strong> {product.id}
          </p>
          <p>
            <strong>SKU:</strong> {product.sku}
          </p>
          <p>
            <strong>Warehouse:</strong> {product.warehouse}
          </p>
          <p>
            <strong>Stock:</strong> {product.stock}
          </p>
          <p>
            <strong>Demand:</strong> {product.demand}
          </p>
          <p>
            <strong>Status:</strong> {getStatus(product)}
          </p>
        </div>

        <form onSubmit={handleUpdateDemand} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Update Demand</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              value={demand}
              onChange={(e) => setDemand(safeInt(e.target.value, 0))}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Demand"
            />
            <button
              type="submit"
              disabled={updating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {updating ? "Updating…" : "Update"}
            </button>
          </div>
        </form>

        <form onSubmit={handleTransferStock}>
          <h3 className="text-lg font-semibold mb-2">Transfer Stock</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From
              </label>
              <p className="p-2 bg-gray-100 rounded-md">{product.warehouse}</p>
            </div>

            <div>
              <label
                htmlFor="to-warehouse"
                className="block text-sm font-medium text-gray-700"
              >
                To
              </label>
              <select
                id="to-warehouse"
                value={toWarehouse}
                onChange={(e) => setToWarehouse(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="To Warehouse"
              >
                <option value="">Select Warehouse</option>
                {availableDestinations.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="transfer-qty"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                id="transfer-qty"
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(safeInt(e.target.value, 1))}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Quantity"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available: {product.stock}
              </p>
            </div>

            <button
              type="submit"
              disabled={transferring}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {transferring ? "Transferring…" : "Transfer"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default ProductDrawer;
export { ProductDrawer };