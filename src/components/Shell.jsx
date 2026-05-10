import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import { loadLiveCatalog } from '../features/librarySlice'
import Footer from './Footer'
import Header from './Header'
import PreviewModal from './PreviewModal'

function Shell() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(loadLiveCatalog())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-ink text-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <PreviewModal />
    </div>
  )
}

export default Shell
