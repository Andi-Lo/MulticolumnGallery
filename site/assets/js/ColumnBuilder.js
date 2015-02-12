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

var tmpColumn = -1;

/**
 * Build html columns out of the data gotten from the ajax call
 * @param  {String} columnName    the columns name
 * @param  {object} requestResult an object containing the requests data
 * @todo remove jquery
 */
function buildColumn(columnName) {
  var tmp = columnName.split('_'),
      columnNumber = parseInt(tmp[0], 10) - 1,
      gallery = document.getElementById('gallery'),
      winHeight = window.innerHeight + window.pageYOffset,
      images = gallery.getElementsByClassName('image');
      console.log(winHeight);

  if (tmpColumn != columnNumber) {
    tmpColumn = columnNumber;
    gallery.style.height = columnHeight[columnNumber];

    // $('.images').remove();

    if(images.length !== 0){
      for (var i = images.length - 1; i >= 0; i--) {
        images[i].remove();
      }
    }

    $('#gallery').css("height", columnHeight[columnNumber]);

    requestResult[columnName].forEach(function(image, i){
      if (typeof image == 'object' && image !== null) {
        var elem;
        
        /* image position is in the users screensize -> image is visible */
        if (image.posY <= winHeight){
          elem = buildImageElement(image, 'visible');
          gallery.appendChild(elem);    
        }
        else if (image.posY <= winHeight + 300 && image.posY <= winHeight + 900) {
          elem = buildImageElement(image, 'hidden');
          gallery.appendChild(elem);
        }
      } else
        return false;
    });
    return true;
  }
} // end buildColumn

var imgId = 0;

function buildImageElement(image, visiblity) {
  var outerImg = document.createElement('a'),
      innerImg = document.createElement('img');

      outerImg.setAttribute('class', 'image');
      outerImg.setAttribute('href', image.imgPath);
      outerImg.setAttribute('title', image.imgName);

      innerImg.setAttribute('class', "image-inner");
      innerImg.setAttribute('style', 'position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; height:' + image.height + 'px; width:' + image.width + 'px; visibility:' + visiblity +';');
      innerImg.setAttribute('src',  image.thumbPath);
      innerImg.setAttribute('height', image.height);
      innerImg.setAttribute('width', image.width);

      outerImg.appendChild(innerImg);
      return outerImg;
}

function addImgToColumn(columnName, scrollPos) {
  var elem = "";
  gallery = document.getElementById('gallery');
  requestResult[columnName].forEach(function(image, i){
    // console.log(image);
    if (typeof image == 'object' && image !== null) {
      // console.log(image.id + ' ' + imgId + ' ' +  (image.id - imgId));
      if (image.id > imgId && (image.id - imgId) <= 1) {
        // image gets loaded but is hidden till user scrolls there
        if (activeColumn == "1_Columns" && image.posY <= scrollPos + 300) {
          elem = buildImageElement(image, 'hidden');
          gallery.appendChild(elem);
          imgId = image.id;
        } else if (image.posY <= scrollPos + 900) {
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
} // end addImgToColumn
