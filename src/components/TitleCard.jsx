import { Check, Info, Play, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { openPreview, selectIsInMyList, toggleMyList } from '../features/librarySlice'
import FallbackImage from './FallbackImage'
import { FALLBACK_BACKDROP, FALLBACK_POSTER } from '../utils/fallbackImages'

function TitleCard({ title, variant = 'standard', compact = false }) {
  const dispatch = useDispatch()
  const isInMyList = useSelector((state) => selectIsInMyList(state, title.id))
  const progress = Math.min(92, 24 + title.rank * 6)

  return (
    <article
      className={[
        'group relative shrink-0 overflow-hidden rounded-md bg-zinc-900 shadow-xl ring-1 ring-white/10',
        compact ? 'w-[156px] sm:w-[190px]' : 'w-[178px] sm:w-[222px] lg:w-[258px]',
      ].join(' ')}
    >
      <Link to={`/title/${title.id}`} className="netflix-focus block">
        <div className={variant === 'ranked' ? 'aspect-[16/9]' : 'aspect-[2/3]'}>
          <FallbackImage
            src={variant === 'ranked' ? title.backdrop : title.poster}
            fallbackSrc={variant === 'ranked' ? FALLBACK_BACKDROP : FALLBACK_POSTER}
            alt={title.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {variant === 'ranked' && (
        <div className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded bg-black/75 text-lg font-black text-white ring-1 ring-white/20">
          {title.rank}
        </div>
      )}

      <div className="poster-sheen absolute inset-x-0 bottom-0 p-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="netflix-focus grid h-8 w-8 place-items-center rounded-full bg-white text-black hover:bg-zinc-200"
            onClick={() => dispatch(openPreview(title.id))}
            aria-label={`Play ${title.title}`}
          >
            <Play size={16} fill="currentColor" />
          </button>
          <button
            type="button"
            className="netflix-focus grid h-8 w-8 place-items-center rounded-full border border-white/45 bg-black/60 text-white hover:bg-white/10"
            onClick={() => dispatch(toggleMyList(title.id))}
            aria-label={isInMyList ? `Remove ${title.title} from My List` : `Add ${title.title} to My List`}
          >
            {isInMyList ? <Check size={16} /> : <Plus size={16} />}
          </button>
          <Link
            to={`/title/${title.id}`}
            className="netflix-focus ml-auto grid h-8 w-8 place-items-center rounded-full border border-white/45 bg-black/60 text-white hover:bg-white/10"
            aria-label={`More about ${title.title}`}
          >
            <Info size={16} />
          </Link>
        </div>

        <h3 className="mt-3 line-clamp-1 text-sm font-bold text-white">{title.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-200">
          <span className="text-emerald-400">{title.match}% Match</span>
          <span>{title.maturity}</span>
          <span>{title.type}</span>
        </div>
      </div>

      {variant === 'progress' && (
        <div className="absolute inset-x-3 bottom-2 h-1 rounded bg-zinc-600">
          <div className="h-full rounded bg-netflix" style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  )
}

export default TitleCard
