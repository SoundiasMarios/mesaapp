$(window).on('load', function () {
    var fingerprint = new Fingerprint().get();
	connectDevice(fingerprint);
});

var postMaxTime;
var barTimeoutVal;

function connectDevice(fingerprint) {
    var socket = io.connect(':8089');

    socket.on('connection_established', function(){
        socket.emit('authentication', fingerprint);

        socket.on('AuthenticationStatus', function(status){
            if(status === 'SUCCESS') {
                var loadingTheme = createLoadingTheme();
                $("#mesa_container").empty();
                $("#mesa_container").append(loadingTheme);
                $('#loading_text').html('Προετοιμασία συσκευής...');
                socket.on('send_rtt', function() {
                    socket.emit('receive_rtt');
                });
                socket.on('rtt calculated', function(sendPostTime) {
                    console.log('postMaxTime : ', sendPostTime);
                    postMaxTime = sendPostTime;
                    barTimeoutVal = Math.floor(postMaxTime/100);
                    $('#loading_text').html('Αναμονή για δεδομένα...');
                    bindConnectedDevice(socket);
                });

                socket.emit('fingerprint', fingerprint);  
            } else {
                window.location.replace('/devices/authentication');
            }
        });
    });
}

var stopPrevBar = {};
var stopPrevBar_i = 0;
function bindConnectedDevice(socket) {

    var postTimeoutVal;
    stopPrevBar[0] = false;
    stopPrevBar[1] = false;


    socket.on('start presentation', function(data){
        var time_arrived = (new Date()).getTime();
        var wait_before_start = ((time_arrived - data.epochTime) > 0 ) ? 4000 - (time_arrived - data.epochTime) : 4000 + (time_arrived - data.epochTime);
        
        var parsed_post = parsePost(data.posts);
        var next_post = createNode(data.posts, parsed_post);
        var postDOM = createPostDOM(next_post);

        var totalPages;
        if (parsed_post.en_lng) {
            totalPages = (parsed_post.el_lng.totalPages > parsed_post.en_lng.totalPages) ? parsed_post.el_lng.totalPages : parsed_post.en_lng.totalPages;
        } else {
            totalPages = parsed_post.el_lng.totalPages;
        }
        // console.log('post : ', data.posts, '\n parsed_post : ', parsed_post);

        postTimeoutVal = setTimeout(function() {
            showNextPost(postDOM, next_post);
            createIndexPages(totalPages);

            $('#loading_main_theme').hide();
            $('#show_post').show();
            $('#footer').show();
            $('#header').show();

            stopPrevBar[stopPrevBar_i] = true;
            stopPrevBar_i = (stopPrevBar_i==0) ? 1 : 0;
            stopPrevBar[stopPrevBar_i] = false;

            var curPage = 0;
            progressBar((new Date()).getTime(), stopPrevBar_i, parsed_post, curPage, totalPages);

        }, 4000 - data.rtt);

    });
    socket.on('stop presentation', function(data){
        clearTimeout(postTimeoutVal);
        presentationEnd();
    });
    socket.on('refresh', function(){
        window.location.reload();
    });
}


function createIndexPages(totalPages) {
    $("#progress_page_container").empty();

    var firstPage = $('<div></div>').addClass('progress_page active').text('1/' + (totalPages+1));
    $("#progress_page_container").append(firstPage);

    var first_index_perc_width = $(firstPage).width() / $(firstPage).parent().width() * 100;
    
    var page, position;
    position = ((100) / (totalPages + 1)) - first_index_perc_width;
    for (var i = 1; i<=totalPages; i++) {
        page = $('<div></div>').addClass('progress_page i' + i).text((i+1) + '/' + (totalPages+1));
        $(page).css("margin-left", position + "%");
        $("#progress_page_container").append(page);
    }
}

function createPostDOM(parsed_post) {
    var postDOM = $('<div id="show_post"></div>');

    if (parsed_post.en_title != null) {
        postDOM.addClass('half_screen');
        var el_lng = $('<div id="body"></div>').addClass('half_screen el_lng');
        var el_title = $('<h2 id="el_title"></h2>').addClass('title').html(parsed_post.title);
        var el_content = $('<p id="el_content"></p>').addClass('content').html(parsed_post.content);
        el_lng.append(el_title);
        el_lng.append(el_content);

        var en_lng = $('<div id="en_body"></div>').addClass('half_screen en_lng');
        var en_title = $('<h2 id="en_title"></h2>').addClass('title').html(parsed_post.en_title);
        var en_content = $('<p id="en_content"></p>').addClass('content').html(parsed_post.en_content);
        en_lng.append(en_title);
        en_lng.append(en_content);

        postDOM.append(el_lng);
        postDOM.append(en_lng);
    }else {
        postDOM.addClass('full_screen');
        var lng = $('<div id="body"></div>').addClass('full_screen');
        var title = $('<h2></h2>').addClass('title').html(parsed_post.title);
        var content = $('<p></p>').addClass('content').html(parsed_post.content);
        lng.append(title);
        lng.append(content);

        postDOM.append(lng);
    }

    return postDOM;
}

function progressBar(start_time, stopIndex, parsed_post, curPage, totalPages) {
    var now = new Date();
    var timeDiff = now.getTime() - start_time;
    var perc = Math.round((timeDiff/postMaxTime)*100);

    if((curPage < totalPages) && (perc > (((curPage+1) * 100)/(totalPages+1)))) {
        $("#progress_page_container").find('.active').removeClass('active').addClass('past');
        curPage++;
        $("#progress_page_container").find('.i' + curPage).addClass('active');
        updateNode(parsed_post, curPage);
    }

    if ((perc <= 100 ) && (!stopPrevBar[stopIndex]) ) {
        updateProgressBar(perc);

        setTimeout(function () {
            progressBar(start_time, stopIndex, parsed_post, curPage, totalPages);
        }, barTimeoutVal);
    }
}

function updateProgressBar(percentage) {
    $('#progress-bar').css("width", percentage + "%");
}

function updateNode(post, page_i) {
    var show_post_class = $('#show_post').attr('class');
    if (show_post_class == 'full_screen') {
        $('#body').find('.content').html(post.el_lng.text[page_i]);
    } else {
        var el_content = post.el_lng;
        var en_content = post.en_lng;
        $('#el_content').html(post.el_lng.text[page_i]);
        $('#en_content').html(post.en_lng.text[page_i]);
    }
}

function showNextPost(postDOM, post) {
    $("#mesa_container").empty();
    $("#mesa_container").append(postDOM);
    
    $("#footer").empty();
    $('#footer').append(post.info);
}

function createNode(post, parsed_post) {
    var title, en_title;
    var information_container;
    var node = {title: null, content: null, en_title: null, en_content: null, info: null}

    if(post.type === 'announcement'){
        title = post.announcement_content[0].title;
        en_title = (parsed_post.en_lng == null) ? null : post.announcement_content[0].en_title;
        information_container = createAnnouncementInformationNode(post);
    }
    else{
        title = post.event_content[0].title;
        en_title = (parsed_post.en_lng == null) ? null : post.event_content[0].en_title;
        information_container = createEventInformationNode(post);
    }

    node.title = title;
    node.content = parsed_post.el_lng.text[0];

    node.en_title = en_title;
    node.en_content = (parsed_post.en_lng == null) ? null : parsed_post.en_lng.text[0];

    node.info = information_container;

    return node;
}

function createAnnouncementInformationNode(post) {
    // console.log(post);
    var information_container = $("<div id='information_container'></div>");

    var post_type = $("<div class='group'><p id='post_type'><span class='glyphicon glyphicon-file'></span> " +'Ανακοίνωση' + "</p></div>");
    $(information_container).append(post_type);

    var username = "<span class='glyphicon glyphicon-user'></span><span id='username'> " + post.postedBy.username + ",</span>";
    var upload_date = "<span id='upload_date'> " + changeDateFormat(post.uploadDate) + "</span>";
    var posted_by = $('<div class="group"><div id="posted_by"><p>' + username + upload_date + '</p></div></div>');
    $(information_container).append(posted_by);

    return information_container;
}

function createEventInformationNode(post) {
    // console.log(post);
    var information_container = $("<div id='information_container'></div>");

    var post_type = $("<div class='group'><p id='post_type'><span class='glyphicon glyphicon-file'></span> " + "Εκδήλωση" + "</p></div>");
    $(information_container).append(post_type);

    var username = "<span class='glyphicon glyphicon-user'></span><span id='username'> " + post.postedBy.username + ",</span>";
    var upload_date = "<span id='upload_date'> " + changeDateFormat(post.uploadDate) + "</span>";
    var posted_by = $('<div class="group"><div id="posted_by"><p>' + username + upload_date + '</p></div></div>');
    $(information_container).append(posted_by);

    var start_date = "<div id='start_date'><p><span class='glyphicon glyphicon-calendar'></span> <span>"
                     + changeDateFormat(post.event_content[0].startDate) + "</span></p></div>";
    var end_date = "<div id='end_date'><p> - <span>" + changeDateFormat(post.event_content[0].endDate) + "</span></p></div>";
    var dates = $('<div class="group">' + start_date + end_date + '</div>');
    $(information_container).append(dates);    


    var start_time = "<div id='start_time'><p><span class='glyphicon glyphicon-time'></span> <span>"
                     + post.event_content[0].startTime + "</span></p></div>";
    var end_time = "<div id='end_time'><p> - <span>" + post.event_content[0].endTime + "</span></p></div>";
    var times = $('<div class="group">' + start_time + end_time + '</div>');
    $(information_container).append(times);

    var state = $("<div class='group'><div id='state'><p><span class='glyphicon glyphicon-info-sign''></span> <span>"
                     + getState(post.event_content[0].state) + "</span></p></div></div>");
    $(information_container).append(state);

    return information_container;
}

function getState(state) {
    if(state=='default') {
        return 'Δεν έχει τροποποιηθεί';
    }else if(state=='modified') {
        return 'Τροποιήθηκε';
    }else if(state=='canceled') {
        return 'Ακυρώθηκε';
    }else {
        return 'Ολοκληρώθηκε';
    }
}

function changeDateFormat(date) {
    var convert_date = new Date(date);

    var b_yyyy = convert_date.getFullYear();
    var b_dd = convert_date.getDate();
    var b_mm = convert_date.getMonth()+1;

    if(b_dd<10){
        b_dd='0'+b_dd;
    } 
    if(b_mm<10){
        b_mm='0'+b_mm;
    }

    return b_dd+'/'+b_mm+'/'+b_yyyy;
}

function parsePost(post) {
    const full_limit_row_length = 200;
    const half_limit_row_length = 80;
    const limit_line_length = 26;

    var parsed_content = {el_lng: null, en_lng: null};

    if(post.type === 'announcement'){
        if (post.announcement_content[0].en_text !=null) {
            parsed_content.el_lng = parseContent(post.announcement_content[0].text, half_limit_row_length, limit_line_length);
            parsed_content.en_lng = parseContent(post.announcement_content[0].en_text, half_limit_row_length, limit_line_length);
        } else{
            parsed_content.el_lng = parseContent(post.announcement_content[0].text, full_limit_row_length, limit_line_length);
        }
    } else {
        if (post.event_content[0].en_text !=null) {
            parsed_content.el_lng = parseContent(post.event_content[0].text, half_limit_row_length, limit_line_length);
            parsed_content.en_lng = parseContent(post.event_content[0].en_text, half_limit_row_length, limit_line_length);
        } else {
            parsed_content.el_lng = parseContent(post.event_content[0].text, full_limit_row_length, limit_line_length);
        }
    }

    return parsed_content;
}

function parseContent(content, limit_row_length, limit_line_length) {

    var new_content = {totalPages: 0, text: {}};
    new_content.text[new_content.totalPages] = ''
    var prev_length = 0;

    var line_counter = -1;
    var row_counter = 0;

    $.each(content.split('\n'), function(){
        // console.log(this);
        line_counter++;

        row_counter = 0;

        for (var i = 0, len = this.length; i < len; i++) {
            if(this[i]=='<') {
                for (; i<len; i++) {
                    if(this[i]=='>') {
                        break;
                    } else {
                        new_content.text[new_content.totalPages] += this[i];
                    }
                }
            } else {
                if((row_counter == 0) && (line_counter >= limit_line_length)) {
                    new_content.totalPages++;
                    var curlength = new_content.text[new_content.totalPages-1].length;
                    new_content.text[new_content.totalPages] = new_content.text[new_content.totalPages-1].substring((curlength - i), curlength);
                    new_content.text[new_content.totalPages-1] = new_content.text[new_content.totalPages-1].substring(0, (curlength - i));
                    line_counter = 0;
                }
                row_counter++;
            }

            new_content.text[new_content.totalPages] += this[i];

            if((row_counter > limit_row_length) && ( (i+1) < len )) {
                var start = findPreviousSpace(new_content.text[new_content.totalPages], prev_length);

                var end = new_content.text[new_content.totalPages].length;

                line_counter++;
                if(line_counter >= limit_line_length) {
                    new_content.totalPages++;
                    new_content.text[new_content.totalPages] = new_content.text[new_content.totalPages-1].substring(start+1, end);
                    new_content.text[new_content.totalPages-1] = new_content.text[new_content.totalPages-1].substring(0, start);
                    row_counter = new_content.text[new_content.totalPages].length;
                    line_counter = 0;
                } else {
                    new_content.text[new_content.totalPages] = new_content.text[new_content.totalPages].substring(0, start) + '<br>' + new_content.text[new_content.totalPages].substring(start+1, end);
                    row_counter = end - start - 1;  //check here
                }
            }
            prev_length = new_content.text[new_content.totalPages].length;
        }
        
        if (row_counter == 0) {
            line_counter--;
        }
        
    });

    return new_content;
}

function findPreviousSpace(content, index) {
    for (; index>0; index--) {
        if(/\s/.test(content[index])) {
            return index;
        }
    }
}

function presentationEnd() {
    stopPrevBar[stopPrevBar_i] = true;

    $('#progress-bar').css("width", 100 + "%");
    $('#header').hide();
    $('#show_post').hide();
    $('#footer').hide();

    var loadingTheme = createLoadingTheme();
    $("#mesa_container").empty();
    $("#mesa_container").append(loadingTheme);
    $('#loading_text').html('Αναμονή για δεδομένα...');
}

function createLoadingTheme() {
    var loadingTheme = $('<div id="loading_main_theme">' + 
        '<p id="main_theme"><span>M</span><span>E</span><span>S</span><span>A</span></p>' +
        '<p id="loading_text"></p>' +
    '</div>');

    return loadingTheme;
}