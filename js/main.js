

var main = function() {
  // if hovering on prject box, show description and add shadow
  $('.projectbox').hover(function() {
  	$(this).addClass('projecthover');
  	console.log("test");
  	$(this).find('div.description').fadeIn(20);
  }, function() {
  	$(this).removeClass('projecthover');
  	$(this).find('div.description').fadeOut(20);
  });
  
  $('.projectselector li').click(function() {
    var category = $(this).attr('class');
    if(category==="selector-js") {
      $('.projectbox').removeClass('selected');
      $('.js').addClass('selected');
    }
    else if(category==="selector-html") {
      $('.projectbox').removeClass('selected');
      $('.html').addClass('selected');
    }
    else if(category==="selector-fun") {
      $('.projectbox').removeClass('selected');
      $('.fun').addClass('selected');
    }
    else if(category==="selector-all") {
      $('.projectbox').addClass('selected')
    }

    $('.projectselector li').removeClass('active');
    $(this).addClass('active');
  });
};


$(document).ready(main);