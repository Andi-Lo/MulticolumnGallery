$(document).ready(function() {
  $('.popup-gallery').magnificPopup({
    delegate: 'a',
    type: 'image',
    tLoading: 'Loading image...',
    mainClass: 'mfp-img-mobile',
    gallery: {
      enabled: true,
      navigateByImgClick: true,
      preload: [0,1] // Will preload 0 - before current, and 1 after the current image
    },
    image: {
      tError: '<a href="%url%">The image </a> could not be loaded.',
      titleSrc: function(item) {
        // return item.el.attr('title') + '<small>by Andreas Lorer</small>';
        return '<small>by Andreas Lorer</small>';
      }
    }
  });
});