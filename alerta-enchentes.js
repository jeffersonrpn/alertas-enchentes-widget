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

  function getWidgetLocation(callback, errorCallback) {
    Alert.$('[data-alerta-enchentes-station]').each(function() {
      var
        location = Alert.$(this),
        station = location.attr('data-alerta-enchentes-station'),
        timestamp = location.attr('data-alerta-enchentes-timestamp'),
        htmlWrapper = 'alerta-enchentes-'+station;
      location.attr('id', htmlWrapper);
      var params = {
        htmlWrapper: htmlWrapper,
        station: station,
        timestamp: timestamp
      }
      getData(params, callback, errorCallback)
    });
  }

  function getData(params, callback, errorCallback) {
    var urlParams = "";
    if (params.timestamp) {
      urlParams = "?timestamp="+params.timestamp;
    }
    Alert.$.ajax({
      method: "GET",
      url: "https://enchentes.infoamazonia.org:8080/station/"+params.station+"/prediction"+urlParams,
      // url: "http://localhost:8080/station/"+params.station+"/prediction"+urlParams,
      data: {},
      success: function(river) {
        callback(river, params.timestamp, params.htmlWrapper);
      },
      error: function(error) {
        errorCallback(error, params.timestamp, params.htmlWrapper);
      }
    });
  }

  function getAlertTimestamp(river) {
    if (!river.data) throw "Nenhum dado obtido";

    if (!river.data.length) {
      return {
        title: "--",
        description: "N&atilde;o foi poss&iacute;vel obter dados",
        timestamp: null
      };
    }
    // Checks flood threshold
    for (var i = 0; i < river.data.length; i++) {
      if (river.data[i].predicted >= river.info.floodThreshold) {
        return {
          title: "Alerta de enchente",
          description: "Aç&atilde;o evasiva é recomendada",
          timestamp: river.data[i].timestamp
        };
      };
    }
    // Checks warning threshold
    for (var i = 0; i < river.data.length; i++) {
      if (river.data[i].predicted >= river.info.warningThreshold) {
        return {
          title: "Alerta de cheia",
          description: "Esteja preparado",
          timestamp: river.data[i].timestamp
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
          top: 35,
          right: 10,
          bottom: 30,
          left: 30
        },
        width = 600 - margin.left - margin.right,
        height = 220 - margin.top - margin.bottom,
        viewBoxWidth = width + margin.left + margin.right,
        viewBoxHeight = height + margin.top + margin.bottom,
        baseValue = 0,
        tooltipWidth = 170,
        tooltipHeight = 30,
        tooltipPadding = -35;

    var bisectDate = d3Widget.bisector(function(d) { return d.timestamp; }).left;
    var formatTimeLiteral = d3Widget.time.format("%Hh%M");
    var formatDateTimeLiteral = d3Widget.time.format("%d/%m/%Y &agrave;s %Hh%M");
    var formatVolume = function(n) {
      var m = Math.round((n * 0.01) * 100) / 100;
      return m.toString().replace('.', ',')+"m";
    };

    //Get alert info
    var alertTimestamp = getAlertTimestamp(river);
    var alertHour = null
    if (alertTimestamp.timestamp !== null) {
      var date = new Date(alertTimestamp.timestamp*1000);
      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      alertHour = hours + ':' + minutes.substr(-2);
    }

    var font = d3Widget.select("#"+htmlWrapper)
      .html('<link href="https://fonts.googleapis.com/css?family=Open+Sans|Open+Sans+Condensed:700" rel="stylesheet">')
      .html('<link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet">');
    var mapInfo = d3Widget.select("#"+htmlWrapper)
      .append("div")
        .attr("class", "alertas-enchentes-widget")
        .style({
          "padding": "20px",
          "background-color": "rgba(11, 51, 65, 0.95)",
          "font-size": "16px",
          "font-family": "'Montserrat', sans-serif",
          "color": "#fff"
        });
      mapInfo.append("div")
        .attr("class", "alertas-enchentes-widget-title")
        .style({
          "font-size": "22px"
        })
        .html("<strong>"+river.info.riverName+"</strong> em "+river.info.cityName);
      mapInfo.append("div")
        .html("Previs&otilde;es a partir de "+formatDateTimeLiteral(new Date(river.params.timestamp*1000))+" (horário local)");

      var mapInfoStatus = mapInfo.append("div")
        .style({
          "margin-top": "15px",
          "margin-bottom": "15px",
          "display": "flex"
        });
      var mapInfoMeasuredIcon = mapInfoStatus.append("div")
          .style({
            "font-size": "2.3em",
            "width": "55px"
          })
          .html(getAlertIcon(river.measurement.measuredStatus));
      var mapInfoMeasuredStatus = mapInfoStatus.append("div")
          .style({
            "font-size": "16px",
            "margin-right": "15px"
          })
          .append("div")
           .attr("id", "alertas-enchentes-widget-icon");
      mapInfoMeasuredStatus.append("div")
          .style({
            "font-size": "16px"
          })
          .attr("id", "alertas-enchentes-widget-measurement-msg")
          .html("N&iacute;vel atual do rio em "+formatVolume(river.measurement.measured));
      mapInfoMeasuredStatus.append("div")
          .attr("id", "alertas-enchentes-widget-measurement-status")
          .html(river.measurement.measuredStatus);

      if (river.prediction.predictedStatus !== "INDISPONIVEL") {
        var mapInfoPredictionIcon = mapInfoStatus.append("div")
        .style({
          "font-size": "2.3em",
          "width": "55px",
          "margin-left": "10px"
        })
        .html(getAlertIcon(river.prediction.predictedStatus));
        var mapInfoPredictionStatus = mapInfoStatus.append("div")
          .style({
            "font-size": "16px",
            "margin-right": "15px"
          })
          .append("div");
        mapInfoPredictionStatus.append("div")
          .style({
            "font-size": "16px"
          })
          .attr("id", "alertas-enchentes-widget-prediction-msg")
          .html("Previs&atilde;o de "+formatVolume(river.prediction.predicted)+" em "+river.info.predictionWindow+"h");
        mapInfoPredictionStatus.append("div")
          .attr("id", "alertas-enchentes-widget-prediction-status")
          .html(river.prediction.predictedStatus);
      } else {
      var mapInfoPredictionStatus = mapInfoStatus.append("div")
        .style({
          "font-size": "16px",
          "margin-right": "15px",
          "margin-left": "60px"
        })
        .append("div");
        mapInfoPredictionStatus.append("div")
          .attr("id", "alertas-enchentes-widget-prediction-status")
          .html("Previs&atilde;o indispon&iacute;vel no momento");
      }

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
        .ticks(6)
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
    .html("N&iacute;vel de atenç&atilde;o");
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
      .html("N&iacute;vel de alerta");
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
      .html("N&iacute;vel de enchente");
    var predictionText = linesG.append("text")
      .attr({
        "fill": color("NORMAL"),
        "opacity": 1,
        "font-size": "10",
        "font-family": "sans",
        "text-anchor": "end"
      })
      .html("Previs&atilde;o");

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
      "font-size": "10px",
      "font-family": "'Montserrat'",
      "fill": "#999",
      "stroke": "none"
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
    }

    function color(predictedStatus) {
      switch (predictedStatus) {
        case "NORMAL":
          return "#1878f0";
          break;
        case "ATENCAO":
          return "#FFE168";
          break;
          break;
        case "ALERTA":
          return "#ebb03e";
          break;
        case "INUNDACAO":
          return "#e74c3c";
          break;
        default:
          return "#1878f0";
      }
    }

    function getAlertIcon(status) {
      if (status == "NORMAL") {
        return '<svg width="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g><g stroke="null" fill="#fff" id="svg_1"><path stroke="null" fill="#fff id="svg_2" d="m50.000001,11.399997c-21.256081,0 -38.599999,17.343918 -38.599999,38.599999s17.343918,38.599999 38.599999,38.599999c21.256081,0 38.599999,-17.343918 38.599999,-38.599999s-17.343918,-38.599999 -38.599999,-38.599999zm0,71.592566c-18.256756,0 -32.992567,-14.73581 -32.992567,-32.992567s14.73581,-32.992567 32.992567,-32.992567c18.256756,0 32.992567,14.73581 32.992567,32.992567s-14.73581,32.992567 -32.992567,32.992567z"/><path stroke="null" fill="#fff" id="svg_3" d="m65.90946,34.87297l-23.994594,23.994594l-10.693243,-10.693243c-1.043243,-1.043243 -2.868919,-1.043243 -3.912162,0c-1.043243,1.043243 -1.043243,2.868919 0,3.912162l12.649324,12.649324c0.521622,0.521622 1.173649,0.782432 1.956081,0.782432c0.782432,0 1.434459,-0.260811 1.956081,-0.782432l25.950675,-25.950675c1.043243,-1.043243 1.043243,-2.868919 0,-3.912162c-1.043243,-1.043243 -2.738513,-1.043243 -3.912162,0z"/></g></g></svg>';
      } else {
        return '<svg width="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110"><g><g stroke="null" fill="'+color(status)+'" id="svg_7"><path stroke="null" fill="'+color(status)+'" d="m56.067027,16.150893c-1.247582,-2.160865 -3.571864,-3.503692 -6.067027,-3.503692s-4.819446,1.342827 -6.067027,3.503692l-35.018256,60.698309c-1.245718,2.15992 -1.244782,4.844655 0.001864,7.003648c1.247582,2.158057 3.571864,3.499956 6.065164,3.499956l70.036512,0c2.4933,0 4.817573,-1.341899 6.064227,-3.499956c1.247582,-2.159929 1.248518,-4.843727 0.001864,-7.003648l-35.01732,-60.698309zm30.97295,65.365538c-0.415551,0.719976 -1.190627,1.167273 -2.021721,1.167273l-70.036512,0c-0.831103,0 -1.60617,-0.447297 -2.021721,-1.167273c-0.415551,-0.719976 -0.415551,-1.61457 0,-2.334546l35.018256,-60.698309c0.414615,-0.719976 1.189691,-1.167282 2.021721,-1.167282s1.607106,0.447305 2.022657,1.167282l35.018256,60.698309c0.414615,0.719968 0.414615,1.61457 -0.000936,2.334546z" id="svg_1"/><path stroke="null" fill="'+color(status)+'" d="m50,31.323598c-3.86228,0 -7.003648,3.141376 -7.003648,7.003656c0,4.565448 0.550951,10.603521 1.403526,15.384685c1.32229,7.408926 2.892042,10.295368 5.600122,10.295368s4.277832,-2.886442 5.600122,-10.295368c0.852576,-4.781164 1.403526,-10.819237 1.403526,-15.384685c0,-3.86228 -3.141368,-7.003656 -7.003648,-7.003656zm0,26.068523c-1.168209,-4.028497 -2.334555,-12.242381 -2.334555,-19.064867c0,-1.287745 1.047747,-2.334555 2.334555,-2.334555s2.334546,1.04681 2.334546,2.334555c0,6.822485 -1.166337,15.036369 -2.334546,19.064867z" id="svg_2"/><path stroke="null" fill="'+color(status)+'" d="m50,68.676409c-2.574544,0 -4.669101,2.094557 -4.669101,4.669093s2.094557,4.669101 4.669101,4.669101s4.669101,-2.094557 4.669101,-4.669101s-2.094557,-4.669093 -4.669101,-4.669093z" id="svg_3"/></g></g></svg>';
      }
    }

    var footer = d3Widget.select("#"+htmlWrapper)
      .append("div")
        .attr("class", "alerta-enchentes-footer")
        .style({
            "font-family": "'Open Sans Condensed',sans-serif",
            "font-weight": "bold",
            "text-align": "right",
            "height": "30px",
            "background": "#101010",
            "padding-right": "10px"
        })
        .append("a")
          .attr("href", "https://enchentes.infoamazonia.org/")
          .attr("target", "_blank")
          .style({
              "color": "#333",
              "font-size": "14px",
              "line-height": "30px",
              "text-transform": "uppercase",
              "text-decoration": "none",
              "float": "right"
          })
          .text("InfoAmazonia")
          .on("mouseover", function() {
            d3.select(this).transition(200).style({"color": "#FFF"});
          })
          .on("mouseout", function() {
            d3.select(this).transition(200).style({"color": "#333"});
          })
          .append("span")
            .style({
              "background": "transparent url(https://infoamazonia.org/wp-content/themes/infoamazonia-wptheme-3.0/img/logo-small.png) center no-repeat",
              "display": "inline-block",
              "width": "13px",
              "height": "30px",
              "margin-left": "7px",
              "float": "right"
            });
  }

  function drawError(error, timestamp, htmlWrapper) {
    var d3Widget = d3;
    var errorInfo = d3Widget.select("#"+htmlWrapper)
      .append("div")
        .attr("class", "alertas-enchentes-widget-error")
        .style({
          "padding": "20px",
          "background-color": "rgba(11, 51, 65, 0.95)",
          "font": "16px arial,sans-serif-light,sans-serif",
          "color": "#fff"
        });
    errorInfo.append("div")
      .attr("class", "alertas-enchentes-widget-error-title")
      .style({
        "font-size": "25px"
      })
      .html("Ops! Tivemos um problema.");
    var footer = d3Widget.select("#"+htmlWrapper)
      .append("div")
        .attr("class", "alerta-enchentes-footer")
        .style({
            "font-family": "sans-serif",
            "font-weight": "bold",
            "text-align": "right",
            "height": "30px",
            "background": "#101010",
            "padding-right": "10px"
        })
        .append("a")
          .attr("href", "https://enchentes.infoamazonia.org/")
          .attr("target", "_blank")
          .style({
              "color": "#333",
              "font-size": "14px",
              "line-height": "30px",
              "text-transform": "uppercase",
              "text-decoration": "none",
              "float": "right"
          })
          .text("InfoAmazonia")
          .on("mouseover", function() {
            d3.select(this).transition(200).style({"color": "#FFF"});
          })
          .on("mouseout", function() {
            d3.select(this).transition(200).style({"color": "#333"});
          })
          .append("span")
            .style({
              "background": "transparent url(https://infoamazonia.org/wp-content/themes/infoamazonia-wptheme-3.0/img/logo-small.png) center no-repeat",
              "display": "inline-block",
              "width": "13px",
              "height": "30px",
              "margin-left": "7px",
              "float": "right"
            });
  }

  loadScript('//d3js.org/d3.v3.min.js', function() {
    loadScript('//code.jquery.com/jquery-3.1.0.min.js', function() {
      Alert.$ = Alert.jQuery = jQuery.noConflict(true);
      getWidgetLocation(drawWidget, drawError)
    });
  });

  return Alert;
})(window);
