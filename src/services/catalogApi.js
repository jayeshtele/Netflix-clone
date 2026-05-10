import { FALLBACK_BACKDROP, FALLBACK_POSTER } from '../utils/fallbackImages'

const RAPIDAPI_HOST = import.meta.env.VITE_RAPIDAPI_HOST || 'streaming-availability.p.rapidapi.com'
const RAPIDAPI_BASE_URL = import.meta.env.VITE_RAPIDAPI_BASE_URL || `https://${RAPIDAPI_HOST}`
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY
const NETFLIX_COUNTRY = (import.meta.env.VITE_NETFLIX_COUNTRY || 'in').toLowerCase()
const NETFLIX_CATALOG = import.meta.env.VITE_NETFLIX_CATALOG || 'netflix'
const SERVER_CATALOG_ENDPOINT = '/.netlify/functions/catalog'
const CURRENT_YEAR = new Date().getFullYear()
const FALLBACK_TRAILER_VIDEO_ID = 'b9EkMc79ZSU'

const rapidApiRequests = [
  { id: 'topMovies', path: '/shows/top', query: { service: 'netflix', show_type: 'movie' } },
  { id: 'topSeries', path: '/shows/top', query: { service: 'netflix', show_type: 'series' } },
  {
    id: 'popularMovies',
    path: '/shows/search/filters',
    query: { catalogs: NETFLIX_CATALOG, show_type: 'movie', order_by: 'popularity_1week' },
  },
  {
    id: 'popularSeries',
    path: '/shows/search/filters',
    query: { catalogs: NETFLIX_CATALOG, show_type: 'series', order_by: 'popularity_1week' },
  },
  {
    id: 'newMovies',
    path: '/shows/search/filters',
    query: {
      catalogs: NETFLIX_CATALOG,
      show_type: 'movie',
      order_by: 'popularity_1week',
      year_min: String(CURRENT_YEAR - 2),
    },
  },
  {
    id: 'newSeries',
    path: '/shows/search/filters',
    query: {
      catalogs: NETFLIX_CATALOG,
      show_type: 'series',
      order_by: 'popularity_1week',
      year_min: String(CURRENT_YEAR - 2),
    },
  },
  {
    id: 'acclaimed',
    path: '/shows/search/filters',
    query: { catalogs: NETFLIX_CATALOG, order_by: 'rating', rating_min: '75' },
  },
  {
    id: 'newOnNetflix',
    path: '/changes',
    query: { catalogs: NETFLIX_CATALOG, change_type: 'new', item_type: 'show' },
  },
]

const curatedTrailerIds = {
  'breaking-bad': 'HhesaQXLuRY',
  dark: 'rrwycJ08PSA',
  'money-heist': 'htqXL94Rza4',
  'stranger-things': 'b9EkMc79ZSU',
  'the-crown': 'JWtnJjn6ng0',
  'the-dark-knight': 'EXeTwQWrcwY',
  'the-godfather': 'UaVTIH8mujA',
  'the-queens-gambit': 'CDrieqwSdgI',
}

export async function fetchLiveCatalog() {
  const shouldTryServer = !import.meta.env.DEV || import.meta.env.VITE_USE_NETLIFY_FUNCTIONS === 'true'

  if (shouldTryServer) {
    const serverPayload = await safeFetchServerCatalog()

    if (serverPayload) {
      return normalizeCatalogPayload(serverPayload)
    }
  }

  if (!RAPIDAPI_KEY) {
    return {
      titles: [],
      source: 'demo',
      provider: 'Local demo data',
      message: 'Add RAPIDAPI_KEY for Netlify or VITE_RAPIDAPI_KEY for local Vite to load Netflix catalog data.',
    }
  }

  try {
    return normalizeCatalogPayload(await fetchRapidApiGroups())
  } catch (error) {
    return {
      titles: [],
      source: 'demo',
      provider: RAPIDAPI_HOST,
      message: error instanceof Error ? error.message : 'RapidAPI Netflix catalog request failed.',
    }
  }
}

export function getTrailerEmbedUrl(titleName, trailerUrl) {
  const videoId = getYouTubeVideoId(trailerUrl) || curatedTrailerIds[toSlug(titleName)] || FALLBACK_TRAILER_VIDEO_ID

  return `https://www.youtube-nocookie.com/embed/${videoId}`
}

function normalizeCatalogPayload(payload) {
  const groups = payload?.groups || {}
  const titlesById = new Map()

  Object.entries(groups).forEach(([groupId, groupItems]) => {
    coerceItems(groupItems).forEach((item, index) => {
      const title = normalizeTitle(item, index, groupId, payload?.provider, payload?.country)

      if (!title) {
        return
      }

      const existingTitle = titlesById.get(title.id)

      if (existingTitle) {
        titlesById.set(title.id, mergeTitle(existingTitle, title))
        return
      }

      titlesById.set(title.id, title)
    })
  })

  const titles = Array.from(titlesById.values())
    .sort((first, second) => second.trendingScore - first.trendingScore)
    .map((title, index) => ({ ...title, rank: index + 1 }))
    .slice(0, 120)

  return {
    titles,
    source: titles.length > 0 ? payload?.source || 'rapidapi' : 'demo',
    provider: payload?.provider || RAPIDAPI_HOST,
    country: payload?.country || NETFLIX_COUNTRY,
    fetchedAt: payload?.fetchedAt || new Date().toISOString(),
    message: payload?.errors?.length ? 'Some Netflix catalog sections could not be loaded.' : '',
  }
}

async function safeFetchServerCatalog() {
  try {
    return await fetchJson(SERVER_CATALOG_ENDPOINT)
  } catch {
    return null
  }
}

async function fetchRapidApiGroups() {
  const groups = {}
  const errors = []

  await Promise.all(
    rapidApiRequests.map(async (request) => {
      try {
        groups[request.id] = await requestRapidApiEndpoint(request.path, request.query)
      } catch (error) {
        errors.push({
          section: request.id,
          message: error instanceof Error ? error.message : 'Request failed.',
        })
      }
    }),
  )

  if (Object.keys(groups).length === 0) {
    throw new Error('RapidAPI did not return any Netflix catalog sections.')
  }

  return {
    source: 'rapidapi',
    provider: RAPIDAPI_HOST,
    country: NETFLIX_COUNTRY,
    groups,
    errors,
    fetchedAt: new Date().toISOString(),
  }
}

async function requestRapidApiEndpoint(path, query = {}) {
  const data = await fetchJson(buildRapidApiUrl(path, query), {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  })

  return coerceItems(data)
}

function buildRapidApiUrl(path, query = {}) {
  const url = new URL(path, RAPIDAPI_BASE_URL)
  const params = {
    country: NETFLIX_COUNTRY,
    output_language: 'en',
    series_granularity: 'show',
    ...query,
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const contentType = response.headers.get('content-type') || ''

  if (!response.ok || !contentType.includes('application/json')) {
    throw new Error(`Request failed for ${url}`)
  }

  return response.json()
}

function normalizeTitle(rawTitle, index, groupId, provider, country) {
  const title = firstText(rawTitle.title, rawTitle.primaryTitle, rawTitle.name, rawTitle.originalTitle)

  if (!title) {
    return null
  }

  const rawType = firstText(rawTitle.showType, rawTitle.type, rawTitle.titleType, rawTitle.kind)
  const type = getTitleType(rawType)
  const year = toYear(rawTitle.releaseYear, rawTitle.firstAirYear, rawTitle.startYear, rawTitle.year)
  const genres = normalizeGenres(rawTitle.genres, rawTitle.genre, rawTitle.interests)
  const rating = toNumber(rawTitle.rating, rawTitle.averageRating, rawTitle.voteAverage, rawTitle.imdbRating)
  const runtime = toNumber(rawTitle.runtime, rawTitle.runtimeMinutes, rawTitle.durationMinutes)
  const match = clamp(Math.round((rating <= 10 ? rating * 10 : rating) || 84), 70, 99)
  const apiId = firstText(rawTitle.id, rawTitle.imdbId, rawTitle.imdbID, rawTitle.tconst, rawTitle.tmdbId, rawTitle.titleId)
  const id = apiId || `${toSlug(title)}-${year || index + 1}`
  const poster = getPoster(rawTitle)
  const backdrop = getBackdrop(rawTitle, poster)
  const netflixOption = getNetflixOption(rawTitle.streamingOptions, country)
  const trailerUrl = firstText(
    rawTitle.trailer,
    rawTitle.trailerUrl,
    rawTitle.videoUrl,
    rawTitle.youtubeTrailerVideoLink,
    rawTitle.youtubeTrailerData,
  )

  return {
    id,
    imdbId: firstText(rawTitle.imdbId, rawTitle.imdbID, rawTitle.tconst),
    tmdbId: firstText(rawTitle.tmdbId),
    title,
    type,
    year: year || CURRENT_YEAR,
    maturity: firstText(rawTitle.contentRating, rawTitle.certificate, rawTitle.rated) || '13+',
    seasons: type === 'Series' ? formatSeasons(toNumber(rawTitle.seasonCount, rawTitle.numberOfSeasons)) : null,
    duration: runtime ? formatRuntime(runtime) : type === 'Movie' ? '2h' : '45m',
    match,
    rank: index + 1,
    tagline: getTagline(rawTitle, genres, country),
    synopsis:
      firstText(rawTitle.overview, rawTitle.description, rawTitle.plot, rawTitle.plotText) ||
      `${title} is currently listed in the Netflix ${String(country || NETFLIX_COUNTRY).toUpperCase()} catalog.`,
    creator: getCreator(rawTitle, type),
    cast: normalizeStringArray(rawTitle.cast, rawTitle.stars, rawTitle.actors).slice(0, 5),
    genres,
    mood: getMood(genres, match),
    badge: getBadge(groupId, index, year),
    isNew: groupId === 'newMovies' || groupId === 'newSeries' || groupId === 'newOnNetflix' || (year && year >= CURRENT_YEAR - 2),
    isTopTen: groupId === 'topMovies' || groupId === 'topSeries' || index < 10,
    trendingScore: getTrendingScore(groupId, index, match, year),
    backdrop,
    poster,
    trailerUrl,
    trailerEmbedUrl: getTrailerEmbedUrl(title, trailerUrl),
    netflixLink: firstText(netflixOption?.link, netflixOption?.videoLink),
    availabilityCountry: String(country || NETFLIX_COUNTRY).toUpperCase(),
    apiProvider: provider || RAPIDAPI_HOST,
  }
}

function mergeTitle(existingTitle, incomingTitle) {
  return {
    ...existingTitle,
    isNew: existingTitle.isNew || incomingTitle.isNew,
    isTopTen: existingTitle.isTopTen || incomingTitle.isTopTen,
    trendingScore: Math.max(existingTitle.trendingScore, incomingTitle.trendingScore),
    match: Math.max(existingTitle.match, incomingTitle.match),
    badge: existingTitle.isTopTen ? existingTitle.badge : incomingTitle.badge,
    netflixLink: existingTitle.netflixLink || incomingTitle.netflixLink,
  }
}

function coerceItems(data) {
  if (Array.isArray(data)) {
    return data.map(unwrapTitle)
  }

  if (!data || typeof data !== 'object') {
    return []
  }

  if (Array.isArray(data.shows)) {
    return data.shows.map(unwrapTitle)
  }

  if (data.shows && typeof data.shows === 'object') {
    return Object.values(data.shows).map(unwrapTitle)
  }

  if (Array.isArray(data.changes)) {
    return data.changes.map(unwrapTitle)
  }

  if (Array.isArray(data.results)) {
    return data.results.map(unwrapTitle)
  }

  if (Array.isArray(data.titles)) {
    return data.titles.map(unwrapTitle)
  }

  if (Array.isArray(data.items)) {
    return data.items.map(unwrapTitle)
  }

  return []
}

function unwrapTitle(item) {
  if (!item || typeof item !== 'object') {
    return item
  }

  return item.show || item.item || item.title || item
}

function getTitleType(rawType) {
  const value = rawType.toLowerCase()

  if (value.includes('tv') || value.includes('series') || value.includes('show')) {
    return 'Series'
  }

  return 'Movie'
}

function getPoster(rawTitle) {
  return (
    pickImage(rawTitle.primaryImage) ||
    pickImage(rawTitle.image) ||
    pickImage(rawTitle.poster) ||
    pickImage(rawTitle.imageSet?.verticalPoster) ||
    pickImage(rawTitle.imageSet?.verticalBackdrop) ||
    FALLBACK_POSTER
  )
}

function getBackdrop(rawTitle, poster) {
  return (
    pickImage(rawTitle.backdrop) ||
    pickImage(rawTitle.imageSet?.horizontalBackdrop) ||
    pickImage(rawTitle.imageSet?.horizontalPoster) ||
    pickImage(rawTitle.banner) ||
    poster ||
    FALLBACK_BACKDROP
  )
}

function pickImage(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  return firstText(value.url, value.imageUrl, value.src, value.w1440, value.w1080, value.w720, value.w600, value.w480)
}

function getNetflixOption(streamingOptions, country) {
  if (!streamingOptions || typeof streamingOptions !== 'object') {
    return null
  }

  const countryOptions = streamingOptions[country] || streamingOptions[String(country || '').toLowerCase()]
  const optionGroups = countryOptions ? [countryOptions] : Object.values(streamingOptions)

  for (const optionGroup of optionGroups) {
    if (!Array.isArray(optionGroup)) {
      continue
    }

    for (const option of optionGroup) {
      if (firstText(option?.service?.id) === 'netflix') {
        return option
      }
    }
  }

  return null
}

function getCreator(rawTitle, type) {
  const people = normalizeStringArray(
    type === 'Series' ? rawTitle.creators : rawTitle.directors,
    rawTitle.director,
    rawTitle.creator,
  )

  return people[0] || 'Netflix'
}

function getTagline(rawTitle, genres, country) {
  const tagline = firstText(rawTitle.tagline, rawTitle.shortDescription)

  if (tagline) {
    return tagline
  }

  if (genres.length > 0) {
    return `${genres.slice(0, 2).join(' and ')} streaming on Netflix ${String(country || NETFLIX_COUNTRY).toUpperCase()}.`
  }

  return `Streaming on Netflix ${String(country || NETFLIX_COUNTRY).toUpperCase()}.`
}

function getBadge(groupId, index, year) {
  if ((groupId === 'topMovies' || groupId === 'topSeries') && index < 10) {
    return 'Top 10'
  }

  if (groupId === 'newOnNetflix' || groupId === 'newMovies' || groupId === 'newSeries') {
    return 'New on Netflix'
  }

  if (groupId === 'acclaimed') {
    return 'Critics Pick'
  }

  if (year && year >= CURRENT_YEAR - 2) {
    return 'New Release'
  }

  return 'Popular on Netflix'
}

function getTrendingScore(groupId, index, match, year) {
  const groupBoosts = {
    topMovies: 28,
    topSeries: 27,
    popularMovies: 24,
    popularSeries: 23,
    newMovies: 18,
    newSeries: 18,
    newOnNetflix: 19,
    acclaimed: 15,
  }
  const recencyBoost = year && year >= CURRENT_YEAR - 2 ? 8 : 0
  const groupBoost = groupBoosts[groupId] || 0

  return Math.max(1, match + groupBoost + recencyBoost - index)
}

function getMood(genres, match) {
  if (genres.includes('Comedy')) {
    return 'Witty'
  }

  if (genres.includes('Thriller') || genres.includes('Crime') || genres.includes('Horror')) {
    return 'Suspenseful'
  }

  if (genres.includes('Documentary')) {
    return 'Insightful'
  }

  if (genres.includes('Animation') || genres.includes('Anime')) {
    return 'Imaginative'
  }

  return match >= 90 ? 'Acclaimed' : 'Binge-Worthy'
}

function normalizeGenres(...values) {
  const genres = normalizeStringArray(...values).map((genre) => normalizeGenreName(genre)).filter(Boolean)
  const uniqueGenres = Array.from(new Set(genres))

  return uniqueGenres.length > 0 ? uniqueGenres.slice(0, 4) : ['Drama']
}

function normalizeGenreName(value) {
  const genre = firstText(value)
  const lowerGenre = genre.toLowerCase()

  if (lowerGenre === 'sci-fi' || lowerGenre === 'scifi' || lowerGenre === 'science fiction' || lowerGenre === 'science-fiction') {
    return 'Sci-Fi'
  }

  if (lowerGenre === 'animation') {
    return 'Anime'
  }

  if (!genre) {
    return ''
  }

  return genre
    .split(' ')
    .map((part) => (part ? `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}` : ''))
    .join(' ')
}

function normalizeStringArray(...values) {
  const items = []

  values.forEach((value) => {
    if (!value) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        const text = firstText(item)

        if (text) {
          items.push(text)
        }
      })
      return
    }

    if (typeof value === 'string') {
      value.split(',').forEach((item) => {
        const text = item.trim()

        if (text) {
          items.push(text)
        }
      })
    }
  })

  return Array.from(new Set(items))
}

function firstText(...values) {
  for (const value of values) {
    if (!value) {
      continue
    }

    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim()

      if (text) {
        return text
      }
    }

    if (typeof value === 'object') {
      const text = firstText(value.text, value.name, value.plainText, value.url, value.videoUrl, value.value)

      if (text) {
        return text
      }
    }
  }

  return ''
}

function toNumber(...values) {
  for (const value of values) {
    const number = Number(value)

    if (Number.isFinite(number) && number > 0) {
      return number
    }
  }

  return 0
}

function toYear(...values) {
  for (const value of values) {
    if (!value) {
      continue
    }

    const text = String(value).trim()
    const year = Number(text.slice(0, 4))

    if (Number.isFinite(year) && year > 1900) {
      return year
    }
  }

  return null
}

function formatRuntime(minutes) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes - hours * 60

  if (hours <= 0) {
    return `${minutes}m`
  }

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
}

function formatSeasons(seasonCount) {
  if (!seasonCount) {
    return '1 Season'
  }

  return seasonCount === 1 ? '1 Season' : `${seasonCount} Seasons`
}

function getYouTubeVideoId(url) {
  if (!url || !String(url).includes('youtu')) {
    return ''
  }

  try {
    const parsedUrl = new URL(url)
    const watchId = parsedUrl.searchParams.get('v')

    if (watchId) {
      return watchId
    }

    const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
    const embedIndex = pathParts.indexOf('embed')
    const shortsIndex = pathParts.indexOf('shorts')

    if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
      return pathParts[embedIndex + 1]
    }

    if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
      return pathParts[shortsIndex + 1]
    }

    return pathParts[0] || ''
  } catch {
    return ''
  }
}

function toSlug(value) {
  const text = String(value || '').toLowerCase()
  const parts = []
  let current = ''

  text.split('').forEach((character) => {
    const code = character.charCodeAt(0)
    const isNumber = code >= 48 && code <= 57
    const isLetter = code >= 97 && code <= 122

    if (isNumber || isLetter) {
      current += character
      return
    }

    if (current) {
      parts.push(current)
      current = ''
    }
  })

  if (current) {
    parts.push(current)
  }

  return parts.join('-')
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value))
}
