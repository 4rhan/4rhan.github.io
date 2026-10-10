// Fade sections and cards in as they scroll into view.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll('.portfolio-section, .contact-section, .work-item, .content-card, .profile-facts > div');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) {
    // Stagger siblings slightly so lists cascade in.
    var index = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--reveal-delay', Math.min(index, 4) * 0.07 + 's');
    el.classList.add('reveal');
    el.addEventListener('animationend', function done(e) {
      if (e.target !== el) return;
      el.classList.remove('reveal', 'is-visible');
      el.style.removeProperty('--reveal-delay');
      el.removeEventListener('animationend', done);
    });
    observer.observe(el);
  });
})();
