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

require('../magnific-popup/magnific-popup.js');

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
          // console.log('pending');
          document.getElementsByClassName('ajax-loading')[0].style.display = 'block';
          break;
        case REQUEST_SUCCESS:
          // console.log('success');
          document.getElementsByClassName('ajax-loading')[0].style.display = 'none';
      }
    };

    // handles the ajax onload event
    request.onload = function() {

      if (request.status >= 200 && request.status < 400) {

        /* Success! */
        var data = JSON.parse(request.responseText);
        // console.log(data);
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
},{"../magnific-popup/magnific-popup.js":5,"./ColumnBuilder":2,"./ResizeController":3,"./ScrollController":4}],2:[function(require,module,exports){
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
  this.scrollPosSave = 0;
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
      var style = window.getComputedStyle(images[i]);
      var cssTopValue = parseInt(style.getPropertyValue('top'), 10);
      var isHidden = images[i].style.visibility;

      /* to see a Visual effect of unhiding a picture I use an offset of e.g. -100 */
      /* != 'NaN' because css.('top') returns the 'top' value and 'auto', parsing 'auto' will return a value or 'NaN' */
      var tmp = scrlPos + 150;
      // console.log(tmp + ' >= ' + cssTopValue + ' ' + isHidden + ' == ishidden');
      if(tmp >= cssTopValue && cssTopValue != 'NaN' && isHidden == 'hidden') {

        images[i].style.visibility = 'visible';
        if(fadeIn == 'yes'){
          if(images[i].style.opacity < 1) {
            scrlCtrl.fadeIn([images[i]]);
          }
        } 
        this.setScrollPosSave(cssTopValue);
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
        this.setScrollPosSave(cssTopValue);
      }
    }
  };

};

ScrollController.prototype.getScrollPosSave = function () {
  return this.scrollPosSave;
};

ScrollController.prototype.setScrollPosSave = function (scrollSave) {
  this.scrollPosSave = scrollSave;
};

ScrollController.prototype.setController = function(galleryCtrl){
  this.galleryCtrl = galleryCtrl;
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
  if(newScrollPos > this.getScrollPosSave()){
    // console.log('newscrlpo: ' + newScrollPos + ' old scrl pos: ' + this.getScrollPosSave());
    if(window.innerWidth > 767){
      scrlCtrl.refreshScreenOnScroll(150, scrlCtrl);
    } 
    else{
      if(window.innerWidth <= 768){
        scrlCtrl.refreshScreenOnScroll(300, scrlCtrl);
      }
    }

    if(scrlCtrl.timeoutId){
      clearTimeout(scrlCtrl.timeoutId);
    }

    /* if the user scrolled down and not up && the user scrolled down more then 300 pixels*/
    scrlCtrl.timeoutId = setTimeout(function(){
      columnBuilder.addImgToColumn(scrlCtrl.names[columnBuilder.getTmpColumn()], newScrollPos, requestResult);
      scrlCtrl.refreshScreenOnScroll(300, scrlCtrl);

    }, 50);
    // end timeout
  } 
};

var requestResult = (function() {
   var requestResult = ''; // This is the private persistent value
   return function() { return requestResult; }; 
})(); // Invoke the outer function after defining it.

module.exports = ScrollController;
},{}],5:[function(require,module,exports){
// Magnific Popup v0.9.9 by Dmitry Semenov
// http://bit.ly/magnific-popup#build=inline+image+gallery+retina+fastclick
(function(a){var b="Close",c="BeforeClose",d="AfterClose",e="BeforeAppend",f="MarkupParse",g="Open",h="Change",i="mfp",j="."+i,k="mfp-ready",l="mfp-removing",m="mfp-prevent-close",n,o=function(){},p=!!window.jQuery,q,r=a(window),s,t,u,v,w,x=function(a,b){n.ev.on(i+a+j,b)},y=function(b,c,d,e){var f=document.createElement("div");return f.className="mfp-"+b,d&&(f.innerHTML=d),e?c&&c.appendChild(f):(f=a(f),c&&f.appendTo(c)),f},z=function(b,c){n.ev.triggerHandler(i+b,c),n.st.callbacks&&(b=b.charAt(0).toLowerCase()+b.slice(1),n.st.callbacks[b]&&n.st.callbacks[b].apply(n,a.isArray(c)?c:[c]))},A=function(b){if(b!==w||!n.currTemplate.closeBtn)n.currTemplate.closeBtn=a(n.st.closeMarkup.replace("%title%",n.st.tClose)),w=b;return n.currTemplate.closeBtn},B=function(){a.magnificPopup.instance||(n=new o,n.init(),a.magnificPopup.instance=n)},C=function(){var a=document.createElement("p").style,b=["ms","O","Moz","Webkit"];if(a.transition!==undefined)return!0;while(b.length)if(b.pop()+"Transition"in a)return!0;return!1};o.prototype={constructor:o,init:function(){var b=navigator.appVersion;n.isIE7=b.indexOf("MSIE 7.")!==-1,n.isIE8=b.indexOf("MSIE 8.")!==-1,n.isLowIE=n.isIE7||n.isIE8,n.isAndroid=/android/gi.test(b),n.isIOS=/iphone|ipad|ipod/gi.test(b),n.supportsTransition=C(),n.probablyMobile=n.isAndroid||n.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),t=a(document),n.popupsCache={}},open:function(b){s||(s=a(document.body));var c;if(b.isObj===!1){n.items=b.items.toArray(),n.index=0;var d=b.items,e;for(c=0;c<d.length;c++){e=d[c],e.parsed&&(e=e.el[0]);if(e===b.el[0]){n.index=c;break}}}else n.items=a.isArray(b.items)?b.items:[b.items],n.index=b.index||0;if(n.isOpen){n.updateItemHTML();return}n.types=[],v="",b.mainEl&&b.mainEl.length?n.ev=b.mainEl.eq(0):n.ev=t,b.key?(n.popupsCache[b.key]||(n.popupsCache[b.key]={}),n.currTemplate=n.popupsCache[b.key]):n.currTemplate={},n.st=a.extend(!0,{},a.magnificPopup.defaults,b),n.fixedContentPos=n.st.fixedContentPos==="auto"?!n.probablyMobile:n.st.fixedContentPos,n.st.modal&&(n.st.closeOnContentClick=!1,n.st.closeOnBgClick=!1,n.st.showCloseBtn=!1,n.st.enableEscapeKey=!1),n.bgOverlay||(n.bgOverlay=y("bg").on("click"+j,function(){n.close()}),n.wrap=y("wrap").attr("tabindex",-1).on("click"+j,function(a){n._checkIfClose(a.target)&&n.close()}),n.container=y("container",n.wrap)),n.contentContainer=y("content"),n.st.preloader&&(n.preloader=y("preloader",n.container,n.st.tLoading));var h=a.magnificPopup.modules;for(c=0;c<h.length;c++){var i=h[c];i=i.charAt(0).toUpperCase()+i.slice(1),n["init"+i].call(n)}z("BeforeOpen"),n.st.showCloseBtn&&(n.st.closeBtnInside?(x(f,function(a,b,c,d){c.close_replaceWith=A(d.type)}),v+=" mfp-close-btn-in"):n.wrap.append(A())),n.st.alignTop&&(v+=" mfp-align-top"),n.fixedContentPos?n.wrap.css({overflow:n.st.overflowY,overflowX:"hidden",overflowY:n.st.overflowY}):n.wrap.css({top:r.scrollTop(),position:"absolute"}),(n.st.fixedBgPos===!1||n.st.fixedBgPos==="auto"&&!n.fixedContentPos)&&n.bgOverlay.css({height:t.height(),position:"absolute"}),n.st.enableEscapeKey&&t.on("keyup"+j,function(a){a.keyCode===27&&n.close()}),r.on("resize"+j,function(){n.updateSize()}),n.st.closeOnContentClick||(v+=" mfp-auto-cursor"),v&&n.wrap.addClass(v);var l=n.wH=r.height(),m={};if(n.fixedContentPos&&n._hasScrollBar(l)){var o=n._getScrollbarSize();o&&(m.marginRight=o)}n.fixedContentPos&&(n.isIE7?a("body, html").css("overflow","hidden"):m.overflow="hidden");var p=n.st.mainClass;return n.isIE7&&(p+=" mfp-ie7"),p&&n._addClassToMFP(p),n.updateItemHTML(),z("BuildControls"),a("html").css(m),n.bgOverlay.add(n.wrap).prependTo(n.st.prependTo||s),n._lastFocusedEl=document.activeElement,setTimeout(function(){n.content?(n._addClassToMFP(k),n._setFocus()):n.bgOverlay.addClass(k),t.on("focusin"+j,n._onFocusIn)},16),n.isOpen=!0,n.updateSize(l),z(g),b},close:function(){if(!n.isOpen)return;z(c),n.isOpen=!1,n.st.removalDelay&&!n.isLowIE&&n.supportsTransition?(n._addClassToMFP(l),setTimeout(function(){n._close()},n.st.removalDelay)):n._close()},_close:function(){z(b);var c=l+" "+k+" ";n.bgOverlay.detach(),n.wrap.detach(),n.container.empty(),n.st.mainClass&&(c+=n.st.mainClass+" "),n._removeClassFromMFP(c);if(n.fixedContentPos){var e={marginRight:""};n.isIE7?a("body, html").css("overflow",""):e.overflow="",a("html").css(e)}t.off("keyup"+j+" focusin"+j),n.ev.off(j),n.wrap.attr("class","mfp-wrap").removeAttr("style"),n.bgOverlay.attr("class","mfp-bg"),n.container.attr("class","mfp-container"),n.st.showCloseBtn&&(!n.st.closeBtnInside||n.currTemplate[n.currItem.type]===!0)&&n.currTemplate.closeBtn&&n.currTemplate.closeBtn.detach(),n._lastFocusedEl&&a(n._lastFocusedEl).focus(),n.currItem=null,n.content=null,n.currTemplate=null,n.prevHeight=0,z(d)},updateSize:function(a){if(n.isIOS){var b=document.documentElement.clientWidth/window.innerWidth,c=window.innerHeight*b;n.wrap.css("height",c),n.wH=c}else n.wH=a||r.height();n.fixedContentPos||n.wrap.css("height",n.wH),z("Resize")},updateItemHTML:function(){var b=n.items[n.index];n.contentContainer.detach(),n.content&&n.content.detach(),b.parsed||(b=n.parseEl(n.index));var c=b.type;z("BeforeChange",[n.currItem?n.currItem.type:"",c]),n.currItem=b;if(!n.currTemplate[c]){var d=n.st[c]?n.st[c].markup:!1;z("FirstMarkupParse",d),d?n.currTemplate[c]=a(d):n.currTemplate[c]=!0}u&&u!==b.type&&n.container.removeClass("mfp-"+u+"-holder");var e=n["get"+c.charAt(0).toUpperCase()+c.slice(1)](b,n.currTemplate[c]);n.appendContent(e,c),b.preloaded=!0,z(h,b),u=b.type,n.container.prepend(n.contentContainer),z("AfterChange")},appendContent:function(a,b){n.content=a,a?n.st.showCloseBtn&&n.st.closeBtnInside&&n.currTemplate[b]===!0?n.content.find(".mfp-close").length||n.content.append(A()):n.content=a:n.content="",z(e),n.container.addClass("mfp-"+b+"-holder"),n.contentContainer.append(n.content)},parseEl:function(b){var c=n.items[b],d;c.tagName?c={el:a(c)}:(d=c.type,c={data:c,src:c.src});if(c.el){var e=n.types;for(var f=0;f<e.length;f++)if(c.el.hasClass("mfp-"+e[f])){d=e[f];break}c.src=c.el.attr("data-mfp-src"),c.src||(c.src=c.el.attr("href"))}return c.type=d||n.st.type||"inline",c.index=b,c.parsed=!0,n.items[b]=c,z("ElementParse",c),n.items[b]},addGroup:function(a,b){var c=function(c){c.mfpEl=this,n._openClick(c,a,b)};b||(b={});var d="click.magnificPopup";b.mainEl=a,b.items?(b.isObj=!0,a.off(d).on(d,c)):(b.isObj=!1,b.delegate?a.off(d).on(d,b.delegate,c):(b.items=a,a.off(d).on(d,c)))},_openClick:function(b,c,d){var e=d.midClick!==undefined?d.midClick:a.magnificPopup.defaults.midClick;if(!e&&(b.which===2||b.ctrlKey||b.metaKey))return;var f=d.disableOn!==undefined?d.disableOn:a.magnificPopup.defaults.disableOn;if(f)if(a.isFunction(f)){if(!f.call(n))return!0}else if(r.width()<f)return!0;b.type&&(b.preventDefault(),n.isOpen&&b.stopPropagation()),d.el=a(b.mfpEl),d.delegate&&(d.items=c.find(d.delegate)),n.open(d)},updateStatus:function(a,b){if(n.preloader){q!==a&&n.container.removeClass("mfp-s-"+q),!b&&a==="loading"&&(b=n.st.tLoading);var c={status:a,text:b};z("UpdateStatus",c),a=c.status,b=c.text,n.preloader.html(b),n.preloader.find("a").on("click",function(a){a.stopImmediatePropagation()}),n.container.addClass("mfp-s-"+a),q=a}},_checkIfClose:function(b){if(a(b).hasClass(m))return;var c=n.st.closeOnContentClick,d=n.st.closeOnBgClick;if(c&&d)return!0;if(!n.content||a(b).hasClass("mfp-close")||n.preloader&&b===n.preloader[0])return!0;if(b!==n.content[0]&&!a.contains(n.content[0],b)){if(d&&a.contains(document,b))return!0}else if(c)return!0;return!1},_addClassToMFP:function(a){n.bgOverlay.addClass(a),n.wrap.addClass(a)},_removeClassFromMFP:function(a){this.bgOverlay.removeClass(a),n.wrap.removeClass(a)},_hasScrollBar:function(a){return(n.isIE7?t.height():document.body.scrollHeight)>(a||r.height())},_setFocus:function(){(n.st.focus?n.content.find(n.st.focus).eq(0):n.wrap).focus()},_onFocusIn:function(b){if(b.target!==n.wrap[0]&&!a.contains(n.wrap[0],b.target))return n._setFocus(),!1},_parseMarkup:function(b,c,d){var e;d.data&&(c=a.extend(d.data,c)),z(f,[b,c,d]),a.each(c,function(a,c){if(c===undefined||c===!1)return!0;e=a.split("_");if(e.length>1){var d=b.find(j+"-"+e[0]);if(d.length>0){var f=e[1];f==="replaceWith"?d[0]!==c[0]&&d.replaceWith(c):f==="img"?d.is("img")?d.attr("src",c):d.replaceWith('<img src="'+c+'" class="'+d.attr("class")+'" />'):d.attr(e[1],c)}}else b.find(j+"-"+a).html(c)})},_getScrollbarSize:function(){if(n.scrollbarSize===undefined){var a=document.createElement("div");a.id="mfp-sbm",a.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(a),n.scrollbarSize=a.offsetWidth-a.clientWidth,document.body.removeChild(a)}return n.scrollbarSize}},a.magnificPopup={instance:null,proto:o.prototype,modules:[],open:function(b,c){return B(),b?b=a.extend(!0,{},b):b={},b.isObj=!0,b.index=c||0,this.instance.open(b)},close:function(){return a.magnificPopup.instance&&a.magnificPopup.instance.close()},registerModule:function(b,c){c.options&&(a.magnificPopup.defaults[b]=c.options),a.extend(this.proto,c.proto),this.modules.push(b)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',tClose:"Close (Esc)",tLoading:"Loading..."}},a.fn.magnificPopup=function(b){B();var c=a(this);if(typeof b=="string")if(b==="open"){var d,e=p?c.data("magnificPopup"):c[0].magnificPopup,f=parseInt(arguments[1],10)||0;e.items?d=e.items[f]:(d=c,e.delegate&&(d=d.find(e.delegate)),d=d.eq(f)),n._openClick({mfpEl:d},c,e)}else n.isOpen&&n[b].apply(n,Array.prototype.slice.call(arguments,1));else b=a.extend(!0,{},b),p?c.data("magnificPopup",b):c[0].magnificPopup=b,n.addGroup(c,b);return c};var D="inline",E,F,G,H=function(){G&&(F.after(G.addClass(E)).detach(),G=null)};a.magnificPopup.registerModule(D,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){n.types.push(D),x(b+"."+D,function(){H()})},getInline:function(b,c){H();if(b.src){var d=n.st.inline,e=a(b.src);if(e.length){var f=e[0].parentNode;f&&f.tagName&&(F||(E=d.hiddenClass,F=y(E),E="mfp-"+E),G=e.after(F).detach().removeClass(E)),n.updateStatus("ready")}else n.updateStatus("error",d.tNotFound),e=a("<div>");return b.inlineElement=e,e}return n.updateStatus("ready"),n._parseMarkup(c,{},b),c}}});var I,J=function(b){if(b.data&&b.data.title!==undefined)return b.data.title;var c=n.st.image.titleSrc;if(c){if(a.isFunction(c))return c.call(n,b);if(b.el)return b.el.attr(c)||""}return""};a.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var a=n.st.image,c=".image";n.types.push("image"),x(g+c,function(){n.currItem.type==="image"&&a.cursor&&s.addClass(a.cursor)}),x(b+c,function(){a.cursor&&s.removeClass(a.cursor),r.off("resize"+j)}),x("Resize"+c,n.resizeImage),n.isLowIE&&x("AfterChange",n.resizeImage)},resizeImage:function(){var a=n.currItem;if(!a||!a.img)return;if(n.st.image.verticalFit){var b=0;n.isLowIE&&(b=parseInt(a.img.css("padding-top"),10)+parseInt(a.img.css("padding-bottom"),10)),a.img.css("max-height",n.wH-b)}},_onImageHasSize:function(a){a.img&&(a.hasSize=!0,I&&clearInterval(I),a.isCheckingImgSize=!1,z("ImageHasSize",a),a.imgHidden&&(n.content&&n.content.removeClass("mfp-loading"),a.imgHidden=!1))},findImageSize:function(a){var b=0,c=a.img[0],d=function(e){I&&clearInterval(I),I=setInterval(function(){if(c.naturalWidth>0){n._onImageHasSize(a);return}b>200&&clearInterval(I),b++,b===3?d(10):b===40?d(50):b===100&&d(500)},e)};d(1)},getImage:function(b,c){var d=0,e=function(){b&&(b.img[0].complete?(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("ready")),b.hasSize=!0,b.loaded=!0,z("ImageLoadComplete")):(d++,d<200?setTimeout(e,100):f()))},f=function(){b&&(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("error",g.tError.replace("%url%",b.src))),b.hasSize=!0,b.loaded=!0,b.loadError=!0)},g=n.st.image,h=c.find(".mfp-img");if(h.length){var i=document.createElement("img");i.className="mfp-img",b.img=a(i).on("load.mfploader",e).on("error.mfploader",f),i.src=b.src,h.is("img")&&(b.img=b.img.clone()),i=b.img[0],i.naturalWidth>0?b.hasSize=!0:i.width||(b.hasSize=!1)}return n._parseMarkup(c,{title:J(b),img_replaceWith:b.img},b),n.resizeImage(),b.hasSize?(I&&clearInterval(I),b.loadError?(c.addClass("mfp-loading"),n.updateStatus("error",g.tError.replace("%url%",b.src))):(c.removeClass("mfp-loading"),n.updateStatus("ready")),c):(n.updateStatus("loading"),b.loading=!0,b.hasSize||(b.imgHidden=!0,c.addClass("mfp-loading"),n.findImageSize(b)),c)}}});var K,L=function(){return K===undefined&&(K=document.createElement("p").style.MozTransform!==undefined),K};a.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(a){return a.is("img")?a:a.find("img")}},proto:{initZoom:function(){var a=n.st.zoom,d=".zoom",e;if(!a.enabled||!n.supportsTransition)return;var f=a.duration,g=function(b){var c=b.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),d="all "+a.duration/1e3+"s "+a.easing,e={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},f="transition";return e["-webkit-"+f]=e["-moz-"+f]=e["-o-"+f]=e[f]=d,c.css(e),c},h=function(){n.content.css("visibility","visible")},i,j;x("BuildControls"+d,function(){if(n._allowZoom()){clearTimeout(i),n.content.css("visibility","hidden"),e=n._getItemToZoom();if(!e){h();return}j=g(e),j.css(n._getOffset()),n.wrap.append(j),i=setTimeout(function(){j.css(n._getOffset(!0)),i=setTimeout(function(){h(),setTimeout(function(){j.remove(),e=j=null,z("ZoomAnimationEnded")},16)},f)},16)}}),x(c+d,function(){if(n._allowZoom()){clearTimeout(i),n.st.removalDelay=f;if(!e){e=n._getItemToZoom();if(!e)return;j=g(e)}j.css(n._getOffset(!0)),n.wrap.append(j),n.content.css("visibility","hidden"),setTimeout(function(){j.css(n._getOffset())},16)}}),x(b+d,function(){n._allowZoom()&&(h(),j&&j.remove(),e=null)})},_allowZoom:function(){return n.currItem.type==="image"},_getItemToZoom:function(){return n.currItem.hasSize?n.currItem.img:!1},_getOffset:function(b){var c;b?c=n.currItem.img:c=n.st.zoom.opener(n.currItem.el||n.currItem);var d=c.offset(),e=parseInt(c.css("padding-top"),10),f=parseInt(c.css("padding-bottom"),10);d.top-=a(window).scrollTop()-e;var g={width:c.width(),height:(p?c.innerHeight():c[0].offsetHeight)-f-e};return L()?g["-moz-transform"]=g.transform="translate("+d.left+"px,"+d.top+"px)":(g.left=d.left,g.top=d.top),g}}});var M=function(a){var b=n.items.length;return a>b-1?a-b:a<0?b+a:a},N=function(a,b,c){return a.replace(/%curr%/gi,b+1).replace(/%total%/gi,c)};a.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var c=n.st.gallery,d=".mfp-gallery",e=Boolean(a.fn.mfpFastClick);n.direction=!0;if(!c||!c.enabled)return!1;v+=" mfp-gallery",x(g+d,function(){c.navigateByImgClick&&n.wrap.on("click"+d,".mfp-img",function(){if(n.items.length>1)return n.next(),!1}),t.on("keydown"+d,function(a){a.keyCode===37?n.prev():a.keyCode===39&&n.next()})}),x("UpdateStatus"+d,function(a,b){b.text&&(b.text=N(b.text,n.currItem.index,n.items.length))}),x(f+d,function(a,b,d,e){var f=n.items.length;d.counter=f>1?N(c.tCounter,e.index,f):""}),x("BuildControls"+d,function(){if(n.items.length>1&&c.arrows&&!n.arrowLeft){var b=c.arrowMarkup,d=n.arrowLeft=a(b.replace(/%title%/gi,c.tPrev).replace(/%dir%/gi,"left")).addClass(m),f=n.arrowRight=a(b.replace(/%title%/gi,c.tNext).replace(/%dir%/gi,"right")).addClass(m),g=e?"mfpFastClick":"click";d[g](function(){n.prev()}),f[g](function(){n.next()}),n.isIE7&&(y("b",d[0],!1,!0),y("a",d[0],!1,!0),y("b",f[0],!1,!0),y("a",f[0],!1,!0)),n.container.append(d.add(f))}}),x(h+d,function(){n._preloadTimeout&&clearTimeout(n._preloadTimeout),n._preloadTimeout=setTimeout(function(){n.preloadNearbyImages(),n._preloadTimeout=null},16)}),x(b+d,function(){t.off(d),n.wrap.off("click"+d),n.arrowLeft&&e&&n.arrowLeft.add(n.arrowRight).destroyMfpFastClick(),n.arrowRight=n.arrowLeft=null})},next:function(){n.direction=!0,n.index=M(n.index+1),n.updateItemHTML()},prev:function(){n.direction=!1,n.index=M(n.index-1),n.updateItemHTML()},goTo:function(a){n.direction=a>=n.index,n.index=a,n.updateItemHTML()},preloadNearbyImages:function(){var a=n.st.gallery.preload,b=Math.min(a[0],n.items.length),c=Math.min(a[1],n.items.length),d;for(d=1;d<=(n.direction?c:b);d++)n._preloadItem(n.index+d);for(d=1;d<=(n.direction?b:c);d++)n._preloadItem(n.index-d)},_preloadItem:function(b){b=M(b);if(n.items[b].preloaded)return;var c=n.items[b];c.parsed||(c=n.parseEl(b)),z("LazyLoad",c),c.type==="image"&&(c.img=a('<img class="mfp-img" />').on("load.mfploader",function(){c.hasSize=!0}).on("error.mfploader",function(){c.hasSize=!0,c.loadError=!0,z("LazyLoadError",c)}).attr("src",c.src)),c.preloaded=!0}}});var O="retina";a.magnificPopup.registerModule(O,{options:{replaceSrc:function(a){return a.src.replace(/\.\w+$/,function(a){return"@2x"+a})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var a=n.st.retina,b=a.ratio;b=isNaN(b)?b():b,b>1&&(x("ImageHasSize."+O,function(a,c){c.img.css({"max-width":c.img[0].naturalWidth/b,width:"100%"})}),x("ElementParse."+O,function(c,d){d.src=a.replaceSrc(d,b)}))}}}}),function(){var b=1e3,c="ontouchstart"in window,d=function(){r.off("touchmove"+f+" touchend"+f)},e="mfpFastClick",f="."+e;a.fn.mfpFastClick=function(e){return a(this).each(function(){var g=a(this),h;if(c){var i,j,k,l,m,n;g.on("touchstart"+f,function(a){l=!1,n=1,m=a.originalEvent?a.originalEvent.touches[0]:a.touches[0],j=m.clientX,k=m.clientY,r.on("touchmove"+f,function(a){m=a.originalEvent?a.originalEvent.touches:a.touches,n=m.length,m=m[0];if(Math.abs(m.clientX-j)>10||Math.abs(m.clientY-k)>10)l=!0,d()}).on("touchend"+f,function(a){d();if(l||n>1)return;h=!0,a.preventDefault(),clearTimeout(i),i=setTimeout(function(){h=!1},b),e()})})}g.on("click"+f,function(){h||e()})})},a.fn.destroyMfpFastClick=function(){a(this).off("touchstart"+f+" click"+f),c&&r.off("touchmove"+f+" touchend"+f)}}(),B()})(window.jQuery||window.Zepto)
},{}]},{},[1]);

//# sourceMappingURL=bundle.js.map
