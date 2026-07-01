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
})();
