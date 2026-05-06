import { ArrowLeft, Check, Play, Plus, Star } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import TitleCard from '../components/TitleCard'
import {
  openPreview,
  selectAllTitles,
  selectIsInMyList,
  selectTitleById,
  toggleMyList,
} from '../features/librarySlice'

function TitlePage() {
  const { titleId } = useParams()
  const dispatch = useDispatch()
  const title = useSelector((state) => selectTitleById(state, titleId))
  const isInMyList = useSelector((state) => (title ? selectIsInMyList(state, title.id) : false))
  const allTitles = useSelector(selectAllTitles)

  if (!title) {
    return <Navigate to="/" replace />
  }

  const similarTitles = allTitles
    .filter((item) => item.id !== title.id)
    .filter((item) => item.genres.some((genre) => title.genres.includes(genre)))
    .slice(0, 6)

  return (
    <article>
      <section className="relative min-h-[640px] overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${title.backdrop})` }}
          aria-hidden="true"
        />
        <div className="hero-fade absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto flex min-h-[640px] max-w-[1500px] flex-col justify-end px-4 pb-20 pt-28 sm:px-6 lg:px-10">
          <Link
            to="/"
            className="netflix-focus mb-8 inline-flex w-fit items-center gap-2 rounded-md bg-black/45 px-3 py-2 text-sm font-bold text-zinc-200 hover:bg-white/10"
          >
            <ArrowLeft size={18} />
            Back
          </Link>

          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-netflix">{title.badge}</p>
            <h1 className="mt-3 text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
              {title.title}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-100">{title.synopsis}</p>

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
              <span className="font-bold text-emerald-400">{title.match}% Match</span>
              <span>{title.year}</span>
              <span className="rounded border border-zinc-400 px-1.5 py-0.5 text-xs">{title.maturity}</span>
              <span>{title.seasons || title.duration}</span>
              <span>{title.type}</span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className="netflix-focus inline-flex h-11 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-black hover:bg-zinc-200 sm:text-base"
                onClick={() => dispatch(openPreview(title.id))}
              >
                <Play size={21} fill="currentColor" />
                Play
              </button>
              <button
                type="button"
                className="netflix-focus inline-flex h-11 items-center gap-2 rounded-md border border-white/35 bg-black/45 px-5 text-sm font-bold text-white hover:bg-white/10 sm:text-base"
                onClick={() => dispatch(toggleMyList(title.id))}
              >
                {isInMyList ? <Check size={20} /> : <Plus size={20} />}
                My List
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <div>
          <h2 className="text-2xl font-black text-white">Storyline</h2>
          <p className="mt-3 text-base leading-7 text-zinc-300">{title.tagline}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Match', value: `${title.match}%` },
              { label: 'Mood', value: title.mood },
              { label: 'Rank', value: `#${title.rank}` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-md border border-white/10 bg-zinc-950 p-4">
                <p className="text-xs font-bold uppercase text-zinc-500">{stat.label}</p>
                <p className="mt-2 flex items-center gap-2 text-xl font-black text-white">
                  {stat.label === 'Match' && <Star size={18} className="text-amber-300" fill="currentColor" />}
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <dl className="space-y-4 rounded-md border border-white/10 bg-zinc-950 p-5 text-sm">
          <div>
            <dt className="text-zinc-500">Cast</dt>
            <dd className="mt-1 text-zinc-200">{title.cast.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Creator</dt>
            <dd className="mt-1 text-zinc-200">{title.creator}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Genres</dt>
            <dd className="mt-1 text-zinc-200">{title.genres.join(', ')}</dd>
          </div>
        </dl>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-10">
        <h2 className="text-2xl font-black text-white">More Like This</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {similarTitles.map((item) => (
            <TitleCard key={item.id} title={item} compact />
          ))}
        </div>
      </section>
    </article>
  )
}

export default TitlePage
