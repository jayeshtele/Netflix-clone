import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import TitleCard from './TitleCard'

function TitleRow({ title, titles, variant = 'standard' }) {
  const railRef = useRef(null)

  const scrollRail = (direction) => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    const distance = direction === 'next' ? rail.clientWidth * 0.86 : rail.clientWidth * -0.86
    rail.scrollBy({ left: distance, behavior: 'smooth' })
  }

  if (titles.length === 0) {
    return null
  }

  return (
    <section className="relative mx-auto w-full max-w-[1500px] px-4 py-4 sm:px-6 lg:px-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-black text-white sm:text-2xl">{title}</h2>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            className="netflix-focus grid h-9 w-9 place-items-center rounded bg-zinc-900/85 text-white ring-1 ring-white/15 hover:bg-zinc-800"
            onClick={() => scrollRail('previous')}
            aria-label={`Scroll ${title} backward`}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="netflix-focus grid h-9 w-9 place-items-center rounded bg-zinc-900/85 text-white ring-1 ring-white/15 hover:bg-zinc-800"
            onClick={() => scrollRail('next')}
            aria-label={`Scroll ${title} forward`}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar flex gap-3 overflow-x-auto overscroll-x-contain pb-5"
      >
        {titles.map((item) => (
          <TitleCard key={item.id} title={item} variant={variant} />
        ))}
      </div>
    </section>
  )
}

export default TitleRow
