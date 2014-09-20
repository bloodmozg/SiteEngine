(function($,window,undefined){
  '$:nomunge';
  
  var str_hashchange = 'hashchange',
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  $.fn[ str_hashchange ].delay = 50;
  
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    setup: function() {
      if ( supports_onhashchange ) { return false; }
      $( fake_onhashchange.start );
    },
    teardown: function() {
      if ( supports_onhashchange ) { return false; }
      $( fake_onhashchange.stop );
    }
    
  });
  
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    self.start = function() {
      timeout_id || poll();
    };
    
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    if($.browser){
        $.browser.msie && !supports_onhashchange && (function(){
          var iframe,
            iframe_src;
          self.start = function(){
            if ( !iframe ) {
              iframe_src = $.fn[ str_hashchange ].src;
              iframe_src = iframe_src && iframe_src + get_fragment();

              // Create hidden Iframe. Attempt to make Iframe as hidden as possible
              // by using techniques from http://www.paciellogroup.com/blog/?p=604.
              iframe = $('<iframe tabindex="-1" title="empty"/>').hide()

                // When Iframe has completely loaded, initialize the history and
                // start polling.
                .one( 'load', function(){
                  iframe_src || history_set( get_fragment() );
                  poll();
                })

                // Load Iframe src if specified, otherwise nothing.
                .attr( 'src', iframe_src || 'javascript:0' )

                // Append Iframe after the end of the body to prevent unnecessary
                // initial page scrolling (yes, this works).
                .insertAfter( 'body' )[0].contentWindow;

              // Whenever `document.title` changes, update the Iframe's title to
              // prettify the back/next history menu entries. Since IE sometimes
              // errors with "Unspecified error" the very first time this is set
              // (yes, very useful) wrap this with a try/catch block.
              doc.onpropertychange = function(){
                try {
                  if ( event.propertyName === 'title' ) {
                    iframe.document.title = doc.title;
                  }
                } catch(e) {}
              };

            }
          };

          // Override the "stop" method since an IE6/7 Iframe was created. Even
          // if there are no longer any bound event handlers, the polling loop
          // is still necessary for back/next to work at all!
          self.stop = fn_retval;

          // Get history by looking at the hidden Iframe's location.hash.
          history_get = function() {
            return get_fragment( iframe.location.href );
          };

          // Set a new history item by opening and then closing the Iframe
          // document, *then* setting its location.hash. If document.domain has
          // been set, update that as well.
          history_set = function( hash, history_hash ) {
            var iframe_doc = iframe.document,
              domain = $.fn[ str_hashchange ].domain;

            if ( hash !== history_hash ) {
              // Update Iframe with any initial `document.title` that might be set.
              iframe_doc.title = doc.title;

              // Opening the Iframe's document after it has been closed is what
              // actually adds a history entry.
              iframe_doc.open();

              // Set document.domain for the Iframe document as well, if necessary.
              domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );

              iframe_doc.close();

              // Update the Iframe's hash, for great justice.
              iframe.location.hash = hash;
            }
          };

        })();
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

        return self;
    }
  })();
})(jQuery,this);
