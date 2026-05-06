import { Bell, ChevronDown, Menu, Search, UserRound, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  closeMobileNav,
  closeProfilePanel,
  setSearchQuery,
  toggleMobileNav,
  toggleProfilePanel,
} from '../features/librarySlice'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'TV Shows', path: '/tv' },
  { label: 'Movies', path: '/movies' },
  { label: 'New & Popular', path: '/new' },
  { label: 'My List', path: '/my-list' },
]

function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mobileNavOpen, profilePanelOpen, searchQuery } = useSelector((state) => state.library)

  const linkClass = ({ isActive }) =>
    [
      'netflix-focus rounded px-1 py-2 text-sm font-medium transition-colors',
      isActive ? 'text-white' : 'text-zinc-300 hover:text-white',
    ].join(' ')

  const handleSearchChange = (event) => {
    dispatch(setSearchQuery(event.target.value))
  }

  const submitSearch = (event) => {
    event.preventDefault()
    dispatch(closeMobileNav())
    navigate('/search')
  }

  const closePanels = () => {
    dispatch(closeMobileNav())
    dispatch(closeProfilePanel())
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/5 bg-gradient-to-b from-black via-black/88 to-black/18">
      <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          className="netflix-focus rounded p-2 text-zinc-200 lg:hidden"
          onClick={() => dispatch(toggleMobileNav())}
          aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <NavLink
          to="/"
          className="netflix-focus rounded text-2xl font-black text-netflix sm:text-3xl"
          onClick={closePanels}
        >
          NETFLIX
        </NavLink>

        <nav className="hidden items-center gap-4 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <form
            className="hidden h-9 items-center gap-2 rounded border border-white/20 bg-black/55 px-3 md:flex"
            onSubmit={submitSearch}
          >
            <Search size={17} className="text-zinc-300" />
            <input
              className="w-40 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none lg:w-56"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Titles, people, genres"
              aria-label="Search titles"
            />
          </form>

          <button
            type="button"
            className="netflix-focus rounded p-2 text-zinc-200 hover:bg-white/10"
            onClick={() => navigate('/search')}
            aria-label="Open search"
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            className="netflix-focus hidden rounded p-2 text-zinc-200 hover:bg-white/10 sm:inline-flex"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          <div className="relative">
            <button
              type="button"
              className="netflix-focus flex items-center gap-1 rounded p-1 text-zinc-100 hover:bg-white/10"
              onClick={() => dispatch(toggleProfilePanel())}
              aria-label="Open profile menu"
            >
              <span className="grid h-8 w-8 place-items-center rounded bg-red-700">
                <UserRound size={19} />
              </span>
              <ChevronDown size={16} className="hidden sm:block" />
            </button>

            {profilePanelOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-md border border-white/15 bg-black/95 p-2 shadow-2xl">
                {['Manage Profiles', 'Transfer Profile', 'Account', 'Help Center'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="netflix-focus w-full rounded px-3 py-2 text-left text-sm text-zinc-200 hover:bg-white/10"
                    onClick={() => dispatch(closeProfilePanel())}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-white/10 bg-black/96 px-4 py-3 lg:hidden">
          <form
            className="mb-3 flex h-10 items-center gap-2 rounded border border-white/20 bg-zinc-950 px-3"
            onSubmit={submitSearch}
          >
            <Search size={17} className="text-zinc-300" />
            <input
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search Netflix"
              aria-label="Search titles"
            />
          </form>

          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={linkClass}
                onClick={() => dispatch(closeMobileNav())}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
