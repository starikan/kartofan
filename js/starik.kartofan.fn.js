String.prototype.format = function() {
    var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
        ;
     });
 };


// MAIN MENU VIEW
(function(){
    $('.cssmenu > ul > li ul').each(function(index, e){
      var count = $(e).find('li').length;
      var content = '<span class="cnt">' + count + '</span>';
      $(e).closest('li').children('a').append(content);
    });
    $('.cssmenu ul ul li:odd').addClass('odd');
    $('.cssmenu ul ul li:even').addClass('even');
    $('.cssmenu > ul > li > a').click(function() {
      $('.cssmenu li').removeClass('active');
      $(this).closest('li').addClass('active'); 
      var checkElement = $(this).next();
      if((checkElement.is('ul')) && (checkElement.is(':visible'))) {
        $(this).closest('li').removeClass('active');
        checkElement.slideUp('normal');
      }
      if((checkElement.is('ul')) && (!checkElement.is(':visible'))) {
        $('.cssmenu ul ul:visible').slideUp('normal');
        checkElement.slideDown('normal');
      }
      if($(this).closest('li').find('ul').children().length == 0) {
        return true;
      } else {
        return false;   
      }     
    });
 })();


// isArray shim
if (! Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
    };
 }