import { Search } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import EmptyState from '../components/EmptyState'
import TitleCard from '../components/TitleCard'
import { selectAllTitles, selectSearchResults, setSearchQuery } from '../features/librarySlice'

function SearchPage() {
  const dispatch = useDispatch()
  const query = useSelector((state) => state.library.searchQuery)
  const results = useSelector(selectSearchResults)
  const allTitles = useSelector(selectAllTitles)
  const suggestions = [...allTitles].sort((first, second) => second.trendingScore - first.trendingScore).slice(0, 6)
  const hasQuery = query.trim().length > 0
  const visibleTitles = hasQuery ? results : suggestions

  return (
    <section className="pt-28">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <h1 className="text-4xl font-black text-white sm:text-5xl">Search</h1>
        <label className="mt-6 flex h-12 max-w-2xl items-center gap-3 rounded-md border border-white/15 bg-zinc-950 px-4 text-zinc-300">
          <Search size={20} />
          <input
            autoFocus
            className="h-full w-full bg-transparent text-base text-white placeholder:text-zinc-500 outline-none"
            value={query}
            onChange={(event) => dispatch(setSearchQuery(event.target.value))}
            placeholder="Search by title, cast, genre or mood"
            aria-label="Search Netflix titles"
          />
        </label>
      </div>

      {hasQuery && results.length === 0 ? (
        <EmptyState
          title="No matches"
          message="Try a different title, cast member, genre or mood."
          actionLabel="Clear search"
          actionPath="/search"
        />
      ) : (
        <div className="mx-auto mt-8 max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-xl font-black text-white sm:text-2xl">
            {hasQuery ? `Results for ${query}` : 'Top searches'}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {visibleTitles.map((title) => (
              <TitleCard key={title.id} title={title} compact />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default SearchPage
