var postLink = []; //To make sure there are no duplicates
var loadVal = 10; //Load 5 images at a time (for now)
var lastId; //Get the final image ID so I can load the next page
var currentId; //Get the Current ID of the image so I can load next image batch.

function getPosts(params){
  $('.loading').show();
  params = params || {};
  $.getJSON(
    "https://www.reddit.com/user/MCorean/m/superaww.json?jsonp=?", params, //Multi subreddit that I found and cloned.
    function (data){
      var pagechildren = data.data.children;
      $.each(
        pagechildren.slice(loadVal-10, loadVal),
        function (i, post) {
          var imgurl = fixURL(post.data.url);
          var imgext = imgurl.split('.').pop(); //Get the extension of the upload
          if(imgurl != "invalid"){
            postLink.push(post.data.url); //Add it to array of duplicate checks.

            buildContent(post.data.title, imgurl, post.data.url, imgext);
          }
        }
      );
      if (pagechildren && pagechildren.length > 0) { //If there are posts
        lastId = pagechildren[pagechildren.length - 1].data.id; //Get the last post's id so we can load at that point during new page
        if($.isEmptyObject(params) == false){ //If it's not the home page
          currentId = pagechildren[pagechildren.length - 25].data.id; //Then we can use this to load the next 5 images of the same page.
        //  console.log("Current ID Title: "+pagechildren[pagechildren.length - 25].data.title);
        }
        //console.log("Next ID Title: "+pagechildren[pagechildren.length - 1].data.title);
        //console.log("Loaded LastID: " + lastId);
        //console.log("Loaded CurrentID: " +currentId);
      } else {
        lastId = undefined; //Hopefully this doesn't happen and we run out of posts
      }
      $('.loading').hide();
    }
  );
}

function buildContent(title, imgurl, rawurl, imgext){
  var c = $(".grid");
  var html = '<div class="grid-item panel panel-default col-md-4"><div class="panel-heading">'+title+'</div><div class="panel-body">';

  if($.inArray(imgext, ['gifv', 'gif']) > -1 ){ //If the post is a gif, make it a webm and if not, mp4
    html += '<video class="gif" controls="true" preload="auto" autoplay loop>'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'webm" type="video/webm">'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'mp4">' + '</video></div></div>' ;
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
  c.append(html);
}

//Check to make sure the image is served in HTTPS, is linked correctly
function fixURL(url){
  if(checkSource(url)){
    var http = url.split(':');
    http[0] = "https";

    //For now, do gifs as jpg until I find out how to check type
    if(url.indexOf("imgur") > -1 && ($.inArray(url.split('.').pop(), ['jpg','png','jpeg','tif', 'gif', 'gifv']) < 0)){
      var fix = url.split('/');
      url = "https://" + "i.imgur.com/" + fix[fix.length -1] + ".jpg";
    }
    else if(url.indexOf("gfycat") > -1 && ($.inArray(url.split('.').pop(), ['gif', 'gifv']) < 0)){
      var fix = url.split('/');
      url = "https://" + "zippy.gfycat.com/" + fixfix[fix.length -1] + ".gifv";
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
  //Create a whitelist so that non-whitelisted images are not shown.
  if(imgurl.indexOf("imgur.com") < 0 && imgurl.indexOf("reddituploads") < 0 && imgurl.indexOf("gfycat") < 0 && imgurl.indexOf("redd.it")){
    return false;
  }
  return true;
}

//Load more images when scrolled to bottom
$(window).scroll(function() {
   if($(window).scrollTop() + $(window).height() > $(document).height() - 100) {
     loadVal += 10; //Load only 5 at a time... For now?
     if(loadVal > 50){
       if(lastId){
         loadVal = 10;
         getPosts({
           count: '50',
           after: 't3_' + lastId
         });
       }
     }
     else{
       if(currentId){
         getPosts({
           count: '50',
           after: 't3_' + currentId
         });
       }
       else{
         getPosts();
       }
     }
   }
    $grid.masonry();
});

//Load More images when clicking load more.
$('#loadMore').click(function(e){
  e.preventDefault();
  loadVal += 10; //Load only 5 at a time... For now?
  if(loadVal > 50){
    if(lastId){
      loadVal = 10;
      getPosts({
        count: '50',
        after: 't3_' + lastId
      });
    }
  }
  else{
    if(currentId){
      getPosts({
        count: '50',
        after: 't3_' + currentId
      });
    }
    else{
      getPosts();
    }
  }
});


$(document).ready(function (){
  //Get the posts
  getPosts();

  //Lightbox and masonry
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
  $grid.imagesLoaded().progress( function() {
    $grid.masonry();
  });
});
