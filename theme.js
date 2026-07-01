(function(){
  var root=document.documentElement, btn=document.getElementById('themeBtn');
  var saved=localStorage.getItem('theme');
  var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme=saved||(prefersDark?'dark':'light');
  apply(theme);
  if(btn){
    btn.addEventListener('click',function(){
      theme=root.getAttribute('data-theme')==='dark'?'light':'dark';
      apply(theme);localStorage.setItem('theme',theme);
    });
  }
  function apply(t){root.setAttribute('data-theme',t);if(btn)btn.textContent=t==='dark'?'☀️':'🌙';}

  // playful "catch me" hero emoji — dodges the cursor
  var hero=document.querySelector('.hero'), emo=document.getElementById('heroEmoji');
  if(hero && emo){
    var faces=['😄','🙂','😁','😆','🤪','😎','🥳','😜','😊'];
    function hop(){
      var maxX=Math.max(8, hero.clientWidth - emo.offsetWidth - 8);
      var maxY=Math.max(8, hero.clientHeight - emo.offsetHeight - 8);
      emo.style.left=(8+Math.random()*(maxX-8))+'px';
      emo.style.top=(8+Math.random()*(maxY-8))+'px';
      emo.textContent=faces[Math.floor(Math.random()*faces.length)];
      emo.style.transform='rotate('+(Math.random()*44-22)+'deg) scale(1.15)';
      setTimeout(function(){emo.style.transform='rotate(0deg) scale(1)';},300);
    }
    emo.addEventListener('mouseenter', hop);
    emo.addEventListener('click', hop);
    hero.addEventListener('pointermove', function(ev){
      var r=emo.getBoundingClientRect();
      if(Math.hypot(ev.clientX-(r.left+r.width/2), ev.clientY-(r.top+r.height/2)) < 72) hop();
    });
  }

  // mobile hamburger menu
  var nav=document.querySelector('nav'), tgl=document.getElementById('navToggle');
  if(nav&&tgl){
    tgl.addEventListener('click',function(){
      var open=nav.classList.toggle('open');
      tgl.setAttribute('aria-expanded',open);
    });
    nav.querySelectorAll('.nav-links a').forEach(function(a){
      a.addEventListener('click',function(){nav.classList.remove('open');tgl.setAttribute('aria-expanded',false);});
    });
  }
})();
