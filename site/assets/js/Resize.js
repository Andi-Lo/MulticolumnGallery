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

  this.winWidth = window.innerWidth;
  this.winHeight = window.innerHeight;
  this.names = requestResult.columnNames;
  this.columns = requestResult.numOfColumns;
  this.queries = requestResult.mediaQueries;
  this.resize = requestResult.resize;
  this.columnBuilder = new ColumnBuilder();

};

/**
 * Handles the resize window event
 * @param  {[type]} first_argument [description]
 * @return {[type]}                [description]
 */
ResizeController.prototype.handleResize = function() {
  var resizeCtrl = galleryController.resizeCtrl;
  var scrlCtrl = galleryController.scrlCtrl;
  /* if in config.json file "resize" is set to "yes" */
  if(resizeCtrl.resize == 'yes'){
  
    /* handle the first column (1) */
    if(window.innerWidth <= resizeCtrl.queries[0]){
      getColumnBuilder().buildColumn(resizeCtrl.names[0]);
      scrlCtrl.refreshScreen();
      return;
    } 

    /* handle the last column (n) */
    else if(window.innerWidth >= queries[queries.length-1]){
      getColumnBuilder().buildColumn(resizeCtrl.names[columns-1]);
      scrlCtrl.refreshScreen();
      return;
    }

    /* handle columns between 2 and n-1 */
    else if(window.innerWidth >= queries[0]){
      for (var query = 0; query <= columns-1; query++){
        if(window.innerWidth <= queries[query]){
          getColumnBuilder().buildColumn(resizeCtrl.names[query-1]);
          scrlCtrl.refreshScreen();
          return;
        }
      }
    }
  }
};

