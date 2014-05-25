/**
 * Multicolumn image gallery by Andreas Lorer
 * http://andreaslorer.de
 * 
 * GNU General Public License, version 2
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * Examples and documentation available on the project homepage
 * http://bithugger.github.io/MulticolumnGallery/
 * 
 */
 
var oldScrlPos = 0;
var scrollEvents = 0;
var innerWinHeight = $(window).innerHeight();
var isInit = false;	
var winWidth = $(window).innerWidth();		

/* func to calculate if the picture visibility has to be changed */
jQuery(document).ready(function($) {
	$(window).scroll(function() {
		var newScrlPos = innerWinHeight + $(window).scrollTop();
		if(oldScrlPos < newScrlPos){
			scrollEvents++;
			if(winWidth > 631 || isInit == false){
					isInit = true;
					refreshScreenOnScroll(100);
				}	
			else{
				if(scrollEvents > 0 || isInit == false){
					scrollEvents = 0;
					isInit = true;
					refreshScreenOnScroll(30);
				}
			}
		} 
	});
});

$(function(){
	$(window).resize(function(){
		winWidth = $(window).innerWidth();
	})
});

function refreshScreenOnScroll(offset) {
	var scrlPos = innerWinHeight + $(window).scrollTop();
	$('.images').each(function(){
		var cssTopValue = parseInt($(this).css('top'), 10);
		var isVisible = $(this).css('visibility');
		/* to see a Visual effect of unhiding a picture I use an offset of -100 */
		/* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
		if(scrlPos - offset >= cssTopValue && cssTopValue != 'NaN' && isVisible == 'hidden')
		{
			if(fadeIn == 'yes'){
				$(this).css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0});
			} else{
				$(this).css("visibility", "visible");
			}
			oldScrlPos = scrlPos;
		}
	});
}

function refreshScreen() {
	var scrlPos = innerWinHeight + $(window).scrollTop();
	$('.images').each(function(){
		var cssTopValue = parseInt($(this).css('top'), 10);
		/* to see a Visual effect of unhiding a picture I use an offset of -100 */
		/* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
		if(scrlPos >= cssTopValue && cssTopValue != 'NaN')
		{
			$(this).css("visibility", "visible");
			oldScrlPos = scrlPos;
		}
	});
}

