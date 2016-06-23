var postLink = []; //To make sure there are no duplicates
var loadVal = 5; //Load 5 images at a time (for now)
var lastId; //Get the final image ID so I can load the next page
var currentId; //Get the Current ID of the image so I can load next image batch.

function getPosts(params){
  params = params || {};
  $.getJSON(
    "https://www.reddit.com/u/MCorean/m/superaww.json?jsonp=?", params, //Multi subreddit that I found and cloned.
    function (data){
      var pagechildren = data.data.children;
      $.each(
        pagechildren.slice(0, loadVal),
        function (i, post) {
          var imgurl = httpscheck(post.data.url);
          var imgext = imgurl.split('.').pop(); //Get the extension of the upload
          //Make sure it's not a duplicate, text post, or youtube video.
          if($.inArray(imgurl, postLink) < 0 && imgurl.indexOf("reddit.com") < 0 && imgurl.indexOf("youtube.com") < 0){
            postLink.push(imgurl); //Add it to array of duplicate checks.

            $("#content").append( '<br>' + post.data.title );
            $("#content").append( '<br>' + post.data.url);

            if($.inArray(imgext, ['jpg','png','jpeg','tif']) > -1 ){
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray("reddituploads", imgurl.split('.')) > -1 ){
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray(imgext, ['gifv']) > -1 ){
              $("#content").append( '<br>' + '<video class="image" preload="auto" autoplay loop>'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'webm" type="video/webm">'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'mp4">' + '</video>' );
            }
            else{
              $("#content").append( '<br>' + '<img class="image" src="' + imgurl + '.jpg">' );
            }

            $("#content").append('<hr>');
          }
        }
      );
      if (pagechildren && pagechildren.length > 0) {
        lastId = pagechildren[pagechildren.length - 1].data.id;
        if($.isEmptyObject(params) == false){
          currentId = pagechildren[pagechildren.length - 25].data.id;
          console.log("Current ID Title: "+pagechildren[pagechildren.length - 25].data.title);
        }
        console.log("Next ID Title: "+pagechildren[pagechildren.length - 1].data.title);
        console.log("Loaded LastID: " + lastId);
        console.log("Loaded CurrentID: " +currentId);
      } else {
        lastId = undefined;
      }
    }
  );
}

getPosts();

function httpscheck(url){
  var http = url.split(':');
  http[0] = "https";
  url = http.join(':');
  return url;
}

$('#loadMore').click(function(e){
  e.preventDefault();
  loadVal += 5;
  console.log("LoadVal: " + loadVal);
  if(loadVal > 25){
    if(lastId){
      loadVal = 5;
      console.log("Get New Page");
      getPosts({
        after: 't3_' + lastId
      });
    }
  }
  else{
    console.log('LastID: '+ lastId);
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
