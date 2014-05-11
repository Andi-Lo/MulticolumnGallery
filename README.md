MulticolumnGallery
==================

* [Description](#Description)
* [Gallery Example](#Gallery Example)
* [Requirements](#Requirements)
* [Setup](#Setup)
* [Resizing Images](#Resize)
* [License](#License)

## <a name="Description"></a>Description 
Dynamic, customizable and responsive image gallery.

## <a name="Gallery Example"></a>Gallery Example
[Gallery Demo](http://andreaslorer.de/)

## <a name="Requirements"></a>Requirements
If you want to run it on localhost you need a server (like Xampp) of course

## <a name="Setup"></a>Setup
Clone or download and unzip the repository to your website.  
Include the following files in your HTML document. Make sure that the includes are in this order placed in your HTML `<head>`! (the JQuery library has to be loaded befor the javascript files) 
```html
<!-- JQuery library -->
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<!-- Gallery core JS files -->
<script src="js/Ajax.js" type="text/javascript"></script>
<script src="js/Scrolling.js" type="text/javascript"></script>
<script src="js/Resize.js" type="text/javascript"></script>
<script src="js/ColumnBuilder.js" type="text/javascript"></script>
```
If you want a Lightbox (see http://dimsemenov.com/plugins/magnific-popup/ for more infos or help) for your images enabled, include the following files into your HTML document:
```html
<!-- Magnific Popup core CSS file -->
<link rel="stylesheet" href="assets/magnific-popup/magnific-popup.css"> 

<!-- Magnific Popup core JS file -->
<script src="assets/magnific-popup/magnific-popup.js"></script> 
```
Add the following div-box into your HTML document
```html
<div id="gallery" class="popup-gallery">

	<script src="assets/magnific-popup/magnific.js"></script>
	
</div><!-- ./popup-gallery -->
```
Customize your gallery through the config file placed in /config/config.json  
Add Images and Thumbnail into the appropriate folders:  
* Image files should be 1600*1200 to increase performance.
* Supported image formats are png, jpg, gif.
* thumbnails can be named thumb_imagename or need to have the same imagename.
* * e.g if the name is IMGP7001.jpg then your thumbnail needs to be named thumb_IMGP7001.jpg or IMGP7001.jpg

## <a name="resize"></a>Resizing Images
When using a Unix system you can easily resize the images and create thumbnails on the fly with just one simple bash command provided by [ImageMagick](http://www.imagemagick.org/index.php). Normally Unix comes with ImageMagick already installed you can check this by typing `$ identify -version`.

Make a backup of your images befor you run this command!!! (If your pictures are in another file format, change *.jpg to the format you like e.g. *.png)
```bash
$ mkdir images; ls *.jpg | xargs -r -I FILE   convert FILE -auto-orient -unsharp 0x0.5 -resize 1600x1200 -strip images/FILE && mkdir thumbs; ls *.jpg | xargs -r -I FILE   convert FILE -define jpeg:size=760x760 -auto-orient -thumbnail 300 -unsharp 0x0.5 -strip thumbs/thumb_FILE
```

## <a name="License"></a>License
Released under the [MIT License](http://opensource.org/licenses/MIT)
