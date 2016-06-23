var postLink = [];
var loadVal = 0;
var lastId;
function getPosts(params){
  params = params || {};
  $.getJSON(
    "https://www.reddit.com/u/MCorean/m/superaww.json?", params,
    function (data){
      var pagechildren = data.data.children;
      $.each(
        pagechildren.slice(0, loadVal+5),
        function (i, post) {
          var imgurl = post.data.url;
          var imgext = post.data.url.split('.').pop();
          if($.inArray(imgurl, postLink) < 0 && imgurl.indexOf("reddit.com") < 0){
            postLink.push(imgurl);
            $("#reddit-content").append( '<br>' + post.data.title );
            $("#reddit-content").append( '<br>' + post.data.url);
            if($.inArray(imgext, ['jpg','png','jpeg','tif']) > -1 ){
              $("#reddit-content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray("reddituploads", imgurl.split('.')) > -1 ){
              $("#reddit-content").append( '<br>' + '<img class="image" src="' + imgurl + '">' );
            }
            else if($.inArray(imgext, ['gifv']) > -1 ){
              $("#reddit-content").append( '<br>' + '<video class="image" preload="auto" autoplay loop>'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'webm" type="video/webm">'+'<source src="' + imgurl.substring(0,imgurl.length-4) + 'mp4">' + '</video>' );
            }
            else{
              $("#reddit-content").append( '<br>' + '<img class="image" src="' + imgurl + '.jpg">' );
            }
            $("#reddit-content").append( '<hr>' );
          }
        }
      );
      if (pagechildren && pagechildren.length > 0) {
        lastId = pagechildren[pagechildren.length - 1].data.id;
        console.log("Loaded LastID: " + lastId);
      } else {
        lastId = undefined;
      }
    }
  )
  .success(function() { console.log('Load success'); })
  .error(function() { console.log('Error occured'); })
  .complete(function() { console.log('Completed Loading'); });
}

getPosts();

$('#loadMore').click(function(e){
  e.preventDefault();
  loadVal += 5;
  console.log("LoadVal: " + loadVal);
  if(loadVal >= 25){
    if(lastId){
      loadVal = 0;
      console.log("Get New Page");
      getPosts({
        after: 't3_' + lastId
      });
    }
  }
  else{
    console.log('LastID: '+ lastId);
    getPosts();
  }

});
