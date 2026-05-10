import { useSelector } from 'react-redux'
import EmptyState from '../components/EmptyState'
import TitleCard from '../components/TitleCard'
import TitleRow from '../components/TitleRow'
import { selectMyListSections, selectMyListTitles } from '../features/librarySlice'

function MyList() {
  const titles = useSelector(selectMyListTitles)
  const sections = useSelector(selectMyListSections)

  return (
    <section className="pt-28">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <p className="text-sm font-black uppercase text-netflix">My List</p>
        <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">Your saved titles</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
          Add and remove titles from any card or detail page. The list is managed through Redux Toolkit state.
        </p>
      </div>

      {titles.length === 0 ? (
        <EmptyState
          title="Your list is empty"
          message="Add a movie or series with the plus button and it will appear here."
          actionLabel="Find titles"
          actionPath="/new"
        />
      ) : (
        <>
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

          <section className="mx-auto mt-8 max-w-[1500px] px-4 sm:px-6 lg:px-10">
            <h2 className="text-xl font-black text-white sm:text-2xl">All Saved Titles</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {titles.map((title) => (
                <TitleCard key={title.id} title={title} compact />
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}

export default MyList
