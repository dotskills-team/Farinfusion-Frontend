import LowStockProductManagement from '@/components/dashboard/lowStockProducts/LowStockProductManagement'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Low Stock Products | Farin Fusion',
  description: 'View and manage your low stock products on Farin Fusion.',
}

export default function MyOrdersPage() {
  return <LowStockProductManagement />
}
