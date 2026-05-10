import { Check, Info, Play, Plus, Volume2, VolumeX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { openPreview, selectIsInMyList, toggleMuted, toggleMyList } from '../features/librarySlice'
import FallbackImage from './FallbackImage'
import { FALLBACK_BACKDROP } from '../utils/fallbackImages'

function Hero({ title }) {
  const dispatch = useDispatch()
  const muted = useSelector((state) => state.library.muted)
  const isInMyList = useSelector((state) => (title ? selectIsInMyList(state, title.id) : false))

  if (!title) {
    return null
  }

  return (
    <section className="relative min-h-[680px] overflow-hidden pt-16 sm:min-h-[720px] lg:min-h-[760px]">
      <FallbackImage
        src={title.backdrop}
        fallbackSrc={FALLBACK_BACKDROP}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
      />
      <div className="hero-fade absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[620px] max-w-[1500px] items-center px-4 pb-28 pt-24 sm:px-6 lg:min-h-[700px] lg:px-10">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded bg-netflix px-3 py-1 text-xs font-black uppercase text-white">
            <span className="h-2 w-2 rounded-full bg-white" />
            {title.type}
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
            {title.title}
          </h1>

          <p className="mt-4 max-w-lg text-lg font-semibold text-zinc-100 sm:text-xl">{title.tagline}</p>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-200 sm:text-lg">{title.synopsis}</p>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
            <span className="font-bold text-emerald-400">{title.match}% Match</span>
            <span>{title.year}</span>
            <span className="rounded border border-zinc-400 px-1.5 py-0.5 text-xs">{title.maturity}</span>
            <span>{title.seasons || title.duration}</span>
            <span className="rounded bg-white/12 px-2 py-1 text-xs font-semibold">{title.badge}</span>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="netflix-focus inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-black transition hover:bg-zinc-200 sm:text-base"
              onClick={() => dispatch(openPreview(title.id))}
            >
              <Play size={21} fill="currentColor" />
              Play
            </button>

            <Link
              to={`/title/${title.id}`}
              className="netflix-focus inline-flex h-11 items-center gap-2 rounded-md bg-zinc-500/75 px-5 text-sm font-bold text-white transition hover:bg-zinc-500 sm:text-base"
            >
              <Info size={21} />
              More Info
            </Link>

            <button
              type="button"
              className="netflix-focus inline-flex h-11 items-center gap-2 rounded-md border border-white/35 bg-black/35 px-4 text-sm font-bold text-white transition hover:bg-white/10"
              onClick={() => dispatch(toggleMyList(title.id))}
              aria-label={isInMyList ? `Remove ${title.title} from My List` : `Add ${title.title} to My List`}
            >
              {isInMyList ? <Check size={20} /> : <Plus size={20} />}
              My List
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-28 right-4 flex items-center gap-3 sm:right-6 lg:right-10">
        <button
          type="button"
          className="netflix-focus grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-black/35 text-white hover:bg-white/10"
          onClick={() => dispatch(toggleMuted())}
          aria-label={muted ? 'Unmute preview' : 'Mute preview'}
        >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <span className="border-l-4 border-white bg-black/55 px-3 py-2 text-sm text-zinc-200">{title.maturity}</span>
      </div>
    </section>
  )
}

export default Hero
