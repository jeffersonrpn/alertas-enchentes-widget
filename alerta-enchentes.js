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

  function getData(params, callback) {
    Alert.$ = Alert.jQuery = jQuery.noConflict(true);
    $.ajax({
      method: 'GET',
      url: 'http://alertas-enchentes-api.herokuapp.com/station/13600002/prediction?timestamp=1461592800',
      data: {},
      sucess: function() {
        callback();
      },
      error: function(error) {
        console.log(error);
        callback();
      }
    });
  }

  function drawWidget() {
    var container = document.getElementById("alerta-enchentes");

    container.innerHTML =
      "<div>" +
      "  <h3>Here is the widget</h3>" +
      "</div>";
    var scg = d3.select("#alerta-enchentes")
      .append("svg");
  }

  loadScript('//d3js.org/d3.v3.min.js', function() {
    loadScript('//code.jquery.com/jquery-3.1.0.min.js', function() {
      var url = getScriptUrl();
      var params = getUrlParameters(url);
      getData(params, drawWidget);
    });
  });

  return Alert;
})(window);
