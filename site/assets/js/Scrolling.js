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

  this.fadeIn = function (el) {
    el[0].style.opacity = 0;

    var last = +new Date();
    var tick = function() {
      el[0].style.opacity = +el[0].style.opacity + (new Date() - last) / 400;
      last = +new Date();

      if (+el[0].style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
      }
    };
    tick();
  }

  /**
   * [Description]
   * @param  {[type]} offset [description]
   * @return {[type]}        [description]
   */
  this.refreshScreenOnScroll = function (offset) {
    var scrlCtrl = galleryController.scrlCtrl;
    var fadeIn = requestResult.fadeIn,
        scrlPos = scrlCtrl.innerWinHeight + window.pageYOffset;

    var images = document.getElementsByClassName('image-inner');

    for (var i = images.length - 1; i >= 0; i--) {
      var style = window.getComputedStyle(images[i]);
      var cssTopValue = parseInt(style.getPropertyValue('top'), 10);
      var isHidden = images[i].style.visibility;

      /* to see a Visual effect of unhiding a picture I use an offset of -100 */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      if(scrlPos - offset >= cssTopValue && cssTopValue != 'NaN' && isHidden == 'hidden'){
        images[i].style.visibility = 'visible';
        if(fadeIn == 'yes'){
          if(images[i].style.opacity == 0) {
            scrlCtrl.fadeIn([images[i]]);
          }
        } 
        scrollPosSave = scrlPos;
      }
    }
  };

  /**
   * [refreshScreen description]
   * @return {[type]} [description]
   */
  this.refreshScreen = function (scrlCtrl) {

    var scrlPos = this.innerWinHeight + window.pageYOffset;
    var images = document.getElementsByClassName('image-inner');

    for (var i = images.length - 1; i >= 0; i--) {
      var style = window.getComputedStyle(images[i]);
      var cssTopValue = parseInt(style.getPropertyValue('top'), 10);
      /* to see a Visual effect of unhiding a picture I use an offset of -100px */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      if(scrlPos >= cssTopValue && cssTopValue != 'NaN')
      {
        images[i].style.visibility = 'visible';
        scrollPosSave = scrlPos;
      }
    };
  };
  // window.addEventListener('resize', updateWidth, true);
  // window.addEventListener('scroll', refreshScreen, true);

};

ScrollController.prototype.updateWidth = function(){
  var scrlCtrl = galleryController.scrlCtrl;
  scrlCtrl.winWidth = window.innerWidth;
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
      getColumnBuilder().addImgToColumn(scrlCtrl.names[tmpColumn], newScrollPos);
      scrlCtrl.refreshScreenOnScroll(30);

    }, 50);
    // end timeout
  } 
};