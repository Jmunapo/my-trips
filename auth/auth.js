$('#regForm').submit(e=>{
    e.preventDefault();
    $('#register-load').removeClass('d-none');
    let cred = {};
    ($('#regForm').serializeArray()).forEach(val => {
        cred[val.name] = val.value;
    });

    firebase.auth().createUserWithEmailAndPassword(cred.email, cred.password).catch(function(error) {
        var errorCode = error.code;
        $('.notify').removeClass('d-none');
        if(errorCode === 'auth/email-already-in-use'){
            $('.notify').html('Email already in use, please use login');
            $('#register-load').addClass('d-none');
        }else{
            $('.notify').html('Error, please try again');
            $('#register-load').addClass('d-none');
        }
    });
})

//loginForm

$('#loginForm').submit(e=>{
    e.preventDefault();
    $('#login-load').removeClass('d-none');
    let cred = {};
    ($('#loginForm').serializeArray()).forEach(val => {
        cred[val.name] = val.value;
    });

    firebase.auth().signInWithEmailAndPassword(cred.email, cred.password).catch(function(error) {
        var errorCode = error.code;
        $('.notify').removeClass('d-none');
        if(errorCode === 'auth/user-not-found'){
            $('.notify').html('Email not in our records, please use register');
            $('#login-load').addClass('d-none');
        }else if(errorCode === 'auth/network-request-failed'){
            $('.notify').html('Network error, check your connection!');
            $('#login-load').addClass('d-none');
        }else{
            $('.notify').html('Invalid email/password');
            $('#login-load').addClass('d-none');
        }
    });
})


function check(input) {
    if (input.value != document.getElementById('password').value) {
        input.setCustomValidity('Password Must be Matching.');
    } else {
        // input is valid -- reset the error message
        input.setCustomValidity('');
    }
}