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
 */
function buildColumn(columnName, requestResult) {
  html = "";
  tmp = columnName.split('_');
  columnNumber = parseInt(tmp[0], 10) - 1;
  if (tmpColumn != columnNumber) {
    tmpColumn = columnNumber;

    var winHeight = $(window).innerHeight() + $(window).scrollTop();
    $('#gallery').css("height", columnHeight[columnNumber]);
    $('.images').remove();
    jQuery.each(requestResult[columnName], function(i, image) {
      if (typeof image == 'object' && image !== null) {
        
        /* image position is in the users screensize -> image is visible */
        if (image.posY <= winHeight)
          html += '<a class="images" href="' + image.imgPath + '" title="' + image.imgName + '"><img class="images" style="position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; height:' + image.height + 'px; width:' + image.width + 'px; visibility:visible; " src="' + image.thumbPath + '" height="' + image.height + '" width="' + image.width + '"></a>';
        else if (image.posY <= winHeight + 300 && image.posY <= winHeight + 900)
          html += '<a class="images" href="' + image.imgPath + '" title="' + image.imgName + '"><img class="images" style="position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; height:' + image.height + 'px; width:' + image.width + 'px; visibility:hidden; " src="' + image.thumbPath + '" height="' + image.height + '" width="' + image.width + '"></a>';
      } else
        return false;
    });
    $('#gallery').append(html);

    return;
  }
} // end buildColumn

var imgId = 0;

function addImgToColumn(columnName, scrollPos) {
  html = "";
  jQuery.each(requestResult[columnName], function(i, image) {
    if (typeof image == 'object' && image !== null) {
      if (image.id > imgId && (image.id - imgId) <= 1) {
        // image gets loaded but is hidden till user scrolls there
        if (activeColumn == "1_Columns" && image.posY <= scrollPos + 300) {
          html += '<a class="images" href="' + image.imgPath + '" title="' + image.imgName + '"><img class="images" style="position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; height:' + image.height + 'px; width:' + image.width + 'px; visibility:hidden; " src="' + image.thumbPath + '" height="' + image.height + '" width="' + image.width + '"></a>';
          imgId = image.id;
        } else if (image.posY <= scrollPos + 900) {
          html += '<a class="images" href="' + image.imgPath + '" title="' + image.imgName + '"><img class="images" style="position:absolute; top:' + image.posY + 'px; left:' + image.posX + 'px; height:' + image.height + 'px; width:' + image.width + 'px; visibility:hidden; " src="' + image.thumbPath + '" height="' + image.height + '" width="' + image.width + '"></a>';
          imgId = image.id;
        } else
          return;
      } else
        return;
    } else
      return;
  });

  $('#gallery').append(html);
  return;
} // end addImgToColumn
