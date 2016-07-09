<?php

require_once 'Gallery.php';
require_once 'Config.php';

$config = new Config();

/*
Thumbnail generieren

$path Finaler Pfad (ggf. zum Aufruf passender relativer Pfad)
$sourcefilename Dateiname des Bildes (mit Endung aber ohne Suffixe)
$replace true/false true: vorhandenes Thumbnail wird ggf. ersetzt
$suffix Suffix für das generierte Thumbnail (Standard: "_tb")
$resize Größenangabe (B x H), auf die das Bild verkleinert werden soll (Standard: $settings['tb_size'])
$rez_type Resize-Art dyn|fix (dynamisch oder fest) (Standard: $settings['thumbnail_type'])

RETURN: path+filename(inkl. Suffix)+Endung des generierten Thumbnails / false
*/
class Thumbnail{

  public static function makeThumbs(&$image)
  {
    global $config;

    $path = "../" . $config->image_path;
    $thumbdir = "../" . $config->thumb_path;
    $sourcefilename = $image->imgName;
    $sourceFilePath = $path . $sourcefilename;
    $replace = false;
    $prefix = $config->thumbnail_prefix;
    $suffix = $config->thumbnail_postfix;
    $thumbWidth = $config->thumbnail_width;

    // set the thumbnail path, since we created a new thumbnail we have to link it to the picture
    $image->thumbnailPath = $config->thumb_path . $prefix . $sourcefilename . $suffix;
    $image->thumbnail = $prefix . $sourcefilename . $suffix;
    
    $width = $image->width;
    $height = $image->height;
    $imgRatio = $thumbWidth / $width;
    $thumbHeight = (int)($imgRatio * $height);

    $rez_type="";
    
    $rez_size = array();

    $rez_size['width'] = $width;
    $rez_size['height'] = $height;

    $split = explode('.', $sourcefilename);
    $filename = $split[0];
    if(isset($split[1])){
      $fileType = $split[1];
    }
    else {
      $fileType = "";
    }
    
    if($fileType == "jpeg" ||"JPG" || "JPEG") {
      $fileType = "jpg";
    }

    // Überprüfen ob Quelldatei überhaupt exisiert
    if(file_exists($sourceFilePath)){

      if($fileType == "jpg" || $fileType == "png"){
        list($source_width, $source_height) = getimagesize($sourceFilePath);
        $source_height_org = $source_height;
        $source_width_org = $source_width;
        $c1 = array("x"=>0, "y"=>0);

        // Resize images
        switch($rez_type){
          case "dyn":
            if($source_width > $rez_size['width'] && ($source_width/$rez_size['width']) >= ($source_height/$rez_size['height']))
              $k = $source_width/$rez_size['width'];
            elseif($source_height > $rez_size['height'] && ($source_width/$rez_size['width']) < ($source_height/$rez_size['height']))
              $k = $source_height/$rez_size['height'];
            else
              $k = 1;

            $rez_size['width'] = $source_width/$k;
            $rez_size['height'] = $source_height/$k;
          break;

          case "fix":
            if(($source_width/$rez_size['width']) <= ($source_height/$rez_size['height'])){
              $k = $source_width/$rez_size['width'];
              $source_height = $k*$rez_size['height'];
              $c1['y'] = ($source_height_org-$source_height)/2;
            }
            else{
              $k = $source_height/$rez_size['height'];
              $source_width = $k*$rez_size['width'];
              $c1['x'] = ($source_width_org-$source_width)/2;
            }
          break;
        }

        $echofile_id = imagecreatetruecolor($rez_size['width'], $rez_size['height']);

        switch($fileType){
          case('png'):
            $sourcefile_id = imagecreatefrompng($sourceFilePath);

            imagealphablending($echofile_id, false);
            $colorTransparent = imagecolorallocatealpha($echofile_id, 0, 0, 0, 127);
            imagefill($echofile_id, 0, 0, $colorTransparent);
            imagesavealpha($echofile_id, true);
          break;
          
          default:
            $sourcefile_id = imagecreatefromjpeg($sourceFilePath);
        }

        // Create a jpeg out of the modified picture
        imagecopyresampled($echofile_id, $sourcefile_id, 0, 0, $c1['x'], $c1['y'], $rez_size['width'], $rez_size['height'], $source_width, $source_height);

        // replace Thumbnail
        if(!$replace && file_exists($path.$prefix.$filename.$suffix.".".$fileType))
          return $path.$prefix.$filename.$suffix.".".$fileType;
        elseif($replace && file_exists($path.$prefix.$filename.$suffix.".".$fileType)){
          clearstatcache();
          chmod($path.$prefix.$filename.$suffix.".".$fileType, 0777);
          unlink($path.$prefix.$filename.$suffix.".".$fileType);
        } 

        switch($fileType){
          case('png'):
            imagepng($echofile_id,$thumbdir.$prefix.$filename.$suffix.".".$fileType);
          break;

          default:
            imagejpeg($echofile_id,$thumbdir.$prefix.$filename.$suffix.".".$fileType,90);
        }

        @imagedestroy($sourcefile_id);
        @imagedestroy($echofile_id);

        return $path.$prefix.$filename.$suffix.".".$fileType;
      }// falls Bild ein gif ist
      else 
        return false;
    }
    else
      return false;
  }
}

?>