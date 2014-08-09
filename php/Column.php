<?php
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

require_once 'Gallery.php';

class Column{
  public $id = 0;
  public $imgName = "";
  public $imgPath = "";
  public $posX = 0;                           // the X-achsis position of the picture
  public $posY = 0;                           // the Y-achsis position of the picture
  public $width = 0;
  public $height = 0;
  public $thumbnail = "";                     // the thumbnail, belonging to the picture
  public $thumbPath = "";                     // the path of the thumbnail
  public $request = "";                       // the ajax request object

  public static $_init = false;               // just initialize the class once
  public static $_columnHeight = array();     // contains all column heights

  /* Build an dynamic sized container array to store the height of each column */
  private static function initClass($numOfColumns)
  {
    for ($i=0; $i < NUM_OF_COLUMNS; $i++) { 
      self::$_columnHeight[$i][$i] = PAD_TOP;
      for ($j=0; $j < $i+1; $j++) { 
        self::$_columnHeight[$i][$j] = PAD_TOP;
        sort(self::$_columnHeight[$i]);
      }
    }

    /* comment for präsentation*/
    // print_r(self::$_columnHeight);
    //  end
  }

  /* get a column with the given amount back */
  public static function getColumn($numOfColumns, $images)
  {
    if(! self::$_init){
      self::$_init = true;
      Column::initClass($numOfColumns);
    }
    $arr = array();

    if($numOfColumns >= 0){
      foreach ($images as $img) {
        $arr[] = Column::calcColumn($numOfColumns, $img);

        /* comment for präsentation*/
        // if($numOfColumns == 1){
        //  print_r(self::$_columnHeight[1]);
        // }
        // end
      }
    return $arr;
    }else{
      echo "Unsupported Number of Columns";
    }
  }

  /* calculate the image positions for each column */
  public function calcColumn($columnNr, $img)
  {
    global $config;
    $request = $_POST;
    $column = new Column();
    $column->calcDispVal($img, THUMB_WIDTH);
    $column->initProperties($column, $img);

    /* one column */
    if($columnNr == 0){
      /* calculate margin left to display the column centered*/
      $padLeft = ($request['width'] - THUMB_WIDTH - PAD)/2;

      $column->posY = self::$_columnHeight[COLUMN_ONE][0];
      
      /* screen width is too small for 2 pictures, display 1 column centered */
      if($request['width'] < (PAD_LEFT_HDR + THUMB_WIDTH*2 + PAD*2)){
        $column->posX = $padLeft;
      }
      else{
        $column->posX = PAD_LEFT_HDR;
      }
      self::$_columnHeight[COLUMN_ONE][0] = ((self::$_columnHeight[COLUMN_ONE][0] + $column->height) + PAD);
      return $column;
    } /* more then one column */
    else{
      if($config->center == 'yes' && $request['width'] >= GALLERY_SIZE){
        $padLeft = ($request['width'] - ((NUM_OF_COLUMNS)*THUMB_WIDTH) - ((NUM_OF_COLUMNS)*PAD))/2;
      }else{
        $padLeft = PAD_LEFT_HDR;
      }

      /* sorts the array low to heigh while keeping its key => value structure. 
      Index 0 represents the column with the least height so the image will be placed there */
      asort(self::$_columnHeight[$columnNr]);
      /* reset the array pointer so it points to index 0 */
      reset(self::$_columnHeight[$columnNr]);
      $index0 = key(self::$_columnHeight[$columnNr]);

      $column->posY = self::$_columnHeight[$columnNr][$index0];

      /* add the height of the image to the global height container */
      self::$_columnHeight[$columnNr][$index0] = ((self::$_columnHeight[$columnNr][$index0] + $column->height) + PAD);

      /* its the max column (n) */
      if($index0 == NUM_OF_COLUMNS){
        $column->posX = $padLeft + (PAD + THUMB_WIDTH) * $index0;
      } /* its the min column (1) */
      else if($index0 == 0){
        $column->posX = $padLeft;
      } /* its a column between (2) and (n-1) */
      else{ 
        $column->posX = $padLeft + (PAD + THUMB_WIDTH) * $index0;
      }
      // print_r(self::$_columnHeight);
      return $column;
    }
  }

  private function initProperties($column, $img)
  {
    $column->id = $img->id;
    $column->imgName = $img->imgName;
    $column->thumbnail = $img->thumbnail;
    $column->thumbPath = $img->thumbnailPath;
    $column->imgPath = $img->imgPath;
    $column->width = $img->displayWidth;
    $column->height = $img->displayHeight;
  }

  /* calc the image ratio to keep formats */
  public function calcDispVal($img, $imgSize)
  {
    $imgRatio = 0;
    $img->displayWidth = $imgSize;
    $imgRatio = $imgSize / $img->width;
    $img->displayHeight = (int)($imgRatio * $img->height);
  }

  /* calc media queries for responsivness */
  public function calcQueries()
  {
    global $config;
    $queries = array();
    $result = 0;
    $request = $_POST;
    $padLeft = 0;

    if($config->center == 'yes' && $request['width'] >= GALLERY_SIZE){
      $padLeft = ($request['width'] - ((NUM_OF_COLUMNS)*THUMB_WIDTH) - ((NUM_OF_COLUMNS)*PAD))/2;
    }else{
      $padLeft = PAD_LEFT_HDR;
    }

    /* for each column, calculate the size of the gallery to specify media queries */
    for ($column = 1; $column <= NUM_OF_COLUMNS; $column++) {
        /* its the max column (n) */
      if($column == NUM_OF_COLUMNS){
        $result = $padLeft + ($column * THUMB_WIDTH) + PAD + ($column * PAD);
      } /* its the min column (1) */
      elseif($column == 1){
        $result = $padLeft + THUMB_WIDTH + PAD;
      } /* its a column between (2) and (n-1) */
      else{
        $result = $padLeft + ($column * THUMB_WIDTH) + PAD + ($column * PAD);
      }
      $queries[] = $result;
    }
    return $queries;
  }

}

?>