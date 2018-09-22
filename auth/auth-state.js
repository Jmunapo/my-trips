 firebase.auth().onAuthStateChanged(function(user) {
    let path = window.location.pathname;
    var loc = path.substr(path.lastIndexOf('/') + 1);
    if(user){
        window.user = user;
        if(loc === 'login.html' || loc === 'register.html'){
            sessionStorage.setItem('uid', user.uid);
            window.location = 'index.html';
        }
    }else{
        if(loc !== 'login.html' && loc !== 'register.html'){
            window.location = 'login.html';
        }
    }
    

  });

  function signOut(){
    firebase.auth().signOut().then(function() {
    }).catch(function(error) {
        console.log(error);
    });
}