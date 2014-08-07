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
 
/* form html columns out of the data gotten from the ajax call */
function buildColumn (columnName) {
	html = "";
	var winHeight = $(window).innerHeight();

	$('.images').remove();
	jQuery.each(requestResult[columnName], function(i,image){
	   if(typeof image == 'object' && image !== null) {
	   		/* image position is in the users screensize -> image is visible */
    	if(image.posY <= winHeight){ 
				html += '<a class="images" href="'+image.imgPath+'" title="'+image.imgName+'"><img class="images" style="position:absolute; top:'+image.posY+'px; left:'+image.posX+'px; height:'+image.height+'px; width:'+image.width+'px; visibility:visible; " src="'+image.thumbPath+'" height="'+image.height+'" width="'+image.width+'"></a>';
			} /* image is hidden*/
			else{
				// html += '<a class="images" href="'+image.imgPath+'" title="'+image.imgName+'"><img class="images" style="position:absolute; top:'+image.posY+'px; left:'+image.posX+'px; height:'+image.height+'px; width:'+image.width+'px; visibility:hidden; " src="'+image.thumbPath+'" height="'+image.height+'" width="'+image.width+'"></a>';
			}
		} else {
			return false;
	   }
	})
	$('#gallery').append(html);
	return;
} /* end buildColumn */


function addImgToColumn (columnName, scrollPos) {
	html = "";
	var winHeight = $(window).innerHeight();
	console.log(scrollPos);

	jQuery.each(requestResult[columnName], function(i,image){
	   if(typeof image == 'object' && image !== null) {
	   		/* image position is in the users screensize -> image is visible */
    	if(image.posY <= scrollPos+300){ 
				html += '<a class="images" href="'+image.imgPath+'" title="'+image.imgName+'"><img class="images" style="position:absolute; top:'+image.posY+'px; left:'+image.posX+'px; height:'+image.height+'px; width:'+image.width+'px; visibility:hidden; " src="'+image.thumbPath+'" height="'+image.height+'" width="'+image.width+'"></a>';
			} /* image is hidden*/
			else{
				
			}
		} else {
			return false;
	   }
	})
	$('#gallery').append(html);
	return;
}