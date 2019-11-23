/**
 * Copyright 2019 Google LLC. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function (exports) {
  'use strict';

  // [START maps_combining_data]
  var mapStyle = [{
    stylers: [{
      visibility: "off"
    }]
  }, {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{
      visibility: "on"
    }, {
      color: "#fcfcfc"
    }]
  }, {
    featureType: "water",
    elementType: "geometry",
    stylers: [{
      visibility: "on"
    }, {
      color: "#bfd4ff"
    }]
  }];

  exports.censusMin = Number.MAX_VALUE;
      var censusMax = -Number.MAX_VALUE;

  function initMap() {
    // load the map
    exports.map = new google.maps.Map(document.getElementById("map"), {
      center: {
        lat: 40,
        lng: -100
      },
      zoom: 4,
      styles: mapStyle
    }); // set up the style rules and events for google.maps.Data

    exports.map.data.setStyle(styleFeature);
    exports.map.data.addListener("mouseover", mouseInToRegion);
    exports.map.data.addListener("mouseout", mouseOutOfRegion); // wire up the button

    var selectBox = document.getElementById("census-variable");
    google.maps.event.addDomListener(selectBox, "change", function () {
      clearCensusData();
      loadCensusData(selectBox.options[selectBox.selectedIndex].value);
    }); // state polygons only need to be loaded once, do them now

    loadMapShapes();
  }
  /** Loads the state boundary polygons from a GeoJSON source. */


  function loadMapShapes() {
    // load US state outline polygons from a GeoJson file
    exports.map.data.loadGeoJson("https://storage.googleapis.com/mapsdevsite/json/states.js", {
      idPropertyName: "STATE"
    }); // wait for the request to complete by listening for the first feature to be
    // added

    google.maps.event.addListenerOnce(exports.map.data, "addfeature", function () {
      google.maps.event.trigger(document.getElementById("census-variable"), "change");
    });
  }
  /**
   * Loads the census data from a simulated API call to the US Census API.
   *
   * @param {string} variable
   */


  function loadCensusData(variable) {
    // load the requested variable from the census API (using local copies)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", variable + ".json"); // [START maps_combining_data_snippet_loadcensus]

    xhr.onload = function () {
      var censusData = JSON.parse(xhr.responseText);
      censusData.shift(); // the first row contains column names

      censusData.forEach(function (row) {
        var censusVariable = parseFloat(row[0]);
        var stateId = row[1]; // keep track of min and max values

        if (censusVariable < exports.censusMin) {
          exports.censusMin = censusVariable;
        }

        if (censusVariable > censusMax) {
          censusMax = censusVariable;
        } // update the existing row with the new data


        exports.map.data.getFeatureById(stateId).setProperty("census_variable", censusVariable);
      }); // update and display the legend

      document.getElementById("census-min").textContent = exports.censusMin.toLocaleString();
      document.getElementById("census-max").textContent = censusMax.toLocaleString();
    };

    xhr.send(); // [END maps_combining_data_snippet_loadcensus]
  }
  /** Removes census data from each shape on the map and resets the UI. */


  function clearCensusData() {
    exports.censusMin = Number.MAX_VALUE;
    censusMax = -Number.MAX_VALUE;
    exports.map.data.forEach(function (row) {
      row.setProperty("census_variable", undefined);
    });
    document.getElementById("data-box").style.display = "none";
    document.getElementById("data-caret").style.display = "none";
  }
  /**
   * Applies a gradient style based on the 'census_variable' column.
   * This is the callback passed to data.setStyle() and is called for each row in
   * the data set.  Check out the docs for Data.StylingFunction.
   *
   * @param {google.maps.Data.Feature} feature
   */
  // [START maps_combining_data_snippet_stylefeature]


  function styleFeature(feature) {
    var low = [5, 69, 54]; // color of smallest datum

    var high = [151, 83, 34]; // color of largest datum
    // delta represents where the value sits between the min and max

    var delta = (feature.getProperty("census_variable") - exports.censusMin) / (censusMax - exports.censusMin);
    var color = [];

    for (var i = 0; i < 3; i++) {
      // calculate an integer color based on the delta
      color[i] = (high[i] - low[i]) * delta + low[i];
    } // determine whether to show this shape or not


    var showRow = true;

    if (feature.getProperty("census_variable") == null || isNaN(feature.getProperty("census_variable"))) {
      showRow = false;
    }

    var outlineWeight = 0.5,
        zIndex = 1;

    if (feature.getProperty("state") === "hover") {
      outlineWeight = zIndex = 2;
    }

    return {
      strokeWeight: outlineWeight,
      strokeColor: "#fff",
      zIndex: zIndex,
      fillColor: "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)",
      fillOpacity: 0.75,
      visible: showRow
    };
  } // [END maps_combining_data_snippet_stylefeature]
  // [START maps_combining_data_snippet_mouseevents]

  /**
   * Responds to the mouse-in event on a map shape (state).
   *
   * @param {?google.maps.MouseEvent} e
   */


  function mouseInToRegion(e) {
    // set the hover state so the setStyle function can change the border
    e.feature.setProperty("state", "hover");
    var percent = (e.feature.getProperty("census_variable") - exports.censusMin) / (censusMax - exports.censusMin) * 100; // update the label

    document.getElementById("data-label").textContent = e.feature.getProperty("NAME");
    document.getElementById("data-value").textContent = e.feature.getProperty("census_variable").toLocaleString();
    document.getElementById("data-box").style.display = "block";
    document.getElementById("data-caret").style.display = "block";
    document.getElementById("data-caret").style.paddingLeft = percent + "%";
  }
  /**
   * Responds to the mouse-out event on a map shape (state).
   *
   * @param {?google.maps.MouseEvent} e
   */


  function mouseOutOfRegion(e) {
    // reset the hover state, returning the border to normal
    e.feature.setProperty("state", "normal");
  } // [END maps_combining_data_snippet_mouseevents]

  exports.clearCensusData = clearCensusData;
  exports.initMap = initMap;
  exports.loadCensusData = loadCensusData;
  exports.loadMapShapes = loadMapShapes;
  exports.mapStyle = mapStyle;
  exports.mouseInToRegion = mouseInToRegion;
  exports.mouseOutOfRegion = mouseOutOfRegion;
  exports.styleFeature = styleFeature;

}(this.window = this.window || {}));
