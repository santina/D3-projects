// Wait til jQuery and the DOM is fully loaded on the page,
// then run this function.
$(function () {
  $('#query').on('keyup', function (event) {
    // Log the event object to the console.
    // console.log(event);

    var node = event.currentTarget; //get raw node of DOM (the input box)
    var name = $(node).val(); //wrap it back to JQuery node and get the value in the input box

    $.ajax({
      url: 'http://localhost:3000/' + name.toLowerCase(),
      dataType: 'json',
      success: function (serverData) {
        // If the object we get back from the server has an `error` property,
        // then we display the error message we got back from the server.
        if (serverData.error) {
          // Replace the HTML in the <div class="results"> element with the
          // server's error message (class requires a '.' instead of '#')
          $('.results').html('<span>' + serverData.error + '</span>');
        } else {
          // `name` is from before, `serverData.attractiveness` is what we get back from the server.
          var string = name + " has an attractiveness level of " + serverData.attractiveness;
          $('#results').html('<span>' + string + '</span>. They belong to the ' + serverData.club + '.');
        }
      }
    })
  });
});