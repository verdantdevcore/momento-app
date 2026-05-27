import { NotFoundContent } from '@/components/landing/NotFoundContent'

export const metadata = {
  title: '404 – Page Not Found | Momento App',
  description: 'The page you are looking for may have been moved, removed, or is temporarily unavailable.',
}

export default function NotFound() {
  return <NotFoundContent />
}