# NOTES.md

## Decisions
- **Component Structure**: Split the frontend into reusable components (e.g., `KpiCard`, `ProductTable`) and a single `Dashboard` page for modularity and scalability.
- **Styling**: Used Tailwind CSS for rapid prototyping and responsive design, avoiding custom CSS to save time.
- **Data Management**: Leveraged Apollo Client with GraphQL for real-time data fetching and mutations, aligning with the supply chain context.
- **Error/Loading States**: Implemented basic loading spinners and error messages for key queries to ensure user feedback.
- **Business Logic**: Defined status rules (Healthy, Low, Critical) based on stock vs. demand, with edge cases (negative values) handled as "Invalid".

## Trade-offs
- **Performance**: Filters are applied synchronously without debouncing, which could lag with large datasets; prioritized simplicity over optimization.
- **Server Complexity**: Used a basic Apollo Server mock without persistence or authentication, trading off realism for quick setup.
- **Accessibility**: Added ARIA roles but skipped full a11y testing (e.g., keyboard navigation) due to time constraints.
- **Extensibility**: Hardcoded warehouse codes in `ProductDrawer.js` for transfers, limiting dynamic warehouse data use for speed.
- **Testing**: Focused on functionality over unit/integration tests to meet the 4-hour timeline.

## Improvements with More Time
- **Performance Optimization**: Add debouncing to filters, use lazy loading for the table, and implement query caching with Apollo.
- **Accessibility**: Enhance with full keyboard support, screen reader testing, and better contrast ratios.
- **Persistence**: Integrate a real database (e.g., SQLite) or mock persistence in the GraphQL server.
- **Testing**: Write unit tests for components and integration tests for GraphQL interactions.
- **Advanced Features**: Add export functionality (e.g., CSV), real-time notifications, and a settings panel for user preferences.
- **UI Polish**: Implement animations (e.g., drawer transitions), mobile-first design refinements, and custom themes.