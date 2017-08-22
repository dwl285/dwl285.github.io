

var main = function() {
  $('.projectbox').hover(function() {
  	$(this).addClass('projecthover');
  }, function() {
  	$(this).removeClass('projecthover');
  });
};


$(document).ready(main);