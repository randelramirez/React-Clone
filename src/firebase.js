import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC18ajV0pv0gGHoZl1V69ltCOWCKmucmsA',
  authDomain: 'reactslack-c93e3.firebaseapp.com',
  databaseURL: 'https://reactslack-c93e3.firebaseio.com',
  projectId: 'reactslack-c93e3',
  storageBucket: 'reactslack-c93e3.appspot.com',
  messagingSenderId: '545566562592',
  appId: '1:545566562592:web:b8e7de312cecb12ea8df45',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;
