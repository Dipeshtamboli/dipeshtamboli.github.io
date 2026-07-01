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

  // playful "catch me" hero emoji beside the name — dodges the cursor
  var hero=document.querySelector('.hero'), emo=document.getElementById('heroEmoji');
  if(hero && emo){
    var faces=['😄','🙂','😁','😆','🤪','😎','🥳','😜','😊'];
    function hop(){
      // measure the emoji's untransformed (home) position
      var prev=emo.style.transform; emo.style.transform='none';
      var nat=emo.getBoundingClientRect(); emo.style.transform=prev;
      var hr=hero.getBoundingClientRect();
      var minDX=(hr.left+8)-nat.left, maxDX=(hr.right-8)-nat.right;
      var minDY=(hr.top+8)-nat.top, maxDY=(hr.bottom-8)-nat.bottom;
      if(maxDX<minDX){var a=minDX;minDX=maxDX;maxDX=a;}
      if(maxDY<minDY){var b=minDY;minDY=maxDY;maxDY=b;}
      var dx=minDX+Math.random()*(maxDX-minDX);
      var dy=minDY+Math.random()*(maxDY-minDY);
      emo.textContent=faces[Math.floor(Math.random()*faces.length)];
      emo.style.transform='translate('+dx+'px,'+dy+'px) rotate('+(Math.random()*44-22)+'deg)';
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
