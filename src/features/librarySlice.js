import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { collections, genres, heroTitleId, titles } from '../data/titles'
import { fetchLiveCatalog } from '../services/catalogApi'

const currentYear = new Date().getFullYear()

export const loadLiveCatalog = createAsyncThunk('library/loadLiveCatalog', async () => fetchLiveCatalog())

const initialState = {
  titles,
  collections,
  genres,
  heroTitleId,
  activeGenre: 'All',
  sortMode: 'recommended',
  searchQuery: '',
  muted: true,
  mobileNavOpen: false,
  profilePanelOpen: false,
  previewTitleId: null,
  myList: ['midnight-protocol', 'glass-atlas', 'chef-after-hours'],
  catalogStatus: 'idle',
  catalogSource: 'demo',
  catalogProvider: 'Local demo data',
  catalogError: null,
  catalogFetchedAt: null,
}

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setActiveGenre(state, action) {
      state.activeGenre = action.payload
    },
    setSortMode(state, action) {
      state.sortMode = action.payload
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload
    },
    toggleMuted(state) {
      state.muted = !state.muted
    },
    toggleMobileNav(state) {
      state.mobileNavOpen = !state.mobileNavOpen
    },
    closeMobileNav(state) {
      state.mobileNavOpen = false
    },
    toggleProfilePanel(state) {
      state.profilePanelOpen = !state.profilePanelOpen
    },
    closeProfilePanel(state) {
      state.profilePanelOpen = false
    },
    openPreview(state, action) {
      state.previewTitleId = action.payload
    },
    closePreview(state) {
      state.previewTitleId = null
    },
    toggleMyList(state, action) {
      const titleId = action.payload

      if (state.myList.includes(titleId)) {
        state.myList = state.myList.filter((id) => id !== titleId)
        return
      }

      state.myList.push(titleId)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLiveCatalog.pending, (state) => {
        state.catalogStatus = 'loading'
        state.catalogError = null
      })
      .addCase(loadLiveCatalog.fulfilled, (state, action) => {
        const loadedTitles = action.payload.titles || []

        state.catalogStatus = loadedTitles.length > 0 ? 'ready' : 'fallback'
        state.catalogSource = action.payload.source || 'demo'
        state.catalogProvider = action.payload.provider || state.catalogProvider
        state.catalogFetchedAt = action.payload.fetchedAt || null
        state.catalogError = action.payload.message || null

        if (loadedTitles.length === 0) {
          return
        }

        state.titles = loadedTitles
        state.genres = deriveGenres(loadedTitles)
        state.heroTitleId = loadedTitles[0].id

        const availableIds = new Set(loadedTitles.map((title) => title.id))
        state.myList = state.myList.filter((titleId) => availableIds.has(titleId))

        if (state.myList.length === 0) {
          state.myList = loadedTitles.slice(0, 3).map((title) => title.id)
        }
      })
      .addCase(loadLiveCatalog.rejected, (state, action) => {
        state.catalogStatus = 'fallback'
        state.catalogSource = 'demo'
        state.catalogError = action.error.message || 'RapidAPI catalog request failed.'
      })
  },
})

export const {
  closeMobileNav,
  closePreview,
  closeProfilePanel,
  openPreview,
  setActiveGenre,
  setSearchQuery,
  setSortMode,
  toggleMobileNav,
  toggleMuted,
  toggleMyList,
  toggleProfilePanel,
} = librarySlice.actions

export const selectAllTitles = (state) => state.library.titles

export const selectCollections = (state) => state.library.collections

export const selectGenres = (state) => state.library.genres

export const selectCatalogMeta = (state) => ({
  status: state.library.catalogStatus,
  source: state.library.catalogSource,
  provider: state.library.catalogProvider,
  error: state.library.catalogError,
  fetchedAt: state.library.catalogFetchedAt,
})

export const selectHeroTitle = (state) =>
  state.library.titles.find((title) => title.id === state.library.heroTitleId)

export const selectPreviewTitle = (state) =>
  state.library.titles.find((title) => title.id === state.library.previewTitleId)

export const selectTitleById = (state, titleId) =>
  state.library.titles.find((title) => title.id === titleId)

export const selectIsInMyList = (state, titleId) => state.library.myList.includes(titleId)

export const selectMyListTitles = (state) =>
  state.library.titles.filter((title) => state.library.myList.includes(title.id))

export const selectHomeSections = (state) => buildHomeSections(state.library.titles)

export const selectPageSections = (state, mode) => buildPageSections(state.library.titles, mode)

export const selectMyListSections = (state) => {
  const savedTitles = selectMyListTitles(state)
  const savedIds = new Set(savedTitles.map((title) => title.id))
  const savedGenres = new Set(savedTitles.flatMap((title) => title.genres || []))
  const relatedTitles = state.library.titles
    .filter((title) => !savedIds.has(title.id))
    .filter((title) => (title.genres || []).some((genre) => savedGenres.has(genre)))
    .sort(sortByTrending)

  return compactSections([
    createSection('my-list-saved', 'My List', savedTitles, 'standard', 24),
    createSection('my-list-because', 'Because you added these', relatedTitles, 'standard', 18),
    createSection(
      'my-list-trending',
      'Trending now',
      state.library.titles.filter((title) => !savedIds.has(title.id)).sort(sortByTrending),
      'ranked',
      10,
    ),
  ])
}

export const selectSearchResults = (state) => {
  const query = state.library.searchQuery.trim().toLowerCase()

  if (!query) {
    return []
  }

  return state.library.titles.filter((title) => titleMatchesQuery(title, query))
}

export const selectFilteredTitles = (state, mode) => {
  const activeGenre = state.library.activeGenre
  const sortMode = state.library.sortMode
  let nextTitles = state.library.titles

  if (mode === 'movies') {
    nextTitles = nextTitles.filter((title) => title.type === 'Movie')
  }

  if (mode === 'series') {
    nextTitles = nextTitles.filter((title) => title.type === 'Series')
  }

  if (mode === 'new') {
    nextTitles = nextTitles.filter((title) => title.isNew || title.isTopTen)
  }

  if (activeGenre !== 'All') {
    nextTitles = nextTitles.filter((title) => title.genres.includes(activeGenre))
  }

  if (sortMode === 'match') {
    return [...nextTitles].sort((first, second) => second.match - first.match)
  }

  if (sortMode === 'newest') {
    return [...nextTitles].sort((first, second) => second.year - first.year)
  }

  return [...nextTitles].sort((first, second) => second.trendingScore - first.trendingScore)
}

function titleMatchesQuery(title, query) {
  const searchText = [
    title.title,
    title.type,
    title.year,
    title.synopsis,
    title.tagline,
    title.creator,
    title.mood,
    title.badge,
    ...(title.cast || []),
    ...(title.genres || []),
  ]
    .join(' ')
    .toLowerCase()

  return searchText.includes(query)
}

function buildHomeSections(allTitles) {
  const trendingTitles = [...allTitles].sort(sortByTrending)
  const newestTitles = [...allTitles].sort(sortByNewest)
  const actionTitles = titlesByGenres(allTitles, ['Action', 'Adventure', 'Thriller'])
  const sciFiTitles = titlesByGenres(allTitles, ['Sci-Fi', 'Fantasy'])

  return compactSections([
    createSection('continue-watching', 'Continue Watching for Jayesh', trendingTitles.slice(0, 8), 'progress', 8),
    createSection('top-ten', 'Top 10 in India Today', trendingTitles.slice(0, 10), 'ranked', 10),
    createSection('new-releases', 'New Releases', newestTitles.filter((title) => title.isNew), 'standard', 18),
    createSection('popular', 'Popular on Netflix', trendingTitles, 'standard', 18),
    createSection('action-thrillers', 'Action Thrillers', actionTitles, 'standard', 18),
    createSection('critically-acclaimed', 'Critically Acclaimed', [...allTitles].sort(sortByMatch), 'standard', 18),
    createSection('sci-fi-fantasy', 'Sci-Fi and Fantasy', sciFiTitles, 'standard', 18),
    createSection('comedies', 'Comedies', titlesByGenres(allTitles, ['Comedy']), 'standard', 18),
  ])
}

function buildPageSections(allTitles, mode) {
  if (mode === 'series') {
    const series = allTitles.filter((title) => title.type === 'Series')

    return compactSections([
      createSection('series-popular', 'Popular TV Shows', [...series].sort(sortByTrending), 'standard', 18),
      createSection('series-top-ten', 'Top 10 TV Shows Today', [...series].sort(sortByTrending), 'ranked', 10),
      createSection('series-new', 'New Episodes and Seasons', [...series].sort(sortByNewest), 'standard', 18),
      createSection('series-drama', 'Binge-Worthy Dramas', titlesByGenres(series, ['Drama', 'Crime']), 'standard', 18),
      createSection('series-comedy', 'TV Comedies', titlesByGenres(series, ['Comedy']), 'standard', 18),
      createSection('series-anime', 'Anime and Animation', titlesByGenres(series, ['Anime', 'Animation']), 'standard', 18),
    ])
  }

  if (mode === 'movies') {
    const movies = allTitles.filter((title) => title.type === 'Movie')

    return compactSections([
      createSection('movies-popular', 'Popular Movies', [...movies].sort(sortByTrending), 'standard', 18),
      createSection('movies-top-ten', 'Top 10 Movies Today', [...movies].sort(sortByTrending), 'ranked', 10),
      createSection('movies-new', 'New Movies', [...movies].sort(sortByNewest), 'standard', 18),
      createSection('movies-action', 'Action and Adventure', titlesByGenres(movies, ['Action', 'Adventure']), 'standard', 18),
      createSection('movies-drama', 'Dramas', titlesByGenres(movies, ['Drama']), 'standard', 18),
      createSection('movies-docs', 'Documentaries', titlesByGenres(movies, ['Documentary']), 'standard', 18),
    ])
  }

  const newAndPopular = allTitles.filter((title) => title.isNew || title.isTopTen || title.year >= currentYear - 2)

  return compactSections([
    createSection('new-popular-new', 'New on Netflix', [...newAndPopular].sort(sortByNewest), 'standard', 18),
    createSection('new-popular-top-ten', 'Top 10 in India Today', [...allTitles].sort(sortByTrending), 'ranked', 10),
    createSection('new-popular-week', 'Popular This Week', [...allTitles].sort(sortByTrending), 'standard', 18),
    createSection(
      'new-popular-movies',
      'New Movies',
      newAndPopular.filter((title) => title.type === 'Movie').sort(sortByNewest),
      'standard',
      18,
    ),
    createSection(
      'new-popular-series',
      'New TV Shows',
      newAndPopular.filter((title) => title.type === 'Series').sort(sortByNewest),
      'standard',
      18,
    ),
  ])
}

function createSection(id, title, sectionTitles, variant = 'standard', limit = 18) {
  const visibleTitles = dedupeTitles(sectionTitles).slice(0, limit)

  if (visibleTitles.length === 0) {
    return null
  }

  return {
    id,
    title,
    variant,
    titles: visibleTitles,
  }
}

function compactSections(sections) {
  return sections.filter(Boolean)
}

function titlesByGenres(allTitles, genreNames) {
  return allTitles
    .filter((title) => (title.genres || []).some((genre) => genreNames.includes(genre)))
    .sort(sortByTrending)
}

function dedupeTitles(sectionTitles) {
  const seenIds = new Set()
  const uniqueTitles = []

  sectionTitles.forEach((title) => {
    if (!title || seenIds.has(title.id)) {
      return
    }

    seenIds.add(title.id)
    uniqueTitles.push(title)
  })

  return uniqueTitles
}

function sortByTrending(first, second) {
  return second.trendingScore - first.trendingScore
}

function sortByNewest(first, second) {
  return second.year - first.year || second.trendingScore - first.trendingScore
}

function sortByMatch(first, second) {
  return second.match - first.match || second.trendingScore - first.trendingScore
}

function deriveGenres(loadedTitles) {
  const preferredGenres = [
    'Action',
    'Adventure',
    'Drama',
    'Comedy',
    'Thriller',
    'Crime',
    'Sci-Fi',
    'Fantasy',
    'Documentary',
    'Anime',
  ]
  const foundGenres = new Set()

  loadedTitles.forEach((title) => {
    const titleGenres = title.genres || []
    titleGenres.forEach((genre) => foundGenres.add(genre))
  })

  const orderedGenres = preferredGenres.filter((genre) => foundGenres.has(genre))
  const remainingGenres = Array.from(foundGenres)
    .filter((genre) => !preferredGenres.includes(genre))
    .sort()

  return ['All', ...orderedGenres, ...remainingGenres].slice(0, 13)
}

export default librarySlice.reducer
