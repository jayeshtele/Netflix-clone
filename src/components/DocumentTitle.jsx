import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { selectTitleById } from '../features/librarySlice'

const routeTitles = {
  '/': 'Home',
  '/tv': 'TV Shows',
  '/movies': 'Movies',
  '/new': 'New & Popular',
  '/my-list': 'My List',
  '/search': 'Search',
}

function DocumentTitle() {
  const location = useLocation()
  const titleId = getTitleId(location.pathname)
  const title = useSelector((state) => (titleId ? selectTitleById(state, titleId) : null))

  useEffect(() => {
    const pageTitle = title?.title || routeTitles[location.pathname] || 'Not Found'
    document.title = `${pageTitle} - Netflix`
  }, [location.pathname, title?.title])

  return null
}

function getTitleId(pathname) {
  const parts = pathname.split('/').filter(Boolean)

  if (parts[0] !== 'title') {
    return null
  }

  try {
    return decodeURIComponent(parts[1] || '')
  } catch {
    return parts[1] || ''
  }
}

export default DocumentTitle
