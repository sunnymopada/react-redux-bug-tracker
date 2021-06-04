import { createSlice } from '@reduxjs/toolkit'
import moment from 'moment'

import { createSelector } from 'reselect'

import { apiCallBegan } from './api'

let lastId = 0

const slice = createSlice({
  name: 'bugs',
  initialState: {
    list: [],
    loading: false,
    lastFetch: null,
  },
  reducers: {
    bugsRequested: (bugs, action) => {
      bugs.loading = true
    },
    bugsReceived: (bugs, action) => {
      bugs.list = action.payload
      bugs.loading = false
      bugs.lastFetch = Date.now()
    },
    bugsRequestFailed: (bugs, action) => {
      bugs.loading = false
    },
    bugAdded: (bugs, action) => {
      bugs.list.push({
        id: ++lastId,
        resolved: false,
        description: action.payload.description,
        userId: null,
      })
    },
    bugResolved: (bugs, action) => {
      const bugIndex = bugs.list.findIndex(
        (bug) => bug.id === action.payload.id
      )
      bugs.list[bugIndex].resolved = true
    },
    bugRemoved: (bugs, action) => {
      bugs.list.filter((bug) => bug.id !== action.pay)
    },
    bugAssignedToUser: (bugs, action) => {
      const { bugId, userId } = action.payload
      const bugIndex = bugs.list.findIndex((bug) => bug.id === bugId)
      bugs.list[bugIndex].userId = userId
    },
  },
})

export const {
  bugsRequested,
  bugsReceived,
  bugsRequestFailed,
  bugAdded,
  bugResolved,
  bugRemoved,
  bugAssignedToUser,
} = slice.actions

export default slice.reducer

// Action Creators
const url = '/bugs'

export const loadBugs = () => (dispatch, getState) => {
  const { lastFetch } = getState().entities.bugs
  const diffInMinutes = moment().diff(moment(lastFetch), 'minutes')
  if (diffInMinutes < 5) {
    return
  }
  dispatch(
    apiCallBegan({
      url,
      onStart: bugsRequested.type,
      onSuccess: bugsReceived.type,
      onError: bugsRequestFailed.type,
    })
  )
}

//Memoization
export const getUnresolvedBugs = createSelector(
  (state) => state.entities.bugs,
  (bugs) => bugs.list.filter((bug) => !bug.resolved)
)

export const getBugsAssignedToAUser = (userId) =>
  createSelector(
    (state) => state.entities.bugs,
    (bugs) => bugs.list.filter((bug) => bug.userId === userId)
  )
