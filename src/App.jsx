import { Route, Routes } from 'react-router-dom'
import Shell from './components/Shell'
import BrowsePage from './pages/BrowsePage'
import Home from './pages/Home'
import MyList from './pages/MyList'
import NotFound from './pages/NotFound'
import SearchPage from './pages/SearchPage'
import TitlePage from './pages/TitlePage'

function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="tv" element={<BrowsePage mode="series" />} />
        <Route path="movies" element={<BrowsePage mode="movies" />} />
        <Route path="new" element={<BrowsePage mode="new" />} />
        <Route path="my-list" element={<MyList />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="title/:titleId" element={<TitlePage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
