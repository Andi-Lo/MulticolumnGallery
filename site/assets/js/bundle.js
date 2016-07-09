(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


// require modules via browserify's 'require' statement
var columnBuilder = require('./ColumnBuilder');
var resizeController = require('./ResizeController');
var scrollController = require('./ScrollController');

// some pseudo constants for better reading
var REQUEST_PENDING = 2;
var REQUEST_SUCCESS = 4;

// the ajax data request result object
var requestResult;

// static property
var galleryController = (function() {
  var galleryController = ''; // This is the private persistent value
   return function() { return galleryController; }; 
})(); // Invoke the outer function after defining it.


// static property
var colBuilder = (function() {
  var colBuilder = ''; // This is the private persistent value
   return function() { return colBuilder; };
})(); // Invoke the outer function after defining it.


// this is the js entry point. After loading the dom, get startet to request the gallery.php file
window.addEventListener('DOMContentLoaded', function(){
  var gal = new GalleryFactory();
  gal.requestGallery();

}, false);

/**
 * After the ajax request success, create controller instances and add event listeners to the document
 */
var addControllers = function (){
  var scrlCtrl = new scrollController(requestResult, colBuilder);
  var resizeCtrl = new resizeController(requestResult, colBuilder);
  galleryController = {'scrlCtrl': scrlCtrl, 'resizeCtrl': resizeCtrl};

  resizeCtrl.setController(galleryController);
  scrlCtrl.setController(galleryController);

  window.addEventListener('scroll', scrollWrapper, false);
  window.addEventListener('resize', updateWidth, false);
  window.addEventListener('resize', resizeWrapper, false);
  return galleryController;
};

var scrollWrapper = function() {
  galleryController.scrlCtrl.handleScroll(colBuilder, galleryController, requestResult);
};

var resizeWrapper = function() {
  galleryController.resizeCtrl.handleResize(colBuilder, galleryController, requestResult);
};

var updateWidth = function() {
  galleryController.scrlCtrl.updateWidth(galleryController);
};

/**
 * Gallery Factory for creating gallery Objects
 * Makes the Ajax server request to get the gallery.php file
 */
var GalleryFactory = function () {
  'use strict';

  this.hasColumns = -1;
  this.columns = 0;
  this.names = "";
  this.resize = "";
  this.fadeIn = "";
  this.columnHeight = "";
  this.galleryHeight = 0;
  this.gallery = document.getElementById('gallery');
  this.galleryWidth = gallery.offsetWidth;
  this.galleryHeight = gallery.offsetHeight;
  this.windowWidth = window.innerWidth;
  this.windowHeight = window.innerHeight;
  this.sData = {
                'width': this.windowWidth,
                'galleryWidth': this.galleryWidth
               };

  /**
   * urlEncodes an object to send it via post
   * @param  {Object} object Object with key value pairs
   * @return {String}        string in format key=value&foo=bar
   */
  var urlEncode = function (object) {
    var encodedString = '';
    for (var prop in object) {
      if (object.hasOwnProperty(prop)) {
        if (encodedString.length > 0) {
            encodedString += '&';
        }
        encodedString += encodeURI(prop + '=' + object[prop]);
      }
    }
    return encodedString;
  };

  /**
   * Sends an Ajax request to the server and recieves the gallery
   * @return {boolean}     true on success false on failure
   */
  this.requestGallery = function() {
    var request = new XMLHttpRequest();
    request.open('POST', 'php/Gallery.php', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    // check ajax requests states and show a spinner while request is pending
    request.onreadystatechange = function(){
      switch(request.readyState) {
        case REQUEST_PENDING:
          console.log('pending');
          document.getElementsByClassName('ajax-loading')[0].style.display = 'block';
          break;
        case REQUEST_SUCCESS:
          console.log('success');
          document.getElementsByClassName('ajax-loading')[0].style.display = 'none';
      }
    };

    // handles the ajax onload event
    request.onload = function() {

      if (request.status >= 200 && request.status < 400) {

        /* Success! */
        var data = JSON.parse(request.responseText);
        console.log(data);
        requestResult = data;
        colBuilder = new columnBuilder.ColumnBuilder(requestResult);
        this.columns = data.numOfColumns;
        this.queries = data.mediaQueries;
        this.names = data.columnNames;
        this.resize = data.resize;
        this.fadeIn = data.fadeIn;
        this.columnHeight = data.columnHeight;
        this.activeColumn = data.activeColumn +"_Columns";
        this.galleryHeight = data.galleryHeight;

        var controller = addControllers();
        
        for (var i = 0; i < this.columns; i++) {
          if(i === 0){
            colBuilder.buildColumn(this.names[i], requestResult);
            controller.scrlCtrl.refreshScreen(controller.scrlCtrl);
          }else{
            if(window.innerWidth >= this.queries[i]){
              colBuilder.buildColumn(this.activeColumn, requestResult);
              controller.scrlCtrl.refreshScreen(controller.scrlCtrl);
            }
          }
        }
        return true;
      } else {
        /* We reached our target server, but it returned an error */
        return false;
      }
    };

    // ajax request failed
    request.onerror = function() {
      console.log("Ajax Error: "+ err);
      return false;
    };

    /* send ajax request to server */
    request.send(urlEncode(this.sData));
    return true;
  };
};
},{"./ColumnBuilder":2,"./ResizeController":3,"./ScrollController":4}],2:[function(require,module,exports){
/*
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

/**
 * Build html columns out of the data gotten from the Ajax request
 * @param  {String} columnName    the columns name
 * @param  {object} requestResult an object containing the requests data
 * @method {int}    getTmpColumn()
 * @exports tmpColumn
 * @exports ColumnBuiler
 */
var ColumnBuilder = function () {
  'use strict';

  this.buildColumn = function (columnName, requestResult) {
    var galleryHeight = requestResult.galleryHeight;
    var tmp = columnName.split('_');
    var columnNumber = parseInt(tmp[0], 10) - 1;
    var gallery = document.getElementById('gallery');
    var winHeight = window.innerHeight + window.pageYOffset;
    var images = gallery.getElementsByClassName('mult-image');
    var galleryPosY = gallery.getBoundingClientRect().top;

    if (tmpColumn != columnNumber) {
      tmpColumn = columnNumber;
      gallery.setAttribute('style', 'height: '+ galleryHeight[columnNumber]+'px;');

      if(images.length !== 0){
        for (var i = images.length - 1; i >= 0; i--) {
          images[i].remove();
        }
      }

      requestResult[columnName].forEach(function(image, i){
        if (typeof image == 'object' && image !== null) {
          var elem;
          // console.log('img pos ' + (image.posY + galleryPosY) + ' wh: ' + (winHeight+300));
          /* image position is in the users screensize -> image is visible */
          if (image.posY <= winHeight && galleryPosY <= winHeight){
            elem = buildImageElement(image, 'visible');
            gallery.appendChild(elem);    
          }
          else if ((image.posY + galleryPosY) <= winHeight + 200) {
            // console.log('img pos ' + (image.posY + galleryPosY) + ' wh: ' + (winHeight+200));
            elem = buildImageElement(image, 'hidden');
            gallery.appendChild(elem);
          }
        } else
          return false;
      });
      return true;
    }
  };

  var buildImageElement = function (image, visiblity) {
    var outerImg = document.createElement('a');
    var innerImg = document.createElement('img');
    var opacity = visiblity == 'visible' ? 1 : 0;

    outerImg.setAttribute('class', 'mult-image');
    outerImg.setAttribute('href', image.imgPath);
    outerImg.setAttribute('title', image.imgName);

    innerImg.setAttribute('class', "mult-image-inner");
    innerImg.setAttribute('style', 'position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; width:' + image.width + 'px; height:' + image.height  + 'px; visibility:' + visiblity + '; ' + 'opacity: ' + opacity + ';');
    innerImg.setAttribute('src',  image.thumbPath);
    innerImg.setAttribute('alt', image.imgName);
    innerImg.setAttribute('width', image.width);
    innerImg.setAttribute('height', image.height);

    outerImg.appendChild(innerImg);
    return outerImg;
  };

  this.addImgToColumn = function (columnName, scrollPos, requestResult) {
    var elem = "";
    var gallery = document.getElementById('gallery');
    var galleryPosY = gallery.getBoundingClientRect().top;
    var activeColumn = requestResult.activeColumn;

    requestResult[columnName].forEach(function(image, i){
      if (typeof image == 'object' && image !== null) {
        // console.log(image.id + ' ' + imgId + ' ' +  (image.id - imgId));
        if (image.id > imgId && (image.id - imgId <= 1)) {
          // image gets loaded but is hidden till user scrolls there
          if (activeColumn == "1_Columns" && (image.posY + galleryPosY) <= scrollPos + 500) {
            elem = buildImageElement(image, 'hidden');
            gallery.appendChild(elem);
            imgId = image.id;
          } else if ((image.posY + galleryPosY) <= scrollPos + 200) {
            elem = buildImageElement(image, 'hidden');
            gallery.appendChild(elem);
            imgId = image.id;
          } else
            return;
        } else
          return;
      } else
        return;
    });

    return true;
  }; // end addImgToColumn
};

ColumnBuilder.prototype.getTmpColumn = function() {
  return tmpColumn;
};

// static varibles

var tmpColumn = (function() {
   var tmpColumn = -1; // This is the private persistent value
   // The outer function returns a nested function that has access
   // to the persistent value.  It is this nested function we're storing
   // in the variable uniqueID above.
   return function() { return tmpColumn; };  // Return and increment
})(); // Invoke the outer function after defining it.

var imgId = -1;

module.exports.tmpColumn = tmpColumn;
module.exports.ColumnBuilder = ColumnBuilder;

},{}],3:[function(require,module,exports){
/*
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


/**
 * Controller-Class for handling Resize events
 * @methods handleResize(ColumnBuilder, GalleryController, collection)
 * @exports ResizeController
 */
var ResizeController = function(requestResult, columnBuilder){
  'use strict';

  this.requestResult = requestResult;
  this.winWidth = window.innerWidth;
  this.winHeight = window.innerHeight;
  this.names = requestResult.columnNames;
  this.columns = requestResult.numOfColumns;
  this.queries = requestResult.mediaQueries;
  this.resize = requestResult.resize;
  this.galleryCtrl = '';
  this.columnBuilder = columnBuilder;
  
  this.getColumnBuilder = function() {
    return this.columnBuilder;
  };

  this.getGalleryController = function(){
    return this.galleryCtrl;
  };

};

ResizeController.prototype.setController = function(galleryCtrl){
  this.galleryCtrl = galleryCtrl;
};

/**
 * Handler for the onresize event
 * @param  {ColumnBuilder} colBuilder         A Columnbuilder object 
 * @param  {GalleryController} galleryCtrl    The galleryControler instance
 * @param  {Collection} requestResult         The Ajax request result data
 */
ResizeController.prototype.handleResize = function(colBuilder, galleryCtrl, requestResult) {
  var resizeCtrl = galleryCtrl.resizeCtrl;
  var scrlCtrl = galleryCtrl.scrlCtrl;
  var names = requestResult.columnNames;
  var columns = requestResult.numOfColumns;
  var queries = requestResult.mediaQueries;
  var resize = requestResult.resize;

  /* if in config.json file "resize" is set to "yes" */
  if(resize == 'yes'){
    /* handle the first column (1) */
    if(window.innerWidth <= queries[0]){
      colBuilder.buildColumn(names[0], requestResult);
      scrlCtrl.refreshScreen(scrlCtrl);
      return;
    } 

    /* handle the last column (n) */
    else if(window.innerWidth >= queries[queries.length-1]){
      colBuilder.buildColumn(names[columns-1], requestResult);
      scrlCtrl.refreshScreen(scrlCtrl);
      return;
    }

    /* handle columns between 2 and n-1 */
    else if(window.innerWidth >= queries[0]){
      for (var query = 0; query <= columns-1; query++){
        if(window.innerWidth <= queries[query]){
          colBuilder.buildColumn(names[query-1], requestResult);
          scrlCtrl.refreshScreen(scrlCtrl);
          return;
        }
      }
    }
  }
};

module.exports = ResizeController;

},{}],4:[function(require,module,exports){
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
},{}]},{},[1]);

//# sourceMappingURL=bundle.js.map
