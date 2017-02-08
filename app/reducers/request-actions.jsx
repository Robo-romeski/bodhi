'use strict'

//import { RECEIVE_REQUESTS } from './constants'
import { database } from '../firebase.jsx'
import firebase from 'firebase'


// const requestReducer = (requests = [], action) => {
//   switch (action.type) {
//     case RECEIVE_USER_REQUESTS:
//      return action.requests

//     default: return requests
//   }
// }


// export const receiveRequests = (requests) => ({
//   type: RECEIVE_REQUESTS,
//   requests
// })


export const addRequest = (request) =>  {
  return dispatch => {
    const newRequestKey = database.ref().child('Requests').push().key;

    const time = firebase.database.ServerValue.TIMESTAMP

    request.date = time;

    // database.ref(`Users/${request.uid}/requests/${newRequestKey}`).set({ date: theDate })

    let updates = {};
    updates['/Requests/' + newRequestKey] = request

    return database.ref().update(updates);
  }
}

export const updateRequestStatus = (status, markerKey) => {
  return dispatch => {
    let statusUpdate = {}
    statusUpdate[`Requests/${markerKey}/status`] = status

    return database.ref().update(statusUpdate)
  }
}

//export default requestReducer

export const findRequestByKey = (reqKey) => {
  return dispatch => {
    return database
      .ref('Requests')
      .child(reqKey)
      .once('value', function(snapshot) {
        if (snapshot.val()) {
          console.log('snapshot in if ', snapshot.val())
          return snapshot.val().status
        } else {
          console.log("request not found")
        }
      })
      .then((request) => {
        const status = request.val().status
          console.log("STATUS!!! " , status)
        return status })
      .catch(err => console.log(err))
  }
}

