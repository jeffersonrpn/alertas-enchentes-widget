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
      url: 'http://alertas-enchentes-api.herokuapp.com/station/13600002/prediction?timestamp='+params.timestamp,
      data: {},
      sucess: function(data) {
        callback(data);
      },
      error: function(error) {
        var data = JSON.parse('[{"id":{"stationId":13600002,"timestamp":1461592800},"measured":749,"predicted":1029,"corrected":1350,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461593700},"measured":747,"predicted":1031,"corrected":1354,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461594600},"measured":747,"predicted":1035,"corrected":1359,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461595500},"measured":747,"predicted":1038,"corrected":1366,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461596400},"measured":747,"predicted":1042,"corrected":1375,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461597300},"measured":746,"predicted":1045,"corrected":1380,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461598200},"measured":745,"predicted":1048,"corrected":1386,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461599100},"measured":746,"predicted":1051,"corrected":1391,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461600000},"measured":746,"predicted":1055,"corrected":1399,"measuredStatus":"NORMAL","predictedStatus":"ALERTA"},{"id":{"stationId":13600002,"timestamp":1461600900},"measured":745,"predicted":1056,"corrected":1400,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461601800},"measured":745,"predicted":1060,"corrected":1408,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461602700},"measured":743,"predicted":1062,"corrected":1409,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461603600},"measured":743,"predicted":1065,"corrected":1416,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461604500},"measured":742,"predicted":1066,"corrected":1418,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461605400},"measured":743,"predicted":1072,"corrected":1430,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461606300},"measured":741,"predicted":1073,"corrected":1432,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461607200},"measured":740,"predicted":1077,"corrected":1438,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461608100},"measured":740,"predicted":1078,"corrected":1440,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461609000},"measured":739,"predicted":1078,"corrected":1439,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461609900},"measured":739,"predicted":1083,"corrected":1451,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461610800},"measured":738,"predicted":1084,"corrected":1451,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461611700},"measured":737,"predicted":1088,"corrected":1458,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461612600},"measured":737,"predicted":1090,"corrected":1462,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461613500},"measured":736,"predicted":1091,"corrected":1464,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461614400},"measured":735,"predicted":1096,"corrected":1475,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461615300},"measured":735,"predicted":1097,"corrected":1475,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461616200},"measured":734,"predicted":1099,"corrected":1480,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461617100},"measured":734,"predicted":1103,"corrected":1486,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461618000},"measured":733,"predicted":1104,"corrected":1488,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461618900},"measured":732,"predicted":1108,"corrected":1496,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461619800},"measured":732,"predicted":1110,"corrected":1499,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461620700},"measured":732,"predicted":1112,"corrected":1503,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461621600},"measured":730,"predicted":1116,"corrected":1511,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461622500},"measured":730,"predicted":1116,"corrected":1511,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461623400},"measured":730,"predicted":1119,"corrected":1517,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461624300},"measured":729,"predicted":1120,"corrected":1518,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461625200},"measured":729,"predicted":1121,"corrected":1520,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461626100},"measured":728,"predicted":1123,"corrected":1524,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461627000},"measured":728,"predicted":1125,"corrected":1529,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461627900},"measured":726,"predicted":1129,"corrected":1535,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461628800},"measured":726,"predicted":1129,"corrected":1536,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461629700},"measured":726,"predicted":1129,"corrected":1537,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461630600},"measured":725,"predicted":1133,"corrected":1544,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461631500},"measured":725,"predicted":1133,"corrected":1542,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461632400},"measured":724,"predicted":1137,"corrected":1550,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461633300},"measured":724,"predicted":1136,"corrected":1549,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461634200},"measured":723,"predicted":1137,"corrected":1551,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461635100},"measured":723,"predicted":1140,"corrected":1558,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"},{"id":{"stationId":13600002,"timestamp":1461636000},"measured":721,"predicted":1142,"corrected":1560,"measuredStatus":"NORMAL","predictedStatus":"INUNDACAO"}]');
        callback(data);
      }
    });
  }

  function drawWidget(data) {
    if (!data) return;
    var margin = {
          top: 20,
          right: 20,
          bottom: 100,
          left: 40
        },
        width = 960 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom,
        viewBoxWidth = width + margin.left + margin.right,
        viewBoxHeight = height + margin.top + margin.bottom,
        baseValue = 100,
        tooltipWidth = 80,
        tooltipHeight = 50;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select("#alerta-enchentes").append("svg")
        .attr("width", "100%")
        .attr("viewBox", "0 0 "+viewBoxWidth+" "+viewBoxHeight)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) { return d.id.timestamp; }));
    y.domain([d3.min(data, function(d) { return d.predicted; }), d3.max(data, function(d) { return d.predicted; })]);


    var line = svg.append("line")
      .attr("class", "line line-alert")
      .attr("x1", 0)
      .attr("y1", y(1020))
      .attr("x2", width)
      .attr("y2", y(1020));

    var line = svg.append("line")
      .attr("class", "line line-flood")
      .attr("x1", 0)
      .attr("y1", y(1055))
      .attr("x2", width)
      .attr("y2", y(1055));

    var tooltip = svg.append("g")
      .attr("class", "alert-tooltip")
      .attr("opacity", 0);
    var tooltipRect = tooltip.append("rect")
      .attr({
        "width": tooltipWidth,
        "height": tooltipHeight,
        "x": margin.left/2,
        "y": margin.top/2,
        "fill": "#fff"
      });
    var tooltipText = tooltip.append("text")
      .attr({
        "x": margin.left/2 + 22,
        "y": margin.top/2 + 40,
        "fill": "#000",
        "font-size": "12",
        "font-family": "sans"
      })
      .text("");
    var tooltipText2 = tooltip.append("text")
      .attr({
        "x": margin.left/2 + 17,
        "y": margin.top/2 + 25,
        "fill": "#000",
        "font-size": "18",
        "font-family": "sans"
      })
      .text("");

      // svg.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + height + ")")
      //     .call(xAxis);

      // svg.append("g")
      //     .attr("class", "y axis")
      //     .call(yAxis);

      var bar = svg.selectAll(".bar")
          .data(data);
        // Render bars
        bar.enter().append("rect")
          .attr("x", function(d) { return x(d.id.timestamp); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.predicted); })
          .attr("height", function(d) { return height - y(d.predicted) + baseValue; })
          .attr("fill", function(d) { return color(d.predictedStatus); })
          .style("opacity", 0.4)
          .on("mouseover", function(d) {
            d3.select(this).transition().duration(200).style("opacity", 1);

            var date = new Date(d.id.timestamp*1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var time = hours + ':' + minutes.substr(-2);
            tooltipText.text(time);
            tooltipText2.text(d.predicted);
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            var positionX = x(d.id.timestamp) - tooltipWidth/2 - x.rangeBand()/2;
            var positionY = y(d.predicted) - tooltipHeight*1.5;
            tooltip.attr("transform", "translate(" + positionX + "," + positionY + ")");
            })
        .on("mouseout", function(d) {
          d3.select(this).transition().duration(200).style("opacity", 0.4);
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
        // Render top bars
        bar.enter().append("rect")
          .attr("width", x.rangeBand())
          .attr("x", function(d) { return x(d.id.timestamp); })
          .attr("y", function(d) { return y(d.predicted); })
          .attr("fill", function(d) { return color(d.predictedStatus); })
          .attr("height", 2);
        // Render time
        bar.enter().append("text")
          .attr("fill", "#fff")
          .attr("font-size", "12px")
          .attr("text-anchor", "start")
          .attr("x", function(d) { return x(d.id.timestamp)+x.rangeBand()+4; })
          .attr("y", height + baseValue - 5)
          .text(function(d, i) {
            var date = new Date(d.id.timestamp*1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            if (minutes === "00") {
              return hours + ':' + minutes.substr(-2);
            }
          });

    function type(d) {
      d.predicted = +d.predicted;
      return d;
    }

    function color(predictedStatus) {
      switch (predictedStatus) {
        case "NORMAL":
          return "#1878f0";
          break;
        case "ALERTA":
          return "#faea59";
          break;
        case "INUNDACAO":
          return "#eb533e";
          break;
        default:
          return "#1878f0";
      }
    }
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
