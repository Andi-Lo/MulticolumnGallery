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
   * reads all file names of any given directory
   * @param  string $dirPath the folder to read
   * @return string[]          names of files in folder
   */
  public function readDirectory($dirPath)
  {
    $names = array();

    // given path is a folder?
    if(is_dir($dirPath)){

      // extract . .. childs from array
      $scanned_directory = array_diff(scandir($dirPath), array('..', '.'));

      // for every file in folder, get its names
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

  /**
   * sets the thumbnail Name property to a given Image object
   * @param object $img Image
   * @return string Thumnail name or an error message
   * @todo  Transform image file type to lowercase befor checking it so that JPG and jpg is supported
   */
  public function setThumbnailName($img)
  {
    global $config;
    $prefix = $config->thumbnail_prefix;
    $postfix = $config->thumbnail_postfix;
    $findme = array('.jpg','.jpeg','.png');

    // for file ending in files
    foreach ($findme as $format) {

      // imagename is name.jpg/png/.. ?
      if(strpos($img->imgName, $format)){

        // for thumbnail in thumbnails
        foreach (self::$_thumbNames as $thumb_name) {

          // $pos is the string position of the file type e.g. .jpg
          $pos = strpos($img->imgName, $format);

          // extract file name from file.type
          $substring = substr($img->imgName, 0, $pos);

          // if Thumbnail name was found in folder
          if($prefix.$substring.$postfix.$format == $thumb_name) { 
          // set thumbnail path
            $img->thumbnailPath = PATH_THUMBNAILS.                        
                $prefix.$substring.$postfix.$format;

            // return thumbnail name as string (bsp: prefix+myimagename+postfix.jpg)
            return $prefix.$substring.$postfix.$format;
          } /* maybe not needed cause of config file */
          elseif($substring.$format == $thumb_name) {
            $img->thumbnailPath = PATH_THUMBNAILS.$substring.$format;

            // return thumbnail name as string (bsp: thumb_IMG2342.jpg)
            return $substring.$format;
          }
        }
      }
    }
    // no thumbnail for given image file found
    return "file_not_found";
  }

  /**
   * Gets the date of the image out of its metadata header
   * @param  string $imgPath Location of the image
   * @return int             a number (jjjjmmtt) representing the date taken
   */
  public function getDateTaken($imgPath)
  {
    $exif = exif_read_data($imgPath, 0, true);

    // if metadata header is found in file
    if($exif !== null && $exif !== "undefined"){

      // if datetaken property exists
      if(!(empty($exif['EXIF']['DateTimeOriginal']))){

        $dateTaken = $exif['EXIF']['DateTimeOriginal'];

        // remove time stemp from String (e.g. "2012:04:23 21:13:29")
        return self::parseDateTaken($dateTaken);
      }
    }
    return 0;
  }

  /**
   * parse the date taken out of a tuple string
   * @param  String $date DateTimeOriginal format (2012:04:23 21:13:29)
   * @return int          parsed date as a number jjjjmmtt
   */
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