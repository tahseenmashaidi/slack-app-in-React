import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';


const config = {
    apiKey: "AIzaSyAbK3WjzZK3fTvRvdMvXQw0GMdPjVvgX9g",
    authDomain: "react-slack-8f5fa.firebaseapp.com",
    databaseURL: "https://react-slack-8f5fa.firebaseio.com",
    projectId: "react-slack-8f5fa",
    storageBucket: "react-slack-8f5fa.appspot.com",
    messagingSenderId: "408368750860",
    appId: "1:408368750860:web:d1ba7630511d78d1b72929",
    measurementId: "G-S6YV7CWY30"
};
firebase.initializeApp(config);

export default firebase;