(()=>{
  const CIG_KEY='milk_clock_cigarettes_v1';
  let cigarettes=[];

  function loadCigarettes(){
    try{
      const saved=JSON.parse(localStorage.getItem(CIG_KEY)||'[]');
      cigarettes=Array.isArray(saved)?saved:[];
    }catch(e){cigarettes=[]}
  }
  function saveCigarettes(){localStorage.setItem(CIG_KEY,JSON.stringify(cigarettes))}
  function addCigarette(){
    cigarettes.push({id:`cig_${Date.now()}_${Math.random().toString(16).slice(2)}`,t:Date.now()});
    saveCigarettes();
    renderLog();
    if(typeof showToast==='function') showToast('🚬 Cigaret tilføjet');
  }
  function installButton(){
    const adjust=document.getElementById('adjustBtn');
    if(!adjust||document.getElementById('cigaretteBtn'))return;
    const group=document.createElement('div');
    group.className='quickActions';
    adjust.parentNode.insertBefore(group,adjust);
    group.appendChild(adjust);
    const btn=document.createElement('button');
    btn.id='cigaretteBtn';
    btn.className='pill';
    btn.type='button';
    btn.textContent='🚬 Cigaret';
    btn.setAttribute('aria-label','Log en cigaret nu');
    btn.onclick=addCigarette;
    group.appendChild(btn);

    const style=document.createElement('style');
    style.textContent='.quickActions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.cigaretteMark{font-size:15px;margin-right:4px}';
    document.head.appendChild(style);
  }

  loadCigarettes();
  installButton();

  renderLog=function(){
    const log=document.getElementById('log');
    if(!log)return;
    log.innerHTML='';
    const total=state.drinks.reduce((s,d)=>s+d.u,0);
    const alcoholText=`${String(Math.round(total*10)/10).replace('.',',')} ${total===1?'genstand':'genstande'}`;
    document.getElementById('historyCount').textContent=cigarettes.length?`${alcoholText} · ${cigarettes.length} 🚬`:alcoholText;

    const entries=[
      ...state.drinks.map(d=>({type:'drink',...d})),
      ...cigarettes.map(c=>({type:'cigarette',...c}))
    ].sort((a,b)=>b.t-a.t);

    if(!entries.length){
      log.innerHTML='<div class="empty">Ingen drinks eller cigaretter registreret endnu.</div>';
      return;
    }

    entries.forEach(entry=>{
      const row=document.createElement('div');
      row.className='logItem';
      const meta=document.createElement('div');

      if(entry.type==='drink'){
        meta.innerHTML=`<div class="logTitle">${String(entry.u).replace('.',',')} ${entry.u===1?'genstand':'genstande'}</div><div class="logTime">${formatDateTime(entry.t)}</div>`;
        const actions=document.createElement('div');
        actions.className='logActions';
        const edit=document.createElement('button');
        edit.textContent='Ret';
        edit.onclick=()=>{
          document.getElementById('unitsInput').value=entry.u;
          document.getElementById('timeInput').value=localDateTime(new Date(entry.t));
          state.drinks=state.drinks.filter(x=>x.id!==entry.id);
          save();renderAll();openSheet('adjustSheet');
        };
        const del=document.createElement('button');
        del.textContent='Slet';
        del.onclick=()=>{state.drinks=state.drinks.filter(x=>x.id!==entry.id);save();renderAll()};
        actions.append(edit,del);row.append(meta,actions);
      }else{
        meta.innerHTML=`<div class="logTitle"><span class="cigaretteMark">🚬</span>Cigaret</div><div class="logTime">${formatDateTime(entry.t)}</div>`;
        const actions=document.createElement('div');
        actions.className='logActions';
        const del=document.createElement('button');
        del.textContent='Slet';
        del.onclick=()=>{cigarettes=cigarettes.filter(x=>x.id!==entry.id);saveCigarettes();renderLog()};
        actions.append(del);row.append(meta,actions);
      }
      log.appendChild(row);
    });
  };

  const clear=document.getElementById('clearAllBtn');
  if(clear){
    clear.onclick=()=>{
      if(!(state.drinks.length||cigarettes.length))return;
      if(confirm('Slet hele historikken?')){
        state.drinks=[];cigarettes=[];save();saveCigarettes();renderAll();
      }
    };
  }

  renderLog();
})();