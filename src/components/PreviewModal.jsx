import { Check, Play, Plus, Volume2, VolumeX, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getTrailerEmbedUrl } from '../services/catalogApi'
import {
  closePreview,
  openPreview,
  selectIsInMyList,
  selectPreviewTitle,
  toggleMuted,
  toggleMyList,
} from '../features/librarySlice'

function PreviewModal() {
  const dispatch = useDispatch()
  const title = useSelector(selectPreviewTitle)
  const muted = useSelector((state) => state.library.muted)
  const isInMyList = useSelector((state) => (title ? selectIsInMyList(state, title.id) : false))

  useEffect(() => {
    if (!title) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(closePreview())
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch, title])

  if (!title) {
    return null
  }

  const trailerSrc = getTrailerPlayerUrl(title, muted)

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/78 px-3 py-8 sm:px-6"
      onClick={() => dispatch(closePreview())}
      role="dialog"
      aria-modal="true"
      aria-label={`${title.title} preview`}
    >
      <div
        className="mx-auto max-w-4xl overflow-hidden rounded-md bg-zinc-950 shadow-2xl ring-1 ring-white/15"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative min-h-[360px] overflow-hidden bg-black">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${title.backdrop})` }}
            aria-hidden="true"
          />
          <iframe
            className="absolute inset-0 h-full w-full opacity-75"
            src={trailerSrc}
            title={`${title.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div className="hero-fade pointer-events-none absolute inset-0" aria-hidden="true" />
          <button
            type="button"
            className="netflix-focus absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/75 text-white hover:bg-black"
            onClick={() => dispatch(closePreview())}
            aria-label="Close preview"
          >
            <X size={20} />
          </button>

          <div className="relative flex min-h-[360px] max-w-xl flex-col justify-end p-5 sm:p-8">
            <h2 className="text-4xl font-black text-white sm:text-5xl">{title.title}</h2>
            <p className="mt-3 text-base leading-7 text-zinc-100">{title.synopsis}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="netflix-focus inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-bold text-black hover:bg-zinc-200"
                onClick={() => dispatch(openPreview(title.id))}
              >
                <Play size={19} fill="currentColor" />
                Play
              </button>
              <button
                type="button"
                className="netflix-focus inline-flex h-10 items-center gap-2 rounded-md border border-white/30 bg-black/50 px-4 text-sm font-bold text-white hover:bg-white/10"
                onClick={() => dispatch(toggleMyList(title.id))}
              >
                {isInMyList ? <Check size={18} /> : <Plus size={18} />}
                My List
              </button>
              <button
                type="button"
                className="netflix-focus grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-black/50 text-white hover:bg-white/10"
                onClick={() => dispatch(toggleMuted())}
                aria-label={muted ? 'Unmute preview' : 'Mute preview'}
              >
                {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-5 sm:grid-cols-[1.5fr_1fr] sm:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
              <span className="font-bold text-emerald-400">{title.match}% Match</span>
              <span>{title.year}</span>
              <span className="rounded border border-zinc-500 px-1.5 py-0.5 text-xs">{title.maturity}</span>
              <span>{title.seasons || title.duration}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-300">{title.tagline}</p>
            <Link
              to={`/title/${title.id}`}
              className="netflix-focus mt-5 inline-flex h-10 items-center rounded-md border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10"
              onClick={() => dispatch(closePreview())}
            >
              Open details
            </Link>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Cast</dt>
              <dd className="text-zinc-200">{title.cast.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Genres</dt>
              <dd className="text-zinc-200">{title.genres.join(', ')}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Mood</dt>
              <dd className="text-zinc-200">{title.mood}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}

function getTrailerPlayerUrl(title, muted) {
  const embedUrl = title.trailerEmbedUrl || getTrailerEmbedUrl(title.title, title.trailerUrl)

  try {
    const url = new URL(embedUrl)
    url.searchParams.set('autoplay', '1')
    url.searchParams.set('controls', '1')
    url.searchParams.set('mute', muted ? '1' : '0')
    url.searchParams.set('playsinline', '1')
    url.searchParams.set('rel', '0')

    if (typeof window !== 'undefined') {
      url.searchParams.set('origin', window.location.origin)
    }

    return url.toString()
  } catch {
    return embedUrl
  }
}

export default PreviewModal
