import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

function EmptyState({ title, message, actionLabel = 'Browse Home', actionPath = '/' }) {
  return (
    <div className="mx-auto grid min-h-[360px] max-w-2xl place-items-center px-4 py-20 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-zinc-900 text-zinc-300 ring-1 ring-white/10">
          <SearchX size={26} />
        </div>
        <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">{message}</p>
        <Link
          to={actionPath}
          className="netflix-focus mt-6 inline-flex h-10 items-center rounded-md bg-white px-4 text-sm font-bold text-black hover:bg-zinc-200"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  )
}

export default EmptyState
