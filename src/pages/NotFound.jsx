import EmptyState from '../components/EmptyState'

function NotFound() {
  return (
    <section className="pt-28">
      <EmptyState
        title="Lost in the catalog"
        message="That page is not available in this Netflix clone."
        actionLabel="Go Home"
        actionPath="/"
      />
    </section>
  )
}

export default NotFound
