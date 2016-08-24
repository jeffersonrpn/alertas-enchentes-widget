var Alert = (function(window, undefined) {
  var Alert = {};
  function loadSupportingFiles(callback) {}
  function getWidgetParams() {}
  function getData(params, callback) {}
  function drawWidget() {
    var container = document.getElementById("alerta-enchentes");
    container.innerHTML =
      "<div>" +
      "  <h3>Here is the widget</h3>" +
      "</div>";
  }

  drawWidget();

  return Alert;
})(window);
