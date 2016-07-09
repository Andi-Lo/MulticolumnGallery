<?php

require_once 'Gallery.php';
require_once 'Config.php';

$config = new Config();

/*
Thumbnail generieren

$imagedir Finaler Pfad (ggf. zum Aufruf passender relativer Pfad)
$imageName Dateiname des Bildes (mit Endung aber ohne Suffixe)
$replace true/false true: vorhandenes Thumbnail wird ggf. ersetzt
$suffix Suffix für das generierte Thumbnail (Standard: "_tb")
$resize Größenangabe (B x H), auf die das Bild verkleinert werden soll (Standard: $settings['tb_size'])
$rez_type Resize-Art dyn|fix (dynamisch oder fest) (Standard: $settings['thumbnail_type'])

RETURN: imagedir+filename(inkl. Suffix)+Endung des generierten Thumbnails / false
*/
class Thumbnail{

  public static function makeThumbs(&$image)
  {
    global $config;

    $imagedir = "../" . $config->image_path;
    $thumbdir = "../" . $config->thumb_path;
    $imageName = $image->imgName;
    $imagePath = $imagedir . $imageName;
    $replace = false;
    $prefix = $config->thumbnail_prefix;
    $suffix = $config->thumbnail_postfix;
    $imageWidth = $image->width;
    $imageHeight = $image->height;
    $thumbWidth = $config->thumbnail_width;
    $imgRatio = $thumbWidth / $imageWidth;
    $thumbHeight = (int)($imgRatio * $imageHeight);  // calc aspect ratio of the image

    // set the thumbnail imagedir, since we created a new thumbnail we have to link it to the picture
    $image->thumbnailPath = $config->thumb_path . $prefix . $imageName . $suffix;
    $image->thumbnail = $prefix . $imageName . $suffix;

    $rez_type="fix";

    $split = explode('.', $imageName);
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
    if(file_exists($imagePath)){

      if($fileType == "jpg" || $fileType == "png"){
        $c1 = array("x"=>0, "y"=>0);

        // Resize images
        switch($rez_type){
          case "dyn":
            if($imageWidth > $thumbWidth && ($imageWidth / $thumbWidth) >= ($imageHeight / $thumbHeight))
              $k = $imageWidth / $thumbWidth;
            elseif($imageHeight > $thumbHeight && ($imageWidth / $thumbWidth) < ($imageHeight / $thumbHeight))
              $k = $imageHeight / $thumbHeight;
            else
              $k = 1;

            $thumbWidth = $imageWidth / $k;
            $thumbHeight = $imageHeight / $k;
          break;

          case "fix":
            if(($imageWidth / $thumbWidth) <= ($imageHeight / $thumbHeight)){
              $k = $imageWidth / $thumbWidth;
              $imageHeight = $k * $thumbHeight;
              $c1['y'] = ($imageHeight - $imageHeight) / 2;
            }
            else{
              $k = $imageHeight / $thumbHeight;
              $imageWidth = $k * $thumbWidth;
              $c1['x'] = ($imageWidth - $imageWidth) / 2;
            }
          break;
        }

        $echofile_id = imagecreatetruecolor($thumbWidth, $thumbHeight);

        switch($fileType){
          case('png'):
            $sourcefile_id = imagecreatefrompng($imagePath);

            imagealphablending($echofile_id, false);
            $colorTransparent = imagecolorallocatealpha($echofile_id, 0, 0, 0, 127);
            imagefill($echofile_id, 0, 0, $colorTransparent);
            imagesavealpha($echofile_id, true);
          break;
          
          default:
            $sourcefile_id = imagecreatefromjpeg($imagePath);
        }

        // Create a jpeg out of the modified picture
        imagecopyresampled($echofile_id, $sourcefile_id, 0, 0, $c1['x'], $c1['y'], $thumbWidth, $thumbHeight, $imageWidth, $imageHeight);

        // replace Thumbnail
        if(!$replace && file_exists($imagedir.$prefix.$filename.$suffix.".".$fileType))
          return $imagedir.$prefix.$filename.$suffix.".".$fileType;
        elseif($replace && file_exists($imagedir.$prefix.$filename.$suffix.".".$fileType)){
          clearstatcache();
          chmod($imagedir.$prefix.$filename.$suffix.".".$fileType, 0777);
          unlink($imagedir.$prefix.$filename.$suffix.".".$fileType);
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

        return $imagedir.$prefix.$filename.$suffix.".".$fileType;
      }// falls Bild ein gif ist
      else 
        return false;
    }
    else
      return false;
  }
}

?>