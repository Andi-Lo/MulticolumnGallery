/**
 * Multicolumn image gallery by Andreas Lorer
 * http://andreaslorer.de
 * 
 * GNU General Public License, version 2
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * Examples and documentation available on the project homepage
 * http://andi-lo.github.io/MulticolumnGallery/
 * 
 */

var scrollPosSave = 0;

/**
 * Controller-Class to calculate, observe and manage if the picture visibility 
 * has to be changed
 * @method handleScroll(ColumnBuilder, GalleryController, Collection)
 * @method ScrollController(collection, ColumnBuilder)  the constructor
 * @method setController(GalleryController)
 * @method GalleryController getGalleryController()
 * @method setColumnBuilder(ColumnBuilder)
 * @method updateWidth(GalleryController)
 */
var ScrollController = function(requestResult, columnBuilder) {
  'use strict';

  requestResult = requestResult;
  this.scrollEvents = 0;
  this.innerWinHeight = window.innerHeight;
  this.scrollHeight = this.innerWinHeight;
  this.winWidth = window.innerWidth;
  this.timeoutId = 0;
  this.names = requestResult.columnNames;
  this.columnBuilder = columnBuilder;
  this.galleryCtrl = '';

  this.getColumnBuilder = function() {
    return this.columnBuilder;
  };

  /**
   * Animation function to animate a fade in effect on a given DOM element
   * (note: this is the Javascript version of JQuery's $.animate)
   * @param  {Element} el  A DOM element
   */
  this.fadeIn = function (el) {
    el[0].style.opacity = 0;

    var last = +new Date();
    var tick = function() {
      el[0].style.opacity = +el[0].style.opacity + (new Date() - last) / 400;
      last = +new Date();

      if (+el[0].style.opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
      }
    };
    tick();
  };

  /**
   * refreshes the users viewport when scrolling through the pictrues
   * @param  {int}              offset    simulate a bigger viewport by increasing it by a number
   * @param  {ScrollController} scrlCtrl  an instance of the ScrollController
   */
  this.refreshScreenOnScroll = function (offset, scrlCtrl) {
    var fadeIn = requestResult.fadeIn;
    var scrlPos = window.pageYOffset;

    var images = document.getElementsByClassName('mult-image-inner');

    for (var i = images.length - 1; i >= 0; i--) {
      var style = window.getComputedStyle(images[i]),
          cssTopValue = parseInt(style.getPropertyValue('top'), 10),
          isHidden = images[i].style.visibility;

      /* to see a Visual effect of unhiding a picture I use an offset of -100 */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      var tmp = scrlPos - offset;
      // console.log(tmp + ' >= ' + cssTopValue + ' && ' + cssTopValue + ' != NAN ' + isHidden + ' == hidden' + ' fadeIn = '+fadeIn);
      if(tmp >= cssTopValue && cssTopValue != 'NaN' && isHidden == 'hidden') {
        images[i].style.visibility = 'visible';
        if(fadeIn == 'yes'){
          if(images[i].style.opacity < 1) {
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
    var scrlPos = window.pageYOffset;
    var images = document.getElementsByClassName('mult-image-inner');

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
    }
  };

};

ScrollController.prototype.setController = function(galleryCtrl){
  galleryCtrl = galleryCtrl;
};

ScrollController.prototype.getGalleryController = function(){
  return this.galleryCtrl;
};

ScrollController.prototype.setColumnBuilder = function(columnBuilder) {
  this.columnBuilder = columnBuilder;
};

ScrollController.prototype.updateWidth = function(galleryController){
  var scrlCtrl = galleryController.scrlCtrl;
  scrlCtrl.winWidth = window.innerWidth;
};

/**
 * Handler for the onscroll event
 * @param  {ColumnBuilder}      columnBuilder  A columnBuilder object to build columns
 * @param  {GalleryController}  galleryCtrl    The galleryController which contains two instances: Scrollcontroller, ResizeController
 * @param  {Collection}         requestResult  Ajax request result data collection @see class Ajax
 */
ScrollController.prototype.handleScroll = function(columnBuilder, galleryCtrl, requestResult){
  var scrlCtrl = galleryCtrl.scrlCtrl;
  var newScrollPos = scrlCtrl.innerWinHeight + window.pageYOffset;

  /* lazy loading: Adds images depending on the Users scrolling position */
  if(newScrollPos > scrollPosSave){

    if(window.innerWidth > 767){
      scrlCtrl.refreshScreenOnScroll(100, scrlCtrl);
    } 
    else{
      if(window.innerWidth <= 768){
        scrlCtrl.refreshScreenOnScroll(30, scrlCtrl);
      }
    }

    if(scrlCtrl.timeoutId){
      clearTimeout(scrlCtrl.timeoutId);
    }

    /* if the user scrolled down and not up && the user scrolled down more then 300 pixels*/
    scrlCtrl.timeoutId = setTimeout(function(){
      columnBuilder.addImgToColumn(scrlCtrl.names[columnBuilder.getTmpColumn()], newScrollPos, requestResult);
      scrlCtrl.refreshScreenOnScroll(30, scrlCtrl);

    }, 50);
    // end timeout
  } 
};

var requestResult = (function() {
   var requestResult = ''; // This is the private persistent value
   return function() { return requestResult; }; 
})(); // Invoke the outer function after defining it.

module.exports = ScrollController;