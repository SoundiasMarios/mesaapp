function signOut() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/signout');
    xhr.onload = function () {
        if (xhr.status === 200) {
            window.location.replace('/');   /////////////////
        } else if(xhr.status !== 200) {
            console.log("NOT OK");
        }
    };
    xhr.send();
}

function showMyProfile() {
    window.location.href = '/users/myprofile';
}

function showUserProfile(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    window.location.href = '/users/userprofile/' + datasend;
}

function showAllUsers() {
    window.location.href = '/admin_users/allusers';
}

function showAllDevices() {
    window.location.href = '/admin_users/showdevices';
}

function showOnScreen(element) {
    var fingerprint;
    fingerprint = $(element).attr('mesa-data');
    //console.log('fingerprint : ', fingerprint, ' and ', element.value);

    var sendData = 'fingerprint=' + fingerprint + '&show=' + element.value;

    $.ajax({
        url: '/admin_users/showonscreen',
        type: 'POST',
        data: sendData,
        contentType: 'application/x-www-form-urlencoded',
        success: function() {
            console.log('showOnScreen WORKED')
        },
        error: function(errmsg) {
            console.log('showOnScreen NOT WORKED');
        }
    });
}

function startPresentation() {
    $.ajax({
        url: '/admin_users/startpresentation',
        type: 'GET',
        success: function(responseText) {
            $('#start_presentation').prop('disabled', true);
            $('#start_presentation').removeClass('btn-primary');
            $('#restart_presentation').prop('disabled', false);
            $('#restart_presentation').addClass('btn-primary');
            $('#stop_presentation').prop('disabled', false);
            $('#stop_presentation').addClass('btn-primary');
            console.log('startPresentation WORKED');
            $('#server_msg').removeClass('error').addClass('success').fadeIn(2000).html(responseText).show().slideUp(1000);
        },
        error: function(errmsg) {
            $('#server_msg').removeClass('success').addClass('error').html(errmsg.responseText).show();
            console.log('startPresentation NOT WORKED');
        }
    });
}

function stopPresentation() {
    $.ajax({
        url: '/admin_users/stoppresentation',
        type: 'GET',
        success: function(responseText) {
            $('#start_presentation').prop('disabled', false);
            $('#start_presentation').addClass('btn-primary');
            $('#restart_presentation').prop('disabled', true);
            $('#restart_presentation').removeClass('btn-primary');
            $('#stop_presentation').prop('disabled', true);
            $('#stop_presentation').removeClass('btn-primary');
            $('#server_msg').removeClass('error').addClass('success').fadeIn(2000).html(responseText).show().slideUp(1000);
        },
        error: function(errmsg) {
            $('#server_msg').removeClass('success').addClass('error').html(errmsg.responseText).show();
        }
    });
}

function restartPresentation() {
    $.ajax({
        url: '/admin_users/restartpresentation',
        type: 'GET',
        success: function(responseText) {
            $('#server_msg').removeClass('error').addClass('success').fadeIn(2000).html(responseText).show().slideUp(1000);
        },
        error: function(errmsg) {
            $('#server_msg').removeClass('success').addClass('error').html(errmsg.responseText).show();
        }
    });
}

function deleteDevice(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');
    console.log('In delete device : ' + datasend);

    $.ajax({
        url: '/admin_users/deletedevice/' + datasend,
        type: 'DELETE',
        success: function(responseText) {
            console.log('deleteDevice WORKED');

            $(element).closest('.device_field').fadeIn(500).html(responseText)
            .css({'backgroundColor': 'white', 'text-align': 'center', 'font-size': '16px', 'padding': '10px'});
        },
        error: function(errmsg) {
            var error = $('<div class="error">' + errmsg.responseText + '</div>').css("display", "block");
            $(element).closest('.device_field').prepend(error);
        }
    });
}

function deleteUser(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    $.ajax({
        url: '/admin_users/deleteuser/' + datasend,
        type: 'DELETE',
        success: function(responseText) {
            $(element).closest('.user_field').fadeIn(500).html(responseText)
            .css({'backgroundColor': 'white', 'text-align': 'center', 'font-size': '16px', 'padding': '10px'});
        },
        error: function(errmsg) {
            var error = $('<div class="error">' + errmsg.responseText + '</div>').css("display", "block");
            $(element).closest('.user_field').prepend(error);
        }
    });
}

function deleteMyProfile() {

    $.ajax({
        url: '/users/deletemyprofile',
        type: 'GET',
        success: function() {
            signOut();
        },
        error: function(errmsg) {
            console.log('delete my account NOT WORKED');
        }
    });
}

$(window).on('load', function () {

    $(document).on('click', '#submit_signout', function() {
        signOut();
    });
    
    $(document).on('click', '#show_user_info', function() {
        showMyProfile();
        return false;
    });

    $(document).on('click', '.profile_link',  function() {
        showUserProfile(this);
        return false;
    });

    $(document).on('click', '#cancel_action',  function() {
        showUserProfile(this);
        return false;
    });

    $(document).on('click', '#show_all_users', function() {
        showAllUsers();
        return false;
    });

    $(document).on('click', '#show_all_devices', function() {
        showAllDevices();
        return false;
    });

    $(document).on('change', 'input[type=radio][name=device_status]', function() {
        showOnScreen(this);
    });

    $(document).on('click', '#start_presentation', function() {
        startPresentation();
    });

    $(document).on('click', '#stop_presentation', function() {
        stopPresentation();
    });

    $(document).on('click', '#restart_presentation', function() {
        restartPresentation();
    });

    $(document).on('click', '.delete_device', function() {
        var id = $(this).closest('.device_field').find('.device_name').find('.name').html();
        var delete_device = this;

        $.confirm({
            title: '',
            content: 'Διαγραφή της συσκευής "' + id + '" ;',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        deleteDevice(delete_device);
                    }
                },
                cancel:{
                    text: 'ΑΚΥΡΩΣΗ',
                    action: function () {
                    }
                }
            }
        });
    });

    $(document).on('click', '.delete_user', function() {
        var id = $(this).attr('mesa-data');
        var delete_user = this;

        $.confirm({
            title: '',
            content: 'Διαγραφή του χρήστη ' + id + ' ;',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        deleteUser(delete_user);
                    }
                },
                cancel:{
                    text: 'ΑΚΥΡΩΣΗ',
                    action: function () {
                    }
                }
            }
        });
    });

    $(document).on('click', '#delete_my_profile', function() {
        deleteMyProfile();
    });

});