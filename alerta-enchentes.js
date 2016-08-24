var Alert = (function(window, undefined) {
  var Alert = {};

  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.async = true;
    script.src = url;

    var entry = document.getElementsByTagName('script')[0];
    entry.parentNode.insertBefore(script, entry);

    script.onload = script.onreadystatechange = function() {
      var rdyState = script.readyState;
      if (!rdyState || /complete|loaded/.test(script.readyState)) {
        callback();
        script.onload = null;
        script.onreadystatechange = null;
      }
    }
  }
  function loadSupportingFiles(callback) {}
  function getWidgetParams() {}
  function getData(params, callback) {}
  function drawWidget() {
    var container = document.getElementById("alerta-enchentes");
    container.innerHTML =
      "<div>" +
      "  <h3>Here is the widget</h3>" +
      "</div>";
    var scg = d3.select("#alerta-enchentes").append("svg");
  }
  loadScript('//d3js.org/d3.v3.min.js', function() {
    drawWidget();
  })

  return Alert;
})(window);
