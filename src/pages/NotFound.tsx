import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</div>
      <p className="text-neutral-500 mb-6">That page doesn't exist.</p>
      <Link to="/" className="text-violet-500 font-medium hover:underline">
        Back to course overview
      </Link>
    </div>
  )
}
