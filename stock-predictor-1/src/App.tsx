import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from './components/Dashboard'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-bg-primary">
        <Dashboard />
      </div>
    </QueryClientProvider>
  )
}

export default App
