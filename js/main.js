

var main = function() {
  $('.projectbox').hover(function() {
  	$(this).addClass('projecthover');
  	console.log("test");
  	$(this).find('div.description').fadeIn(20);
  }, function() {
  	$(this).removeClass('projecthover');
  	$(this).find('div.description').fadeOut(20);
  });
};


$(document).ready(main);