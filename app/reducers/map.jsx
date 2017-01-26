import firebase from '../firebase.jsx';

let initialState = {
  markers: [],
  selectedMarker: {}
}

const reducer = (state=initialState, action) => {
  switch(action.type) {
  case GET_ALL_MARKERS:
    return {markers: action.markers, selectedMarker: state.selectedMarker} 
  }
  return state
}

const GET_ALL_MARKERS = 'GET_ALL_MARKERS'
export const getAllMarkers = (markers) => ({
  type: GET_ALL_MARKERS,
  markers
})

const GET_SELECTED_MARKER = 'GET_SELECTED_MARKER'
export const getSelectedMarker = (marker) => ({
  type: GET_SELECTED_MARKER,
  selectedMarker: marker
})

//getAllMarkers, getSelectedMarker, addMarker, removeMarker
export const getMarkers = () => 
  dispatch => 
    firebase.database().ref('Requests')
    .on('value', snapshot => { 
      let requestObjects = snapshot.val()
      let markers = [];

      Object.keys(requestObjects).forEach(key => {
        markers.push({location: requestObjects[key].location, tag: requestObjects[key].tag, title: requestObjects[key].title})
      })

      dispatch(getAllMarkers(markers))
  })

export default reducer
