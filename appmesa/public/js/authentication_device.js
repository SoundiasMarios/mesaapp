$(window).on('load', function () {
    var fingerprint = new Fingerprint().get();

	$(document).on('click', '#submit_new_device', function() {
        addNewDevice(fingerprint);
    });
});

function addNewDevice(fingerprint) {
    var name = $('#device_auth_name').val();
    var key = $('#device_auth_key').val();

    var socket = io.connect(':8089');
    socket.on('connection_established', function(){
        socket.on('NewDeviceStatus', function(status){
            if(status === 'SUCCESS') {
                window.location.replace('/devices');
            }else {
                $('#device_auth_server_msg').html('Λάθος κωδικός πρόσβασης');
            }
        });

        socket.emit('NewDevice', fingerprint, key, name);
    });
}