// Renders the Blogs list (blogs.html) and individual posts (blog/post.html) from blog/posts.json.
(function () {
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function formatDate(value) {
    if (!value) return '';
    var parts = value.split('-');
    var month = MONTHS[parseInt(parts[1], 10) - 1];
    return (month ? month + ' ' : '') + parts[0];
  }

  function metaLine(post) {
    var bits = [];
    if (post.authors && post.authors.length) bits.push(post.authors.map(escapeHtml).join(', '));
    if (post.date) bits.push(formatDate(post.date));
    return bits.join(' · ');
  }

  function tagsHtml(post) {
    if (!post.tags || !post.tags.length) return '';
    return '<div class="tags">' + post.tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>';
  }

  // Pull maths out before Markdown parsing so underscores and backslashes survive, then render with KaTeX.
  function renderMarkdown(source) {
    var math = [];
    function stash(tex, display) {
      var html;
      try { html = katex.renderToString(tex.trim(), { displayMode: display, throwOnError: false }); }
      catch (e) { html = escapeHtml(tex); }
      math.push(html);
      return '@@MATH' + (math.length - 1) + '@@';
    }

    var text = source.replace(/\r\n/g, '\n').replace(/^\s*# [^\n]*\n/, '');
    text = text.split(/(```[\s\S]*?```)/).map(function (chunk, i) {
      if (i % 2) return chunk; // fenced code block
      return chunk
        .replace(/\$\$([\s\S]+?)\$\$/g, function (_, tex) { return stash(tex, true); })
        .replace(/\$([^$\n]+?)\$/g, function (_, tex) { return stash(tex, false); })
        .replace(/^(#{1,5})(?= )/gm, '#$1'); // the post title is the page's h1
    }).join('');

    return marked.parse(text).replace(/@@MATH(\d+)@@/g, function (_, n) { return math[n]; });
  }

  function absolutize(container, base) {
    container.querySelectorAll('img[src], a[href]').forEach(function (el) {
      var attr = el.tagName === 'IMG' ? 'src' : 'href';
      var value = el.getAttribute(attr);
      if (/^(#|[a-z]+:|\/)/i.test(value)) return;
      el.setAttribute(attr, new URL(value, base).href);
    });
    container.querySelectorAll('a[href^="http"]').forEach(function (a) {
      if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noreferrer'; }
    });
  }

  function loadPosts(base) {
    return fetch(new URL('posts.json', base), { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Could not load posts.json');
      return r.json();
    });
  }

  var list = document.getElementById('post-list');
  if (list) {
    var listBase = new URL('blog/', location.href);
    loadPosts(listBase).then(function (posts) {
      list.innerHTML = posts.map(function (post) {
        var title = post.comingSoon
          ? escapeHtml(post.title)
          : '<a class="post-title-link" href="blog/post.html?p=' + encodeURIComponent(post.slug) + '">' + escapeHtml(post.title) + '</a>';
        var right = post.comingSoon ? '<span class="soon-badge">Coming soon</span>' : '<span class="date">' + formatDate(post.date) + '</span>';
        var authors = post.authors && post.authors.length ? '<p class="post-authors">' + post.authors.map(escapeHtml).join(', ') + '</p>' : '';
        return '<article class="content-card">' +
          '<div class="card-head"><div><h3>' + title + '</h3><div class="meta">' + escapeHtml(post.summary || '') + '</div></div>' + right + '</div>' +
          authors + tagsHtml(post) + '</article>';
      }).join('');
    }).catch(function () {
      list.innerHTML = '<p class="meta">Couldn’t load posts right now.</p>';
    });
  }

  var target = document.getElementById('post');
  if (target) {
    var base = new URL('./', location.href);
    var slug = new URLSearchParams(location.search).get('p');
    loadPosts(base).then(function (posts) {
      var post = posts.filter(function (p) { return p.slug === slug; })[0];
      if (!post || post.comingSoon) throw new Error('missing');
      var mdUrl = new URL(encodeURIComponent(post.slug) + '/post.md', base);
      return fetch(mdUrl, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('missing');
        return r.text();
      }).then(function (md) {
        document.title = post.title + ' | Arhan Chavare';
        var body = document.createElement('div');
        body.className = 'post-body';
        body.innerHTML = renderMarkdown(md);
        absolutize(body, mdUrl);
        target.innerHTML = '<header class="post-header"><h1>' + escapeHtml(post.title) + '</h1><p class="post-meta">' + metaLine(post) + '</p>' + tagsHtml(post) + '</header>';
        target.appendChild(body);
      });
    }).catch(function () {
      target.innerHTML = '<h1>Post not found</h1><p class="meta">This post doesn’t exist yet. <a href="../blogs.html">Back to all posts</a>.</p>';
    });
  }
})();
