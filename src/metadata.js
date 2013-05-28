// ==UserScript==
// @name         <%= meta.name %>
// @version      <%= version %>
// @namespace    milky
// @description  <%= description %>
<%=
  meta.authors.map(function(author) {
    return '// @author       ' + author
  }).join('\n')
%>
<%=
  meta.includes.map(function(include) {
    return '// @include      ' + include
  }).join('\n')
%>
// @run-at       document-start
// @updateURL    <%= meta.builds %>firefox/NameSync.meta.js
// @downloadURL  <%= meta.builds %>firefox/NameSync.user.js
// @icon         data:image/png;base64,<%= grunt.file.read('img/logo.png', {encoding: 'base64'}) %>
// ==/UserScript==
