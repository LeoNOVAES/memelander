(function(){
  var i = new Image();
  var engineKey = "Tyut9ZjAAB9kAKBjPMRb";

  var params = '?url=' + encodeURIComponent(window.location.href);
  params += '&engine_key=' + engineKey;

  if (document.referrer != "") { params += "&r=" + encodeURIComponent(document.referrer); }

  i.src = "//cc.swiftype.com/cc" + params;
})();
