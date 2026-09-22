(function(){
  var root=document.documentElement, btn=document.getElementById('themeBtn');
  var saved=localStorage.getItem('theme');
  var prefersDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme=saved||(prefersDark?'dark':'light');
  apply(theme);
  function setTheme(t){theme=t;apply(t);localStorage.setItem('theme',t);}

  // Switching to dark is instant. Defecting to light? Not so fast — a playful
  // escalating "are you sure?" nag (dark-mode superiority, with love).
  var NAG=[
    {t:"Switch to light mode? ☀️", yes:"Yes, switch", no:"Never mind"},
    {t:"You sure? That's a lot of light for those eyes… 😎", yes:"I'm sure", no:"Keep it dark"},
    {t:"Last chance — this cannot be unseen. Really go light? 🙈", yes:"Blind me ☀️", no:"Fine, stay dark"}
  ];
  function askLight(step){
    var cfg=NAG[step];
    var wrap=document.createElement('div');
    wrap.className='theme-modal-backdrop';
    wrap.innerHTML='<div class="theme-modal" role="alertdialog" aria-modal="true" aria-labelledby="tmMsg">'
      +'<p class="tm-step">Confirmation '+(step+1)+' of '+NAG.length+'</p>'
      +'<h3 id="tmMsg"></h3>'
      +'<div class="tm-row">'
      +'<button class="tm-no" type="button"></button>'
      +'<button class="tm-yes" type="button"></button>'
      +'</div></div>';
    document.body.appendChild(wrap);
    wrap.querySelector('#tmMsg').textContent=cfg.t;
    var yes=wrap.querySelector('.tm-yes'), no=wrap.querySelector('.tm-no');
    yes.textContent=cfg.yes; no.textContent=cfg.no;
    function cleanup(){document.removeEventListener('keydown',onKey);wrap.remove();}
    function close(){cleanup();if(btn)btn.focus();}
    function onKey(e){if(e.key==='Escape')close();}
    document.addEventListener('keydown',onKey);
    wrap.addEventListener('click',function(e){if(e.target===wrap)close();});
    no.addEventListener('click',close);
    yes.addEventListener('click',function(){
      if(step+1<NAG.length){cleanup();askLight(step+1);}
      else{close();setTheme('light');}
    });
    no.focus(); // the dark side nudges you: "keep dark" is the default
  }

  if(btn){
    btn.addEventListener('click',function(){
      if(root.getAttribute('data-theme')==='dark') askLight(0); // going to light → nag
      else setTheme('dark');                                    // going to dark → instant
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
    // catch it (or tap on mobile) → secret page
    var secret=emo.getAttribute('data-secret')||'private.html';
    emo.addEventListener('click', function(){ window.location.href=secret; });
    // only dodge on real cursors; touch devices just tap to open
    var fine=window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if(fine){
      emo.addEventListener('mouseenter', hop);
      hero.addEventListener('pointermove', function(ev){
        var r=emo.getBoundingClientRect();
        if(Math.hypot(ev.clientX-(r.left+r.width/2), ev.clientY-(r.top+r.height/2)) < 60) hop();
      });
    }
  }

  // mobile hamburger menu
  var nav=document.querySelector('nav'), tgl=document.getElementById('navToggle');
  if(nav&&tgl){
    var menuLinks=nav.querySelectorAll('.nav-links a');
    function setMenu(open,returnFocus){
      nav.classList.toggle('open',open);
      tgl.setAttribute('aria-expanded',open?'true':'false');
      tgl.setAttribute('aria-label',open?'Close menu':'Open menu');
      if(!open&&returnFocus)tgl.focus({preventScroll:true});
    }
    tgl.addEventListener('click',function(){
      var open=!nav.classList.contains('open');
      setMenu(open,false);
      if(open&&menuLinks.length)menuLinks[0].focus({preventScroll:true});
    });
    menuLinks.forEach(function(a){
      a.addEventListener('click',function(){
        var samePage=a.origin===window.location.origin&&a.pathname===window.location.pathname&&a.hash;
        setMenu(false,false);
        if(samePage){
          var target=document.getElementById(a.hash.slice(1));
          if(target){
            if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
            window.setTimeout(function(){target.focus({preventScroll:true});},0);
          }
        }
      });
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&nav.classList.contains('open'))setMenu(false,true);
    });
    document.addEventListener('pointerdown',function(e){
      if(nav.classList.contains('open')&&!nav.contains(e.target))setMenu(false,false);
    });
    var mobile=window.matchMedia&&window.matchMedia('(max-width: 760px)');
    if(mobile){
      var closeOnDesktop=function(e){if(!e.matches)setMenu(false,false);};
      if(mobile.addEventListener)mobile.addEventListener('change',closeOnDesktop);
      else if(mobile.addListener)mobile.addListener(closeOnDesktop);
    }
  }
})();
