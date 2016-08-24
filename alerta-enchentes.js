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

  function getScriptUrl() {
    var
      scripts = document.getElementsByTagName('script'),
      element,
      src;
    for (var i = 0; i < scripts.length; i++) {
      element = scripts[i];
      src = element.src;

      if (src && /alerta-enchentes\.js/.test(src)) {
        return src
      }
    }
    return null;
  }

  function getUrlParameters(url) {
    var
      query = url.replace(/^.*\?/, ''),
      args = query.split('&'),
      params = {},
      pair,
      key,
      value;

    function decode(string) {
      return decodeURIComponent(string || "").replace('+', ' ');
    }

    for (var i = 0; i < args.length; i++) {
      pair = args[i].split('=');
      key = decode(pair[0]);
      value = decode(pair[1]);
      params[key] = value;
    }

    return params;
  }

  function getData(params, callback) {}
  function drawWidget() {
    var url = getScriptUrl();
    var params = getUrlParameters(url);
    var container = document.getElementById("alerta-enchentes");

    container.innerHTML =
      "<div>" +
      "  <h3>Here is the widget</h3>" +
      "  <p>URL "+ url +"</p>" +
      "  <p>Timestamp "+ params.timestamp +"</p>" +
      "</div>";
    var scg = d3.select("#alerta-enchentes")
      .append("svg");
  }
  loadScript('//d3js.org/d3.v3.min.js', function() {
    drawWidget();
  })

  return Alert;
})(window);
