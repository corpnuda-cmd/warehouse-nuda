import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PackageX } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <PackageX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">Page not found</p>
        <Button onClick={() => navigate('/')}>Go back to Dashboard</Button>
      </div>
    </div>
  )
}