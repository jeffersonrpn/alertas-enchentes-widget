var Alert = (function(window, undefined) {
  var Alert = {};
  function loadSupportingFiles(callback) {}
  function getWidgetParams() {}
  function getData(params, callback) {}
  function drawWidget() {}

  loadSupportingFiles(function() {
    var params = getWidgetParams();
    getData(params, function() {
      drawWidget();
    });
  });

  return Alert;
})(window);
