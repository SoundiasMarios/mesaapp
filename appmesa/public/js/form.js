'use strict'

function getSignUpForm() {
    window.location.href = '/forms/signup';
}

function submitSignUpForm() {
    var formData = new FormData();

    var readFormData = function() {
        var firstname = validateField('#firstname', '#err_firstname', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 3 έως 20)');
        var lastname = validateField('#lastname', '#err_lastname', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 3 έως 20)');
        var username = validateField('#username', '#err_username', 'text', true, /^.{8,}$/, 'Πρέπει να είναι τουλάχιστον 8 χαρακτήρες');
        var email = validateField('#email', '#err_email', 'text', true, /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/, 'Πρέπει να είναι της μορφής mail@domain.co');
        var birthdate = validateField('#birthdate', '#err_birthdate', 'date', true, null, null);
        var city = validateField('#city', '#err_city', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){2,51}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 2 έως 50)');
        var phone = validateField('#phone', '#err_phone', 'text', true, /^[0-9]{10}$/, 'Mόνο αριθμοί μήκούς 10');
        var moreinfo= validateField('#moreinfo', '#err_moreinfo', 'text', false, /^.{0,500}$/, 'Πρέπει να είναι λιγότεροι από 500 χαρακτήρες');

        var gender = $('input[name=gender]:checked', '#gender').val();
        var role = $('input[name=role]:checked', '#role').val();

        if(firstname && lastname && username && email && birthdate && city && phone && (!moreinfo || (moreinfo.length<500) )) {
            formData.append('firstname',firstname);
            formData.append('lastname', lastname);
            formData.append('username', username);
            formData.append('email', email);
            formData.append('birthdate', birthdate);
            formData.append('gender', gender);
            formData.append('city', city);
            formData.append('phone', phone);
            formData.append('moreinfo', moreinfo);
            formData.append('role', role);
            return true;
        }else {
            ///// for debbuging
            // formData.append('firstname', 'simplename');
            // formData.append('lastname', 'simplelastname');
            // formData.append('username', 'simpleusernqwqwqadsaame');
            // formData.append('email', 'marsoun91@gmail.com');    //email@sads.cuy    simplsqwqwasdasqr@domain.gr
            // formData.append('birthdate', birthdate); //'11/11/1990'
            // formData.append('gender', 'male');
            // formData.append('city', 'simplecity');
            // formData.append('phone', '1234567890');
            // formData.append('moreinfo', 'simpleuser info');
            // formData.append('role', role);
            // return true;

            return false;
        }
    }

    var valid = readFormData();
    if(!valid) {
        $("#client_msg").html("Παρακαλώ ελέγξετε πάλι τα στοιχεία που δώσατε").removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        },100);
        return;
    } else {
        $("#client_msg").html("").removeClass('gen_msg error').hide();
    }

    var read_file = new Promise(function(resolve, reject){
            var reader = new FileReader();
            var file = document.getElementById('photo').files[0];
            if(file!==undefined) {
                reader.onload = function() {
                    formData.append('file', file);
                    return resolve(true);
                }
                reader.readAsDataURL(file);
            }else {
                return resolve(false);
            }
        }
    );

    var send_form = function(hasfile){
        console.log('has file : ', hasfile);
        console.log('send_form');

        $.ajax({
            url: '/forms/signup',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(responseText) {
                $('#server_msg').html(responseText).removeClass('error').addClass('success gen_msg').show();
                $('html, body').animate({
                    scrollTop: $("#mesa_container").offset().top
                });
            },
            error: function(errmsg) {
                $('#server_msg').html(errmsg.responseText).removeClass('success').addClass('error gen_msg').show();
                $('html, body').animate({
                    scrollTop: $("#mesa_container").offset().top
                });
            }
        });
    };

    read_file.then(send_form);
};

function submitSignInForm() {
    var formData;

    var readFormData = function() {
        var username = validateField('#signin_username', null, 'text', true, null, null);
        var password = validateField('#signin_password', null, 'text', true, null, null);
        var role = $('input[name=role]:checked', '#signin_role').val();
        var role_val = (role == 'simple_user') || (role == 'admin_user') ? role : null;

        var stay_logged_in;
        if ($('#stay_logged_in').is(":checked"))
            stay_logged_in = true;
        else
            stay_logged_in = false;


        if(username && password && role_val) {
            formData = 'username=' + username + '&password=' + password + '&role=' + role + '&stay_logged_in=' + stay_logged_in;
            return true;
        }else {
            return false;
        }
    }

    var valid = readFormData();
    if(!valid) {
        $("#signin_client_error").html("Ένα ή περισσότερα από τα παρακάτω πεδία είναι κενά").removeClass('success').addClass('gen_msg error').show();
        $("#signin_server_msg").hide();
        return;
    } else {
        $("#signin_client_error").html("").removeClass('gen_msg error').hide();
    }

    $.ajax({
        url: '/forms/signin',
        type: 'POST',
        data: formData,
        contentType: 'application/x-www-form-urlencoded',
        success: function() {
            window.location.replace('/');
        },
        error: function(errmsg) {
            $('#signin_server_msg').html(errmsg.responseText).removeClass('success').addClass('error gen_msg').show();
        }
    });
};

function getUserProfileForm(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    window.location.href = '/forms/editprofile/' + datasend;
}

function submitUserProfileForm(element) {
    var formData = new FormData();

    var readFormData = function() {
        var firstname = validateField('#firstname', '#err_firstname', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 3 έως 20)');
        var lastname = validateField('#lastname', '#err_lastname', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){3,20}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 3 έως 20)');
        var username = validateField('#username', '#err_username', 'text', true, /^.{8,}$/, 'Πρέπει να είναι τουλάχιστον 8 χαρακτήρες');
        var password;
        if(document.getElementById('password'))
            password = validateField('#password', '#err_password', 'password', true, /^.{8,}$/, 'Πρέπει να είναι τουλάχιστον 8 χαρακτήρες');
        else
            password = '#';     // An invalid password. Changed by admin and can't change other user password
        var email = validateField('#email', '#err_email', 'text', true, /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/, 'Πρέπει να είναι της μορφής mail@domain.co');
        var birthdate = validateField('#birthdate', '#err_birthdate', 'date', true, null, null);
        var city = validateField('#city', '#err_city', 'text', true, /^([a-zα-ωA-ZΑ-Ωά-ώ]){2,51}$/, 'Λατινικοί ή ελληνικοί χαρακτήρες(μήκους 2 έως 50)');
        var phone = validateField('#phone', '#err_phone', 'text', true, /^[0-9]{10}$/, 'Mόνο αριθμοί μήκούς 10');
        var moreinfo= validateField('#moreinfo', '#err_moreinfo', 'text', false, /^.{0,500}$/, 'Πρέπει να είναι λιγότεροι από 500 χαρακτήρες');

        var gender = $('input[name=gender]:checked', '#gender').val();
        var role = $('input[name=role]:checked', '#role').val();

        if(firstname && lastname && username && password && email && birthdate && city && phone && (!moreinfo || (moreinfo.length<500) )) {
            formData.append('firstname',firstname);
            formData.append('lastname', lastname);
            formData.append('username', username);
            formData.append('password', password);
            formData.append('email', email);
            formData.append('birthdate', birthdate);
            formData.append('gender', gender);
            formData.append('city', city);
            formData.append('phone', phone);
            formData.append('moreinfo', moreinfo);
            formData.append('role', role);
            return true;
        }else {
            ///// for debbuging
            /*formData.append('firstname', 'simplename');
            formData.append('lastname', 'simplelastname');
            formData.append('username', 'simpleusernqwqwqadsaame');
            formData.append('email', 'simplsqwqwasdasqr@domain.gr');    //email@sads.cuy
            formData.append('birthdate', '11/11/1990');
            formData.append('gender', 'male');
            formData.append('city', 'simplecity');
            formData.append('phone', '1234567890');
            formData.append('moreinfo', 'simpleuser info');
            formData.append('role', 'simple_user');
            return true;*/

            return false;
        }
    }

    var valid = readFormData();
    if(!valid) {
        $("#client_msg").html("Παρακαλώ ελέγξετε πάλι τα στοιχεία που δώσατε").removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        },100);
        return;
    } else {
        $("#client_msg").html("").removeClass('gen_msg error').hide();
    }

    var read_file = new Promise(function(resolve, reject){
            var reader = new FileReader();
            var file = document.getElementById('photo').files[0];
            if(file!==undefined) {
                reader.onload = function() {
                    formData.append('file', file);
                    return resolve(true);
                }
                reader.readAsDataURL(file);
            }else {
                return resolve(false);
            }
    });

    var send_form = function(hasfile){
        var datasend;
        datasend = $(element).attr('mesa-data');
        console.log('has file : ', hasfile);
        console.log('send_form');

        $.ajax({
            url: '/forms/editprofile/' + datasend,
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(responseText) {
                $('#server_msg').html(responseText).removeClass('error').addClass('success gen_msg').show();
                $('html, body').animate({
                    scrollTop: $("#mesa_container").offset().top
                });
            },
            error: function(errmsg) {
                $('#server_msg').html(errmsg.responseText).removeClass('success').addClass('error gen_msg').show();
                $('html, body').animate({
                    scrollTop: $("#mesa_container").offset().top
                });
            }
        });
    };

    read_file.then(send_form);
}

$(window).on('load', function () {

    $(document).on('click', '#show_signup_form', function() {
        getSignUpForm();
    });

    $(document).on('click', '#submit_signup', function() {
        submitSignUpForm();
    });

    $(document).on('click', '#submit_signin', function() {
        submitSignInForm();
    });

    $(document).on('click', '#edit_profile', function() {
        getUserProfileForm(this);
    });

    $(document).on('click', '#submit_editprofile', function() {
        submitUserProfileForm(this);
    });

    $(document).on('mousedown', '#show_password', function() {
        $('#password').attr('type', 'text');
    }).on('mouseup mouseleave', function() {
        $('#password').attr('type', 'password');
    });

    $('#photo').on('change', function(){

    });    

    $('#photo').on('change', function(){
        var input = this.files[0];
        if(input) {
            var ext = input.name.substring(input.name.lastIndexOf('.') + 1).toLowerCase();
            if (input && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) 
            {
                var reader = new FileReader();

                reader.onload = function (e) {
                   $('#photo_profile').attr('src', e.target.result);
                }
               reader.readAsDataURL(input);
            }
        }
    });

    $(document).on('change', '#gender', function() {
        var img_src= $('#photo_profile').attr('src');

        if (img_src.substring(0,14)=='/image/signup/') {
            var gender = $('input[name=gender]:checked', '#gender').val();
            switch (gender) {
                case 'default':
                    $('#photo_profile').attr('src', '/image/signup/d');
                    break;
                case 'male':
                    $('#photo_profile').attr('src', '/image/signup/m_d');
                    break;
                case 'female':
                    $('#photo_profile').attr('src', '/image/signup/f_d');
                    break;
                default:
                    console.log('Δεν υπάρχει εικόνα για το "' + gender + '".');
            }
        }
    });

});

function validateField(element, err_element, type, required, reg_expr, reg_expr_msg) {
    var ret_field_value = null;

    var validateText = function() {
        var valid;
        var field_value = $(element).val();

        if(required && (field_value==="")) {
            $(err_element).text('Υποχρεωτικό πεδίο').show();
            return null;
        }else if(reg_expr) {
            valid = reg_expr.test(field_value);
            if(!valid) {
                $(err_element).text(reg_expr_msg).show();
                return null;
            } else {
                $(err_element).hide();
            }
        }else {
            $(err_element).hide();
        }

        return field_value;
    };

    var validateDate = function() {

        var isInvalid = function(birthdate) {
            var now = (new Date()).getFullYear();
            var birth = (new Date(birthdate)).getFullYear();

            if(now < birth) {
                return true;
            } else {
                return false;
            }
        };

        var field_value = $(element).val();

        if(required && (field_value==="")) {
            $(err_element).text('Υποχρεωτικό πεδίο').show();
            return null;
        } else if(isInvalid(field_value)) {
            $(err_element).text('Η ημερομηνία δεν είναι έγκυρη.').show();
            return null;
        } else {
            $(err_element).hide();
        }

        return field_value;
    };

    switch (type) {
        case 'text':
        case 'password':
            ret_field_value = validateText();
            break;
        case 'date':
            ret_field_value = validateDate();
            break;
        default:
            console.log('Δεν υποστηρίζεται ο τύπος "' + type + '".');
    }

    return ret_field_value;
}