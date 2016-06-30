var postLink = []; //To make sure there are no duplicates
var lastId; //Get the final image ID so I can load the next page
var currentId; //Get the Current ID of the image so I can load next image batch.

function getPosts(url, params){
  $('.loading').show();
  params = params || {};
  $.getJSON(
    url, params, //Multi subreddit that includes the images
    function (data){
      var pagechildren = data.data.children;
      var html = '';
      $.each(
        pagechildren.slice(),
        function (i, post) {
          var imgurl = fixURL(post.data.url);
          var imgext = imgurl.split('.').pop(); //Get the extension of the upload
          if(imgurl != "invalid"){
            postLink.push(post.data.url); //Add it to array of duplicate checks.
            html += buildContent(post.data.title, imgurl, post.data.url, imgext);
          }
        }
      );
      if (pagechildren && pagechildren.length > 0) { //If there are posts
        lastId = pagechildren[pagechildren.length - 1].data.id; //Get the last post's id so we can load at that point during new page
        if($.isEmptyObject(params) == false){ //If it's not the home page
          currentId = pagechildren[pagechildren.length - 25].data.id; //If we decide to load x amount of pics at a time
        }
      } else {
        lastId = undefined; //Hopefully this doesn't happen and we run out of posts
      }
      $('.loading').hide();
      var $el = $(html).filter('div.grid-item');
      $('.grid').masonryImagesReveal($el);
    }
  );
}

$.fn.masonryImagesReveal = function( $items ) {
  var msnry = this.data('masonry');
  var itemSelector = msnry.options.itemSelector;
  $items.hide();
  this.append( $items );
  $items.imagesLoaded().progress(function( imgLoad, image ) {
    var $item = $( image.img ).parents(itemSelector);
    var video = $item.children('.panel-body').children('video');
    if(video.length > 0){
      video.on("loadedmetadata loadeddata", function(){
        if(this.videoHeight > this.height){
            $(image.img).parent().css("min-height", this.height + "px");
        }
        else{
          $(image.img).parent().css("min-height", this.videoHeight + "px");
        }
        $('.grid').masonry('layout');
      });
    }
    $item.show();
    msnry.appended( $item );
  });
  return this;
};


function buildContent(title, imgurl, rawurl, imgext){
  var c = $(".grid");
  var html = '<div class="grid-item panel panel-default col-md-4"><div class="panel-heading text-center"><a href="'+rawurl +'">'+ title +'</a>'+'</div><div class="panel-body">';

  if($.inArray(imgext, ['gifv', 'gif', 'mp4', 'webm']) > -1 ){  //If the post is a gif, make it a webm and if not, mp4
    var mp4 = imgurl.split('.')
    var webm = imgurl.split('.');
    mp4[mp4.length -1] = "mp4";
    webm[webm.length -1 ] = "webm";
    mp4 = mp4.join('.');
    webm = webm.join('.');
    html += '<img /><video controls="true" preload="auto" autoplay loop>'+'<source src="' + webm + '" type="video/webm">'+'<source src="' + mp4 + '"></video></div></div>' ;
  }
  else{
    html += '<a data-lightbox="set" data-title="'+title+'" href="'+imgurl+'">';
    if($.inArray(imgext, ['jpg','png','jpeg','tif']) > -1 ){ //If the post already has a picture extension
     html += '<img class="image" src="' + imgurl + '">';
    }
    else if($.inArray("reddituploads", imgurl.split('.')) > -1 ){ //If the picture is a reddit upload instead
      html += '<img class="image" src="' + imgurl + '">';
    }
    else{ //Otherwise just add a .jpg extension to the end. Brute force.
      html += '<img class="image" src="' + imgurl + '.jpg">';
    }
    html += '</a></div></div>';
  }
  return html;
}

//Check to make sure the image is served in HTTPS, is linked correctly
function fixURL(url){
  if(checkSource(url)){
    var http = url.split(':');
    http[0] = "https";

    //Make sure it doesn't have an extension. For now, do gifs as jpg until I find out how to check type
    if((url.indexOf("imgur") > -1) && ($.inArray(url.split('.').pop(), ['jpg','png','jpeg','tif', 'gif', 'gifv', 'mp4','webm']) < 0)){

      var fix = url.split('/');
      url = "https://" + "i.imgur.com/" + fix[fix.length -1] + ".jpg";
    }
    else if((url.indexOf("gfycat") > -1) && ($.inArray(url.split('.').pop(), ['gif', 'gifv']) < 0)){
      var fix = url.split('/');
      url = "https://" + "zippy.gfycat.com/" + fix[fix.length -1] + ".gifv";
    }
    else{
      url = http.join(':');
    }
    return url;
  }
  else{
      return "invalid";
  }
}

//Make sure it's not a duplicate, album, text post, instagram, or youtube video. (For now)
function checkSource(imgurl){
  if($.inArray(imgurl, postLink) > -1){
    return false;
  }
  if(imgurl.indexOf("reddit.com") > -1 || imgurl.indexOf("youtube.com") > -1 || imgurl.indexOf("instagram.com") > -1){
    return false;
  }
  if(imgurl.indexOf("imgur.com/a/") > -1 || imgurl.indexOf("imgur.com/gallery/") > -1){
    return false;
  }
  //Create a whitelist so that non-whitelisted images are not shown. (&& imgurl.indexOf("gfycat") < 0) - Gfycat is wierd
  if(imgurl.indexOf("imgur.com") < 0 && imgurl.indexOf("reddituploads") < 0  && imgurl.indexOf("redd.it")){
    return false;
  }
  return true;
}

$(document).ready(function (){
  var jsonurl= "https://www.reddit.com/user/MCorean/m/superaww.json?jsonp=?";

  //Get the posts
  getPosts(jsonurl);

  /*Light Box and Masonry*/
  lightbox.option({
    'resizeDuration': 200,
    'showImageNumberLabel': false,
    'fadeDuration': 200,
    'positionFromTop': 0
  });

  var $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    percentPosition: true
  });
  $grid.imagesLoaded().progress(function() {
    $grid.masonry('layout');
  });

  //Initialize Tooltip
  $('[data-toggle="tooltip"]').tooltip()

  /*Image Load and Navbar*/
  var lastScrollTop = 0;
  $(window).scroll(function(event) {
    //Get more Posts when scroll to bottom
     if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
       if(lastId){
         getPosts(jsonurl,{
           after: 't3_' + lastId
         });
       }
       else{
         getPosts(jsonurl);
       }
     }
     //Display and Hide Navbar
     var st = $(this).scrollTop();
     if(st > 100){
       $('nav').addClass('navbar-inverse');
       $('nav').removeClass('navbar-default');
     }
     else{
       $('nav').removeClass('navbar-inverse');
       $('nav').addClass('navbar-default');
     }
     if(st > lastScrollTop){
       if($('nav').is(":visible")){
         $('nav').slideUp("fast");
       }
     }else{
      if($('nav').is(":hidden")){
        $('nav').slideDown("fast");
      }
     }
     lastScrollTop = st;
  });

  /*Scroll To Top*/
  $('#top').click(function(){
      $('html,body').animate({ scrollTop: 0 }, 'slow');
      return false;
  });

});
