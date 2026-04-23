import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/lib/auth"

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        {/* Routes will be here */}
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App
