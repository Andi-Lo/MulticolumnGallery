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

function dateTakenSort( &$a, $b ) {
  return $a->dateTaken == $b->dateTaken ? 0 : ( $a->dateTaken < $b->dateTaken ) ? 1 : -1;
}    

class Image{
  public $id = 0;
  public $imgName = "";
  public $imgPath = "";
  public $width = 0;
  public $height = 0;
  public $displayWidth = 0;
  public $displayHeight = 0;
  public $type = "";
  public $attr= "";
  public $thumbnailPath = "";
  public $thumbnail = "";
  public $dateTaken = 0;

  public static $_thumbNames = array(); 

  public function initializing()
  {
    global $config;
    $images = array();
    $names = array();
    $names = $this->readDirectory(DIR_PATH_IMAGES);
    self::$_thumbNames = $this->readDirectory(DIR_PATH_THUMBNAILS);

    if($config->shuffle === 'yes'){
      shuffle($names);
    }

    foreach($names as $value){
      $imgPath = DIR_PATH_IMAGES."$value";
      $img = new Image();
      $img->imgPath = PATH_IMAGES."$value";
      $img->imgName = $value;
      $img->thumbnail = $img->setThumbnailName($img);
      $img->readMetadata($imgPath, $img);
      $images[] = $img;
    }

    if($config->sortAfterDate === 'yes')
      usort($images, "dateTakenSort");

    self::setIds($images);
    return $images;
  }

  public function setIds(&$images)
  {
    $id = 0;
    foreach ($images as $image) { 
      $image->id = $id;
      $id++;
    }
  }
  
  public function readDirectory($dirPath)
  {
    $names = array();
    if(is_dir($dirPath)){
      $scanned_directory = array_diff(scandir($dirPath), array('..', '.'));
      foreach ($scanned_directory as $key => $value) {     
        $names[] = $value;
      }
      return $names;
    } else echo "readDirectory failed: no such directory found<br>";
  }

  public function readMetadata($imgPath, $img)
  {  
    list($width, $height, $type, $attr) = getimagesize($imgPath);
    $img->width = $width;
    $img->height = $height;
    $img->type = $type;
    $img->attr = $attr;
    $img->dateTaken = $img->getDateTaken($imgPath);
  }

  public function setThumbnailName($img)
  {
    global $config;
    $prefix = $config->thumbnail_prefix;
    $postfix = $config->thumbnail_postfix;
    $findme = array('.jpg','.jpeg','.png', '.gif');                       // supported datatypes
    foreach ($findme as $format) {                                             
      if(strpos($img->imgName, $format)){                                 // imagename is name.jpg/png/.. ?
        foreach (self::$_thumbNames as $thumb_name) {                      
          $pos = strpos($img->imgName, $format);                          // position of the datatype
          $substring = substr($img->imgName, 0, $pos);                    // remove datatype from string
          if($prefix.$substring.$postfix.$format == $thumb_name){         // if Thumbnail is in folder
            $img->thumbnailPath = PATH_THUMBNAILS.                        // set thumbnail path
                $prefix.$substring.$postfix.$format;
            return $prefix.$substring.$postfix.$format;                   // return Thumbnailname (bsp: thumb_IMG2342.jpg)
          } /* maybe not needed cause of config file */
          elseif($substring.$format == $thumb_name){
            $img->thumbnailPath = PATH_THUMBNAILS.$substring.$format;
            return $substring.$format;
          }
        }
      }
    }
    return "file_not_found";
  }

  public function getDateTaken($imgPath)
  {
    $exif = exif_read_data($imgPath, 0, true);
    if($exif !== null && $exif !== "undefined"){
      if(!(empty($exif['EXIF']['DateTimeOriginal']))){
        $dateTaken = $exif['EXIF']['DateTimeOriginal'];
        return self::parseDateTaken($dateTaken);
      }
    }
    return 0;
  }

  public function parseDateTaken($date)
  {
    $tmp = split(" ", $date);
    $tmp = $tmp[0];
    $tmp = split(":", $tmp);
    $date = $tmp[0].$tmp[1].$tmp[2];
    return $date;
  }

}

?>