import { ApolloClient, InMemoryCache, HttpLink  } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import Dashboard from './pages/Dashboard';
import { API_BASE_URL } from './constant';

const client = new ApolloClient({
  link: new HttpLink({
    uri: API_BASE_URL,
  }),
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Dashboard />
    </ApolloProvider>
  );
}

export default App;