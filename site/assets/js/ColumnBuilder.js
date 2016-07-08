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
