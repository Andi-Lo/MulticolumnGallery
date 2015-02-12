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

var scrollPosSave = 0;

/**
 * Controller-Class to calculate if the picture visibility has to be changed
 */
var ScrollController = function() {

  // this.scrollPosSave = 0;
  this.scrollEvents = 0;
  this.innerWinHeight = window.innerHeight;
  this.scrollHeight = this.innerWinHeight;
  this.isInit = false;
  this.winWidth = window.innerWidth;
  this.timeoutId = 0;
  this.names = requestResult.columnNames;


  /**
   * [Description]
   * @param  {[type]} offset [description]
   * @return {[type]}        [description]
   */
  this.refreshScreenOnScroll = function (offset) {
    var scrlCtrl = galleryController.scrlCtrl;
    var fadeIn = requestResult.fadeIn,
        scrlPos = scrlCtrl.innerWinHeight + window.pageYOffset;

    $('.image-inner').each(function(){
      var cssTopValue = parseInt($(this).css('top'), 10);
      var isVisible = $(this).css('visibility');

      /* to see a Visual effect of unhiding a picture I use an offset of -100 */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      if(scrlPos - offset >= cssTopValue && cssTopValue != 'NaN' && isVisible == 'hidden'){
        if(fadeIn == 'yes'){
          $(this).css({opacity: 0.0, visibility: "visible"}).animate({opacity: 1.0});
        } else{
          $(this).css("visibility", "visible");
        }
        scrollPosSave = scrlPos;
      }
    });
  };

  /**
   * [refreshScreen description]
   * @return {[type]} [description]
   */
  this.refreshScreen = function (scrlCtrl) {
    // console.log('refreshScreen');
    var scrlPos = this.innerWinHeight + $(window).scrollTop();
    $('.image-inner').each(function(){
      var cssTopValue = parseInt($(this).css('top'), 10);
      /* to see a Visual effect of unhiding a picture I use an offset of -100 */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      if(scrlPos >= cssTopValue && cssTopValue != 'NaN')
      {
        $(this).css("visibility", "visible");
        scrollPosSave = scrlPos;
      }
    });
  };
  // window.addEventListener('resize', updateWidth, true);
  // window.addEventListener('scroll', refreshScreen, true);

};

ScrollController.prototype.updateWidth = function(){
  var scrlCtrl = galleryController.scrlCtrl;
  scrlCtrl.winWidth = $(window).innerWidth();
};


ScrollController.prototype.handleScroll = function(){
  var scrlCtrl = galleryController.scrlCtrl;
  var newScrollPos = scrlCtrl.innerWinHeight + window.pageYOffset;

  if(newScrollPos > scrollPosSave){
    scrlCtrl.scrollEvents++;

    if(window.innerWidth > 767 || scrlCtrl.isInit === false){
      scrlCtrl.isInit = true;
      scrlCtrl.refreshScreenOnScroll(100);
    } 
    else{
      if(window.innerWidth <= 768 || scrlCtrl.isInit === false){
        scrlCtrl.scrollEvents = 0;
        scrlCtrl.isInit = true;
        scrlCtrl.refreshScreenOnScroll(30);
      }
    }
    /* lazy loading: Adds images depending on the Users scrolling position */
    if(scrlCtrl.timeoutId){
      clearTimeout(scrlCtrl.timeoutId);  
    }

    /* if the user scrolled down and not up && the user scrolled down more then 300 pixels*/
    scrlCtrl.timeoutId = setTimeout(function(){
      addImgToColumn(scrlCtrl.names[tmpColumn], newScrollPos);
      scrlCtrl.refreshScreenOnScroll(30);

    }, 50);
    // end timeout
  } 
};