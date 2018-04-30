var userProfile;
window.addEventListener('load', function() {

  var webAuth = new auth0.WebAuth({
    domain: 'code-collab.auth0.com',
    clientID: 'UEaOJi3NuRsfeEUrXrVUIWub1MdrtV63',
    responseType: 'token id_token',
    audience: 'https://code-collab.auth0.com/userinfo',
    scope: 'openid profile',
    redirectUri: window.location.href

  });

  var loginBtn = document.getElementById('btn-login');

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    webAuth.authorize();
  });


    // ...
    var loginStatus = document.querySelector('.container h4');
    var loginView = document.getElementById('login-view');
    var homeView = document.getElementById('home-view');


    // buttons and event listeners
    var homeViewBtn = document.getElementById('btn-home-view');
    var loginBtn = document.getElementById('btn-login');
    var logoutBtn = document.getElementById('btn-logout');

    homeViewBtn.addEventListener('click', function() {
      homeView.style.display = 'inline-block';
      loginView.style.display = 'none';
    });

    logoutBtn.addEventListener('click', logout);

    function handleAuthentication() {
      webAuth.parseHash(function(err, authResult) {
        if (authResult && authResult.accessToken && authResult.idToken) {
          window.location.hash = '';
          setSession(authResult);
          loginBtn.style.display = 'none';
          homeView.style.display = 'inline-block';
        } else if (err) {
          homeView.style.display = 'inline-block';
          console.log(err);
          alert(
            'Error: ' + err.error + '. Check the console for further details.'
          );
        }
        displayButtons();
      });

    }

    function setSession(authResult) {
      // Set the time that the Access Token will expire at
      var expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );
      localStorage.setItem('access_token', authResult.accessToken);
      localStorage.setItem('id_token', authResult.idToken);
      localStorage.setItem('expires_at', expiresAt);

    }

    function logout() {
      // Remove tokens and expiry time from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('expires_at');
      displayButtons();
    }

    function isAuthenticated() {
      // Check whether the current time is past the
      // Access Token's expiry time
      var expiresAt = JSON.parse(localStorage.getItem('expires_at'));
      return new Date().getTime() < expiresAt;
    }

    function displayButtons() {
      if (isAuthenticated()) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        loginStatus.innerHTML = 'You are logged in!';
        document.getElementById('CodeDiv').style.visibility='visible';
        getProfile();
      } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        loginStatus.innerHTML =
          'You are not logged in! Please log in to continue.';
          document.getElementById('CodeDiv').style.visibility='hidden';
      }
    }

    function setProfile(profile) {
      userProfile = profile;
      CallFirbase(userProfile);


    }
    function getProfile() {
      if (!userProfile) {
        var accessToken = localStorage.getItem('access_token');

        if (!accessToken) {
          console.log('Access Token must exist to fetch profile');

        }

        webAuth.client.userInfo(accessToken, function(err, profile) {
          if (profile) {
            userProfile = profile;
            setProfile(userProfile);




          }
        });
      } else {

      }




    }

    handleAuthentication();


    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyA8cNideq63znns2pIhThFUQr5p1wv3vHA",
      authDomain: "codecollab-8304e.firebaseapp.com",
      databaseURL: "https://codecollab-8304e.firebaseio.com",
      projectId: "codecollab-8304e",
      storageBucket: "codecollab-8304e.appspot.com",
      messagingSenderId: "765863585188"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    var element = document.getElementById('div');
    element.addEventListener('input', UpdateFunc);

    function UpdateFunc(e) {
      console.log(userProfile);
      var profile = userProfile;
      if(localStorage.getItem('UserNickName')){
        firebase.database().ref(`users/${localStorage.getItem('UserNickName')}/Code`).set({
          ProjectCode: element.innerHTML,
          authName:  localStorage.getItem('UserNickName')

          });

          firebase.database().ref(`users/${localStorage.getItem('UserNickName')}/Collaborators`).once("value", snapshot => {

             //AddCollabUser(snapshot.val());
             console.log(snapshot.val());
          });
          firebase.database().ref(`users/${localStorage.getItem('UserNickName')}/Collaborators/${profile.nickname}`).set({
            authName:  localStorage.getItem('UserNickName')
          });
      }else{
        firebase.database().ref(`users/${profile.nickname}/Code`).set({
          ProjectCode: element.innerHTML,
          authName: profile.nickname

        });
        firebase.database().ref(`users/${profile.nickname}/Collaborators`).once("value", snapshot => {

          var collaboratorList = document.getElementById('collaboratorList');
           collaboratorList.innerHTML = collaboratorList.innerHTML + ' <div class="item">  <div class="left aligned content" style="font-size: 20px; text-overflow: ellipsis;">' + snapshot.val()[0] + '</div> ';
           console.log(snapshot.val());
        });

      }





    }
    function CallFirbase(profile){
      console.log(userProfile);
      firebase.database().ref(`users/${profile.nickname}`).once("value", snapshot => {
         const user = snapshot.val();
         if (user){
             console.log("user exists!");
             firebase.database().ref(`users/${profile.nickname}/Code`).once("value", snapshot => {
                const Code = snapshot.val();
                if (Code){
                    console.log("Code exists!");
                    console.log(localStorage.getItem('UserNickName'));
                    if(localStorage.getItem('UserNickName')){
                      firebase.database().ref(`users/${localStorage.getItem('UserNickName')}/Code/ProjectCode`).once("value", snapshot => {
                         const ProjectCode = snapshot.val();

                         element.innerHTML = ProjectCode;
                         document.getElementsByTagName("iframe")[0].setAttribute("srcdoc", element.textContent );


                       });


                    }else{
                      firebase.database().ref(`users/${profile.nickname}/Code/ProjectCode`).once("value", snapshot => {
                         const ProjectCode = snapshot.val();

                         element.innerHTML = ProjectCode;
                         document.getElementsByTagName("iframe")[0].setAttribute("srcdoc", element.textContent );

                       });

                    }


                }else{
                  console.log("Code does not exist!");
                  firebase.database().ref(`users/${profile.nickname}/Code`).set({
                    ProjectCode: 'Type Here To Begin!',

                  });
                  location.reload();



                }

             });
         }else{
           console.log("user does not exist!");

             firebase.database().ref('users/' + profile.nickname).set({
               userName: profile.nickname

             });
             location.reload();

         }
      });
  }


});
