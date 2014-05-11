<?php
require_once 'Gallery.php';

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

	public static $_numOfElements = 0;
	public static $_thumbNames = array(); 

	public function initializing()
	{
		$images = array();
		$names = array();
		$names = $this->readDirectory(DIR_PATH_IMAGES);
		self::$_thumbNames = $this->readDirectory(DIR_PATH_THUMBNAILS);

		foreach($names as $value){
			$imgPath = DIR_PATH_IMAGES."$value";
			$img = new Image();
			$img->imgPath = PATH_IMAGES."$value";
			$img->imgName = $value;
			$img->thumbnail = $img->setThumbnailName($img);
			$img->id = self::$_numOfElements;
			$img->readMetadata($imgPath, $img);
			self::$_numOfElements++;
			$images[] = $img;       
		}
		Image::osort($images);
		return $images;
	}

	public function readDirectory($imagePath)
	{
		$names = array();
		if(is_dir($imagePath)){
			$scanned_directory = array_diff(scandir($imagePath), array('..', '.'));
			foreach ($scanned_directory as $key => $value) {        
				$names[] = $value;
			}
			return $names;
		} else echo "readDirectory failed: no such directory found<br>";
	}

	public static function osort(&$array)
	{
		$array = array_reverse($array, false);
	}

	public function readMetadata($imgPath, $img)
	{  
		list($width, $height, $type, $attr) = getimagesize($imgPath);
		$img->width = $width;
		$img->height = $height;
		$img->type = $type;
		$img->attr = $attr;
	}

	public function setThumbnailName($img)
	{
		$findme = array('.jpg','.jpeg','.png', '.gif');     	  		// supported datatypes
		foreach ($findme as $format) {                                             
			if(strpos($img->imgName, $format)){                     	// imagename is name.jpg/png/.. ?
				foreach (self::$_thumbNames as $thumb_name) {                      
					$pos = strpos($img->imgName, $format);              	// position of the datatype
					$substring = substr($img->imgName, 0, $pos);        	// remove datatype from string
					if("thumb_".$substring.$format == $thumb_name){ 			// if Thumbnail is in folder
						$img->thumbnailPath = PATH_THUMBNAILS.         	  	// set thumbnail path
								"thumb_".$substring.$format;
						return "thumb_".$substring.$format;              		// return Thumbnailname (bsp: thumb_IMG2342.jpg)
					}
				}
			}
		}
		return "file_not_found";
	} /* TODO: remove thumb_ name restriction */

}

?>