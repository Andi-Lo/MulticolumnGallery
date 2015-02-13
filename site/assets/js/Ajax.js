/**
 * Multicolumn image gallery by Andreas Lorer
 * http://andreaslorer.de
 * 
 * GNU General Public License, version 2
 * http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * Examples and documentation available on the project homepage
 * http://bithugger.github.io/MulticolumnGallery/
 * bla
 */

var REQUEST_PENDING = 2;
var REQUEST_SUCCESS = 4;
var requestResult;
var galleryController;

window.addEventListener('DOMContentLoaded', function(){
  var gal = new GalleryFactory(getColumnBuilder());
  gal.requestGallery();

}, false);

function addControllers(){
  var scrlCtrl = new ScrollController();
  var resizeCtrl = new ResizeController();
  galleryController = {
                     'scrlCtrl': scrlCtrl,
                     'resizeCtrl': resizeCtrl
                    };

  window.addEventListener('scroll', scrlCtrl.handleScroll, true);
  window.addEventListener('resize', scrlCtrl.updateWidth, false);
  window.addEventListener('resize', resizeCtrl.handleResize, false);
  return galleryController;
}


/**
 * Gallery Factory for creating gallery Objects
 * @method requestGallery()
 */
var GalleryFactory = function (colBuilder) {
  this.colBuilder = colBuilder;
  this.hasColumns = -1;
  this.columns = 0;
  this.names = "";
  this.resize = "";
  this.fadeIn = "";
  this.columnHeight = "";
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
          document.getElementsByClassName('ajax-loading')[0].style.display = 'block';
          break;
        case REQUEST_SUCCESS:
          document.getElementsByClassName('ajax-loading')[0].style.display = 'none';
      }
    };

    // handles the ajax onload event
    request.onload = function() {

      if (request.status >= 200 && request.status < 400) {

        /* Success! */
        var data = JSON.parse(request.responseText);
        requestResult = data;
        columns = data.numOfColumns;
        queries = data.mediaQueries;
        names = data.columnNames;
        resize = data.resize;
        fadeIn = data.fadeIn;
        columnHeight = data.columnHeight;
        activeColumn = data.activeColumn +"_Columns";

        var controller = addControllers();
        
        for (var i = 0; i < columns; i++) {
          if(i === 0){
            colBuilder.buildColumn(names[i]);
            controller.scrlCtrl.refreshScreen();
          }else{
            if(window.innerWidth >= queries[i]){
              colBuilder.buildColumn(activeColumn);
              controller.scrlCtrl.refreshScreen();
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
