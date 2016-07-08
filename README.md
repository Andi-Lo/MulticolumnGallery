MulticolumnGallery
==================

* [Description](#Description)
* [Features](#Features)
* [Gallery Example](#Gallery Example)
* [Requirements](#Requirements)
* [Setup](#Setup)
* [Resizing Images](#Resize)
* [Documentation](#Documentation)
* [License](#License)

## <a name="Description"></a>Description 
Dynamic, customizable and responsive image gallery made with PHP and JS.  
Show your best pictures to the world with a very minimalistic approach. No picture raiting, nor comments or taggin so your pictures stay in the spotlight!

## <a name="Features"></a>Features
* Lightweight
* Responsive
* Lazy loading
* No database needed
* Supports any number of columns
* Use picture sizes that suits you best
* Position your gallery via a simple config file

## <a name="Gallery Example"></a>Gallery Example
[Gallery Demo](http://andreaslorer.de/)  
[Another Demo](http://www.emkwangen.de/bilder.php)  

## <a name="Requirements"></a>Requirements

Webserver with php or if you want to run it on localhost you need a server (like Xampp). Optional: If you are familiar with **npm** and **gulp** you can take a look at the gulpfile and set up a webserver that way (however you need to proxy through a server that can interprete PHP)

## <a name="Setup"></a>Setup
Clone or download and unzip the repository. Browse the "dist/"-folder and copy those file into your project or website.  
Get the following lines into your HTML document. 
Make sure that the includes are the right order and placed just befor the closing `</body>` tag! (JQuery has to be loaded befor the javascript files if you already have jquery on your site dont include it twice) 
```html
<!-- JQuery library -->
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
<!-- Gallery core JS file, feel free to rename it -->
<script src="assets/js/all.min.js" type="text/javascript"></script>
```

If you want a Lightbox (see http://dimsemenov.com/plugins/magnific-popup/ for more infos or help) for your images enabled, include the following files into your HTML document: (make sure to have JQuery included befor the script tag)
```html
<head>
<!-- Magnific Popup core CSS file -->
<link rel="stylesheet" href="assets/magnific-popup/magnific-popup.min.css"> 
</head>

<!-- make sure to have JQuery included befor this script tag -->
<!-- Magnific Popup core JS file -->
<script src="assets/magnific-popup/magnific-popup.js"></script> 

<!-- Take a look into that file and change the credentials accordingly  -->
<script src="assets/magnific-popup/magnific.js"></script>
</body>
</html>
```

Add the following div-box into your HTML document
```html
<div id="gallery" class="popup-gallery">
</div><!-- ./popup-gallery -->

```
Customize your gallery through the config file placed in /config/config.json  
See Section: Documentation for more Information on how to use the config file.  
Add Images and Thumbnail into the appropriate folders: 
* Image files dimensions should be 1600*1200 (better smaller) to increase performance.
* Supported image formats are png, jpg.
* Thumbnails can be named like this: yourPrefix_imagename, imagename_yourPostfix or a combination of both (e.g. prefix_img_postfix.jpg)
* If you want to place your thumbnails in the same folder as your images, make sure they are pre or postfixed else its not working
* If you place images and thumbnails in an seperat folder they do not need a pre or postfix.

## <a name="resize"></a>Resizing Images
When using a Unix system you can easily resize the images and create thumbnails on the fly with just one simple bash command provided by [ImageMagick](http://www.imagemagick.org/index.php). Normally Unix comes with ImageMagick already installed you can check this by typing `$ identify -version`. If you are familiar with **gulp** and **npm** you can use the gulp command "gulp resize" to resize images.

Make a backup of your images befor you run this command!
If your pictures are in another file format, change *.jpg to the format you like e.g. *.png
```bash
$ mkdir images; ls *.jpg | xargs -r -I FILE   convert FILE -auto-orient -unsharp 0x0.5 -resize 1600x1200 -strip images/FILE && mkdir thumbs; ls *.jpg | xargs -r -I FILE   convert FILE -define jpeg:size=760x760 -auto-orient -thumbnail 300 -unsharp 0x0.5 -strip thumbs/thumb_FILE
```
## <a name="Documentation"></a>Documentation
A short documentation for the config.json file:  
```
{
  "your_image_directory_path": "assets/images/",        // Your folder containing your images

  "your_thumbnail_directory_path": "assets/thumbs/",    // Your folder containing the *thumbnails (*smaller
                                                        // versions of your pictures)
                                                        // Thumbnails can be placed in the same folder
                                                        //   then your images if you pre or postfix them

  "thumbnail_prefix": "thumb_",                         // Your prefix e.g thumb_myimage.jpg

  "thumbnail_postfix": "",                              // Your postfix e.g myimage_thumb.jpg

  "number_of_columns": "5",                             // How many columns you would like to have

  "thumbnail_width": "300",                             // The image width of your thumbnails

  "space_between_pictures": "10",                       // The white space between the pictures

  "margin_left": "10",                                  // Spacing to the left border of your screen

  "margin_left_hd": "180",                              // On bigger screens you can set an extra margin to
                                                        //   center the gallery

  "margin_top": "70",                                   // Spacing from top till the beginning of the gallery

  "margin_right": "0",                                  // Margin to right border of the screen

  "margin_bottom": "0",                                 // Add a margin to the bottom of your page

  "center_column": "yes",                               // Yes / No, centeres the gallery if you have 5 columns

  "resize_columns": "yes",                              // Yes / No, disables responsive behavior

  "fade_in_pictures": "yes",                            // On scrolling down the page you get an fade in animation
                                                        // disalbe this option if you have performance issues.

  "shuffle_pictures": "no",                             // Yes / No, Shuffles pictures to always display
                                                        // different ones on page reload or if a user revisits 
                                                        // your site. If value "No" is chosen the pictures are 
                                                        // sorted by their names

  "sort_pictures_after_date_taken": "yes"               // Yes / No If your pictures got metadata you can sort 
                                                        // your pictures by the date you took them.
                                                        // However if you optimized them for the web, your programm
                                                        // might have removed the metadata header and removed those
                                                        // information.
}

```

## <a name="License"></a>License
Released under the [MIT License](http://opensource.org/licenses/MIT)
