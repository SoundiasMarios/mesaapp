function getNewAnnouncementForm() {
    window.location.href = '/announcements/new';
}

function submitNewAnnouncementForm() {
	var formData;

    var readForm = function () {
    	var title = $('#title').val();
    	var content = tinyMCE.get('content').getContent().replace(/&nbsp;/g, " ");
        var en_title = $('#en_title').val();
        var en_content = $('#en_content').val();
        var tags = $('#tags').val();

        en_title = ((en_title==undefined) || (en_title=='')) ? '' : en_title;
        en_content = ((en_content==undefined)) ? '' : tinyMCE.get('en_content').getContent().replace(/&nbsp;/g, " ");

        var pinned;
        if ($('#pinned').is(":checked"))
            pinned = true;
        else
            pinned = false;
        
    	formData = 'title=' + title + '&content=' + content + '&en_title=' + en_title + '&en_content=' + en_content + '&tags=' + tags + '&pinned=' + pinned;

        if (title!=="") {
            return true;
        } else {
            return false;
        }
    };

    var sendForm = function(){
        $.ajax({
            url: '/announcements/new',
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

    var valid = readForm();

    if (valid) {
        sendForm();
        $("#client_msg").html("").removeClass('gen_msg error success').hide();
    } else {
        $("#client_msg").html("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία της φόρμας ( * ).").removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").html("").removeClass('gen_msg error success').hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        });
    }
}

function showAnnouncement(element) {
    var datasend, openIn;
    datasend = $(element).attr('mesa-data');
    openIn = $(element).attr('href');

    $.ajax({
        url: '/announcements/announcement/' + datasend,
        type: 'GET',
        success: function(responseText) {
            $(openIn).find('.panel-body').html(responseText);
        },
        error: function(errmsg) {
            $(openIn).find('.panel-body').html('Η δημοσέυση δε βρέθηκε.');
        }
    });
}

function showAllAnnouncements() {
    window.location.href = '/announcements/all';
}

function showUserAnnouncements() {
    window.location.href = '/announcements/userannouncements';
}

function getEditAnnouncementForm(element) {
    var datasend;
    datasend = $(element).attr('mesa-data');

    window.location.href = '/announcements/edit/' + datasend;
}

function submitEditAnnouncementForm(element) {
    var announcementID;
    announcementID = $(element).attr('mesa-data');

    var formData;

    var readForm = function () {
        var title = $('#title').val();
        var content = tinyMCE.get('content').getContent().replace(/&nbsp;/g, " ");
        var en_title = $('#en_title').val();
        var en_content = $('#en_content').val();
        var tags = $('#tags').val();

        en_title = ((en_title==undefined) || (en_title=='')) ? '' : en_title;
        en_content = ((en_content==undefined)) ? '' : tinyMCE.get('en_content').getContent().replace(/&nbsp;/g, " ");

        var pinned;
        if ($('#pinned').is(":checked"))
            pinned = true;
        else
            pinned = false;
        
        formData = 'title=' + title + '&content=' + content + '&en_title=' + en_title + '&en_content=' + en_content + '&tags=' + tags + '&pinned=' + pinned;

        if (title!=="") {
            return true;
        } else {
            return false;
        }
    };

    var sendForm = function(){
        $.ajax({
            url: '/announcements/edit/' + announcementID,
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

    var valid = readForm();

    if (valid) {
        sendForm();
        $("#client_msg").html("").removeClass('gen_msg error success').hide();
    } else {
        $("#client_msg").html("Παρακαλώ συμπληρώστε τα υποχρεωτικά πεδία της φόρμας ( * ).").removeClass('success').addClass('gen_msg error').show();
        $("#server_msg").html("").removeClass('gen_msg error success').hide();
        $('html, body').animate({
            scrollTop: $("#mesa_container").offset().top
        });
    }
}

function deleteAnnouncement(element) {
    var datasend = $(element).attr('mesa-data');

    $.ajax({
        url: '/announcements/delete/' + datasend,
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

function nextAnnouncements(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/announcements/all/next_announcements/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_all_announcements').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
        },
        error: function(errmsg) {
            console.log('nextAnnouncements NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function nextUserAnnouncements(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/announcements/next_userannouncements/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_user_announcements').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
        },
        error: function(errmsg) {
            console.log('nextUserAnnouncements NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function showAllPosts() {
    window.location.href = '/posts/all';
}

$(window).on('load', function () {

    $(document).on('click', '#show_new_announcement_form', function() {
        getNewAnnouncementForm();
        return false;
    });

    $(document).on('click', '#submit_announcement', function() {
        submitNewAnnouncementForm();
    });

    $(document).on('click', '.moreinfolink_announcement.collapsed', function() {
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

        showAnnouncement(element);
        return false;
    });

    $(document).on('click', '.moreinfolink_announcement.collapsed_in', function() {
        var element = this;

        $(this).children().removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
        $(this).removeClass('collapsed_in');
    });

    $(document).on('click', '#show_all_announcements', function() {
        showAllAnnouncements();
        return false;
    });

    $(document).on('click', '#user_announcements', function() {
        showUserAnnouncements();
    });

    $(document).on('click', '.edit_announcement', function() {
        getEditAnnouncementForm(this);
    });

    $(document).on('click', '#submit_edit_announcement', function() {
        submitEditAnnouncementForm(this);
    });

    $(document).on('click', '.delete_announcement', function() {
        var id = $(this).attr('mesa-data');
        var delete_post = this;

        var title = $(this).closest('.panel').find('.content_title').html();

        $.confirm({
            title: '',
            content: 'Διαγραφή της ανακοίνωσης "' + title + '" ;',
            buttons: {
                confirm: {
                    text: 'ΣΥΝΕΧΕΙΑ',
                    action: function () {
                        deleteAnnouncement(delete_post);
                    }
                },
                cancel:{
                    text: 'ΑΚΥΡΩΣΗ'
                }
            }
        });
    });

    $(document).on('click', '#more_announcements', function() {
        nextAnnouncements(this);
    });

    $(document).on('click', '#more_userannouncements', function() {
        nextUserAnnouncements(this);
    });

    $(document).on('click', '#new_language', function() {
        $('#other_languages').show();
        $('#other_languages').append(
            '<div id=other_languages_btn_container>' + 
                '<button id="hide_language" class="btn button">Απόκρυψη</button>' +
                '<button id="delete_language" class="btn button">Διαγραφή</button>' +
            '</div>' +
            '<div id="en_header">' +
                '<label for="title">Τίτλος (Αγγλικά)</label>' +
                '<div id="errtitle" class="error"></div>' +
                '<input id="en_title" class="form-control" type="text"/>' +
            '</div>' +
            '<div id="en_body">' +
                '<label for="content">Κείμενο (Αγγλικά)</label>' +
                '<div id="en_errcontent" class="error"></div>' +
                '<textarea id="en_content" class="form-control"></textarea>' +
            '</div>');
        tinymce.EditorManager.execCommand('mceAddEditor', true, 'en_content');
        // tinyMCE.init({selector:'#en_content', entity_encoding: "raw"});
        $('#new_language').hide();
    });

    tinyMCE.init({selector:'#content', entity_encoding: "raw"});
    tinyMCE.init({selector:'#en_content', entity_encoding: "raw"});

    $(document).on('click', '#hide_language', function() {
        $(this).attr('id', 'show_language').html('Εμφάνιση (Αγγλικά)');
        $('#en_header').slideUp();
        $('#en_body').slideUp();
        $('#delete_language').hide();
    });

    $(document).on('click', '#show_language', function() {
        $(this).attr('id', 'hide_language').html('Απόκρυψη');
        $('#en_header').show();
        $('#en_body').show();
        $('#delete_language').show();
    });

    $(document).on('click', '#delete_language', function() {
        tinyMCE.EditorManager.execCommand('mceRemoveEditor', true, 'en_content');;
        
        $('#other_languages').slideUp("slow", function(){
            $('#other_languages').empty();
        });
        $('#new_language').show();
    });

    $(document).on('click', '#show_all_posts', function() {
        showAllPosts();
        return false;
    });
    
    $(document).on('click', '.announcement_en_content', function() {
        $(this).closest('.nav').find('.active').removeClass('active');
        $(this).closest('.nav-item').addClass('active')

        $(this).closest('.panel-body').find('.announcement_text').hide();
        $(this).closest('.panel-body').find('.announcement_en_text').show();

        return false;
    });

    $(document).on('click', '.announcement_content', function() {
        $(this).closest('.nav').find('.active').removeClass('active');
        $(this).closest('.nav-item').addClass('active');

        $(this).closest('.panel-body').find('.announcement_en_text').hide();
        $(this).closest('.panel-body').find('.announcement_text').show();

        return false;
    });
});
