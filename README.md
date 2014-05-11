MulticolumnGallery
==================

* [Description](#Description)
* [Gallery Example](#Gallery Example)
* [Setup](#Setup)
* [License](#License)

## <a name="Description"></a>Description 
Dynamic, customizable and responsive image gallery.

## <a name="Gallery Example"></a>Gallery Example
[Gallery Demo](http://andreaslorer.de/)

## <a name="Setup"></a>Setup
Clone or download and unzip the repository to your website.  
Include the following files in your HTML document.  
```html
<script src="js/Ajax.js" type="text/javascript" charset="utf-8" async defer></script>
<script src="js/Resize.js" type="text/javascript"></script>
<script src="js/Scrolling.js" type="text/javascript"></script>
<script src="js/ColumnBuilder.js" type="text/javascript"></script>
```
If you want a Lightbox (see http://dimsemenov.com/plugins/magnific-popup/ for more infos or help) for your images enabled, include the following files into your HTML document:
```html
<!-- Magnific Popup core CSS file -->
<link rel="stylesheet" href="assets/magnific-popup/magnific-popup.css"> 

<!-- jQuery 1.7.2+ or Zepto.js 1.0+ -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script> 

<!-- Magnific Popup core JS file -->
<script src="assets/magnific-popup/jquery.magnific-popup.js"></script> 
```
Add the following div-box into your HTML document
```html
<div class="popup-gallery">

	<script src="assets/magnific-popup/magnific.js"></script>
	
</div><!-- ./popup-gallery -->
```
Customize your gallery through the config file placed in /config/config.json

## <a name="License"></a>License
Released under the [MIT License](http://opensource.org/licenses/MIT)
