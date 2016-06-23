var postLink = []; //To make sure there are no duplicates
var loadVal = 5; //Load 5 images at a time (for now)
var lastId; //Get the final image ID so I can load the next page
var currentId; //Get the Current ID of the image so I can load next image batch.

function getPosts(params){
  params = params || {};
  $.getJSON(
    "https://www.reddit.com/user/MCorean/m/superaww.json?jsonp=?", params, //Multi subreddit that I found and cloned.
    function (data){
      var pagechildren = data.data.children;
      $.each(
        pagechildren.slice(0, loadVal),
        function (i, post) {
          var imgurl = fixURL(post.data.url);
          var imgext = imgurl.split('.').pop(); //Get the extension of the upload
          if(imgurl != "invalid"){
            postLink.push(post.data.url); //Add it to array of duplicate checks.

            $("#content").append( '<br>' + post.data.title ); //Get Post Title
            $("#content").append( '<br>' + post.data.url); //Get Post Direct Link Raw URL

            if($.inArray(imgext, ['jpg','png','jpeg','tif']) > -1 ){ //If the post already has a picture extension
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray("reddituploads", imgurl.split('.')) > -1 ){ //If the picture is a reddit upload instead
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray(imgext, ['gifv']) > -1 ){ //If the post is a gif, make it a webm and if not, mp4
              $("#content").append( '<br>' + '<video class="image" preload="auto" autoplay loop>'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'webm" type="video/webm">'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'mp4">' + '</video>' );
            }
            else{ //Otherwise just add a .jpg extension to the end. Brute force.
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '.jpg">' );
            }

            $("#content").append('<hr>');
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
    }
  );
}

//Init the function
getPosts();

//Check to make sure the image is served in HTTPS, is linked correctly
function fixURL(url){
  if(checkSource(url)){
    var http = url.split(':');
    http[0] = "https";

    if(url.indexOf("imgur") > -1 && ($.inArray(url.split('.').pop(), ['jpg','png','jpeg','tif', 'gif', 'gifv']) < 0)){
      var fix = url.split('/');
      url = "https://" + "i.imgur.com/" + fix[fix.length -1] + ".jpg";
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
  if(imgurl.indexOf("imgur.com/a/") > -1){
    return false;
  }

  return true;

}

//Load More images when clicking load more.
$('#loadMore').click(function(e){
  e.preventDefault();
  loadVal += 5; //Load only 5 at a time... For now?
  if(loadVal > 25){
    if(lastId){
      loadVal = 5;
      getPosts({
        after: 't3_' + lastId
      });
    }
  }
  else{
    if(currentId){
      getPosts({
        after: 't3_' + currentId
      });
    }
    else{
      getPosts();
    }
  }
});
