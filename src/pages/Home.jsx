import { useSelector } from 'react-redux'
import Hero from '../components/Hero'
import TitleRow from '../components/TitleRow'
import { selectAllTitles, selectCollections, selectHeroTitle } from '../features/librarySlice'

function Home() {
  const heroTitle = useSelector(selectHeroTitle)
  const collections = useSelector(selectCollections)
  const allTitles = useSelector(selectAllTitles)

  const titlesById = allTitles.reduce((nextMap, title) => {
    nextMap[title.id] = title
    return nextMap
  }, {})

  return (
    <>
      <Hero title={heroTitle} />

      <div className="-mt-24 space-y-2">
        {collections.map((collection) => (
          <TitleRow
            key={collection.id}
            title={collection.title}
            variant={collection.variant}
            titles={collection.ids.map((id) => titlesById[id]).filter(Boolean)}
          />
        ))}
      </div>
    </>
  )
}

export default Home
