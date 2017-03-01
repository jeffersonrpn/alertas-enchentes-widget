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

  function getWidgetLocation(callback) {
    Alert.$('[data-alerta-enchentes-station]').each(function() {
      var
        location = Alert.$(this),
        station = location.attr('data-alerta-enchentes-station'),
        timestamp = location.attr('data-alerta-enchentes-timestamp'),
        htmlWrapper = 'alerta-enchentes-'+station;
      location.attr('id', htmlWrapper);
      if (!timestamp) {
        timestamp = new Date().getTime();
      }
      var params = {
        htmlWrapper: htmlWrapper,
        station: station,
        timestamp: timestamp
      }
      getData(params, callback)
    });
  }

  function getData(params, callback) {
    Alert.$.ajax({
      method: 'GET',
      url: 'http://localhost:8080/station/'+params.station+'/prediction?timestamp='+Math.floor(params.timestamp/1000),
      data: {},
      success: function(river) {
        callback(river, params.timestamp, params.htmlWrapper);
      },
      error: function(error) {
        console.log("Error");
      }
    });
  }

  function getAlertTimestamp(river) {
    if (!river) return;

    if (!river.data.length) {
      return {
        title: "--",
        description: "Não foi possível obter dados",
        timestamp: null
      };
    }
    // Checks flood threshold
    for (var i = 0; i < river.data.length; i++) {
      if (river.data[i].predicted >= river.info.floodThreshold) {
        return {
          title: "Alerta de enchente",
          description: "Ação evasiva é recomendada",
          timestamp: data[i].id.timestamp
        };
      };
    }
    // Checks warning threshold
    for (var i = 0; i < river.data.length; i++) {
      if (river.data[i].predicted >= river.info.warningThreshold) {
        return {
          title: "Alerta de cheia",
          description: "Esteja preparado",
          timestamp: data[i].id.timestamp
        };
      };
    }
    return {
      title: "Dia normal",
      description: "Nenhuma alta prevista para as próximas horas",
      timestamp: null
    };
  }

  function drawWidget(river, timestamp, htmlWrapper) {
    if (!river) return;

    var d3Widget = d3;

    var margin = {
          top: 50,
          right: 10,
          bottom: 30,
          left: 30
        },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom,
        viewBoxWidth = width + margin.left + margin.right,
        viewBoxHeight = height + margin.top + margin.bottom,
        baseValue = 0,
        tooltipWidth = 125,
        tooltipHeight = 30,
        tooltipPadding = -20;

    var bisectDate = d3Widget.bisector(function(d) { return d.timestamp; }).left;
    var formatTimeLiteral = d3Widget.time.format("%Hh%M");
    var formatDateTimeLiteral = d3Widget.time.format("%Hh%M");

    //Get alert info
    var alertTimestamp = getAlertTimestamp(river);
    var alertHour = null
    if (alertTimestamp.timestamp !== null) {
      var date = new Date(alertTimestamp.timestamp*1000);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      alertHour = hours + ':' + minutes.substr(-2);
    }

    var mapInfo = d3Widget.select("#"+htmlWrapper)
      .append("div")
        .attr("class", "alertas-enchentes-widget")
        .style({
          "padding": "20px",
          "background-color": "rgba(11, 51, 65, 0.95)",
          "font": "16px arial,sans-serif-light,sans-serif",
          "color": "#fff"
        });
      mapInfo.append("div")
        .attr("class", "alertas-enchentes-widget-title")
        .style({
          "font-size": "25px"
        })
        .html(river.info.riverName+" em "+river.info.cityName);
      mapInfo.append("div")
        .html("Previsões a partir de "+formatTimeLiteral(new Date(river.params.timestamp*1000)));

      // Alert info
      var alertInfo = mapInfo.append("div")
        .attr("class", "alerta-enchentes-alert-info")
        .append("div");
      if (alertHour !== null) {
        alertInfo.append("div")
        .style({
          "margin-top": "10px",
          "margin-right": "12px",
          "font-size": "60px"
        })
        .append("span")
        .html(alertHour);
      }
      var alertInfoText = alertInfo.append("div")
        .style({
          "margin-top": "25px",
          "font-size": "16px"
        });
      alertInfoText.append("div")
        .style({
          "font-size": "22px"
        })
        .html(alertTimestamp.title);
      alertInfoText.append("div")
        .html(alertTimestamp.description);

    // Chart
    if (river.data.length < 1) return;

    var graph = mapInfo.append("div")
    .attr("class", "alerta-enchentes-chart");
    var svg = graph.append("svg")
        .attr("width", "100%")
        .attr("viewBox", "0 0 "+viewBoxWidth+" "+viewBoxHeight)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3Widget.time.scale()
        .range([0, width]);
    var y = d3Widget.scale.linear()
        .range([height, 0]);
    var valuearea = d3Widget.svg.area()
        .x(function(d) { return x(d.timestamp); })
        .y1(function(d) { return y(d.measured); });
    var valueline = d3Widget.svg.line()
      .x(function(d) { return x(d.timestamp); })
      .y(function(d) { return y(d.measured); });
    var valueline2 = d3Widget.svg.line()
      .x(function(d) { return x(d.timestamp); })
      .y(function(d) { return y(d.predicted); });
    var xAxis = d3Widget.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(12)
        .tickFormat(d3.time.format("%Hh"));
    var yAxis = d3Widget.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(12)
        .tickFormat(function(d) {
          return Math.round((d * 0.01) * 100) / 100
        });

    var areaG = svg.append("g").attr("class", "areaG");
    var linesG = svg.append("g").attr("class", "lines");

    var areaSVG = areaG.append("path")
      .attr("class", "alerta-enchentes-chart-area")
      .style({
        "fill": "#7baff0",
        "fill-opacity": "0.3"
      });
    var line2SVG = areaG.append("path")
      .attr("class", "alerta-enchentes-chart-line")
      .style({
        "fill": "none",
        "stroke": "#1878F0",
        "stroke-width": "2"
      });

    var axisSVG = areaG.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "alerta-enchentes-chart-x-axis")
      .style({
        "fill": "none",
        "stroke": "#999"
      });

    var axisYSVG = areaG.append("g")
      .attr("class", "alerta-enchentes-chart-y-axis")
      .style({
        "fill": "none",
        "stroke": "#999"
      });

    var attentionLine = linesG.append("line")
    .attr({
      "x1": 0,
      "x2": width,
      "fill": "none",
      "stroke-width": "2px",
      "opacity": 1,
      "stroke-dasharray": "10,5",
      "stroke": color("ATENCAO")
    });
    var attentionText = linesG.append("text")
    .attr({
      "x": margin.right,
      "fill": color("ATENCAO"),
      "opacity": 1,
      "font-size": "10",
      "font-family": "sans"
    })
    .text("Nível de atenção");
    var alertLine = linesG.append("line")
      .attr({
        "x1": 0,
        "x2": width,
        "fill": "none",
        "stroke-width": "2px",
        "opacity": 1,
        "stroke-dasharray": "10,5",
        "stroke": color("ALERTA")
      });
    var alertText = linesG.append("text")
      .attr({
        "x": margin.right,
        "fill": color("ALERTA"),
        "opacity": 1,
        "font-size": "10",
        "font-family": "sans"
      })
      .text("Nível de alerta");
    var floodLine = linesG.append("line")
      .attr({
        "fill": "none",
        "x1": 0,
        "x2": width,
        "stroke-width": "2px",
        "opacity": 1,
        "stroke-dasharray": "10,5",
        "stroke": color("INUNDACAO")
      });
    var floodText = linesG.append("text")
      .attr({
        "x": margin.right,
        "fill": color("INUNDACAO"),
        "opacity": 1,
        "font-size": "10",
        "font-family": "sans"
      })
      .text("Nível de enchente");
    var predictionText = linesG.append("text")
      .attr({
        "fill": color("NORMAL"),
        "opacity": 1,
        "font-size": "10",
        "font-family": "sans",
        "text-anchor": "end"
      })
      .text("Previsão");

    var dots = svg.append("g")
        .attr({
          "class": "alerta-enchentes-chart-dots",
          "opacity": 0,
          "stroke-width": "2"
        });
    var rectMouse = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");
    var selectedValue = svg.append("g")
        .attr("class", "alerta-enchentes-chart-selected-value")
        .style("display", "none");
    var selectedValueLine = selectedValue.append("line")
        .style({
          "stroke": "#1878F0",
          "fill": "none",
          "stroke-width": "2"
        });
    var selectedValueCircle = selectedValue.append("g");
        selectedValueCircle.append("circle")
          .attr("r", 8)
          .style({
            "fill": "#fff"
          });
        selectedValueCircle.append("circle")
          .attr("r", 5)
          .style({
            "fill": "#fff",
            "stroke":"#1878F0",
            "stroke-width": "2"
          });
    var selectedValueRect = selectedValue.append("rect")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", tooltipWidth)
        .attr("height", tooltipHeight)
        .style({
          "fill": "#1878F0"
        });
    var selectedValueText = selectedValue.append("text")
        .attr("x", 5)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style({
          "fill": "#fff",
          "font-size": "12"
        });

    var data = [];
    var data2 = [];
    river.data.forEach(function(d) {
      d.timestamp = new Date(d.timestamp*1000);
      if (d.measured !== null) {
        data.push(d);
      }
      if (d.predicted !== null) {
        data2.push(d);
      }
    });

    var domainMax = d3Widget.max(data, function(d) { return d.measured; });
    var domainMin = d3Widget.min(data, function(d) { return d.measured; });
    if (domainMax < river.info.floodThreshold) {
      domainMax = river.info.floodThreshold;
    }
    if (domainMin > river.info.floodThreshold - 1000) {
      domainMin = river.info.floodThreshold - 1000;
    }
    x.domain(d3.extent(river.data, function(d) { return d.timestamp; }));
    y.domain([domainMin - 10, domainMax]);
    valuearea.y0(y(domainMin));

    attentionLine.attr({
      "y1": y(river.info.attentionThreshold),
      "y2": y(river.info.attentionThreshold)
    });
    attentionText.attr({
      "y": y(river.info.attentionThreshold) - 4,
    });
    alertLine.attr({
      "y1": y(river.info.warningThreshold),
      "y2": y(river.info.warningThreshold)
    });
    alertText.attr({
      "y": y(river.info.warningThreshold) - 4,
    });
    floodLine.attr({
      "y1": y(river.info.floodThreshold),
      "y2": y(river.info.floodThreshold),
    });
    floodText.attr({
      "y": y(river.info.floodThreshold) - 4,
    });
    predictionText.attr({
      "x": x(data2[data2.length-1].timestamp),
      "y": y(data2[data2.length-1].predicted) - 4,
    });

    areaSVG.datum(data).attr("d", valuearea);
    line2SVG.datum(data2).attr("d", valueline2);

    axisSVG.call(xAxis);
    axisYSVG.call(yAxis);
    d3Widget.selectAll(".tick text").style({
      "font-size": "10",
      "font-family": "sans",
      "fill": "#999"
    });
    d3Widget.selectAll(".tick").style({"fill" : "#999"});

    rectMouse
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mousemove);

    function mouseover() {
      selectedValue.style("display", null);
    }

    function mouseout() {
      selectedValue.style("display", "none");
    }

    function mousemove() {
      var
        x0 = x.invert(d3Widget.mouse(this)[0]),
        i = bisectDate(data2, x0, 1),
        d0 = data2[i - 1],
        d1 = data2[i],
        d = x0 - d0.timestamp > d1.timestamp - x0 ? d1 : d0,
        measured = Math.round((d.predicted * 0.01) * 100) / 100;
      selectedValueCircle.attr("transform", "translate(" + x(d.timestamp) + "," + y(d.predicted) + ")");
      selectedValueLine.attr({"x1": x(d.timestamp), "y1": (y(d.predicted)+tooltipPadding), "x2": x(d.timestamp), "y2": y(domainMin)});
      selectedValueText.text(measured.toString().replace('.', ',')+"m em "+formatTimeLiteral(d.timestamp));

      var xTooltip;
      if (x(d.timestamp) > width - tooltipWidth/2 + 10) {
        xTooltip = width - tooltipWidth/2 + 10;
      } else if (x(d.timestamp) < tooltipWidth/2) {
        xTooltip = tooltipWidth/2;
      } else {
        xTooltip = x(d.timestamp);
      }

      selectedValueText.attr("transform", "translate(" + xTooltip + "," + (y(d.predicted)-(tooltipHeight/2)+tooltipPadding) + ")");
      selectedValueRect.attr({"x": (xTooltip-(tooltipWidth/2)), "y": (y(d.predicted)-tooltipHeight+tooltipPadding)});
      d3Widget.select('.alert-tip').style("visible", "visible");
      d3Widget.select('.alert-measure').text(measured.toString()+"m".replace('.', ','));
      d3Widget.select('.alert-time').text(formatTimeLiteral(d.timestamp));
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
      loadScript('//cdnjs.cloudflare.com/ajax/libs/moment.js/2.14.1/moment.min.js', function() {
        var url = getScriptUrl();
        var params = getUrlParameters(url);
        Alert.$ = Alert.jQuery = jQuery.noConflict(true);
        getWidgetLocation(drawWidget)
      });
    });
  });

  return Alert;
})(window);
