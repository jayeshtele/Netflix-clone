import { useSelector } from 'react-redux'
import EmptyState from '../components/EmptyState'
import GenreControls from '../components/GenreControls'
import TitleCard from '../components/TitleCard'
import TitleRow from '../components/TitleRow'
import { selectFilteredTitles, selectPageSections } from '../features/librarySlice'

const pageCopy = {
  movies: {
    eyebrow: 'Movies',
    title: 'Feature films for every mood',
    body: 'Explore action thrillers, intimate dramas, smart sci-fi and weekend crowd-pleasers.',
  },
  series: {
    eyebrow: 'TV Shows',
    title: 'Series worth settling into',
    body: 'Find bingeable seasons, new episodes and character-driven stories across genres.',
  },
  new: {
    eyebrow: 'New & Popular',
    title: 'Fresh releases and rising hits',
    body: 'Catch what just landed, what is climbing, and what everyone is talking about.',
  },
}

function BrowsePage({ mode }) {
  const titles = useSelector((state) => selectFilteredTitles(state, mode))
  const sections = useSelector((state) => selectPageSections(state, mode))
  const copy = pageCopy[mode]

  return (
    <section className="pt-28">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <p className="text-sm font-black uppercase text-netflix">{copy.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black text-white sm:text-5xl">{copy.title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">{copy.body}</p>
      </div>

      <div className="mt-8">
        <GenreControls />
      </div>

      <div className="mt-7 space-y-2">
        {sections.map((section) => (
          <TitleRow
            key={section.id}
            title={section.title}
            variant={section.variant}
            titles={section.titles}
          />
        ))}
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="No titles found"
          message="Try another genre or sort option to bring more titles back into view."
        />
      ) : (
        <section className="mx-auto mt-8 max-w-[1500px] px-4 sm:px-6 lg:px-10">
          <h2 className="text-xl font-black text-white sm:text-2xl">All {copy.eyebrow}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {titles.map((title) => (
              <TitleCard key={title.id} title={title} compact />
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

export default BrowsePage
