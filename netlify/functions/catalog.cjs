const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || 'imdb236.p.rapidapi.com'
const RAPIDAPI_BASE_URL = process.env.RAPIDAPI_BASE_URL || `https://${RAPIDAPI_HOST}`
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

const requests = [
  { id: 'popularMovies', path: '/api/imdb/most-popular-movies' },
  { id: 'popularSeries', path: '/api/imdb/most-popular-tv' },
  { id: 'topMovies', path: '/api/imdb/top250-movies' },
  { id: 'topSeries', path: '/api/imdb/top250-tv' },
  { id: 'indiaMovies', path: '/api/imdb/india/top-rated-indian-movies' },
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
        groups[request.id] = await fetchRapidApiPath(request.path)
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
      error: 'RapidAPI did not return catalog data.',
      errors,
    })
  }

  return jsonResponse(200, {
    source: 'rapidapi',
    provider: RAPIDAPI_HOST,
    groups,
    errors,
    fetchedAt: new Date().toISOString(),
  })
}

async function fetchRapidApiPath(path) {
  const response = await fetch(`${RAPIDAPI_BASE_URL}${path}`, {
    headers: {
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
    },
  })

  if (!response.ok) {
    throw new Error(`RapidAPI ${path} returned ${response.status}`)
  }

  const data = await response.json()

  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.results)) {
    return data.results
  }

  if (data && Array.isArray(data.items)) {
    return data.items
  }

  if (data && Array.isArray(data.titles)) {
    return data.titles
  }

  if (data && Array.isArray(data.shows)) {
    return data.shows
  }

  return []
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
