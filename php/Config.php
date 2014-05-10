<?php

class Config{
	public $number_of_columns = 0;
	public $thumbnail_width = 0;
	public $thumb_path = "";
	public $image_path = "";
	public $offset = 0;
	public $margin_left_hdr = 0;
	public $margin_left_hd = 0;
	public $margin_top = 0;
	public $margin_right = 0;
	public $center = 'yes';
	public $resize = 'yes';
	public $fadeIn = 'yes';

	function __construct($path)
	{
		$json = json_decode(file_get_contents($path), true);
		$this->thumbnail_width = $json['thumbnail_width'];
		$this->offset = $json['space_between_pictures'];
		$this->margin_left_hdr = $json['margin_left'];
		$this->margin_left_hd = $json['margin_left_hd'];
		$this->margin_top = $json['margin_top'];
		$this->margin_right = $json['margin_right'];
		$this->number_of_columns = $json['number_of_columns'];
		$this->center = $json['center_fifth_column'];
		$this->image_path = $json['your_image_directory_path'];
		$this->thumb_path = $json['your_thumbnail_directory_path'];
		$this->resize = $json['resize_columns'];
		$this->fadeIn = $json['fade_in_pictures'];
	}
}

?>