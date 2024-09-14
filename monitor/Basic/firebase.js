const firebaseConfig = {
  apiKey: "AIzaSyBDLV2QTBbNZg4FRfx3wq3stONnzTytSAo",
  authDomain: "python-hosting-server.firebaseapp.com",
  databaseURL: "https://python-hosting-server-default-rtdb.firebaseio.com",
  projectId: "python-hosting-server",
  storageBucket: "python-hosting-server.appspot.com",
  messagingSenderId: "816868950844",
  appId: "1:816868950844:web:681f2565fe4043da44d439",
  measurementId: "G-QVG5HN4YFE",
};

// Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();
// const rdb = firebase.database();

// function listenerNotifications(UID, callBack) {
//   var ref = rdb.ref("Notification/" + UID);
//   ref.on("child_added", function (snapshot) {
//     var childData = snapshot.val();
//     callBack(snapshot, childData);
//     ref.child(childData.mid).remove();
//   });
// }


async function apiCall(path, body) {
  let full_url = "";
  if(isLive){
    full_url = DB_URL_Live + "/" + path;
  } else {
    full_url = DB_URL_Local + "/" + path;
  }
  const url = full_url;
  const headers = {
    "Content-Type": "application/json",
  };
  if (body == undefined) {
    var response = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const responseBody = await response.text();
    try {
      // Attempt to parse the response body as JSON
      return JSON.parse(responseBody);
    } catch (error) {
      // Handle JSON parsing error or return the response body as is
      return responseBody;
    }
  } else {
    var response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const responseBody = await response.text();
    try {
      // Attempt to parse the response body as JSON
      return JSON.parse(responseBody);
    } catch (error) {
      // Handle JSON parsing error or return the response body as is
      return responseBody;
    }
  }
}

async function fetchAWS(path, body) {
  const url = DB_URL + "/" + path;
  const headers = {
    "X-Encrypted-Key":
      "gAkhJbEBXzR5CVj2rngd9S1kL+FFAGeAGvkmbIx1CUpvshOXceq80P58/qAKAajz",
    "Content-Type": "application/json",
  };
  if (body == undefined) {
    var response = await fetch(url, {
      method: "GET",
      headers: headers,
    });
    const responseBody = await response.text();
    try {
      // Attempt to parse the response body as JSON
      return JSON.parse(responseBody);
    } catch (error) {
      // Handle JSON parsing error or return the response body as is
      return responseBody;
    }
  } else {
    var response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    });
    const responseBody = await response.text();
    try {
      // Attempt to parse the response body as JSON
      return JSON.parse(responseBody);
    } catch (error) {
      // Handle JSON parsing error or return the response body as is
      return responseBody;
    }
  }
}

// Function to handle Google sign-in
function requestSignInGoogle(onsuccess) {
  var provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" }); // Add this line
  firebase
    .auth()
    .signInWithPopup(provider)
    .then(async function (result) {
      // User signed in with Google
      var user = result.user;
      var credential = result.credential;

      // Extract user information
      const UID = user.uid;
      const Name = user.displayName;
      const ImageUrl = user.photoURL;
      const Email = user.email;
      const OAuth = credential.accessToken;

      // Call the LoginStore function with the extracted user information
      await LoginStore({
        UID: UID,
        Name: Name,
        ImageUrl: ImageUrl,
        Email: Email,
        OAuth: OAuth,
      });

      console.log("Login Success");
      if (onsuccess) {
        onsuccess();
      }
    })
    .catch(function (error) {
      // Handle errors
      console.error("Error during sign-in:", error);
    });
}

// Function to handle sign out
function signOut(on_sign_out, on_error) {
  if (isLogedIn()) {
    firebase
      .auth()
      .signOut()
      .then(function () {
        // Sign-out successful
        if (on_sign_out) {
          on_sign_out();
        }
        Logout();
      })
      .catch(function (error) {
        // An error happened
        on_error(error);
      });
  }
}
