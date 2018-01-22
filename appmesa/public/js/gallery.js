
function displayPhotos(url, element) {
	var index = $(element).parent().index();
	var mesa_data = $(element).closest('#gallery_container').attr('mesa-data');
	var total = $(element).closest('#gallery_container').find('div').find('div').length;

	carouselController(total, index, url, mesa_data);
	$('#trslphotos').modal();
}

function carouselController(total, index, src, mesa_data) {
	var newPrevIndex = parseInt(index) - 1;
	var newNextIndex = parseInt(index) + 1;
	
	if(total === newNextIndex){
	    $('a.right').hide();
	}else{
	    $('a.right').show()
		$('.shownext').attr('href', newNextIndex);
		$('.shownext').attr('mesa-data', mesa_data);
	}
	
	if(newPrevIndex === -1){
	    $('a.left').hide();
	}else{
	    $('a.left').show()
		$('.showprev').attr('href', newPrevIndex);
		$('.showprev').attr('mesa-data', mesa_data);
	}

	$('.modal-body img').attr('src', src);
}

$(window).on('load', function () {
	/*$('#trslphotos').on('shown.bs.modal', function (a) {
		var clickedImageUrl = a.relatedTarget.childNodes[0].src;
		displayPhotos(clickedImageUrl, a.relatedTarget.childNodes[0]);
	});*/

	$(document).on('click', '.tile', function() {
        var clickedImageUrl = $(this).find('img').attr('src');
        displayPhotos(clickedImageUrl, this);
    });

	$('#trslphotos').on('hidden.bs.modal', function(){
		$('.modal-body img').attr('src','');
		$('.shownext').attr('href', '');
		$('.shownext').attr('mesa-data', '');
		$('.showprev').attr('href', '');
		$('.showprev').attr('mesa-data', '');
  	});

  	$(document).on('click', 'a.carousel-control', function(){
		var index = $(this).attr('href');
		var mesa_data = $(this).attr('mesa-data');

		var total = $('#gallery_container[mesa-data="' + mesa_data + '"]').find('div').find('div').length;
		var src = $('#gallery_container[mesa-data="' + mesa_data + '"]').find('div').find('div:nth-child('+ (parseInt(index)+1) +') img').attr('src');
  		carouselController(total, index, src, mesa_data);
		return false;
	});
});