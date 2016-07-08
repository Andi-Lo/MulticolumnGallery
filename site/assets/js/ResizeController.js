/*
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


/**
 * Controller-Class for handling Resize events
 * @methods handleResize(ColumnBuilder, GalleryController, collection)
 * @exports ResizeController
 */
var ResizeController = function(requestResult, columnBuilder){
  'use strict';

  this.requestResult = requestResult;
  this.winWidth = window.innerWidth;
  this.winHeight = window.innerHeight;
  this.names = requestResult.columnNames;
  this.columns = requestResult.numOfColumns;
  this.queries = requestResult.mediaQueries;
  this.resize = requestResult.resize;
  this.galleryCtrl = '';
  this.columnBuilder = columnBuilder;
  
  this.getColumnBuilder = function() {
    return this.columnBuilder;
  };

  this.getGalleryController = function(){
    return this.galleryCtrl;
  };

};

ResizeController.prototype.setController = function(galleryCtrl){
  this.galleryCtrl = galleryCtrl;
};

/**
 * Handler for the onresize event
 * @param  {ColumnBuilder} colBuilder         A Columnbuilder object 
 * @param  {GalleryController} galleryCtrl    The galleryControler instance
 * @param  {Collection} requestResult         The Ajax request result data
 */
ResizeController.prototype.handleResize = function(colBuilder, galleryCtrl, requestResult) {
  var resizeCtrl = galleryCtrl.resizeCtrl;
  var scrlCtrl = galleryCtrl.scrlCtrl;
  var names = requestResult.columnNames;
  var columns = requestResult.numOfColumns;
  var queries = requestResult.mediaQueries;
  var resize = requestResult.resize;

  /* if in config.json file "resize" is set to "yes" */
  if(resize == 'yes'){
    /* handle the first column (1) */
    if(window.innerWidth <= queries[0]){
      colBuilder.buildColumn(names[0], requestResult);
      scrlCtrl.refreshScreen(scrlCtrl);
      return;
    } 

    /* handle the last column (n) */
    else if(window.innerWidth >= queries[queries.length-1]){
      colBuilder.buildColumn(names[columns-1], requestResult);
      scrlCtrl.refreshScreen(scrlCtrl);
      return;
    }

    /* handle columns between 2 and n-1 */
    else if(window.innerWidth >= queries[0]){
      for (var query = 0; query <= columns-1; query++){
        if(window.innerWidth <= queries[query]){
          colBuilder.buildColumn(names[query-1], requestResult);
          scrlCtrl.refreshScreen(scrlCtrl);
          return;
        }
      }
    }
  }
};

module.exports = ResizeController;
