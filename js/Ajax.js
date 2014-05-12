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
 
var requestResult = "";
var hasColumns = -1;
var columns = 0;
var names = "";
var resize = "";
var fadeIn = "";

/* ajax call for Gallery images*/
$.ajax({
		url: "php/Gallery.php",
		type: 'post',
		data: { width: $(window).width(), galleryWidth: $('.popup-gallery').innerWidth(),},
		cache: false,
		success: function(json) {
			var winWidth = $(window).width();
			var winHeight = $(window).height();
			requestResult = json;
			columns = requestResult['numOfColumns'];
			queries = requestResult['mediaQueries'];
			names = requestResult['columnNames'];
			resize = requestResult['resize'];
			fadeIn = requestResult['fadeIn'];
			
			for (var i = 0; i < columns; i++) {
				if(i == 0){
					buildColumn(names[i]);
					refreshScreen();
				}else{
					if(winWidth >= queries[i]){
						buildColumn(names[i]);
						refreshScreen();
					}
				}
			};
			
		},
		error: function(xhr, desc, err) {
			console.log(xhr + "\n" + err);
		}
	}); // end ajax call
