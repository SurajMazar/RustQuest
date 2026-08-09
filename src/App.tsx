import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AppShell } from './components/layout/AppShell'

const Home = lazy(() => import('./pages/Home'))
const LevelOverview = lazy(() => import('./pages/LevelOverview'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-neutral-400">
      <Loader2 className="animate-spin" size={22} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/:levelId" element={<LevelOverview />} />
            <Route path="/:levelId/:chapterId/:lessonId" element={<LessonPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
