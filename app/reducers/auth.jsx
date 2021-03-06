import firebase from 'firebase'
import { database, storage } from '../firebase'

const LOGGED_IN = 'LOGGED_IN'
export const LOGGED_OUT = 'LOGGED_OUT'
const UPDATE_USER = 'GET_USER'
const UPDATE_NETWORK = 'UPDATE_NETWORK'

const reducer = (state = null, action) => {
  let newUser
  switch (action.type) {
    case LOGGED_IN: return action.user
    case UPDATE_USER: {
      newUser = Object.assign({}, state, action.updatedUser)
      return newUser
    }
    case LOGGED_OUT: return null
    default: return state
  }
}

export default reducer

export const loggedOut = () => ({
  type: LOGGED_OUT
})

export const loggedIn = (user) => {
  return dispatch => {
    const ref = database
    .ref('Users').child(user.uid)

    const listener = ref
    .on('value', function(snapshot) {

      if (!snapshot.val()){
        const date = new Date
        const theDate = date.toString()

        database.ref(`Users/${user.uid}`).set({
          email: user.email,
          name: user.displayName || '',
          picture: `http://api.adorable.io/avatar/${user.uid}`,
          dateJoined: theDate,
          badges: '', // badges === karma
          skills: '',
          phone: '',
          bio: '',
          network: {},
          privacy: ''
        })
        const newUser = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          picture: `http://api.adorable.io/avatar/${user.uid}`,
          dateJoined: theDate,
          badges: '',
          skills: '',
          phone: '',
          bio: '',
          network: user.network || {},
          privacy: ''
        }
        dispatch({
          type: LOGGED_IN,
          user: newUser
        })
      } else {
          const newUser = {
            ...snapshot.val(),
            uid: user.uid,
            email: user.email
          }
        dispatch({
          type: LOGGED_IN,
          user: newUser
        })
      }
    })
    return () => ref.off('value', listener)
  }
}

export const updateUser = updatedUser => dispatch => {
  const updates = {
    badges: updatedUser.badges,
    skills: updatedUser.skills,
    bio: updatedUser.bio,
    dateJoined: updatedUser.dateJoined,
    email: updatedUser.email,
    privacy: updatedUser.privacy,
    name: updatedUser.name,
    phone: updatedUser.phone,
    picture: updatedUser.picture,
    privacy: updatedUser.privacy
  }

  database.ref('Users')
  .child(updatedUser.uid)
  .update(updates)
  .then(()=> {
    dispatch({ type: UPDATE_USER, updatedUser })
  })
}

export const uploadUserPhoto = (user, picture) => dispatch => {

  let storageRef = storage.ref(`${user.uid}/${picture.name}`)

  storageRef.put(picture)
  .then(() => {
    storageRef.getDownloadURL()
    .then(userPictureURL => {
      user.picture = userPictureURL
      dispatch(updateUser(user))
    })
  })
}

export const addToNetwork = (friendEmail, currentUser) => {
  return dispatch =>
     database
      .ref('Users')
      .orderByChild('email')
      .equalTo(friendEmail)
      .limitToFirst(1)
      .once('value', function(snapshot) {
        if (!snapshot.val()) {
          console.error('user email not found')
        } else {
          let friendUserId = Object.keys(snapshot.val())[0]
          database
          .ref(`Users/${currentUser.uid}/network`)
          .push({
              uid: friendUserId,
              name: snapshot.val()[friendUserId].name,
              picture: snapshot.val()[friendUserId].picture
          })
        }
      })
      .catch(err => console.error(err))
}

export const sendNetworkRequest = (friendEmail, currentUser, msg, network) => {
  return dispatch =>
    database
      .ref('Users')
      .orderByChild('email')
      .equalTo(friendEmail)
      .limitToFirst(1)
      .once('child_added', function(friend) {
        if (!friend.val()) {
          console.error('friend email not found')
        } else {
          let friendUserId = friend.key
          let date = firebase.database.ServerValue.TIMESTAMP
          database
          .ref(`Users/${friendUserId}/message`)
          .push({
            date,
            senderId: currentUser.uid,
            senderPic: currentUser.picture,
            senderEmail: currentUser.email,
            senderName: currentUser.name ? currentUser.name : '',
            msg: msg? msg : '',
            network: network ? network : ''
          })
        }
      })
      .catch(err => console.error(err))
}

export const removeMsg = (msgKey, userId) => {
  return dispatch => {
  const msgToDelete = database.ref(`Users/${userId}/message/${msgKey}`)
  msgToDelete.remove()
  .catch((err) => console.error(err))
}
}
