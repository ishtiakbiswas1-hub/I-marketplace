
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const auth = window.firebaseAuth;

// Registration
window.registerUser = async function(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Login
window.loginUser = async function(email, password) {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    return {
      success: true,
      user: result.user
    };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Logout
window.logoutUser = async function() {
  try {
    await signOut(auth);
    return { success: true };

  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// Login Status
onAuthStateChanged(auth, function(user) {
  window.currentUser = user;

  window.dispatchEvent(
    new CustomEvent("authChanged", {
      detail: { user }
    })
  );
});
      
export { auth };
