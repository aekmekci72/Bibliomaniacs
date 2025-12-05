import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Index() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
    });

    return unsubscribe;
  }, []);

  if (user === undefined) {
    return null;
  }

  if (!user) {
    return <Redirect href="/landingpage" />;
  }
  return <Redirect href="/homepage" />;
}

// default template
// import { registerRootComponent } from 'expo';

// import App from '../App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately
// registerRootComponent(App);
