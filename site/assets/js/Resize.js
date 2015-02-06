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

// function for responsive behavior
$(function(){
  $(window).resize(function(){
    var winWidth = $(window).width();
    var winHeight = $(window).height();

    // config file resize is set to yes
    if(resize == 'yes'){
      // handle the first column
      console.log(winWidth + ">= ? "+ queries[queries.length-1]);
      if(winWidth <= queries[0]){
        console.log('first col');
        buildColumn(names[0]);
        refreshScreen();
        return;
      } // handle the last column
      else if(winWidth >= queries[queries.length-1]){
        buildColumn(names[columns-1]);
        console.log('last col');
        refreshScreen();
        return;
      } // handle all other columns
      else if(winWidth >= queries[0]){
        for (var query = 0; query <= columns-1; query++){
          if(winWidth <= queries[query]){
            buildColumn(names[query-1]);
            refreshScreen();
            return;
          }
        }
      }
    }
  });
});