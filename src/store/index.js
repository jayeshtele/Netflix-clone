import { configureStore } from '@reduxjs/toolkit'
import libraryReducer from '../features/librarySlice'

export const store = configureStore({
  reducer: {
    library: libraryReducer,
  },
})
