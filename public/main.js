 // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDp5mFwoKMzLXwIIAVJ1p7COXGoUYb7Hcg",
    authDomain: "race-71a81.firebaseapp.com",
    databaseURL: "https://race-71a81.firebaseio.com",
    storageBucket: "race-71a81.appspot.com",
  };

  var clientUser = {};
  var gameData;
  var $plusOneBtn = $('#plusOne');
  var $playerBoard = $('#playerBoard');
  var $loginBtn = $('#logInBtn');

  firebase.initializeApp(config);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log("el usuario esta logeado");
      userConstructor(user);
    } else {
      // No user is signed in.
      $plusOneBtn.hide();
      console.log('no hay usuario logeado');
    }
  });

  function userConstructor(user) {
    clientUser.name = user.displayName;
    clientUser.photo = user.photoURL;
    clientUser.uid = user.uid;
    $loginBtn.hide();

    getUserInfo();
  }

  function getUserInfo(){
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
      clientUser.number = snapshot.val().game.number;
    }).then( createUI ).then( setupGame );
  }

  function createUI(){
    $('#userName').html(clientUser.name);
    $('#userPhoto').attr('src', clientUser.photo);
    $plusOneBtn.html(clientUser.number);
  }

  function setupGame(){
    firebase.database().ref('game/').once('value').then(function(snapshot){
      gameData = snapshot.val();
      if( clientUser.uid == "0jqXnbl2Emgpq72hUwWNaZPbGB93"){
        $('#startGameBtn').show();
      }
    })
  }

  function boardConstructor(snapshot){
      var users = snapshot.val();
      $playerBoard.empty();
      $.each(users, function(key, value){
        if(value.game.number==100){
          var template = '<div class="player winner"> <img src="'+value.photo+'" alt="'+value.username+'"> <h3>'+value.username+'</h3> <h4>Winner!!</h4><p class="score">'+value.game.number+'</p> </div>';
        }else{
          var template = '<div class="player"><span class="progressBar" style="width:'+value.game.number+'%"></span> <img src="'+value.photo+'" alt="'+value.username+'"> <h3>'+value.username+'</h3> <p class="score">'+value.game.number+'</p> </div>';
        }
        $playerBoard.append( template );
      })
  }
  // Get the public_profile info
  var provider = new firebase.auth.FacebookAuthProvider();
  provider.addScope('public_profile');

  //Listeners
  $('#logInBtn').click(login);
  $('#plusOne').click(masUno);

//  RealtimeDatabaseListener
  function logedDBListener() {
    firebase.database().ref('users/' + clientUser.uid + '/game/number').on('value', function(snapshot) {
      updatePlusOneCount(snapshot);
    });
  }

  function boardDBListener() {
    firebase.database().ref('users/').orderByChild('game/number').on('value', function(snapshot) {
      boardConstructor(snapshot);
    });
  }

  function gameListener(){
    firebase.database().ref('game/').on('value', function(snapshot) {
       var value= snapshot.val().gameStarted
       if( value == true ){
         $("#plusOne").addClass("active");
         $('body').addClass("started");
       }else{
          $("#plusOne").removeClass("active");
          $('body').removeClass("started");
       }
    });
  }

  logedDBListener();
  boardDBListener();
  gameListener();

  function updatePlusOneCount(snapshot) {
    $plusOneBtn.html( snapshot.val() );
  }

  function startGame(){
    firebase.database().ref('game/').update({
        "gameStarted": true
    });
  }

  function endGame(){
    firebase.database().ref('game/').update({
        gameStarted: false
    });
  }

  function masUno(){
    clientUser.number++;
    var newNumber = clientUser.number;
    if( clientUser.number == 100 ){
      endGame();
      clientUser.number == 100;
     }
    firebase.database().ref('users/' + clientUser.uid + '/game').update({
      number: clientUser.number
    });
  }

  // Login
  function login() {

    firebase.auth().signInWithPopup(provider).then(function(result) {
      var token = result.credential.accessToken;

      // The signed-in user info.
      var user = result.user;
      var userUID = user.uid;
      var userPhoto = user.photoURL;
      var userName = user.displayName;

      firebase.database().ref('users/' + userUID).set({
        uid: userUID,
        username: userName,
        photo: userPhoto,
        game : {"number": 0}
      });

    })
}

//Sign out
function signOut(){
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    location.reload();
  }, function(error) {
    // An error happened.
  });
}
