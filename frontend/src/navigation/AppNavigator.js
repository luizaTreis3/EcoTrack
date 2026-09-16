import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../services/firebaseConfig";

export default function AppNavigator({ setUsuario }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario({
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
        });
      } else {
        setUsuario(null);
      }
    });

    return unsubscribe;
  }, [setUsuario]);

  return null;
}