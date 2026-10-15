/* DEALYX Capacitor back-navigation bridge. This file does not clear localStorage or phone settings. */
(()=>{
  const K='dx_v25_route_history';
  const read=()=>{try{const x=JSON.parse(sessionStorage.getItem(K)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'&&v.startsWith('#/')).slice(-40):[]}catch{return[]}};
  const write=a=>{try{sessionStorage.setItem(K,JSON.stringify(a.slice(-40)))}catch{}};
  let stack=read();
  const current=()=>location.hash||'#/';
  if(!stack.length){stack=[current()];write(stack)}
  let ignoreNext=false;
  window.addEventListener('hashchange',()=>{
    const now=current();
    if(ignoreNext){ignoreNext=false;if(stack[stack.length-1]!==now)stack.push(now);write(stack);return;}
    if(stack[stack.length-1]!==now){stack.push(now);write(stack)}
  });
  const closeOverlay=()=>{
    const sheet=document.querySelector('.more-sheet.open');
    if(sheet){sheet.querySelector('[data-a="close-more"]')?.click();return true;}
    const dlg=[...document.querySelectorAll('dialog[open]')].pop();if(dlg){try{dlg.close()}catch{}return true;}
    const menu=document.querySelector('details.menu[open]');if(menu){menu.open=false;return true;}
    return false;
  };
  const goBack=()=>{
    if(closeOverlay())return;
    const now=current();
    // Keep a visible app at the root; do not trigger the native exit/minimize default.
    if(stack.length>1){
      if(stack[stack.length-1]===now)stack.pop();
      const prev=stack.pop()||'#/';write(stack.length?stack:[prev]);
      if(prev!==now){ignoreNext=true;location.hash=prev;}
      return;
    }
    if(now!=='#/'){write(['#/']);ignoreNext=true;location.hash='#/';return;}
    window.dispatchEvent(new CustomEvent('dealyx:back-at-root'));
  };
  window.DEALYX_APP_GO_BACK=goBack;
  const tryRegister=()=>{
    const App=window.Capacitor?.Plugins?.App;
    if(App?.addListener){try{App.addListener('backButton',()=>goBack());return true}catch{}}
    return false;
  };
  if(!tryRegister()){
    // Capacitor 7 may expose plugins only after bridge init; retry a few short times without polling forever.
    let n=0;const timer=setInterval(()=>{n++;if(tryRegister()||n>=20)clearInterval(timer)},250);
  }
})();
