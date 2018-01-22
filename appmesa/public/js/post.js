function nextPosts(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/posts/all/next_posts/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_all_posts').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
        },
        error: function(errmsg) {
            console.log('delete NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function userPosts() {
    window.location.href = '/posts/userposts';
}

function nextUserPosts(element) {
    var page = $(element).attr('mesa-next-page');

    $.ajax({
        url: '/posts/next_userposts/' + page,
        type: 'GET',
        success: function(responseText) {
            $('#display_user_posts').find('#accordion').append(responseText);
            $(element).parent("#btn_container").remove();
            console.log('responseText : ', responseText);
        },
        error: function(errmsg) {
            console.log('delete NOT WORKED : ' + errmsg.responseText);
        }
    });
}

function otherUsersPosts() {
    window.location.href = '/posts/otherusersposts';
}

function searchByTag(element) {
    var tag = $(element).attr('mesa-data');

    window.location.href = '/search/tag=' + tag;
}

function searchByText(element) {
    var query = $('#search_text').val();
    console.log('query : ', query);

    window.location.href = '/search/text=' + query;
}

function showImportantPosts() {
    window.location.href = '/posts/important';
}

$(window).on('load', function () {
    /*$(document).ajaxStart(function () {
        $('.loader').show();
    }).ajaxStop(function () {
        $('.loader').hide();
    });*/

    $(document).on('click', '#more_posts', function() {
        nextPosts(this);
    });

    $(document).on('click', '#user_posts', function() {
        userPosts();
        return false;
    });

    $(document).on('click', '#more_userposts', function() {
        nextUserPosts(this);
        return false;
    });

    $(document).on('click', '#other_users_posts', function() {
        otherUsersPosts();
        return false;
    });

    $(document).on('click', '.tag', function() {
        searchByTag(this);
        return false;
    });

    $(document).on('click', '#search_btn', function() {
        searchByText(this);
        return false;
    });

    $(document).on('click', '#show_all_important', function() {
        showImportantPosts();
        return false;
    });
});