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
 * Class for handling Resize events
 */
var ResizeController = function(){

  this.winWidth = $(window).width();
  this.winHeight = $(window).height();
  this.names = requestResult.columnNames;
  this.columns = requestResult.numOfColumns;
  this.queries = requestResult.mediaQueries;
  this.resize = requestResult.resize;

  // var handleResize = function() {
  //   console.log('handle Resize');
  //   /* if in config.json file "resize" is set to "yes" */
  //   if(resize == 'yes'){
    
  //     /* handle the first column (1) */
  //     if(window.innerWidth <= queries[0]){
  //       buildColumn(names[0]);
  //       ScrollController.prototype.refreshScreen();
  //       return;
  //     } 

  //     /* handle the last column (n) */
  //     else if(window.innerWidth >= queries[queries.length-1]){
  //       buildColumn(names[columns-1]);
  //       ScrollController.prototype.refreshScreen();
  //       return;
  //     }

  //     /* handle columns between 2 and n-1 */
  //     else if(window.innerWidth >= queries[0]){
  //       for (var query = 0; query <= columns-1; query++){
  //         if(window.innerWidth <= queries[query]){
  //           buildColumn(names[query-1]);
  //           ScrollController.prototype.refreshScreen();
  //           return;
  //         }
  //       }
  //     }
  //   }
  // }

};

/**
 * Handles the resize window event
 * @param  {[type]} first_argument [description]
 * @return {[type]}                [description]
 */
ResizeController.prototype.handleResize = function() {
  var resizeCtrl = galleryController.resizeCtrl;
  console.log('handle Resize');
  /* if in config.json file "resize" is set to "yes" */
  if(resizeCtrl.resize == 'yes'){
  
    /* handle the first column (1) */
    if(window.innerWidth <= resizeCtrl.queries[0]){
      buildColumn(resizeCtrl.names[0]);
      resizeCtrl.refreshScreen();
      return;
    } 

    /* handle the last column (n) */
    else if(window.innerWidth >= queries[queries.length-1]){
      buildColumn(resizeCtrl.names[columns-1]);
      resizeCtrl.refreshScreen();
      return;
    }

    /* handle columns between 2 and n-1 */
    else if(window.innerWidth >= queries[0]){
      for (var query = 0; query <= columns-1; query++){
        if(window.innerWidth <= queries[query]){
          buildColumn(resizeCtrl.names[query-1]);
          resizeCtrl.refreshScreen();
          return;
        }
      }
    }
  }
};