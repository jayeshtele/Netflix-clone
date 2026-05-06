import { createSlice } from '@reduxjs/toolkit'
import { collections, genres, heroTitleId, titles } from '../data/titles'

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

export const selectHeroTitle = (state) =>
  state.library.titles.find((title) => title.id === state.library.heroTitleId)

export const selectPreviewTitle = (state) =>
  state.library.titles.find((title) => title.id === state.library.previewTitleId)

export const selectTitleById = (state, titleId) =>
  state.library.titles.find((title) => title.id === titleId)

export const selectIsInMyList = (state, titleId) => state.library.myList.includes(titleId)

export const selectMyListTitles = (state) =>
  state.library.titles.filter((title) => state.library.myList.includes(title.id))

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
    ...title.cast,
    ...title.genres,
  ]
    .join(' ')
    .toLowerCase()

  return searchText.includes(query)
}

export default librarySlice.reducer
