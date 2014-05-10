
/* function for responsive behavior */
$(function(){
	$(window).resize(function(){
		var winWidth = $(window).width();
		var winHeight = $(window).height();

		/* config file resize is set to yes */
		if(resize == 'yes'){
			/* handle the first column */
			if(winWidth <= queries[0]){
				buildColumn(names[0]);
				refreshScreen();
				return;
			}	/* handle the last column */
			if(winWidth >= queries[queries.length-1]){
				buildColumn(names[columns-1]);
				refreshScreen();
				return;
			} /* handle all other columns */
			if(winWidth >= queries[0]){
				for (var query = columns-1; query > 0; query--) {
					if(winWidth <= queries[query]){
						buildColumn(names[query-1]);
						refreshScreen();
					} 
				}
			}
		}

	})
});