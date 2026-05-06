import { Outlet } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'
import PreviewModal from './PreviewModal'

function Shell() {
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
