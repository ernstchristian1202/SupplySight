# SupplySight Inventory Dashboard

## Overview
The SupplySight Inventory Dashboard is a web-based application built with React, Tailwind CSS, and Apollo Client to manage and visualize inventory data for a supply chain platform. It provides a user-friendly interface to monitor stock levels, demand, and transfer operations, with real-time updates via a mock GraphQL server.

## Features
- **Dashboard Layout**: Displays logo, date range filters (7d, 14d, 30d), and KPI cards for total stock, demand, and fill rate.
- **Line Chart**: Visualizes stock vs. demand trends over the selected date range.
- **Filters**: Search by name, SKU, or ID, with warehouse and status (Healthy, Low, Critical) dropdowns.
- **Products Table**: Lists products with pagination (10 rows/page), showing status indicators (Healthy 🟢, Low 🟡, Critical 🔴).
- **Product Drawer**: Opens on row click to view details and update demand or transfer stock.
- **Real-Time Updates**: Filters and mutations (demand update, stock transfer) update data live.

## Prerequisites
- Node.js (v18.x or higher)
- npm or yarn

## Installation
1. Clone the repository:
git clone https://github.com/ernstchristia1202/SupplySight.git
2. Install dependencies and run GraphQL server & frontend development server:
```
cd backend
npm install
node index.js
```
The server will run on `http://localhost:4000`.

```
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` (or the port specified by Vite) in your browser.

## Technologies Used
- **React**: For building the user interface.
- **Tailwind CSS**: For styling with utility classes.
- **Apollo Client**: For GraphQL queries and mutations.
- **GraphQL**: For data schema and mock server.
- **Vite**: As the development server and bundler.

## Extending the Application
- **New KPIs**: Add more `KpiCard` instances in `Dashboard.js` with custom data.
- **Additional Filters**: Extend `FilterBar.js` with new dropdowns or inputs.
- **New Charts**: Insert additional `Chart` components in `Dashboard.js`.
- **Custom Mutations**: Add new forms in `ProductDrawer.js` with corresponding GraphQL mutations.

## Maintainer
By [Ernst](https://github.com/ernstchristian1202).\
Feel free to contact [Ernst](mailto:ernstchristia@gmail.com).