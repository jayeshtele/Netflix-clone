import { SlidersHorizontal } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectGenres, setActiveGenre, setSortMode } from '../features/librarySlice'

const sortOptions = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Newest', value: 'newest' },
  { label: 'Match', value: 'match' },
]

function GenreControls() {
  const dispatch = useDispatch()
  const genres = useSelector(selectGenres)
  const { activeGenre, sortMode } = useSelector((state) => state.library)

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 sm:px-6 lg:px-10">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            className={[
              'netflix-focus h-9 shrink-0 rounded-md border px-4 text-sm font-bold transition',
              activeGenre === genre
                ? 'border-white bg-white text-black'
                : 'border-white/15 bg-zinc-900 text-zinc-200 hover:border-white/35 hover:bg-zinc-800',
            ].join(' ')}
            onClick={() => dispatch(setActiveGenre(genre))}
          >
            {genre}
          </button>
        ))}
      </div>

      <label className="flex w-full max-w-xs items-center gap-3 rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
        <SlidersHorizontal size={18} />
        <span className="font-semibold">Sort</span>
        <select
          className="ml-auto bg-transparent text-white outline-none"
          value={sortMode}
          onChange={(event) => dispatch(setSortMode(event.target.value))}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-950">
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export default GenreControls
