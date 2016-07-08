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