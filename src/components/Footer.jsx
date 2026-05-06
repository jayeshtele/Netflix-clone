import { Facebook, Instagram, Youtube } from 'lucide-react'

const footerLinks = [
  'Audio Description',
  'Help Center',
  'Gift Cards',
  'Media Center',
  'Investor Relations',
  'Jobs',
  'Terms of Use',
  'Privacy',
  'Legal Notices',
  'Cookie Preferences',
  'Corporate Information',
  'Contact Us',
]

function Footer() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-[1100px] px-4 pb-12 pt-8 text-zinc-500 sm:px-6">
      <div className="flex gap-4 text-zinc-300">
        <Instagram size={21} />
        <Facebook size={21} />
        <Youtube size={21} />
      </div>

      <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {footerLinks.map((link) => (
          <button key={link} type="button" className="netflix-focus w-fit rounded text-left hover:text-zinc-200">
            {link}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="netflix-focus mt-7 rounded border border-zinc-600 px-3 py-2 text-sm hover:text-zinc-200"
      >
        Service Code
      </button>

      <p className="mt-5 text-xs">Netflix clone UI for portfolio learning. No authentication or streaming media is included.</p>
    </footer>
  )
}

export default Footer
