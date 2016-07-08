<?php
/**
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
header('Content-Type: text/javascript');
header('Accept-Encoding: gzip');
ob_start('ob_gzhandler');
 
require_once 'Column.php';
require_once 'Config.php';
require_once 'Image.php';

$config = new Config();
for ($i=0; $i < $config->number_of_columns; $i++) { 
  if(! defined("COLUMN_".$i)) define("COLUMN_".$i, $i);
}

if(! defined("COLUMN_ONE")) define("COLUMN_ONE",  0);
if(! defined("NUM_OF_COLUMNS")) define("NUM_OF_COLUMNS", $config->number_of_columns);
if(! defined("THUMB_WIDTH")) define("THUMB_WIDTH", (int) $config->thumbnail_width);
if(! defined("PAD_LEFT_HD")) define("PAD_LEFT_HD", (int) $config->margin_left_hd);
if(! defined("PAD_LEFT_HDR")) define("PAD_LEFT_HDR", (int) $config->margin_left_hdr);
if(! defined("PAD_RIGHT")) define("PAD_RIGHT", (int) $config->margin_right);
if(! defined("PAD_TOP")) define("PAD_TOP", (int) $config->margin_top);
if(! defined("MARGIN_BOTTOM")) define("MARGIN_BOTTOM", (int) $config->margin_bottom);
if(! defined("PAD")) define("PAD", (int) $config->offset);
if(! defined("PATH_THUMBNAILS")) define("PATH_THUMBNAILS", $config->thumb_path);
if(! defined("PATH_IMAGES")) define("PATH_IMAGES", $config->image_path);
if(! defined("GALLERY_SIZE")) define("GALLERY_SIZE", PAD_LEFT_HD + (NUM_OF_COLUMNS * THUMB_WIDTH) + PAD + (NUM_OF_COLUMNS * PAD));
if(! defined("DIR_PATH_THUMBNAILS")) define("DIR_PATH_THUMBNAILS", "../".PATH_THUMBNAILS);
if(! defined("DIR_PATH_IMAGES")) define("DIR_PATH_IMAGES" , "../".PATH_IMAGES);

new Gallery();

class Gallery{

  public static $_columnContainer = array();
  private static $_numOfColumns = -1;
  
  function __construct()
  {
    global $config;
    $column = new Column();
    $images = new Image();
    $images = $images->initializing();
    $columnHeight = array();
    $request = $_POST;
    $requestWidth = $request['width'];
    $galleryWidth = $request['galleryWidth'];
    $columnNames = array();
    $galleryHeight = "";
    $numOfColumns = -1;

    self::setNumOfColumns($galleryWidth);
    $numOfColumns = self::getNumOfColumns();

    // set the column Names (1_Column to n_Columns)
    for ($i=1; $i <= $numOfColumns; $i++) { 
      if($i == 1)
        $columnNames[] = $i.'_Column';
       else
        $columnNames[] = $i.'_Columns';
    }

    $queries = $column->calcQueries();

    $activeColumn = self::calcActiveColumn($galleryWidth, $requestWidth, $queries);

    self::$_columnContainer =
      array(
        'mediaQueries'  => $queries,
        'numOfColumns'  => $numOfColumns,
        'columnNames'   => $columnNames,
        'resize'        => $config->resize,
        'fadeIn'        => $config->fadeIn,
        'activeColumn'  => $activeColumn,
      );


    for ($i=0; $i < $numOfColumns; $i++) {
      self::$_columnContainer[$columnNames[$i]] = $column->getColumn($i, $images);
      $columnHeight[] = end(self::$_columnContainer[$columnNames[$i]])->posY;
    }

    $galleryHeight = $column->getGalleryHeight();

    self::$_columnContainer['galleryHeight'] = $galleryHeight;
    self::$_columnContainer['columnHeight'] = $columnHeight;
    self::printJSON();
  }

  private function setNumOfColumns($galleryWidth) {
    global $config;

    if($config->center == 'yes') {
      $galleryWidth = (($galleryWidth - PAD) - PAD_LEFT_HD) - PAD_RIGHT;
      // echo $galleryWidth . "\n";
    } else {
      $galleryWidth = ($galleryWidth - PAD_LEFT_HDR) - PAD_RIGHT;
      // echo $galleryWidth . "\n";
    }

    $onePicture = PAD_LEFT_HDR + THUMB_WIDTH + PAD;
    $nPictures = THUMB_WIDTH + PAD;
    // echo $nPictures . "\n";


    if($galleryWidth >= $onePicture) {
      $tmp = $galleryWidth / $nPictures;
      $numOfColumns = intval($tmp);
      if($numOfColumns > NUM_OF_COLUMNS) {
        self::$_numOfColumns = NUM_OF_COLUMNS;
      } else {
        self::$_numOfColumns = $numOfColumns;
      }
    } 
    else {
      self::$_numOfColumns = 1;
    }
  }

  public function getNumOfColumns() {
    return self::$_numOfColumns;
  }

  public function printJSON()
  {
    global $config;
    header("content-type:application/json");
    echo (json_encode(self::$_columnContainer));
  }

  /**
   * Returns the number of columns that can be displayed on the clients screen
   * 
   * Example: if the config has "number_of_columns" set to 5 but the screen of the user
   * is not big enough to display 5, it will calculate the appropriate number
   * @param  int $galleryWidth clients screen width
   * @param  array $queries    the calculated queries for every column
   * @return int               an integer ranging from 1 to "number_of_columns" defined in config
   */
  public function calcActiveColumn($galleryWidth, $requestWidth, $queries)
  {
    // init variables
    $tmpDiff = 0;

    if($requestWidth < $galleryWidth) {
      $galleryWidth = $requestWidth;
    }

    // for every media query in the array
    foreach ($queries as $query => $value) {

      // when clients screen is smaller then the smallest query (e.g. 320px)
      // return that the active column is 1
      if ($galleryWidth < $queries[0]){
        return 1;
      }

      // find the smallest difference
      $diff = $galleryWidth - $value;
      if ($diff < $tmpDiff && $diff > 0 || $tmpDiff == 0) {
        $tmpDiff = $diff;
      }
      if($query+1 > self::$_numOfColumns) {
        return self::$_numOfColumns;
      }
    }
    return $query+1;      // +1 because columns-names run from 1 to 5 not from 0 to 4
  }

  /**
   * Creates a file with the given name in folder ./php
   * @param  String $filename
   * @return boolean          true if file created else false
   */
  public function createFile($filename)
  {
    if(!(file_exists($filename))){

      $newFile = fopen($filename, 'w');
      fclose($newFile);
      return true;
    } 
    else {
      return false;
    }
  }
  
}
?>

