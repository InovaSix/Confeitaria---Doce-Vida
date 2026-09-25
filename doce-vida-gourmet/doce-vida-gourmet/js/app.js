const ZAP = "5511991697132";
const brl = v => v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- Catálogo padrão (substituído pelo banco quando disponível) ---------- */
const DEFAULT_PRODUCTS = [
  {id:"brigadeiro-beijinho",nome:"Brigadeiro e beijinho",desc:"Os clássicos de festa: brigadeiro com granulado crocante e beijinho de coco.",preco:4.5,unidade:"un",cat:"doces",img:"img/real/brig-coco.jpg",estoque:48,ativo:true,ordem:1},
  {id:"brigadeiro-confete",nome:"Brigadeiro com confete",desc:"Brigadeiro cremoso coberto de confete colorido. A alegria das crianças.",preco:5,unidade:"un",cat:"doces",img:"img/real/brig-confete.jpg",estoque:30,ativo:true,ordem:2},
  {id:"bicho-de-pe",nome:"Bicho-de-pé",desc:"Docinho de morango cremoso, finalizado no açúcar cristal vermelho.",preco:4.5,unidade:"un",cat:"doces",img:"img/real/brig-vermelho.jpg",estoque:24,ativo:true,ordem:3},
  {id:"maca-amor",nome:"Maçã do amor com chocolate",desc:"Maçã fresca banhada no chocolate, com laço de cetim.",preco:14,unidade:"un",cat:"doces",img:"img/real/maca.jpg",estoque:3,ativo:true,ordem:4},
  {id:"caixa-sortida",nome:"Caixa de docinhos sortidos",desc:"Brigadeiro, beijinho, bicho-de-pé e bombons na mesma caixa.",preco:62,unidade:"cx",cat:"presentes",img:"img/real/caixa-sortida.jpg",estoque:4,ativo:true,ordem:5},
  {id:"docinhos-finos",nome:"Docinhos finos para lembrancinha",desc:"Em forminhas delicadas e caixinha personalizada com a inicial.",preco:7,unidade:"un",cat:"presentes",img:"img/real/bem-casados.jpg",estoque:20,ativo:true,ordem:6},
  {id:"bolo-rosas",nome:"Bolo confeitado de rosas",desc:"Serve 10 pessoas. Rosas de chantininho feitas à mão.",preco:139,unidade:"un",cat:"bolos",img:"img/real/bolo-rosas.jpg",estoque:1,ativo:true,ordem:7},
  {id:"bolo-vintage",nome:"Bolo vintage com laços",desc:"Serve 12 pessoas. Chantininho branco com babados e fitas.",preco:159,unidade:"un",cat:"bolos",img:"img/real/bolo-laco.jpg",estoque:0,ativo:true,ordem:8},
];
const DEFAULT_AGENDA = {leadDays:3, bloqueados:[], fechado:[0,1]}; // domingo e segunda
let products = DEFAULT_PRODUCTS.map(p=>({...p}));
let agenda = {...DEFAULT_AGENDA};
let cart = {}; // id -> qty
let filtro = "todos";

/* ---------- Vitrine ---------- */
function stockBadge(p){
  if(p.estoque<=0) return `<span class="stock out">Esgotado hoje</span>`;
  if(p.estoque<=3) return `<span class="stock low">Últimas ${p.estoque}</span>`;
  return `<span class="stock">${p.estoque} disponíveis</span>`;
}
function renderVitrine(){
  const list = products.filter(p=>p.ativo && (filtro==="todos"||p.cat===filtro)).sort((a,b)=>(a.ordem||0)-(b.ordem||0));
  $("#vitrine").innerHTML = list.map(p=>{
    const q = cart[p.id]||0, out = p.estoque<=0;
    return `<article class="card">
      <div class="ph"><img src="${esc(p.img)}" alt="${esc(p.nome)}" loading="lazy">${stockBadge(p)}</div>
      <div class="bd"><h3>${esc(p.nome)}</h3><p class="desc">${esc(p.desc)}</p>
        <div class="row"><span class="muted" style="font-size:12px">${({un:"Por unidade",cx:"Por caixa",fatia:"Por fatia"})[p.unidade]||esc(p.unidade)}</span>
        ${q>0?`<span class="qty"><button data-dec="${p.id}" aria-label="Remover um">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Adicionar um" ${q>=p.estoque?"disabled":""}>+</button></span>`
             :`<button class="add" data-inc="${p.id}" aria-label="Adicionar ${esc(p.nome)} à sacola" ${out?"disabled":""}><svg class="i"><use href="#i-plus"/></svg></button>`}
        </div></div></article>`;
  }).join("") || `<p class="muted">Nada nesta categoria hoje. Que tal uma encomenda?</p>`;
}
document.addEventListener("click",e=>{
  const inc=e.target.closest("[data-inc]"), dec=e.target.closest("[data-dec]");
  if(inc){const p=products.find(x=>x.id===inc.dataset.inc); if(!p) return; const q=(cart[p.id]||0); if(q<p.estoque){cart[p.id]=q+1; toast(`${p.nome} na sacola`);} else toast("Quantidade máxima em estoque"); refreshCart();}
  if(dec){const id=dec.dataset.dec; cart[id]=(cart[id]||0)-1; if(cart[id]<=0) delete cart[id]; refreshCart();}
});
document.querySelectorAll(".chip[data-f]").forEach(b=>b.onclick=()=>{filtro=b.dataset.f;document.querySelectorAll(".chip[data-f]").forEach(c=>c.setAttribute("aria-pressed",c===b));renderVitrine();});
document.querySelectorAll("[data-jump]").forEach(a=>a.addEventListener("click",()=>{const b=document.querySelector(`.chip[data-f="${a.dataset.jump}"]`); b&&b.click();}));

/* ---------- Sacola ---------- */
let entregaP=false;
function cartLines(){return Object.entries(cart).map(([id,q])=>({p:products.find(x=>x.id===id),q})).filter(l=>l.p);}
function cartTotal(){return cartLines().reduce((s,l)=>s+l.p.preco*l.q,0)+(entregaP&&cartLines().length?12:0);}
function refreshCart(){
  const lines=cartLines(), n=lines.reduce((s,l)=>s+l.q,0);
  $("#cartCount").hidden=!n; $("#cartCount").textContent=n;
  $("#cartItems").innerHTML = lines.length? lines.map(({p,q})=>`<div class="ci"><img src="${esc(p.img)}" alt=""><div><b>${esc(p.nome)}</b><small>${q} ${esc(p.unidade)}</small></div><span class="qty"><button data-dec="${p.id}" aria-label="Remover um">−</button><span>${q}</span><button data-inc="${p.id}" aria-label="Adicionar um">+</button></span></div>`).join("")
    : `<div class="empty"><div class="script">Sacola vazia</div><p>Escolha algo gostoso na vitrine de pronta entrega.</p><a class="btn btn-rosa" href="#pronta" id="goVitrine" style="margin-top:14px">Ver vitrine</a></div>`;
  $("#cartFoot").hidden=!lines.length;
  renderVitrine();
}
function openCart(o){$("#drawer").hidden=!o;$("#scrim").hidden=!o;}
$("#cartOpen").onclick=()=>openCart(true);
$("#cartClose").onclick=$("#scrim").onclick=()=>openCart(false);
$("#cartItems").addEventListener("click",e=>{if(e.target.id==="goVitrine")openCart(false);});
function setSeg(a,b,v){a.setAttribute("aria-pressed",!v);b.setAttribute("aria-pressed",v);}
$("#pRet").onclick=()=>{entregaP=false;setSeg($("#pRet"),$("#pEnt"),false);$("#pEndWrap").hidden=true;refreshCart();};
$("#pEnt").onclick=()=>{entregaP=true;setSeg($("#pRet"),$("#pEnt"),true);$("#pEndWrap").hidden=false;refreshCart();};
(function horas(){const h=[];for(let i=10;i<=18;i++)h.push(`<option>${String(i).padStart(2,"0")}:00</option>`);$("#pHora").innerHTML=h.join("");})();
$("#cartSend").onclick=()=>{
  const nome=$("#pNome").value.trim(); $("#errCart").hidden=!!nome; if(!nome){$("#pNome").focus();return;}
  const L=cartLines(); let m=`Olá, Doce Vida! 🍫\nQuero fazer um pedido de *PRONTA ENTREGA*:\n\n`;
  L.forEach(({p,q})=>m+=`• ${q}x ${p.nome}\n`);
  m+=`\n${entregaP?"Entrega em: "+($("#pEnd").value.trim()||"(informar)"):"Retirada hoje"} às ${$("#pHora").value}\nNome: ${nome}`;
  showMsg(m,"Pedido de pronta entrega");
};

/* ---------- Encomenda ---------- */
const TIPOS=[
  {id:"bolo",nome:"Bolo personalizado",sub:"de 12 a 45 fatias",img:"img/real/bolo-laco.jpg"},
  {id:"doces",nome:"Docinhos para festa",sub:"de 50 a 200 unidades",img:"img/real/caixa-sortida.jpg"},
  {id:"combo",nome:"Bolo + docinhos",sub:"tudo para a sua festa",img:"img/real/mesa-fazenda2.jpg"},
  {id:"kit",nome:"Kit presente",sub:"caixas de 4, 9 ou 12",img:"img/real/bem-casados.jpg"},
];
const TAM=[{t:"1,5 kg · 12 fatias",kg:1.5},{t:"2 kg · 16 fatias",kg:2},{t:"3 kg · 25 fatias",kg:3},{t:"4 kg · 35 fatias",kg:4},{t:"5 kg · 45 fatias",kg:5}];
const MASSA=["Chocolate","Baunilha","Red velvet","Cenoura"];
const RECHEIO=[{t:"Brigadeiro tradicional",v:0},{t:"Ninho com morango",v:15},{t:"Trufado de chocolate belga",v:20},{t:"Doce de leite com nozes",v:18},{t:"Prestígio",v:8},{t:"Maracujá com chocolate branco",v:12}];
const COB=[{t:"Ganache com drip",v:0},{t:"Chantininho",v:0},{t:"Pasta americana (tema)",v:25}];
const EXTRAS=[{id:"morangos",t:"Morangos frescos",v:35},{id:"brigtopo",t:"Brigadeiros no topo",v:28},{id:"topo",t:"Topo de bolo impresso",v:30},{id:"vela",t:"Vela dourada",v:12}];
const QTD=[{t:"50 unidades",n:50},{t:"100 unidades",n:100},{t:"150 unidades",n:150},{t:"200 unidades",n:200}];
const SABORES=[{t:"Brigadeiro gourmet",v:1.9},{t:"Mix clássico (brigadeiro, beijinho, bicho-de-pé)",v:1.9},{t:"Mix premium (bombom de uva, trufa, ninho)",v:2.6}];
const KITS=[{t:"Caixa com 4 doces",v:22},{t:"Caixa com 9 doces",v:45},{t:"Caixa com 12 doces",v:62}];
const HORAS=["09:00","11:00","14:00","16:00","18:00"];
let tipo="bolo", dataSel=null, horaSel=null, entregaE=false;
const fill=(el,arr,f)=>el.innerHTML=arr.map((x,i)=>`<option value="${i}">${f(x)}</option>`).join("");

$("#optTipo").innerHTML=TIPOS.map(t=>`<div class="opt"><input type="radio" name="tipo" id="t-${t.id}" value="${t.id}" ${t.id===tipo?"checked":""}><label for="t-${t.id}"><b>${t.nome}</b><small>${t.sub}</small></label></div>`).join("");
$("#optExtras").innerHTML=EXTRAS.map(x=>`<div class="opt"><input type="checkbox" id="x-${x.id}" value="${x.id}"><label for="x-${x.id}"><b>${x.t}</b><small>adicional</small></label></div>`).join("");
fill($("#tamanho"),TAM,x=>x.t); fill($("#massa"),MASSA,x=>x);
fill($("#recheio"),RECHEIO,x=>x.t);
fill($("#cobertura"),COB,x=>x.t);
fill($("#saborDoces"),SABORES,x=>x.t);
function setDocesOptions(){ if(tipo==="kit") fill($("#qtdDoces"),KITS,x=>x.t); else fill($("#qtdDoces"),QTD,x=>x.t); $("#saborDoces").closest(".f").hidden = tipo==="kit"; }

function calc(){
  const lines=[];
  if(tipo==="bolo"||tipo==="combo"){
    const t=TAM[$("#tamanho").value];
    lines.push(["Tamanho",t.t],["Massa",MASSA[$("#massa").value]],["Recheio",RECHEIO[$("#recheio").value].t],["Cobertura",COB[$("#cobertura").value].t]);
    const ex=EXTRAS.filter(x=>$("#x-"+x.id).checked).map(x=>x.t); if(ex.length) lines.push(["Adicionais",ex.join(", ")]);
  }
  if(tipo==="doces"||tipo==="combo"){
    lines.push(["Docinhos",QTD[$("#qtdDoces").value].t],["Sabores",SABORES[$("#saborDoces").value].t],["Forminha",$("#forminha").value]);
  }
  if(tipo==="kit"){lines.push(["Kit",KITS[$("#qtdDoces").value].t],["Embalagem","Caixa rosa + cartão escrito à mão"]);}
  lines.push(["Receber",entregaE?"Entrega no ABC":"Retirada no ateliê"]);
  lines.push(["Data",dataSel?fmtData(dataSel)+(horaSel?" · "+horaSel:""):"escolha no calendário"]);
  return {lines};
}
function fmtData(d){return d.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"long"});}
function renderSum(){
  const T=TIPOS.find(t=>t.id===tipo); $("#sumTitle").textContent=T.nome; $("#sumImg").src=T.img;
  const {lines}=calc();
  $("#sumLines").innerHTML=lines.map(([a,b])=>`<div><span class="muted">${esc(a)}</span><span>${esc(b)}</span></div>`).join("");
  $("#sumSinal").textContent="A confeitaria responde pelo WhatsApp com o orçamento e confirma a data.";
}
function setTipo(t){
  tipo=t; document.getElementById("t-"+t).checked=true;
  $("#fsBolo").hidden=!(t==="bolo"||t==="combo");
  $("#fsDoces").hidden=!(t==="doces"||t==="combo"||t==="kit");
  $("#fsDoces").querySelector(".n").textContent=t==="combo"?"2b":"2";
  $("#fsDoces").querySelector("h3").textContent=t==="kit"?"Escolha o kit":"Escolha os docinhos";
  $("#forminha").closest(".f").hidden=t==="kit";
  setDocesOptions(); renderSum();
}
$("#optTipo").addEventListener("change",e=>setTipo(e.target.value));
$("#encForm").addEventListener("change",renderSum);
document.querySelectorAll("[data-tipo]").forEach(a=>a.addEventListener("click",()=>setTipo(a.dataset.tipo)));
$("#encRet").onclick=()=>{entregaE=false;setSeg($("#encRet"),$("#encEnt"),false);$("#encEndWrap").hidden=true;renderSum();};
$("#encEnt").onclick=()=>{entregaE=true;setSeg($("#encRet"),$("#encEnt"),true);$("#encEndWrap").hidden=false;renderSum();};

/* calendário */
const hoje=new Date(); hoje.setHours(0,0,0,0);
let calMes=new Date(hoje.getFullYear(),hoje.getMonth(),1);
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
function diaOk(d){
  const min=new Date(hoje); min.setDate(min.getDate()+Number(agenda.leadDays||3));
  return d>=min && !(agenda.fechado||[]).includes(d.getDay()) && !(agenda.bloqueados||[]).includes(iso(d));
}
function renderCal(){
  const y=calMes.getFullYear(), m=calMes.getMonth(), first=new Date(y,m,1).getDay(), dias=new Date(y,m+1,0).getDate();
  let h=`<div class="cal-h"><button type="button" id="calPrev" aria-label="Mês anterior">‹</button><strong>${calMes.toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</strong><button type="button" id="calNext" aria-label="Próximo mês">›</button></div><div class="cal-g">`;
  ["D","S","T","Q","Q","S","S"].forEach(d=>h+=`<span class="dw">${d}</span>`);
  for(let i=0;i<first;i++) h+=`<span></span>`;
  for(let d=1;d<=dias;d++){const dt=new Date(y,m,d); const ok=diaOk(dt);
    h+=`<button type="button" data-d="${iso(dt)}" ${ok?"":"disabled"} class="${dataSel&&iso(dataSel)===iso(dt)?"sel":""} ${iso(dt)===iso(hoje)?"today":""}" aria-label="${dt.toLocaleDateString("pt-BR",{day:"numeric",month:"long"})}${ok?"":" indisponível"}">${d}</button>`;}
  $("#cal").innerHTML=h+"</div>";
  $("#calPrev").disabled = y===hoje.getFullYear()&&m===hoje.getMonth();
  $("#calPrev").onclick=()=>{calMes=new Date(y,m-1,1);renderCal();};
  $("#calNext").onclick=()=>{calMes=new Date(y,m+1,1);renderCal();};
  $("#cal").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{const [yy,mm,dd]=b.dataset.d.split("-").map(Number);dataSel=new Date(yy,mm-1,dd);renderCal();renderSlots();renderSum();});
}
function renderSlots(){
  if(!dataSel){$("#slots").innerHTML=`<span class="muted" style="font-size:13px">Escolha um dia para ver os horários.</span>`;return;}
  const hs = dataSel.getDay()===6?HORAS.slice(0,3):HORAS;
  if(horaSel && !hs.includes(horaSel)) horaSel=null;
  $("#slots").innerHTML=hs.map(h=>`<button type="button" class="chip" data-h="${h}" aria-pressed="${h===horaSel}">${h}</button>`).join("");
  $("#slots").querySelectorAll("[data-h]").forEach(b=>b.onclick=()=>{horaSel=b.dataset.h;renderSlots();renderSum();});
}

$("#encForm").addEventListener("submit",e=>{
  e.preventDefault();
  const nome=$("#nome").value.trim(), fone=$("#fone").value.replace(/\D/g,""), end=$("#encEnd").value.trim();
  $("#errNome").hidden=!!nome; $("#errFone").hidden=fone.length>=10; $("#errData").hidden=!!(dataSel&&horaSel); $("#errEnd").hidden=!entregaE||!!end;
  const bad=[!(dataSel&&horaSel)&&"#cal",entregaE&&!end&&"#encEnd",!nome&&"#nome",fone.length<10&&"#fone"].find(Boolean);
  if(bad){document.querySelector(bad).scrollIntoView({behavior:"smooth",block:"center"});return;}
  const {lines}=calc(); const T=TIPOS.find(t=>t.id===tipo);
  const dataLonga=dataSel.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"long"});
  let m=`Olá, Doce Vida! 🎂\nGostaria de agendar uma encomenda pelo site.\n\n`;
  m+=`*PEDIDO: ${T.nome.toUpperCase()}*\n`;
  lines.filter(([a])=>a!=="Receber"&&a!=="Data").forEach(([a,b])=>m+=`• ${a}: ${b}\n`);
  m+=`\n*DATA E ENTREGA*\n• Data: ${dataLonga}\n• Horário: ${horaSel}\n• ${entregaE?"Entrega no endereço: "+end:"Retirada no ateliê"}\n`;
  m+=`\n*FESTA*\n• Ocasião: ${$("#ocasiao").value}\n`;
  if($("#topo").value.trim()) m+=`• Frase no topo: ${$("#topo").value.trim()}\n`;
  if($("#obs").value.trim()) m+=`• Tema e observações: ${$("#obs").value.trim()}\n`;
  m+=`\n*CLIENTE*\n• Nome: ${nome}\n• WhatsApp: ${$("#fone").value.trim()}\n`;
  m+=`\nAguardo o orçamento e a confirmação da data. Desde já, agradeço! 💕`;
  showMsg(m,"Encomenda agendada");
});

/* ---------- Modal / WhatsApp ---------- */
function showMsg(m,title){
  $("#mTitle").textContent=title; $("#mMsg").textContent=m;
  const url=`https://wa.me/${ZAP}?text=${encodeURIComponent(m)}`;
  $("#mZap").href=url;
  // Abre o WhatsApp direto; o modal fica como plano B se o navegador bloquear.
  const w=window.open(url,"_blank"); if(w) try{w.opener=null;}catch(_){}
  $("#mHint").textContent = w===null
    ? "Toque em \"Abrir WhatsApp\" para enviar a mensagem abaixo. Se não abrir, copie o texto e envie manualmente."
    : "Abrimos o WhatsApp com a sua mensagem pronta. É só tocar em enviar por lá. Se não abriu, use o botão abaixo.";
  $("#modal").hidden=false; $("#mZap").focus();
}
$("#mClose").onclick=()=>$("#modal").hidden=true;
$("#modal").addEventListener("click",e=>{if(e.target.id==="modal")$("#modal").hidden=true;});
async function copy(text,el){try{await navigator.clipboard.writeText(text);toast("Copiado");}catch(_){const r=document.createRange();r.selectNodeContents(el);const s=getSelection();s.removeAllRanges();s.addRange(r);toast("Texto selecionado. Use Copiar do seu aparelho.");}}
$("#mCopy").onclick=()=>copy($("#mMsg").textContent,$("#mMsg"));
$("#copyNum").onclick=()=>copy("(11) 99169-7132",$("#zapNum"));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){$("#modal").hidden=true;openCart(false);}});
let tt; function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(tt);tt=setTimeout(()=>el.hidden=true,1800);}

/* ---------- Banco de dados + painel ---------- */
let db=null;
function applyAgenda(){ $("#factLead").textContent=`${agenda.leadDays} dia${agenda.leadDays>1?"s":""}`; if(dataSel&&!diaOk(dataSel)){dataSel=null;horaSel=null;} renderCal(); renderSlots(); renderSum(); }
function renderAdmin(){
  $("#admRows").innerHTML=products.sort((a,b)=>(a.ordem||0)-(b.ordem||0)).map(p=>`<tr>
    <td><b>${esc(p.nome)}</b><br><span class="muted">${esc(p.unidade)}</span></td>
    <td><input type="number" step="1" min="0" id="es-${p.id}" value="${p.estoque}"></td>
    <td><input type="checkbox" id="at-${p.id}" ${p.ativo?"checked":""} aria-label="Visível na vitrine"></td>
    <td><button class="btn btn-dark" style="padding:8px 14px" data-save="${p.id}">Salvar</button></td></tr>`).join("");
  $("#admLead").value=agenda.leadDays;
  renderBlocked();
}
function renderBlocked(){
  const b=(agenda.bloqueados||[]).slice().sort();
  $("#admBlocked").innerHTML=b.length?b.map(d=>`<button type="button" class="chip" data-unb="${d}" title="Desbloquear">${d.split("-").reverse().join("/")} ✕</button>`).join(""):`<span class="muted" style="font-size:13px">Nenhum dia bloqueado.</span>`;
}
$("#admRows").addEventListener("click",async e=>{
  const b=e.target.closest("[data-save]"); if(!b||!db) return; const id=b.dataset.save;
  const upd={estoque:Math.max(0,parseInt($("#es-"+id).value)||0), ativo:$("#at-"+id).checked};
  try{await db.doc("catalogo/"+id).update(upd); toast("Vitrine atualizada");}catch(err){toast("Não foi possível salvar: "+(err.message||err.code||"erro"));}
});
$("#admBlockBtn").onclick=()=>{const v=$("#admBlock").value; if(!v) return; agenda.bloqueados=[...new Set([...(agenda.bloqueados||[]),v])]; renderBlocked();};
$("#admBlocked").addEventListener("click",e=>{const b=e.target.closest("[data-unb]"); if(!b) return; agenda.bloqueados=agenda.bloqueados.filter(d=>d!==b.dataset.unb); renderBlocked();});
$("#admSave").onclick=async()=>{
  if(!db) return; const lead=Math.min(30,Math.max(1,parseInt($("#admLead").value)||3));
  try{await db.doc("config/agenda").set({leadDays:lead,bloqueados:agenda.bloqueados||[],fechado:agenda.fechado||[0,1]}); toast("Agenda salva");}catch(err){toast("Não foi possível salvar: "+(err.message||err.code||"erro"));}
};

async function boot(){
  setTipo("bolo"); refreshCart(); applyAgenda();
  // Sem back-end: usa DEFAULT_PRODUCTS e DEFAULT_AGENDA.
  // Para conectar um banco (Firebase, Supabase, API própria), substitua o bloco abaixo.
  const claude=window.claude; if(!claude||!claude.use) return;
  db = await claude.use("db");
  if(db){
    db.collection("catalogo").onSnapshot(snap=>{
      const arr=snap.docs.map(d=>({id:d.id,...d.data()})).filter(p=>p.nome);
      if(arr.length){products=arr; for(const id in cart){const p=products.find(x=>x.id===id); if(!p||!p.ativo) delete cart[id]; else if(cart[id]>p.estoque) cart[id]=p.estoque; if(cart[id]<=0) delete cart[id];} refreshCart(); if(!$("#painel").hidden) renderAdmin();}
    },()=>{});
    db.doc("config/agenda").onSnapshot(s=>{const d=s.data&&s.data(); if(d){agenda={...DEFAULT_AGENDA,...d}; applyAgenda(); if(!$("#painel").hidden) renderAdmin();}},()=>{});
  }
  const user = await claude.use("user");
  const edit = user ? await user.canEdit() : false;
  if(edit && db){ $("#painel").hidden=false; renderAdmin(); }
}
boot();

/* ---------- Surgimento suave ao rolar ---------- */
if("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches){
  const els=document.querySelectorAll("section.blk .head, .mosaic figure, .band, .process li, .insta a, .contact .panel");
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{rootMargin:"0px 0px -8% 0px"});
  els.forEach((el,i)=>{el.classList.add("rv");el.style.transitionDelay=(i%3)*80+"ms";io.observe(el);});
}
