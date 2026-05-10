const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'streaming-availability.p.rapidapi.com'
const RAPIDAPI_BASE_URL = process.env.RAPIDAPI_BASE_URL || `https://${RAPIDAPI_HOST}`
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const NETFLIX_COUNTRY = (process.env.NETFLIX_COUNTRY || 'in').toLowerCase()
const NETFLIX_CATALOG = process.env.NETFLIX_CATALOG || 'netflix'
const CURRENT_YEAR = new Date().getFullYear()

const requests = [
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

exports.handler = async () => {
  if (!RAPIDAPI_KEY) {
    return jsonResponse(500, {
      error: 'Missing RAPIDAPI_KEY environment variable.',
    })
  }

  const groups = {}
  const errors = []

  await Promise.all(
    requests.map(async (request) => {
      try {
        groups[request.id] = await fetchRapidApiPath(request.path, request.query)
      } catch (error) {
        errors.push({
          section: request.id,
          message: error instanceof Error ? error.message : 'Request failed.',
        })
      }
    }),
  )

  if (Object.keys(groups).length === 0) {
    return jsonResponse(502, {
      error: 'RapidAPI did not return Netflix catalog data.',
      errors,
    })
  }

  return jsonResponse(200, {
    source: 'rapidapi',
    provider: RAPIDAPI_HOST,
    country: NETFLIX_COUNTRY,
    groups,
    errors,
    fetchedAt: new Date().toISOString(),
  })
}

async function fetchRapidApiPath(path, query) {
  const response = await fetch(buildRapidApiUrl(path, query), {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`RapidAPI ${path} returned ${response.status}`)
  }

  return response.json()
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

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'access-control-allow-origin': '*',
      'cache-control': 'public, max-age=900',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  }
}
