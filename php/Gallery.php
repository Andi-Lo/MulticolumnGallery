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

		for ($i=1; $i <= NUM_OF_COLUMNS; $i++) { 
			if($i == 1){
				$columnNames[] = $i.'_Column';
			} else{
				$columnNames[] = $i.'_Columns';
			}
		}

		$queries = $column->calcQueries();
		$activeColumn = self::calcActiveColumn($requestWidth, $queries);

		self::$_columnContainer =
			array(
				'mediaQueries'  => $queries,
				'numOfColumns'  => NUM_OF_COLUMNS,
				'columnNames'	  => $columnNames,
				'resize'				=> $config->resize,
				'fadeIn'        => $config->fadeIn,
				'activeColumn'  => $activeColumn,
			);

		for ($i=0; $i < NUM_OF_COLUMNS; $i++) { 
			self::$_columnContainer[$columnNames[$i]] = $column->getColumn($i, $images);
			$columnHeight[] = end(self::$_columnContainer[$columnNames[$i]])->posY;
		}

		self::$_columnContainer['columnHeight'] = $columnHeight;
		self::printJSON();
	}

	public function printJSON()
	{
		header("content-type:application/json");
		echo (json_encode(self::$_columnContainer));
	}

	public function calcActiveColumn($requestWidth, $queries)
	{
		$tmpDiff = 0;
		$key = -1;

		foreach ($queries as $query => $value) {
			$diff = $requestWidth - $value;
			if($diff < $tmpDiff || $tmpDiff == 0){
				$tmpDiff = $diff;
				$key = $query;
			}
		}
		return $key+1; 			// +1 because columns-names run from 1 to 5 not from 0 to 4
	}
}
?>