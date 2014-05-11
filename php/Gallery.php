<?php
require_once 'Column.php';
require_once 'Config.php';
require_once 'Image.php';

if(! defined("CONFIG_PATH")) define('CONFIG_PATH', '../config/config.json');

$config = new Config(CONFIG_PATH);
for ($i=0; $i < $config->number_of_columns; $i++) { 
	if(! defined("COLUMN_".$i)) define("COLUMN_".$i, $i);
}

if(! defined("COLUMN_ONE")) define("COLUMN_ONE",  0);
if(! defined("COLUMN_TWO")) define("COLUMN_TWO",  1);
if(! defined("COLUMN_THREE")) define("COLUMN_THREE",2);
if(! defined("COLUMN_FOUR")) define("COLUMN_FOUR", 3);
if(! defined("COLUMN_FIVE")) define("COLUMN_FIVE", 4);
if(! defined("COLUMN_SIX")) define("COLUMN_SIX", 5);
if(! defined("COLUMN_SEVEN")) define("COLUMN_SEVEN", 6);
if(! defined("COLUMN_EIGHT")) define("COLUMN_EIGHT", 7);
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

	public $images = array();
	public $mediaQueries = array();

	public static $_columnContainer = array();
	
	function __construct()
	{
		$column = new Column();
		$image = new Image();
		$images = $image->initializing();
		global $config;
		for ($i=1; $i <= $config->number_of_columns; $i++) { 
			if($i == 1){
				$names[] = $i.'_Column';
			} else{
				$names[] = $i.'_Columns';
			}
		}

		self::$_columnContainer =
			array(
				'mediaQueries'  => $column->calcQueries(),
				'numOfColumns'  => NUM_OF_COLUMNS,
				'columnNames'	  => $names,
				'resize'				=> $config->resize,
				'fadeIn'        => $config->fadeIn,
			);

		for ($i=0; $i < NUM_OF_COLUMNS; $i++) { 
			self::$_columnContainer[$names[$i]] = $column->getColumn($i, $images);
		}

		self::printJSON();
	}

	public function printJSON()
	{
		header("content-type:application/json");
		echo (json_encode(self::$_columnContainer));
	}

}

?>