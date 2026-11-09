import firebase from 'firebase/app';

const STORAGE_USER_KEY = process.env.STORAGE_USER_KEY;

function getCredentialsFirebase(name) {
	return JSON.parse(window.localStorage.getItem(`${STORAGE_USER_KEY}::${name}`));
}

const config = {
	apiKey: getCredentialsFirebase('firebase-key'),
	appId: getCredentialsFirebase('firebase-key-id'),
	authDomain: getCredentialsFirebase('firebase-auth-domain'),
	databaseURL: getCredentialsFirebase('data-base-url'),
	projectId: getCredentialsFirebase('project-id'),
};

firebase.initializeApp(config);

export default firebase;

export const db = firebase.database();
