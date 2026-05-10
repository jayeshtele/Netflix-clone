import { useSelector } from 'react-redux'
import Hero from '../components/Hero'
import TitleRow from '../components/TitleRow'
import { selectHomeSections, selectHeroTitle } from '../features/librarySlice'

function Home() {
  const heroTitle = useSelector(selectHeroTitle)
  const sections = useSelector(selectHomeSections)

  return (
    <>
      <Hero title={heroTitle} />

      <div className="-mt-24 space-y-2">
        {sections.map((section) => (
          <TitleRow
            key={section.id}
            title={section.title}
            variant={section.variant}
            titles={section.titles}
          />
        ))}
      </div>
    </>
  )
}

export default Home
