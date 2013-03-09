// ==UserScript==
// @name           4chan X Name Sync
// @version        4.0.0
// @namespace      milky
// @description    Shares names with other posters on 4chan's forced anon boards. Requires 4chan X v3.
// @author         milkytiptoe
// @author         ihavenoface
// @run-at         document-idle
// @include        *://boards.4chan.org/b/*
// @include        *://boards.4chan.org/q/*
// @include        *://boards.4chan.org/soc/*
// @updateURL      https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js
// @downloadURL    https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js
// @icon           data:image/gif;base64,R0lGODlhIAAgAMQQABAQEM/Pz9/f3zAwMH9/f+/v7yAgIGBgYJ+fn6+vr4+Pj1BQUHBwcL+/v0BAQAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAgACAAAAXNICSOZGmeaKqubOu6QvC+DSDPopAQfFOMjYdthhg8jsiHowEJKmGOpPToUFBbAcB0i3SwBNqkYUE4GLbeVRRpQJQaxmQ6lUgOfqKDYx/vqpEAeCJZXHMnAkkEJoRThiYISYIkAg2Vlg03OJqbnC8MDgcEbikBew5hQpkjBUkMKk5TQyQESaomsLECQHYruA8DTCUIqA/BKb4PBgpMAghrSAcsyFxIAy1OBsRcB5LHVAIH1AYJLwJGaQIEDmdKB+Q4BQMLnSkF7/T4+fr4IQA7
// ==/UserScript==

// Contributers: https://github.com/milkytiptoe/Name-Sync/graphs/contributors

// This script contains code from 4chan X (https://github.com/MayhemYDG/4chan-x)
// @license: https://github.com/MayhemYDG/4chan-x/blob/v3/LICENSE

(function() {
  var $, $$, CSS, Main, Menus, Names, Set, Settings, Sync, Updater, d, g;

  Set = {};

  d = document;

  g = {
    NAMESPACE: "NameSync.",
    VERSION: "4.0.0",
    threads: [],
    board: null
  };

  $$ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelectorAll(selector);
  };

  $ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelector(selector);
  };

  $.extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
  };

  $.extend($, {
    el: function(type) {
      return d.createElement(type);
    },
    tn: function(text) {
      return d.createTextNode(text);
    },
    id: function(id) {
      return d.getElementById(id);
    },
    event: function(type, detail) {
      return d.dispatchEvent(new CustomEvent(type, detail));
    },
    on: function(el, type, handler) {
      return el.addEventListener(type, handler, false);
    },
    off: function(el, type, handler) {
      return el.removeEventListener(type, handler, false);
    },
    addClass: function(el, className) {
      return el.classList.add(className);
    },
    rmClass: function(el, className) {
      return el.classList.remove(className);
    },
    add: function(parent, children) {
      return parent.appendChild($.nodes(children));
    },
    rm: function(el) {
      return el.parentNode.removeChild(el);
    },
    prepend: function(parent, children) {
      return parent.insertBefore($.nodes(children), parent.firstChild);
    },
    after: function(root, el) {
      return root.parentNode.insertBefore($.nodes(el), root.nextSibling);
    },
    before: function(root, el) {
      return root.parentNode.insertBefore($.nodes(el), root);
    },
    nodes: function(nodes) {
      var frag, node, _i, _len;
      if (!(nodes instanceof Array)) {
        return nodes;
      }
      frag = d.createDocumentFragment();
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        frag.appendChild(node);
      }
      return frag;
    },
    ajax: function(file, type, data, callbacks) {
      var r, url;
      r = new XMLHttpRequest();
      if (file === 'qp') {
        r.overrideMimeType('application/json');
      }
      url = "https://www.milkyis.me/namesync/" + file + ".php";
      if (type === 'GET') {
        url += "?" + data;
      }
      r.open(type, url, true);
      r.setRequestHeader('X-Requested-With', 'NameSync3');
      if (file === 'qp') {
        r.setRequestHeader('If-Modified-Since', Sync.lastModified);
      }
      if (type === 'POST') {
        r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      }
      $.extend(r, callbacks);
      r.withCredentials = true;
      r.send(data);
      return r;
    }
  });

  CSS = {
    init: function() {
      var css;
      css = ".section-name-sync input[type='text'] {\n  border: 1px solid #CCC;\n  width: 148px;\n  padding: 2px;\n}\n.section-name-sync input[type='button'] {\n  width: 130px;\n  height: 26px;\n}\n.section-name-sync ul {\n  list-style: none;\n  margin: 0;\n  padding: 8px;\n}\n.section-name-sync label {\n  text-decoration: underline;\n}\n.section-name-sync {\n  background: url(//www.milkyis.me/namesync/bg.png) no-repeat #F0E0D6 bottom right;\n}";
      if (Set['Hide IDs']) {
        return css += ".posteruid {\n  display: none;\n}";
      }
    }
  };

  Main = {
    init: function() {
      var path, thread, _i, _len, _ref;
      path = location.pathname.slice(1).split('/');
      if (path[1] === 'catalog') {
        return;
      }
      g.board = path[0];
      _ref = $$('.thread');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        thread = _ref[_i];
        g.threads.push(thread.id.slice(1));
      }
      Settings.init();
      Names.init();
      CSS.init();
      Menus.init();
      if (Set["Sync on /" + g.board + "/"]) {
        Sync.init();
      }
      if (Set['Automatic Updates']) {
        return Updater.init();
      }
    }
  };

  Menus = {
    uid: null,
    init: function() {
      this.add('4chan X Name Sync Settings', 'header', function() {
        return $.event('OpenSettings', {
          detail: 'Name Sync'
        });
      });
      return this.add('Change name', 'post', function() {
        return Names.change(Menus.uid);
      }, function(post) {
        Menus.uid = post.info.uniqueID;
        return !/Heaven/.test(Menus.uid);
      });
    },
    add: function(text, type, click, open) {
      var a;
      a = $.el('a');
      a.href = 'javascript:;';
      a.textContent = text;
      $.on(a, 'click', click);
      return $.event('AddMenuEntry', {
        detail: {
          type: type,
          el: a,
          open: open
        }
      });
    }
  };

  Names = {
    nameByID: {},
    nameByPost: {},
    blockedIDs: {},
    init: function() {
      this.load();
      $.event('AddCallback', {
        detail: {
          type: 'Post',
          callback: {
            cb: Names.cb
          }
        }
      });
      if (g.threads.length > 1) {
        return;
      }
      $.on(d, 'ThreadUpdate', this.checkThreadUpdate);
      return this.updateAllPosts();
    },
    cb: function() {
      return Names.updatePost(this.nodes.post);
    },
    change: function(id) {
      var name;
      name = prompt('What would you like this poster to be named?', 'Anonymous');
      if (name && (name = name.trim() !== '')) {
        this.nameByID[id] = {
          n: name,
          t: ''
        };
        this.blockedIDs[id] = true;
        return this.updateAllPosts();
      }
    },
    checkThreadUpdate: function(e) {
      if (e.detail[404]) {
        return Sync.disabled = true;
      }
      if (Set["Sync on /" + g.board + "/"]) {
        clearTimeout(Sync.delay);
        return Sync.delay = setTimeout(Sync.sync, 2000);
      }
    },
    load: function() {
      var stored;
      stored = sessionStorage["" + g.board + "-names"];
      this.nameByID = stored ? JSON.parse(stored) : {};
      stored = sessionStorage["" + g.board + "-blocked"];
      return this.blockedIDs = stored ? JSON.parse(stored) : {};
    },
    store: function() {
      sessionStorage["" + g.board + "-names"] = JSON.stringify(this.nameByID);
      return sessionStorage["" + g.board + "-blocked"] = JSON.stringify(this.blockedIDs);
    },
    updateAllPosts: function() {
      var post, _i, _len, _ref;
      _ref = $$('.thread .post');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        post = _ref[_i];
        this.updatePost(post);
      }
      return this.store();
    },
    updatePost: function(post) {
      var email, emailspan, id, linfo, name, nameblockspan, namespan, oinfo, postnum, postnumspan, subject, subjectspan, tripcode, tripspan;
      id = $('.hand', post).textContent;
      if (/^##/.test(id)) {
        return;
      }
      postnumspan = $('a[title="Quote this post"]', post);
      namespan = $('.desktop .name', post);
      tripspan = $('.desktop .postertrip', post);
      subjectspan = $('.desktop .subject', post);
      postnum = postnumspan.textContent;
      oinfo = Names.nameByPost[postnum];
      linfo = Names.nameByID[id];
      if (oinfo && !Names.blockedIDs[id]) {
        name = oinfo.n;
        tripcode = oinfo.t;
        if (!/Heaven/.test(id)) {
          Names.nameByID[id] = {
            n: name,
            t: tripcode
          };
        }
        email = oinfo.e;
        subject = oinfo.s;
      } else if (linfo) {
        name = linfo.n;
        tripcode = linfo.t;
      } else {
        return;
      }
      if (namespan.textContent !== name) {
        namespan.textContent = name;
      }
      if (subject && subject !== '' && subjectspan.textContent !== subject) {
        subjectspan.textContent = subject;
      }
      if (email && email !== '') {
        emailspan = $('.desktop .useremail', post);
        if (emailspan === null) {
          nameblockspan = $('.desktop .nameBlock', post);
          emailspan = $.el('a');
          $.addClass(emailspan, 'useremail');
          $.before(namespan, emailspan);
        }
        $.add(emailspan, namespan);
        if (tripspan !== null) {
          $.after(namespan, $.tn(" "));
          $.add(emailspan, tripspan);
        }
        emailspan.href = "mailto:" + email;
      }
      if (tripcode && tripcode !== '') {
        if (tripspan === null) {
          tripspan = $.el("span");
          $.addClass(tripspan, "postertrip");
          $.after(namespan, tripspan);
          $.after(namespan, $.tn(" "));
        }
        if (tripspan.textContent !== tripcode) {
          return tripspan.textContent = tripcode;
        }
      } else {
        if (tripspan !== null) {
          return $.rm(tripspan);
        }
      }
    }
  };

  Settings = {
    main: {
      'Sync on /b/': ['Enable sync on /b/', true],
      'Sync on /q/': ['Enable sync on /q/', true],
      'Sync on /soc/': ['Enable sync on /soc/', true],
      'Hide IDs': ['Hide Unique IDs next to names', false],
      'Automatic Updates': ['Check for updates automatically', true],
      'Persona Fields': ['Share persona fields instead of the 4chan X quick reply fields', false],
      'Do Not Track': ['Send a request to third party archives to not store your history', false]
    },
    init: function() {
      var setting, stored, val, _ref;
      _ref = Settings.main;
      for (setting in _ref) {
        val = _ref[setting];
        Set[setting] = (stored = Settings.get(val) === null) ? val[1] : stored === 'true';
      }
      return $.event('AddSettingsSection', {
        detail: {
          title: 'Name Sync',
          open: Settings.open
        }
      });
    },
    open: function(section, g) {},
    get: function(name) {
      return localStorage.getItem("" + g.NAMESPACE + name);
    },
    set: function(name, value) {
      return localStorage.setItem("" + g.NAMESPACE + name, value);
    }
  };

  Sync = {
    lastModified: '0',
    disabled: false,
    delay: null,
    init: function() {
      var r;
      $.on(d, 'QRPostSuccessful', Sync.requestSend);
      this.sync(true);
      if (sessionStorage["" + g.board + "-namesync-tosend"]) {
        r = JSON.parse(sessionStorage["" + g.board + "-namesync-tosend"]);
        return this.send(r.name, r.email, r.subject, r.postID, r.threadID, true);
      }
    },
    canSync: function() {
      return !this.disabled && g.threads.length === 1;
    },
    sync: function(repeat) {
      $.ajax("qp", "GET", "t=" + g.threads + "&b=" + g.board, {
        onloadend: function() {
          var poster, _i, _len, _ref;
          if (this.status === 200) {
            Sync.lastModified = this.getResponseHeader('Last-Modified');
            _ref = JSON.parse(this.response);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              poster = _ref[_i];
              Names.nameByPost[poster.p] = poster;
            }
            return Names.updateAllPosts();
          }
        }
      });
      if (repeat && this.canSync === true) {
        return setTimeout(this.sync, 30000, true);
      }
    },
    requestSend: function(e) {
      var cEmail, cName, cSubject, postID, qr, threadID;
      postID = e.detail.postID;
      threadID = e.detail.threadID;
      if (Set['Persona Fields']) {
        cName = Settings.get('Name');
        cEmail = Settings.get('Email');
        cSubject = Settings.get('Subject');
      } else {
        qr = $.id('qr');
        cName = $('input[name=name]', qr).value;
        cEmail = $('input[name=email]', qr).value;
        cSubject = $('input[name=sub]', qr).value;
      }
      cName = cName.trim();
      cEmail = cEmail.trim();
      cSubject = cSubject.trim();
      if (!(cName === '' && cEmail === '' && cSubject === '')) {
        return Sync.send(cName, cEmail, cSubject, postID, threadID);
      }
    },
    send: function(cName, cEmail, cSubject, postID, threadID, isLateOpSend) {
      if (isLateOpSend && !sessionStorage["" + g.board + "-namesync-tosend"]) {
        return;
      }
      if (g.threads.length > 1) {
        isLateOpSend = true;
        return sessionStorage["" + g.board + "-namesync-tosend"] = JSON.stringify({
          name: cName,
          email: cEmail,
          subject: cSubject,
          postID: postID,
          threadID: threadID
        });
      } else {
        return $.ajax('sp', 'POST', "p=" + postID + "&t=" + threadID + "&b=" + g.board + "&n=" + (encodeURIComponent(cName)) + "&s=" + (encodeURIComponent(cSubject)) + "&e=" + (encodeURIComponent(cEmail)) + "&dnt=" + (Set['Do Not Track'] ? '1' : '0'), {
          onerror: function() {
            return setTimeout(Sync.send, 2000, cName, cEmail, cSubject, postID, threadID, isLateOpSend);
          },
          onloadend: function() {
            if (isLateOpSend) {
              delete sessionStorage["" + g.board + "-namesync-tosend"];
              return Sync.sync();
            }
          }
        });
      }
    },
    clear: function() {
      if (!confirm('This will remove 4chan X Name Sync name, email and subject history stored online by you. Continue?')) {
        return;
      }
      return $.ajax('rm', 'POST', '', {
        onerror: function() {
          return alert('Error removing history');
        },
        onloadend: function() {
          if (this.status === 200) {
            return alert(this.response);
          }
        }
      });
    }
  };

  Updater = {
    init: function() {
      var last;
      if (last = Settings.get('lastcheck') === null || Date.now() > last + 86400000) {
        return this.update();
      }
    },
    update: function() {
      return $.ajax('u3', 'GET', '', {
        onloadend: function() {
          if (this.status !== 200) {
            return;
          }
          Settings.set('lastcheck', Date.now());
          if (this.response !== g.VERSION.replace(/\./g, '') && confirm("A new update for 4chan Name Sync (version " + this.response + ") is available, install now?")) {
            return window.location = 'https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js';
          }
        }
      });
    }
  };

  Main.init();

}).call(this);
