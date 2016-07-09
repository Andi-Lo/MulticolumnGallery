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
      cursor: 'null',
      tError: '<a href="%url%">The image </a> could not be loaded.',
      titleSrc: function(item) {
        return item.el.attr('title') + '<small>&#169; Your Name here</small>';
        // return '<small> &#169; by Your Name here</small>';
      }
    }
  });
});