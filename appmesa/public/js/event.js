function getNewEventForm() {
    window.location.href = '/events/new';
}

function submitNewEventForm() {
    var formData;

    var readForm = function () {
        var title = $('#title').val();
        var content = tinyMCE.get('content').getContent().replace(/&nbsp;/g, " ");
        var en_title = $('#en_title').val();
        var en_content = $('#en_content').val();
        var startDate = $('#start_date').val();
        var endDate = $('#end_date').val();
        var startTime = $('#start_time').val();
        var endTime = $('#end_time').val();
        var tags = $('#tags').val();

        en_title = ((en_title==undefined) || (en_title=='')) ? '' : en_title;
        en_content = ((en_content==undefined)) ? '' : tinyMCE.get('en_content').getContent().replace(/&nbsp;/g, " ");
        
        formData = 'title=' + title + '&content=' + content + '&en_title=' + en_title + '&en_content=' + en_content + 
                    '&startdate=' + startDate + '&enddate=' + endDate + '&starttime=' + startTime + '&endtime=' + endTime + '&tags=' + tags;

        var validation = validateDate(startDate, endDate);

        if ((title!=="") && (!validation.hasError)) {
            return {hasError: false, msg: null};
        } else if ((title=="") || (startDate=="") || (endDate=="")) {
            return {hasError: true, msg: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία της φόρμας ( * )."};
        } else {
            return {hasError: true, msg: validation.msg};
        }
    };

    var send_form = function(){
        $.ajax({
            url: '/events/new',
            type: 'POST',
            data: formData,
            contentType: 'application/x-www-form-urlencoded',
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

    var validation = readForm();

    if (!validation.hasError) {
        send_form();
        $("#client_msg").html("").removeClass('gen_msg error success').hide();
    } else {
        $("#client_msg").html(validation.msg).removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").html("").removeClass('gen_msg error success').hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        });
    }
}

function showEvent(element) {
    var datasend, openIn;
    datasend = $(element).attr('mesa-data');
    openIn = $(element).attr('href');
    
    $.ajax({
        url: '/events/event/' + datasend,
        type: 'GET',
        success: function(responseText) {
            $(openIn).find('.panel-body').html(responseText);
        },
        error: function(errmsg) {
            console.log('HEREE RESPONSED ERROR : ' + errmsg.responseText);
        }
    });
}

function showAllEvents() {
    window.location.href = '/events/all';
}

function showUserEvents() {
    window.location.href = '/events/userevents';
}

function getEditEventForm(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    window.location.href = '/events/edit/' + datasend;
}

function submitEditEventForm(element) {
    var eventID;
    eventID = $(element).attr('mesa-data');

    var formData = new FormData();

    var readForm = function () {
        var title = $('#title').val();
        var content = tinyMCE.get('content').getContent().replace(/&nbsp;/g, " ");
        var en_title = $('#en_title').val();
        var en_content = $('#en_content').val();
        var startDate = $('#start_date').val();
        var endDate = $('#end_date').val();
        var startTime = $('#start_time').val();
        var endTime = $('#end_time').val();
        var tags = $('#tags').val();

        var reset;
        if (($('#reset')) && ($('#reset').is(":checked"))) {
            reset = true;
        } else {
            reset = false;
        }

        en_title = ((en_title==undefined) || (en_title=='')) ? '' : en_title;
        en_content = ((en_content==undefined)) ? '' : tinyMCE.get('en_content').getContent().replace(/&nbsp;/g, " ");

        formData.append('title', title);
        formData.append('content', content);
        formData.append('en_title', en_title);
        formData.append('en_content', en_content);
        formData.append('startDate', startDate);
        formData.append('endDate', endDate);
        formData.append('startTime', startTime);
        formData.append('endTime', endTime);
        formData.append('tags', tags);
        formData.append('reset', reset);

        
        if ((title=="") || (startDate=="") || (endDate=="")) {
            return {hasError: true, msg: "Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία της φόρμας ( * )."};
        } else {
            return {hasError: false, msg: null};
        }
    };

    var read_files = new Promise(function(resolve, reject){
            var event_photos = document.getElementById('event_photos');

            if (event_photos) {
                var files = event_photos.files;
                if (files.length > 0) {
                    var filesLoadedCounter = 0;
                    $.each(files, function (i, f) {
                        formData.append(i, f);
                        filesLoadedCounter++;
                        if (filesLoadedCounter == files.length) {
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            } else {
                resolve();
            }
        });

    var send_form = function(){
        $.ajax({
            url: '/events/edit/' + eventID,
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

    var validation = readForm();

    if (!validation.hasError) {
        read_files.then(send_form);
        $("#client_msg").html("").removeClass('gen_msg error success').hide();
    } else {
        $("#client_msg").html(validation.msg).removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").html("").removeClass('gen_msg error success').hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        });
    }
}

///// fix responce text
function cancelEvent(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    $.ajax({
        url: '/events/cancel/' + datasend,
        type: 'GET',
        success: function(responseText) {
            $(element).attr({'disabled': true, title: 'Η εκδήλωση έχει ακυρωθεί'});
            $(element).closest('.panel').find('#event_state').html('Ακυρώθηκε');
        },
        error: function(errmsg) {
            var error = $('<div class="error">' + errmsg.responseText + '</div>').css("display", "block");
            $(element).closest('.panel').prepend(error);
        }
    });
}

function deleteEvent(element) {
    var datasend = $(element).attr('mesa-data');

    $.ajax({
        url: '/events/delete/' + datasend,
        type: 'DELETE',
        success: function(responseText) {
            $(element).closest('.panel').fadeOut(500);
            setTimeout(function(){
                $(element).closest('.panel').fadeIn(500).html(responseText).addClass('success').slideUp(1000);
            }, 500);
        },
        error: function(errmsg) {
            var error = $('<div class="error">' + errmsg.responseText + '</div>').css("display", "block");
            $(element).closest('.panel').prepend(error);
        }
    });
}

function nextEvents(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/events/all/next_events/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_all_events').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
        },
        error: function(errmsg) {
            console.log('delete NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function nextUserEvents(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/events/next_userevents/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_user_events').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
        },
        error: function(errmsg) {
            console.log('delete NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function deleteImgEvent(element) {
    var imgPath = $(element).attr('mesa-data');
    $.ajax({
        url: '/image/gallery/delete/' + imgPath,
        type: 'DELETE',
        success: function(responseText) {
            $(element).closest('.img_container').remove();
        },
        error: function(errmsg) {
            console.log('delete NOT WORKED : ' + errmsg.responseText);
        }
    });
}

$(window).on('load', function () {

    var start_time = document.getElementById('start_time');
    var end_time = document.getElementById('end_time');

    if(start_time && end_time) {
        $('#start_time').timepicker();//.val('6:00pm');
        $('#end_time').timepicker();//.val('8:00pm');
    }

    $('#start_time').on('keydown', function(){
        return false;
    });

    $('#end_time').on('keydown', function(){
        return false;
    });


    $(document).on('click', '#show_new_event_form', function() {
        getNewEventForm();
        return false;
    });

    $(document).on('click', '#submit_event', function() {
        submitNewEventForm();
    });

    $(document).on('click', '.moreinfolink_event.collapsed', function() {
        console.log('events io');
        var element = this;

        $('.collapsed_in').children().removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
        $('.collapsed_in').removeClass('collapsed_in');

        $(this).addClass('collapsed_in');
        $(this).children().removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');

        setTimeout(function(){
            $('html, body').animate({
                scrollTop: $(element).closest('.panel-default').offset().top
            }, 500);
        }, 440);

        showEvent(element);
        return false;
    });

    $(document).on('click', '.moreinfolink_event.collapsed_in', function() {
        console.log('events');
        var element = this;

        $(this).children().removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
        $(this).removeClass('collapsed_in');
    });

    $(document).on('click', '#show_all_events', function() {
        showAllEvents();
        return false;
    });

    $(document).on('click', '#user_events', function() {
        showUserEvents();
        return false;
    });

    $(document).on('click', '.edit_event', function() {
        getEditEventForm(this);
    });

    $(document).on('click', '#submit_edit_event', function() {
        submitEditEventForm(this);
    });

    $(document).on('click', '.cancel_event', function() {
        var id = $(this).attr('mesa-data');
        var cancel_event = this;
        var title = $(this).closest('.panel').find('.content_title').html();

        $.confirm({
            title: '',
            content: 'Ακύρωση της εκδήλωσης "' + title + '" ;',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        cancelEvent(cancel_event);
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
    
    $(document).on('click', '.delete_event', function() {
        var id = $(this).attr('mesa-data');
        var delete_post = this;
        var title = $(this).closest('.panel').find('.content_title').html();

        $.confirm({
            title: '',
            content: 'Διαγραφή της εκδήλωσης "' + title + '" ;',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        deleteEvent(delete_post);
                    }
                },
                cancel:{
                    text: 'ΑΚΥΡΩΣΗ'
                }
            }
        });
    });

    $(document).on('click', '#more_events', function() {
        nextEvents(this);
    });

    $(document).on('click', '#more_userevents', function() {
        nextUserEvents(this);
    });

    $('#event_photos').on('change', function(){
        $('#event_gallery').empty();
        var files = this.files;

        for (var i = 0, f; f = files[i]; i++) {
            var ext = f.name.substring(f.name.lastIndexOf('.') + 1).toLowerCase();
            if ((ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
                var reader = new FileReader();                
                reader.onload = function (e) {
                    var photo = $('<img class="tile"></img>');
                    $(photo).attr('src', e.target.result);
                    $('#event_gallery').append(photo);
                };
                reader.readAsDataURL(f);
            }
        }
    });

    $(document).on('click', '.delete_event_img', function() {
        var element = this;
        var img = $(this).closest('.img_container').find('.image').attr('src');
        console.log('img : ', img);

        $.confirm({
            title: '',
            content: 'Διαγραφή της εικόνας ; <img src="' + img + '">',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        deleteImgEvent(element);
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
    
    $(document).on('click', '.event_en_content', function() {
        $(this).closest('.nav').find('.active').removeClass('active');
        $(this).closest('.nav-item').addClass('active')

        $(this).closest('.panel-body').find('.event_text').hide();
        $(this).closest('.panel-body').find('#gallery_container').hide();
        $(this).closest('.panel-body').find('.event_en_text').show();

        return false;
    });

    $(document).on('click', '.event_content', function() {
        $(this).closest('.nav').find('.active').removeClass('active');
        $(this).closest('.nav-item').addClass('active');

        $(this).closest('.panel-body').find('.event_en_text').hide();
        $(this).closest('.panel-body').find('#gallery_container').hide();
        $(this).closest('.panel-body').find('.event_text').show();

        return false;
    });

    $(document).on('click', '.event_album', function() {
        $(this).closest('.nav').find('.active').removeClass('active');
        $(this).closest('.nav-item').addClass('active');

        $(this).closest('.panel-body').find('.event_en_text').hide();
        $(this).closest('.panel-body').find('.event_text').hide();
        $(this).closest('.panel-body').find('#gallery_container').show();

        return false;
    });
});

function validateDate(startDate, endDate) {
    var now = (new Date()).getTime();
    var start = (new Date(startDate)).getTime();
    var end = (new Date(endDate)).getTime();

    if(isNaN(start) || isNaN(end)){
        return {hasError: true, msg: 'Οι ημερομηνίες είναι κενές.'};
    }else if((now > start) || (start > end)) {
        return {hasError: true, msg: 'Οι ημερομηνίες δεν είναι σωστές.'};
    } else {
        return {hasError: false};
    }
}