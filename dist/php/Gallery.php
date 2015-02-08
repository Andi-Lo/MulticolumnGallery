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
    $numOfCOlumns = -1;

    // echo $galleryWidth . " \n";
    // echo $requestWidth . "\n";

    if($config->caching == "yes" && $config->shuffle != 'yes') {
      $tmpNames = Image::readDirectory(DIR_PATH_IMAGES);
      $serveFromCache = Gallery::compareCache($tmpNames, 'cache/names.json');
      $configNames = json_decode(file_get_contents('../config/config.json'));
      $confNotChanged = Gallery::compareCache($configNames, 'cache/config.json');

      if(($serveFromCache === true) && ($confNotChanged === true)) {
        if(Gallery::serveFromCache()){
          return;
        }
      }
    }

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
      // echo $tmp . "\n";
      $numOfColumns = intval($tmp);
      self::$_numOfColumns = $numOfColumns;
    } 
    else {
      self::$_numOfColumns = 1;
    }
  }

  public static function getNumOfColumns() {
    return self::$_numOfColumns;
  }

  public function printJSON()
  {
    global $config;
    header("content-type:application/json");
    if($config->caching == "yes" && $config->shuffle != "yes"){
      // write to cache file to reuse without recalculation
      if(file_exists("cache/cache.json")){
        file_put_contents('cache/cache.json', json_encode(self::$_columnContainer));
      } 
      // create a new file if doesnt exist and write to it
      else {
        self::createFile('cache/cache.json');
        file_put_contents('cache/cache.json', json_encode(self::$_columnContainer));
      }
    }
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
    $key = -1;

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
      // echo "diff: " . $diff . " \n" . "tmpdiff: " . $tmpDiff;
      if ($diff < $tmpDiff && $diff > 0 || $tmpDiff == 0) {
        $tmpDiff = $diff;
        $key = $query;

      }
    }
    return $key+1;      // +1 because columns-names run from 1 to 5 not from 0 to 4
  }

  /**
   * Creates a file with the given name
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

  /**
   * Sends Images to the Client from Cache
   * @return boolean true on success else false
   * @todo   http://stackoverflow.com/questions/17612962/possible-to-cache-json-to-increase-performance-load-time
   * caching not working if stored on server. Has to be stored on client
   */
  public function serveFromCache()
  {
    if(file_exists('cache/cache.json')){
      header("content-type:application/json");
      $s = json_decode(file_get_contents('cache/cache.json'));
      echo (json_encode($s));
      return true;
    } else {
      return false;
    }
  }

  /**
   * compares if the cached file is the same as the given input
   * @param  array $names 
   * @return boolean        true if same else false
   */
  public function compareCache($names, $cachedName)
  {
    if(file_exists($cachedName)) {
      $compareNames = json_decode(file_get_contents($cachedName));
      if($compareNames == $names) {
        // hurray we are same!"
        return true;
      } else {
        // we are not same :(
        file_put_contents($cachedName, json_encode($names));
        return false;
      }
    } else {
      if(Gallery::createFile($cachedName)){
        file_put_contents($cachedName, json_encode($names));
        return true;
      }
      return false;
    }
    return false;
  }
  
  public function debugConsole($data)
  {
    echo $data." \n";
  }
}
?>

