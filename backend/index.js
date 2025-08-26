const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')

const typeDefs = `
  type Warehouse {
    id: ID!
    code: String!
    city: String!
    country: String!
  }

  type Product {
    id: ID!
    name: String!
    sku: String!
    warehouse: String!
    stock: Int!
    demand: Int!
  }

  type KPI {
    stock: Int!
    demand: Int!
  }

  type Query {
    products(search: String, status: String, warehouse: String): [Product!]!
    warehouses: [Warehouse!]!
    kpis(range: String!): [KPI!]!
  }

  type Mutation {
    updateDemand(id: ID!, demand: Int!): Product!
    transferStock(id: ID!, from: String!, to: String!, qty: Int!): Product!
  }
`

let nextProductId = 1005;

let products = [
  { id: "P-1001", name: "12mm Hex Bolt", sku: "HEX-12-100", warehouse: "BLR-A", stock: 180, demand: 120 },
  { id: "P-1002", name: "Steel Washer", sku: "WSR-08-500", warehouse: "BLR-A", stock: 50, demand: 80 },
  { id: "P-1003", name: "M8 Nut", sku: "NUT-08-200", warehouse: "PNQ-C", stock: 80, demand: 80 },
  { id: "P-1004", name: "Bearing 608ZZ", sku: "BRG-608-50", warehouse: "DEL-B", stock: 24, demand: 120 }
]

const warehouses = [
  { id: "W1", code: "BLR-A", city: "Bangalore", country: "India" },
  { id: "W2", code: "PNQ-C", city: "Pune", country: "India" },
  { id: "W3", code: "DEL-B", city: "Delhi", country: "India" }
]

const resolvers = {
  Query: {
    products: (_, { search, status, warehouse }) => {
      let filtered = [...products];
      if (search) {
        const lowerSearch = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(lowerSearch) ||
          p.sku.toLowerCase().includes(lowerSearch) ||
          p.id.toLowerCase().includes(lowerSearch)
        );
      }

      if (warehouse && warehouse !== 'All') {
        filtered = filtered.filter(p => p.warehouse === warehouse);
      }

      if (status && status !== 'All') {
        filtered = filtered.filter(p => {
          if (p.stock > p.demand && status === 'Healthy') return true;
          if (p.stock === p.demand && status === 'Low') return true;
          if (p.stock < p.demand && status === 'Critical') return true;
          return false;
        });
      }

      return filtered;
    },

    warehouses: () => warehouses,

    kpis: (_, { range }) => {
      let days;

      switch (range) {
        case '14d':
          days = 14;
        break;
        case '30d':
          days = 30;
        break;
        default: days = 7;
      }

      return Array.from({ length: days }, (_, i) => ({
        stock: Math.floor(Math.random() * 200 + 100),
        demand: Math.floor(Math.random() * 200 + 100)
      }));
    }
  },

  Mutation: {
    updateDemand: (_, { id, demand }) => {
      const product = products.find(p => p.id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      product.demand = demand;
      return product;
    },

    transferStock: (_, { id, from, to, qty }) => {
      const productFrom = products.find(p => p.id === id && p.warehouse === from);
      if (!productFrom) {
        throw new Error('Product not found in from warehouse');
      }
      if (productFrom.stock < qty) {
        throw new Error('Insufficient stock');
      }
      productFrom.stock -= qty;

      let productTo = products.find(p => p.sku === productFrom.sku && p.warehouse === to);
      if (!productTo) {
        productTo = {
          id: `P-${nextProductId++}`,
          name: productFrom.name,
          sku: productFrom.sku,
          warehouse: to,
          stock: qty,
          demand: 0
        };
        products.push(productTo);
      } else {
        productTo.stock += qty;
      }
      return productFrom;
    }
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});