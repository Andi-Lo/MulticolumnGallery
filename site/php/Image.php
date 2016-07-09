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
 
require_once 'Gallery.php';
require_once 'Thumbnail.php';

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

  private static $_thumbNames = array(); 

  public function initializing() {
    global $config;
    $images = array();
    $names = array();
    $names = Gallery::readDir(DIR_PATH_IMAGES);
    self::$_thumbNames = Gallery::readDir(DIR_PATH_THUMBNAILS);
    
    if($config->shuffle === 'yes'){
      shuffle($names);
    }

    // set properties
    foreach($names as $imgName){
      $img = new Image();
      $imgPath = DIR_PATH_IMAGES."$imgName";
      $img->imgPath = PATH_IMAGES."$imgName";
      $img->imgName = $imgName;
      $img->readMetadata($imgPath, $img);
      $img->thumbnail = $img->setThumbnailName($img);
      if($img->thumbnailPath == "" || $img->thumbnail == "file_not_found" ) {
        Thumbnail::makeThumbs($img);
      }
      $img->dateTaken = $img->getDateTaken($imgPath);
      $images[] = $img;
    }

    if($config->sortAfterDate === 'yes'){
      usort($images, "dateTakenSort");
    }

    self::setIds($images);
    return $images;
  }


  /**
   * Set unique image id's
   * @param object $images
   */
  public function setIds(&$images)
  {
    $id = 0;
    foreach ($images as $image) { 
      $image->id = $id;
      $id++;
    }
  }

  
  /**
   * reads all files of a directory. If in config.json the image directory is the same
   * as the thumbnail directory, the function will sort thumbnails into the static 
   * array "thumb_names" and will just return non pre or postfixed image names.
   * @param  string $dirPath the folder to read
   * @return string[]        names of files in folder or FALSE on error  
   */
  /*public static function readDirectory($dirPath)
  {
    $names = array();
    global $config;
    $prefix = $config->thumbnail_prefix;
    $postfix = $config->thumbnail_postfix;
    $imgDirPath = $config->image_path;
    $thumbDirPath = $config->thumb_path;

    // check if config.json has pre or postfix set and images lie in the same 
    // folder as thumbnails
    if(($prefix !== "" || $postfix !== "") && ($imgDirPath == $thumbDirPath)) {
      $search = true;

      if($postfix === "" && $prefix !== "")
        $findme = $prefix;

      elseif($postfix !== "" && $prefix === "")
        $findme = $postfix;

      elseif($postfix !== "" && $prefix !== "")
        $findme = $prefix;

    } else { 
      $search = false;
    }

    // given path is a folder?
    if(is_dir($dirPath)){

      // extract ". .." childs from array
      $scanned_directory = array_diff(scandir($dirPath), array('..', '.'));

      // for every file in folder, get its names
      foreach ($scanned_directory as $images => $image) {

        // if the readed file is actually an image
        if(Image::isImage($image)) {

          // true when thumbnails and images are set in same folder via config.json file
          if($search === true){
  
            // if prefix or postfix is not found, sort it into "names" array
            $pos = (strpos($image, $findme));

            if($pos !== 0)
              $names[] = $image; 

            // else its a thumbnail belonging to an image
            else 
              self::$_thumbNames[] = $image;
            
          } else {
            $names[] = $image;
          }

        }
      }
      return $names;
    } 
    else  {
      echo "readDirectory failed: no such directory found<br>";
    }
    return false;
  }*/


  /**
   * Reads data out of an Image: width, height, type, attr (w*h)
   * @param  [type] $imgPath [description]
   * @param  [type] $img     [description]
   * @return [type]          [description]
   */
  public function readMetadata($imgPath, $img)
  {  
    list($width, $height, $type, $attr) = getimagesize($imgPath);
    $img->width = $width;
    $img->height = $height;
    $img->type = $type;
    $img->attr = $attr;
  }

  /**
   * sets the thumbnail Name property to a given Image object so that a thumbnail belongs to the appropriate image
   * @param object $img Image
   * @return string Thumnail name or an error message
   * @todo  Transform image file type to lowercase befor checking it so that
   * JPG and jpg is supported.
   */
  public function setThumbnailName($img)
  {
    global $config;
    $prefix = $config->thumbnail_prefix;
    $postfix = $config->thumbnail_postfix;
    $imgDirPath = $config->image_path;
    $thumbDirPath = $config->thumb_path;
    $thumbnail = self::getThumbNames();

    $fileTypes = array('.jpg','.jpeg','.png');

    if($prefix !== "" || $postfix !== "" || $imgDirPath !== $thumbDirPath) {
      
      // for file ending in files
      foreach ($fileTypes as $filetype) {

        // for thumbnail in thumbnails
        foreach ($thumbnail as $thumbsName) {

          // $pos is the string position of the file type e.g. .jpg
          $pos = strpos($img->imgName, $filetype);

          // extract file name from file
          $substring = substr($img->imgName, 0, $pos);

          // if thumbnail name was found in folder
          if($prefix.$substring.$postfix.$filetype == $thumbsName) {

          // set thumbnail path
            $img->thumbnailPath = PATH_THUMBNAILS. 
                $prefix.$substring.$postfix.$filetype;

            // return thumbnail name as string (bsp: prefix+myimagename+postfix.jpg)
            return $prefix.$substring.$postfix.$filetype;
          } /* maybe not needed cause of config file */
          elseif($substring.$filetype == $thumbsName) {
            $img->thumbnailPath = PATH_THUMBNAILS.$substring.$filetype;

            // return thumbnail name as string (bsp: thumb_IMG2342.jpg)
            return $substring.$filetype;
          }
        }
      }
    }
    // no thumbnail for given image file found
    return "file_not_found";
  }

  private function getThumbNames() {
    return self::$_thumbNames;
  }


  /**
   * Checks if the given file is an Image based on its Datatype
   * @param  String $filename
   * @return boolean          true if image else false
   */
  public static function isImage($filename)
  {
    // supported image formats
    $supportedFormats = array('.jpg','.jpeg','.png');

    // make sure JPG and jpg doesnt matter
    $toLowerCase = strtolower ($filename);

    // for every supported image format 
    foreach ($supportedFormats as $format) {

      // see if one of the file endings is found
      if(strpos($filename, $format)) {
        return true;
      }

      // file format not found 
      else {
        return false;
      }
    }
  }

  /**
   * Gets the date of the image out of its metadata header
   * @param  string $imgPath Location of the image
   * @return int             a number (jjjjmmtt) representing the date taken or -1 on error
   */
  public function getDateTaken($imgPath)
  {
    // check for metadata header
    if(@exif_read_data($imgPath, 0, true) !== false) {

      $exif = @exif_read_data($imgPath, 0, true);

      // if metadata header was found in file
      if($exif !== null && $exif !== "undefined"){

        // if datetaken property exists
        if(!(empty($exif['EXIF']['DateTimeOriginal']))){

          $dateTaken = $exif['EXIF']['DateTimeOriginal'];

          // remove time stemp from String (e.g. "2012:04:23 21:13:29")
          return self::parseDateTaken($dateTaken);
        }
      }
    } else {
      return false;
    }
  }

  /**
   * parse the date taken out of a tuple string
   * @param  String $date DateTimeOriginal format (2012:04:23 21:13:29)
   * @return int          parsed date as a number jjjjmmtt
   */
  public function parseDateTaken($date)
  {
    $tmp = explode(" ", $date);
    $tmp = $tmp[0];
    $tmp = explode(":", $tmp);
    $date = $tmp[0].$tmp[1].$tmp[2];
    return $date;
  }

}

?>