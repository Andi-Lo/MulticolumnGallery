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
  
  function __construct()
  {
    global $config;
    $column = new Column();
    $images = new Image();
    $images = $images->initializing();
    $columnHeight = array();
    $request = $_POST;
    $requestWidth = $request['width'];

    if($config->caching == "yes") {
      $serveFromCache = -1;
      $serveFromCache = Gallery::getFromCache(DIR_PATH_IMAGES);

      if($serveFromCache == true) {
        if(Gallery::serveFromCache()){
          return;
        }
      } else {
        Gallery::printJSON();
      }
    }

    if($requestWidth < 768){
      $columnNames[] = '1_Column';
      $numOfColumns = 1;
    } 
    else {
      for ($i=1; $i <= NUM_OF_COLUMNS; $i++) { 
        if($i == 1)
          $columnNames[] = $i.'_Column';
         else
          $columnNames[] = $i.'_Columns';
      }
      $numOfColumns = NUM_OF_COLUMNS;
    }

    $queries = $column->calcQueries();

    $activeColumn = self::calcActiveColumn($requestWidth, $queries);

    self::$_columnContainer =
      array(
        'mediaQueries'  => $queries,
        'numOfColumns'  => $numOfColumns,
        'columnNames'   => $columnNames,
        'resize'        => $config->resize,
        'fadeIn'        => $config->fadeIn,
        'activeColumn'  => $activeColumn,
      );

    if ($requestWidth < 768) {
      self::$_columnContainer[$columnNames[0]] = $column->getColumn(0, $images);
      $columnHeight[] = end(self::$_columnContainer[$columnNames[0]])->posY;
    }
    else {
      for ($i=0; $i < NUM_OF_COLUMNS; $i++) { 
        self::$_columnContainer[$columnNames[$i]] = $column->getColumn($i, $images);
        $columnHeight[] = end(self::$_columnContainer[$columnNames[$i]])->posY;
      }
    }

    self::$_columnContainer['columnHeight'] = $columnHeight;
    self::printJSON();
  }

  public function printJSON()
  {
    global $config;
    header("content-type:application/json");
    if($config->caching == "yes"){
      // write to cache file to reuse without recalculation
      if(file_exists("cache/cache.json")){
        file_put_contents('cache/cache.json', json_encode(self::$_columnContainer));
        // Gallery::debugConsole('caching was on');
      } 
      // create a new file if doesnt exist and write to it
      else {
        $newJsonFile = fopen('cache/cache.json', 'w');
        fclose($newJsonFile);
        file_put_contents('cache/cache.json', json_encode(self::$_columnContainer));
        // Gallery::debugConsole('caching was on but file didnt exist so i created one');
      }
    }
    echo (json_encode(self::$_columnContainer));
  }

  /**
   * 
   * @param  [type] $requestWidth [description]
   * @param  [type] $queries      [description]
   * @return [type]               [description]
   */
  public function calcActiveColumn($requestWidth, $queries)
  {
    $tmpDiff = 0;
    $key = -1;
    foreach ($queries as $query => $value) {
      if ($requestWidth < $queries[0])
        return 1;

      $diff = $requestWidth - $value;

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
    } else {
      return false;
    }
  }

  /**
   * Sends Images to the Client from Cache
   * @return boolean true on success else false
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
   * check if file names in folder are the same as in the cache, if yes serve
   * files from the cache, else recalculate columns
   * @param  String $path path to the Folder you want to read the names of
   * @return boolean      true if file names did not change; false if they are different
   */
  public function getFromCache($path)
  {
    $names = array();
    $names = Image::readDirectory($path);
    return Gallery::compareCache($names);
  }

  /**
   * compares if the cached file is the same as the given input
   * @param  array $names 
   * @return boolean        true if same else false
   */
  public function compareCache($names)
  {
    if(file_exists("cache/names.json")) {
      $compareNames = json_decode(file_get_contents('cache/names.json'));
      if($compareNames == $names) {
        // hurray we are same!"
        return true;
      } else {
        // we are not same :(
        file_put_contents('cache/names.json', json_encode($names));
        return false;
      }
    } else {
      if(Gallery::createFile('cache/names.json')){
        file_put_contents('cache/names.json', json_encode($names));
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

