<!--
  Copyright 2019 Google LLC. All Rights Reserved.
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
       http://www.apache.org/licenses/LICENSE-2.0
 
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no"/>
    <meta charset="utf-8"/>
    <title>{{ title }}</title>
    {% block external %}{% endblock %}
    {% if env.JSFIDDLE %}
      <!-- jsFiddle will insert css and js -->
    {% else %}
      {% block css %}
        <link rel="stylesheet" type="text/css" href="./style.css">
      {% endblock %}
      {% block js %}
        <script src="./app.compat.js"></script>
      {% endblock %}
    {% endif %}

    {% block api %}
      <script src="https://maps.googleapis.com/maps/api/js?callback=initMap" async defer></script>
    {% endblock %}
  </head>
  <body>
    {% block html %}{% endblock %}
  </body>
</html>