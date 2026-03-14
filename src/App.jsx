import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Papa from "papaparse";
import {
  BarChart,Bar,PieChart,Pie,Cell,AreaChart,Area,
  XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,
  RadarChart,Radar,PolarGrid,PolarAngleAxis,PolarRadiusAxis,
  ScatterChart,Scatter,ZAxis,ComposedChart,Line,Legend,
} from "recharts";
import {
  TrendingUp,Users,Target,RefreshCw,BarChart3,Activity,Loader2,Sparkles,
  Monitor,Play,Pause,Volume2,VolumeX,Crown,Bell,Settings,Plus,Trash2,
  Calendar,Calculator,Hash,DollarSign,X,ChevronDown,AlertCircle,Globe,
  Layers,Clock,Star,Save,Sun,Moon,Camera,Image,Sliders,Maximize2,Minimize2,BookmarkPlus,FolderOpen,Trophy,Zap,
  Link2,ArrowUp,ArrowDown,ArrowLeft,ArrowRight,Palette,CheckSquare,LayoutGrid,RotateCw,Crosshair
} from "lucide-react";

// ═══ THEMES ═══
const LIGHT={bg:"#F0F2F5",card:"#FFFFFF",border:"#E2E5EA",borderLight:"#EDF0F3",
  text:"#111827",textMid:"#6B7280",textDim:"#9CA3AF",
  primary:"#4F46E5",primaryLight:"#EEF2FF",teal:"#0D9488",
  success:"#059669",danger:"#E11D48",warning:"#D97706",
  headerBg:"rgba(255,255,255,0.92)",inputBg:"#FFFFFF",shadow:"rgba(0,0,0,0.04)"};
const DARK={bg:"#0F1117",card:"#1A1D28",border:"#2A2D3A",borderLight:"#22252F",
  text:"#E8ECF4",textMid:"#8B93A7",textDim:"#4A5068",
  primary:"#818CF8",primaryLight:"#1E1B4B",teal:"#5EEAD4",
  success:"#34D399",danger:"#FB7185",warning:"#FBBF24",
  headerBg:"rgba(15,17,23,0.92)",inputBg:"#1A1D28",shadow:"rgba(0,0,0,0.2)"};
const PAL=["#4F46E5","#0D9488","#EA580C","#E11D48","#D97706","#059669","#7C3AED","#0284C7"];
const TCS=[{p:"#4F46E5",l:"#EEF2FF"},{p:"#0D9488",l:"#F0FDFA"},{p:"#EA580C",l:"#FFF7ED"},
  {p:"#E11D48",l:"#FFF1F2"},{p:"#7C3AED",l:"#F5F3FF"},{p:"#0284C7",l:"#F0F9FF"}];
const FONT="'Plus Jakarta Sans',system-ui,sans-serif";
const NUM="'Space Grotesk',sans-serif";

// ═══ HELPERS ═══
const parseBRL=v=>{if(v==null)return 0;if(typeof v==="number")return v;return parseFloat(String(v).replace(/[R$\s.]/g,"").replace(",","."))||0;};
const fmtBRL=v=>(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fmtN=v=>(v||0).toLocaleString("pt-BR",{maximumFractionDigits:0});
function parseDate(v){
  if(!v)return null;const s=String(v).trim();if(!s||s==="-")return null;
  const n=Number(s);if(!isNaN(n)&&n>1000&&n<100000){const d=new Date((n-25569)*86400000);if(!isNaN(d.getTime()))return d;}
  const p=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if(p){const a=+p[1],b=+p[2],y=+p[3];
    if(a>12)return new Date(y,b-1,a);if(b>12)return new Date(y,a-1,b);
    const d1=new Date(y,a-1,b);if(!isNaN(d1.getTime())&&d1.getFullYear()>1990)return d1;}
  const iso=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(iso)return new Date(+iso[1],+iso[2]-1,+iso[3]);
  return null;
}
function findCol(data,kws){if(!data?.[0])return null;const cols=Object.keys(data[0]);
  for(const kw of kws){const f=cols.find(c=>c.toUpperCase().replace(/[\s:_°]/g,"").includes(kw.toUpperCase().replace(/[\s:_°]/g,"")));if(f)return f;}return null;}
function datePreset(t){const now=new Date(),y=now.getFullYear(),m=now.getMonth(),d=now.getDate(),iso=dt=>dt.toISOString().split("T")[0],end=iso(now);
  if(t==="today")return{start:end,end};
  if(t==="week"){const dow=now.getDay(),diff=dow===0?6:dow-1;return{start:iso(new Date(y,m,d-diff)),end};}
  if(t==="month")return{start:iso(new Date(y,m,1)),end};if(t==="3m")return{start:iso(new Date(y,m-3,d)),end};
  if(t==="6m")return{start:iso(new Date(y,m-6,d)),end};if(t==="year")return{start:iso(new Date(y-1,m,d)),end};return{start:"",end:""};}
function playChime(){try{const c=new(window.AudioContext||window.webkitAudioContext)();
  [523,659,784,1047,1319].forEach((f,i)=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.type="triangle";
    o.frequency.setValueAtTime(f,c.currentTime+i*.12);g.gain.setValueAtTime(0,c.currentTime+i*.12);g.gain.linearRampToValueAtTime(.15,c.currentTime+i*.12+.03);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+i*.12+.45);o.start(c.currentTime+i*.12);o.stop(c.currentTime+i*.12+.5);});}catch(e){}}

// ═══ DB ═══
const DB="mc_v4";
const dbSave=c=>{try{localStorage.setItem(DB,JSON.stringify({...c,_t:Date.now()}))}catch(e){}};
const dbLoad=()=>{try{const s=localStorage.getItem(DB);return s?JSON.parse(s):null}catch(e){return null}};

// ═══ VISÕES (SAVED VIEWS) ═══
const VIEWS_KEY="mc_views_v1";
const viewsSave=v=>{try{localStorage.setItem(VIEWS_KEY,JSON.stringify(v))}catch(e){}};
const viewsLoad=()=>{try{const s=localStorage.getItem(VIEWS_KEY);return s?JSON.parse(s):[]}catch(e){return[]}};

// ═══ CHART BOX (with focus support) ═══
function ChartBox({id,title,icon:Icon,color,children,focused,onFocus,th,chartH}){
  const isFocused=focused===id;const isOther=focused&&!isFocused;
  return<div onClick={e=>{e.stopPropagation();onFocus(isFocused?null:id)}} style={{
    flex:isOther?"0 0 80px":isFocused?"1 1 100%":"1 1 45%",
    minWidth:isOther?80:isFocused?"100%":280,
    maxHeight:isOther?80:"none",
    width:isFocused?"100%":"auto",
    background:th.card,borderRadius:isFocused?20:16,padding:isOther?8:isFocused?24:18,
    border:`1px solid ${isFocused?color+"88":th.border}`,
    overflow:"hidden",cursor:"pointer",transition:"all .6s cubic-bezier(.16,1,.3,1)",
    boxShadow:isFocused?`0 8px 40px ${color}30`:"none",
    opacity:isOther?.4:1,order:isFocused?-1:0,
  }}>
    <h3 style={{fontSize:isOther?9:isFocused?16:13,fontWeight:isFocused?700:600,color:th.text,marginBottom:isOther?2:isFocused?16:12,display:"flex",alignItems:"center",gap:6}}>
      <Icon size={isOther?10:isFocused?18:14} color={color}/> {title}
      {isFocused&&<span style={{marginLeft:"auto",fontSize:10,color:th.textDim,fontWeight:400,display:"flex",alignItems:"center",gap:4}}><Minimize2 size={12}/> clique para reduzir</span>}
      {!focused&&<Maximize2 size={10} color={th.textDim} style={{marginLeft:"auto",opacity:.3}}/>}
    </h3>
    {!isOther&&children}
  </div>;
}

// ═══ FORMULA ENGINE ═══
function evalRule(data,rule){let rows=[...data];
  (rule.conditions||[]).forEach((c,i)=>{const f=rows.filter(r=>{const v=String(r[c.column]||"").trim().toUpperCase(),t=String(c.value||"").trim().toUpperCase();
    if(c.operator==="=")return v===t;if(c.operator==="!=")return v!==t;if(c.operator==="contains")return v.includes(t);if(c.operator==="not_contains")return!v.includes(t);return true;});
    if(i===0||c.logic==="AND")rows=f;else rows=[...new Set([...rows,...f])];});
  const vals=rows.map(r=>parseBRL(r[rule.column])).filter(v=>!isNaN(v));
  if(rule.operation==="COUNT")return rows.length;if(rule.operation==="SUM")return vals.reduce((a,b)=>a+b,0);
  if(rule.operation==="AVG")return vals.length?vals.reduce((a,b)=>a+b,0)/vals.length:0;return 0;}
function evalMetric(data,m){if(!m?.rules?.length)return 0;let r=evalRule(data,m.rules[0]);
  for(let i=1;i<m.rules.length;i++){const v=evalRule(data,m.rules[i]),op=m.rules[i].combineOp;
    if(op==="+")r+=v;else if(op==="-")r-=v;else if(op==="*")r*=v;else if(op==="/")r=v?r/v:0;}return r;}

// ═══ DEFAULTS ═══
const DMET=[
  {id:"fin",name:"Faturamento",format:"currency",color:"#059669",icon:"dollar",rules:[{column:"VALOR:",operation:"SUM",conditions:[{column:"STATUS:",operator:"=",value:"FINALIZADO",logic:"AND"}]}]},
  {id:"canc",name:"Cancelados",format:"currency",color:"#E11D48",icon:"x",rules:[{column:"VALOR:",operation:"SUM",conditions:[{column:"STATUS:",operator:"contains",value:"CANCEL",logic:"AND"}]}]},
  {id:"liq",name:"Resultado Líquido",format:"currency",color:"#4F46E5",icon:"trending",rules:[{column:"VALOR:",operation:"SUM",conditions:[{column:"STATUS:",operator:"=",value:"FINALIZADO",logic:"AND"}]},{column:"VALOR:",operation:"SUM",combineOp:"-",conditions:[{column:"STATUS:",operator:"contains",value:"CANCEL",logic:"AND"}]}]},
  {id:"qtd",name:"Vendas",format:"number",color:"#D97706",icon:"hash",rules:[{column:"VALOR:",operation:"COUNT",conditions:[{column:"STATUS:",operator:"=",value:"FINALIZADO",logic:"AND"}]}]},
  {id:"vid",name:"Vidas",format:"number",color:"#7C3AED",icon:"users",rules:[{column:"N° VIDAS:",operation:"SUM",conditions:[{column:"STATUS:",operator:"=",value:"FINALIZADO",logic:"AND"}]}]},
  {id:"avg",name:"Ticket Médio",format:"currency",color:"#0D9488",icon:"star",rules:[{column:"VALOR:",operation:"AVG",conditions:[{column:"STATUS:",operator:"=",value:"FINALIZADO",logic:"AND"}]}]},
];
const DEF_LAYOUT={metricCols:6,metricFontSize:24,chartHeight:220,rankingFontSize:13,rankingMax:15};

// ═══ LIVE CLOCK ═══
function LiveClock({th}){const[t,setT]=useState(new Date());useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i)},[]);
  return<div style={{display:"flex",alignItems:"center",gap:6}}><Clock size={14} color={th.primary}/>
    <span style={{fontSize:16,fontWeight:700,fontFamily:NUM,color:th.text,minWidth:72}}>{t.toLocaleTimeString("pt-BR")}</span>
    <span style={{fontSize:10,color:th.textDim}}>{t.toLocaleDateString("pt-BR",{weekday:"short",day:"2-digit",month:"short"})}</span></div>;}

// ═══ CELEBRATION ═══
function Celebration({item,dur,onDone,th}){useEffect(()=>{if(!item)return;const t=setTimeout(onDone,(dur||5)*1000);return()=>clearTimeout(t)},[item,dur,onDone]);
  if(!item)return null;const bol=item.type==="boleto",col=bol?th.success:th.primary,bg=bol?`linear-gradient(135deg,${th.success},${th.teal})`:`linear-gradient(135deg,${th.primary},#7C3AED)`;
  return<div onClick={onDone} style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.55)",backdropFilter:"blur(14px)",display:"flex",alignItems:"center",justifyContent:"center",animation:"overlayIn .3s",cursor:"pointer"}}>
    <div style={{background:th.card,borderRadius:28,padding:"48px 64px",textAlign:"center",maxWidth:560,width:"90%",boxShadow:`0 24px 80px ${th.shadow}`,animation:"celebPop .5s cubic-bezier(.16,1,.3,1)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:0,left:0,right:0,height:5,background:bg}}/>
      <div style={{width:80,height:80,borderRadius:20,background:bg,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:24,boxShadow:`0 8px 24px ${col}44`,animation:"celebBounce .6s cubic-bezier(.34,1.56,.64,1)"}}>
        {bol?<DollarSign size={36} color="#fff"/>:<Sparkles size={36} color="#fff"/>}</div>
      <div style={{fontSize:13,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:col,marginBottom:12,fontFamily:NUM}}>{bol?"Boleto Pago":"Nova Proposta"}</div>
      <div style={{fontSize:32,fontWeight:800,color:th.text,lineHeight:1.2,marginBottom:bol?12:8}}>{item.vendor}</div>
      {bol&&item.value>0&&<div style={{fontSize:28,fontWeight:700,color:col,fontFamily:NUM,marginBottom:8}}>{fmtBRL(item.value)}</div>}
      {item.client&&<div style={{fontSize:14,color:th.textMid,marginBottom:8}}>{item.client}</div>}
      {item.team&&<div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 14px",borderRadius:20,background:`${col}10`,marginTop:8}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:col}}/><span style={{fontSize:12,fontWeight:600,color:col}}>{item.team}</span></div>}
      <div style={{fontSize:10,color:th.textDim,marginTop:20}}>toque para fechar</div></div></div>;}

// ═══ PROGRESS BAR ═══
function PBar({pct,color,h=8}){return<div style={{width:"100%",height:h,borderRadius:h,background:`${color}18`,overflow:"hidden"}}>
  <div style={{width:`${Math.min(pct||0,100)}%`,height:"100%",borderRadius:h,background:`linear-gradient(90deg,${color}CC,${color})`,transition:"width 1s cubic-bezier(.16,1,.3,1)"}}/></div>;}

// ═══ VENDOR PHOTO ═══
function VendorAvatar({name,photos,size=28}){
  const photo=photos?.[name];
  const initials=name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  if(photo)return<img src={photo} alt={name} style={{width:size,height:size,borderRadius:size/2,objectFit:"cover"}}/>;
  const hue=name.split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;
  return<div style={{width:size,height:size,borderRadius:size/2,background:`hsl(${hue},60%,75%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*.38,fontWeight:700,color:"#fff",flexShrink:0}}>{initials}</div>;
}

// ═══ PHOTO MANAGER ═══
function PhotoManager({photos,setPhotos,ranking,th}){
  const fileRef=useRef(null);const[editing,setEditing]=useState(null);
  const handleFile=e=>{const file=e.target.files?.[0];if(!file||!editing)return;const reader=new FileReader();
    reader.onload=ev=>{setPhotos(p=>({...p,[editing]:ev.target.result}));setEditing(null);};reader.readAsDataURL(file);};
  return<div style={{background:th.card,borderRadius:16,padding:18,border:`1px solid ${th.border}`,marginBottom:10}}>
    <h3 style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Camera size={14} color={th.primary}/> Fotos dos Vendedores</h3>
    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    <div style={{display:"flex",flexWrap:"wrap",gap:10}}>{(ranking||[]).map(r=>
      <div key={r.name} onClick={()=>{setEditing(r.name);fileRef.current?.click();}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",padding:6,borderRadius:10,border:`1px dashed ${th.border}`,minWidth:60}}>
        <VendorAvatar name={r.name} photos={photos} size={40}/>
        <span style={{fontSize:9,color:th.textMid,textAlign:"center",maxWidth:70,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.name.split(" ")[0]}</span>
      </div>)}
    </div></div>;
}

// ═══ LAYOUT CUSTOMIZER ═══
function LayoutPanel({layout,setLayout,th}){
  const row=(label,key,min,max,step=1)=>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${th.borderLight}`}}>
      <span style={{fontSize:11,color:th.textMid,fontWeight:500}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="range" min={min} max={max} step={step} value={layout[key]} onChange={e=>setLayout({...layout,[key]:Number(e.target.value)})}
          style={{width:100,accentColor:th.primary}}/>
        <span style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:NUM,minWidth:28,textAlign:"right"}}>{layout[key]}</span>
      </div></div>;
  return<div style={{background:th.card,borderRadius:16,padding:18,border:`1px solid ${th.border}`,marginBottom:10}}>
    <h3 style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Sliders size={14} color={th.primary}/> Layout</h3>
    {row("Colunas métricas","metricCols",2,6)}
    {row("Fonte valores (px)","metricFontSize",16,40)}
    {row("Altura gráficos (px)","chartHeight",150,400,10)}
    {row("Fonte ranking (px)","rankingFontSize",10,18)}
    {row("Max vendedores","rankingMax",5,30)}
  </div>;
}

// ═══ FULLSCREEN CONFIGURATOR ═══
const ALL_PANELS=["metrics","monthly","origem","cumul","plano","pipeline","race","scatter","radar","ranking","mini0","mini1","vendorGoal","funnel","pyramid","gauge","wave","crossComp"];
const PANEL_LABELS={metrics:"Métricas",monthly:"Evolução Mensal",origem:"Por Origem",cumul:"Mensal+Acumulado",plano:"Por Plano",pipeline:"Pipeline Status",
  race:"Top Vendedores",scatter:"Vendas×Faturamento",radar:"Radar",ranking:"Ranking Geral",mini0:"Ranking Rápido 1",mini1:"Ranking Rápido 2",vendorGoal:"Meta por Vendedor",
  funnel:"Funil de Vendas",pyramid:"Pirâmide",gauge:"Velocímetro",wave:"Onda de Vendas",crossComp:"Comparação Cruzada"};

function FullscreenConfig({config,setConfig,th}){
  const toggle=id=>{const s=new Set(config.panels);if(s.has(id))s.delete(id);else s.add(id);setConfig({...config,panels:[...s]});};
  return<div style={{background:th.card,borderRadius:16,padding:18,border:`1px solid ${th.border}`,marginBottom:10}}>
    <h3 style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:12,display:"flex",alignItems:"center",gap:6}}><Monitor size={14} color={th.primary}/> Modo Apresentação</h3>

    <div style={{marginBottom:12}}>
      <span style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:6}}>PAINÉIS VISÍVEIS</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {ALL_PANELS.map(id=>{const act=config.panels?.includes(id);return<button key={id} onClick={()=>toggle(id)}
          style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${act?th.primary+"66":th.border}`,background:act?th.primaryLight:th.bg,
            color:act?th.primary:th.textDim,fontSize:10,fontWeight:act?700:400,cursor:"pointer"}}>{PANEL_LABELS[id]||id}</button>;})}
      </div>
    </div>

    <div style={{marginBottom:12}}>
      <span style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:6}}>PAINEL PRINCIPAL (sempre retorna a este)</span>
      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
        {(config.panels||[]).map(id=>{const act=config.mainPanel===id;return<button key={id} onClick={()=>setConfig({...config,mainPanel:id})}
          style={{padding:"4px 10px",borderRadius:8,border:act?`2px solid ${th.primary}`:`1px solid ${th.border}`,background:act?th.primaryLight:th.bg,
            color:act?th.primary:th.textDim,fontSize:10,fontWeight:act?700:400,cursor:"pointer"}}>{PANEL_LABELS[id]||id}</button>;})}
      </div>
    </div>

    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <div style={{flex:"1 1 140px"}}>
        <span style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>ALTERNAR</span>
        <button onClick={()=>setConfig({...config,rotate:!config.rotate})} style={{padding:"5px 12px",borderRadius:8,width:"100%",
          border:`1px solid ${config.rotate?th.primary+"66":th.border}`,background:config.rotate?th.primaryLight:th.bg,
          color:config.rotate?th.primary:th.textMid,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
          <RotateCw size={12}/> {config.rotate?"Ligado":"Desligado"}</button>
      </div>
      <div style={{flex:"1 1 100px"}}>
        <span style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>TEMPO (seg)</span>
        <input type="number" value={config.rotateTime||10} onChange={e=>setConfig({...config,rotateTime:Number(e.target.value)||10})}
          style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${th.border}`,background:th.bg,color:th.text,fontSize:12,outline:"none",fontFamily:NUM,width:"100%"}}/>
      </div>
      <div style={{flex:"1 1 180px"}}>
        <span style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>SECUNDÁRIOS</span>
        <div style={{display:"flex",gap:3}}>
          {[["bottom","Baixo",ArrowDown],["top","Cima",ArrowUp],["left","Esq.",ArrowLeft],["right","Dir.",ArrowRight]].map(([v,l,I])=>
            <button key={v} onClick={()=>setConfig({...config,sidePos:v})} style={{flex:1,padding:"4px 6px",borderRadius:6,
              border:`1px solid ${config.sidePos===v?th.primary+"66":th.border}`,background:config.sidePos===v?th.primaryLight:th.bg,
              color:config.sidePos===v?th.primary:th.textDim,fontSize:9,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
              <I size={10}/>{l}</button>)}
        </div>
      </div>
    </div>
  </div>;
}

// ═══ THEME CUSTOMIZER ═══
function ThemeCustomizer({customColors,setCustomColors,th}){
  const colors=[["primary","Primária"],["teal","Secundária"],["success","Sucesso"],["danger","Perigo"],["warning","Alerta"]];
  return<div style={{background:th.card,borderRadius:16,padding:18,border:`1px solid ${th.border}`,marginBottom:10}}>
    <h3 style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:10,display:"flex",alignItems:"center",gap:6}}><Palette size={14} color={th.primary}/> Cores</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
      {colors.map(([k,l])=><div key={k} style={{display:"flex",alignItems:"center",gap:6}}>
        <input type="color" value={customColors?.[k]||th[k]} onChange={e=>setCustomColors({...customColors,[k]:e.target.value})}
          style={{width:28,height:28,borderRadius:6,border:`1px solid ${th.border}`,cursor:"pointer"}}/>
        <span style={{fontSize:10,color:th.textMid}}>{l}</span></div>)}
      <button onClick={()=>setCustomColors({})} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg,color:th.textDim,fontSize:10,cursor:"pointer"}}>Reset</button>
    </div>
  </div>;
}

// ═══ TOAST ═══

// ═══ PRESENTATION VIEW — Actual fullscreen renderer ═══
function PresentationView({panelMap,fsConfig,fsPrimary,th,onExit,teamName,tc}){
  const panels=fsConfig.panels||[];
  if(!panels.length)return<div style={{position:"fixed",inset:0,zIndex:200,background:"#000",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <div style={{textAlign:"center"}}><p style={{color:"#888",fontSize:20}}>Nenhum painel selecionado</p>
      <button onClick={onExit} style={{marginTop:20,padding:"12px 32px",borderRadius:12,border:"none",background:tc?.p||"#4F46E5",color:"#fff",cursor:"pointer",fontSize:16,fontWeight:700}}>Configurar</button></div></div>;

  const primaryId=panels[fsPrimary%panels.length];
  const secIds=panels.filter((_,i)=>i!==(fsPrimary%panels.length));
  const pos=fsConfig.sidePos||"bottom";
  const isH=pos==="top"||pos==="bottom";
  const flexDir=pos==="top"?"column-reverse":pos==="bottom"?"column":pos==="left"?"row-reverse":"row";
  const accent=tc?.p||th.primary;

  return<div style={{position:"fixed",inset:0,zIndex:200,background:"#050810",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:FONT}}>
    {/* Scoreboard header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 24px",background:"rgba(10,14,24,0.95)",borderBottom:`2px solid ${accent}33`,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:12,height:12,borderRadius:"50%",background:accent,boxShadow:`0 0 12px ${accent}`,animation:"pulse 2s ease-in-out infinite"}}/>
        <span style={{fontSize:20,fontWeight:800,color:"#fff",letterSpacing:"-0.5px"}}>{teamName}</span>
        <span style={{fontSize:11,color:accent,fontFamily:NUM,background:`${accent}15`,padding:"3px 10px",borderRadius:6,fontWeight:600}}>AO VIVO</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <LiveClock th={{...th,primary:accent,text:"#fff",textDim:"#555"}}/>
        <button onClick={onExit} style={{padding:"6px 16px",borderRadius:8,border:`1px solid #333`,background:"#111",cursor:"pointer",color:"#888",fontSize:11,fontWeight:600}}>✕ Sair</button>
      </div>
    </div>

    {/* Content */}
    <div style={{flex:1,display:"flex",flexDirection:flexDir,gap:6,padding:6,overflow:"hidden"}}>
      {/* PRIMARY — BILLBOARD */}
      <div key={primaryId} style={{flex:"1 1 0",minWidth:0,minHeight:0,background:"linear-gradient(180deg,#0a0e18,#0d1220)",borderRadius:16,padding:"clamp(16px,3vw,32px)",overflow:"auto",
        border:`2px solid ${accent}30`,boxShadow:`0 0 60px ${accent}10, inset 0 1px 0 ${accent}15`,
        display:"flex",flexDirection:"column",animation:"fadeUp .5s ease-out"}}>
        {/* Panel label */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:"clamp(12px,2vw,24px)"}}>
          <div style={{width:4,height:24,borderRadius:2,background:accent}}/>
          <span style={{fontSize:"clamp(14px,2vw,22px)",fontWeight:800,color:accent,textTransform:"uppercase",letterSpacing:2,fontFamily:NUM}}>
            {PANEL_LABELS[primaryId]||primaryId}</span>
        </div>
        {/* Panel content */}
        <div style={{flex:1,minHeight:0}}>
          {panelMap[primaryId]||<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#444",fontSize:18}}>Sem dados para este painel</div>}
        </div>
      </div>

      {/* SECONDARIES */}
      {secIds.length>0&&<div style={{flex:"0 0 auto",display:"flex",flexDirection:isH?"row":"column",gap:4,overflow:"auto",
        [isH?"height":"width"]:isH?"clamp(100px,15vh,160px)":"clamp(140px,18vw,220px)"}}>
        {secIds.map(id=><div key={id} style={{flex:"1 1 0",background:"#0a0e18",borderRadius:12,padding:8,overflow:"hidden",border:`1px solid #1a1f30`,position:"relative",minWidth:isH?140:0,minHeight:isH?0:70}}>
          <div style={{fontSize:9,fontWeight:700,color:accent,marginBottom:4,textTransform:"uppercase",letterSpacing:1,fontFamily:NUM}}>{PANEL_LABELS[id]||id}</div>
          <div style={{transform:isH?"scale(0.45)":"scale(0.5)",transformOrigin:"top left",width:isH?"222%":"200%",height:isH?"222%":"200%",pointerEvents:"none",filter:"brightness(0.8)"}}>{panelMap[id]}</div>
        </div>)}
      </div>}
    </div>

    {/* Bottom indicators */}
    {panels.length>1&&<div style={{display:"flex",justifyContent:"center",gap:6,padding:"8px 0",background:"rgba(5,8,16,0.95)"}}>
      {panels.map((id,i)=><div key={id} style={{width:i===(fsPrimary%panels.length)?40:8,height:4,borderRadius:2,
        background:i===(fsPrimary%panels.length)?accent:"#333",transition:"all .5s",boxShadow:i===(fsPrimary%panels.length)?`0 0 8px ${accent}60`:"none"}}/>)}
    </div>}
  </div>;
}

// ═══ TOAST (original) ═══
function Toast({items,th}){if(!items.length)return null;
  return<div style={{position:"fixed",top:16,right:16,zIndex:500,display:"flex",flexDirection:"column",gap:8}}>
    {items.slice(-3).map(n=><div key={n.id} style={{background:th.card,borderRadius:12,padding:"10px 14px",border:`1px solid ${th.border}`,borderLeft:`4px solid ${n.color}`,
      display:"flex",alignItems:"center",gap:10,minWidth:240,boxShadow:`0 8px 24px ${th.shadow}`,animation:"slideIn .3s ease-out"}}>
      <Bell size={15} color={n.color}/><div><div style={{fontSize:12,fontWeight:600,color:th.text}}>{n.title}</div><div style={{fontSize:11,color:th.textMid}}>{n.msg}</div></div></div>)}</div>;}

// ═══ CUSTOM CHARTS ═══

// Funnel Chart (SVG)
function FunnelChart({data,th,height=300}){
  if(!data?.length)return null;
  const max=Math.max(...data.map(d=>d.value))||1;
  const h=height;const stepH=Math.min(50,h/data.length);
  return<svg width="100%" height={h} viewBox={`0 0 500 ${h}`} style={{overflow:"visible"}}>
    {data.map((d,i)=>{const w=Math.max(60,(d.value/max)*460);const x=(500-w)/2;const y=i*stepH+4;
      return<g key={i}><rect x={x} y={y} width={w} height={stepH-6} rx={6} fill={PAL[i%8]} opacity={.85}/>
        <text x={250} y={y+stepH/2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={Math.min(13,stepH*.4)} fontWeight={700} fontFamily={NUM}>{d.name}</text>
        <text x={x+w+8} y={y+stepH/2} dominantBaseline="middle" fill={th.textMid} fontSize={10} fontFamily={NUM}>{fmtBRL(d.value)}</text></g>;})}</svg>;
}

// Pyramid Chart (inverted funnel)
function PyramidChart({data,th,height=300}){
  if(!data?.length)return null;
  const sorted=[...data].sort((a,b)=>a.value-b.value);
  const max=Math.max(...sorted.map(d=>d.value))||1;
  const h=height;const stepH=Math.min(50,h/sorted.length);
  return<svg width="100%" height={h} viewBox={`0 0 500 ${h}`} style={{overflow:"visible"}}>
    {sorted.map((d,i)=>{const w=Math.max(40,(d.value/max)*440);const x=(500-w)/2;const y=i*stepH+4;
      return<g key={i}><rect x={x} y={y} width={w} height={stepH-6} rx={4} fill={PAL[i%8]} opacity={.85}/>
        <text x={250} y={y+stepH/2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={Math.min(12,stepH*.38)} fontWeight={600} fontFamily={NUM}>{d.name} — {fmtBRL(d.value)}</text></g>;})}</svg>;
}

// Gauge / Spectrometer
function GaugeChart({value,max,label,color,th}){
  const pct=Math.min((value||0)/(max||1),1);const angle=-90+pct*180;
  const r=80;const cx=100;const cy=95;
  const toRad=a=>a*Math.PI/180;
  const arcPath=(start,end)=>{const s=toRad(start),e=toRad(end);
    return`M${cx+r*Math.cos(s)},${cy+r*Math.sin(s)} A${r},${r} 0 ${end-start>180?1:0} 1 ${cx+r*Math.cos(e)},${cy+r*Math.sin(e)}`;};
  return<svg width="100%" viewBox="0 0 200 120" style={{maxWidth:260}}>
    <path d={arcPath(-180,0)} fill="none" stroke={th.borderLight||"#ddd"} strokeWidth={16} strokeLinecap="round"/>
    <path d={arcPath(-180,-180+pct*180)} fill="none" stroke={color} strokeWidth={16} strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color}66)`}}/>
    <line x1={cx} y1={cy} x2={cx+55*Math.cos(toRad(angle))} y2={cy+55*Math.sin(toRad(angle))} stroke={th.text||"#333"} strokeWidth={2.5} strokeLinecap="round"/>
    <circle cx={cx} cy={cy} r={4} fill={th.text||"#333"}/>
    <text x={cx} y={cy+22} textAnchor="middle" fill={color} fontSize={20} fontWeight={800} fontFamily={NUM}>{(pct*100).toFixed(0)}%</text>
    <text x={cx} y={cy+36} textAnchor="middle" fill={th.textMid||"#888"} fontSize={9}>{label}</text>
    <text x={20} y={105} fill={th.textDim||"#aaa"} fontSize={8}>0</text>
    <text x={175} y={105} fill={th.textDim||"#aaa"} fontSize={8} textAnchor="end">{fmtBRL(max)}</text></svg>;
}

// Wave Chart (smooth area)
function WaveChart({data,color,th,height=200}){
  if(!data?.length)return null;
  return<ResponsiveContainer width="100%" height={height}><AreaChart data={data}>
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={.35}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
    <XAxis dataKey="name" tick={{fill:th.textMid,fontSize:9,fontFamily:NUM}} axisLine={false} tickLine={false}/>
    <YAxis hide/><Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontSize:12,fontFamily:NUM}} formatter={v=>[fmtBRL(v),"Valor"]}/>
    <Area type="natural" dataKey="valor" stroke={color} strokeWidth={3} fill="url(#wg)" dot={false}/></AreaChart></ResponsiveContainer>;
}

// Cross-Comparison (grouped bar)
function CrossCompChart({data,keys,th,height=250}){
  if(!data?.length)return null;
  return<ResponsiveContainer width="100%" height={height}><BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis dataKey="name" tick={{fill:th.textMid,fontSize:9,fontFamily:NUM}}/>
    <YAxis tick={{fill:th.textMid,fontSize:9,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontSize:12,fontFamily:NUM}} formatter={v=>[fmtBRL(v)]}/>
    {(keys||[]).map((k,i)=><Bar key={k} dataKey={k} fill={PAL[i%8]} radius={[4,4,0,0]} barSize={16}/>)}
    <Legend wrapperStyle={{fontSize:10,fontFamily:NUM}}/></BarChart></ResponsiveContainer>;
}

// ═══ TV NEWS TICKER ═══
function NewsTicker({items,th,tc}){
  if(!items?.length)return null;
  const text=items.join("     •     ");
  return<div style={{background:"#0a0e18",borderTop:`2px solid ${tc?.p||th.primary}44`,padding:"6px 0",overflow:"hidden",position:"relative"}}>
    <div style={{display:"flex",alignItems:"center",gap:12,paddingLeft:12,position:"absolute",left:0,top:0,bottom:0,zIndex:1,background:"linear-gradient(90deg,#0a0e18 80%,transparent)"}}>
      <div style={{background:tc?.p||th.primary,borderRadius:4,padding:"2px 8px",fontSize:10,fontWeight:700,color:"#fff",fontFamily:NUM,whiteSpace:"nowrap"}}>PROPOSTAS DO MÊS</div>
    </div>
    <div style={{animation:`ticker ${Math.max(20,items.length*4)}s linear infinite`,whiteSpace:"nowrap",paddingLeft:200}}>
      <span style={{color:"#E8ECF4",fontSize:13,fontWeight:500,fontFamily:NUM,letterSpacing:".3px"}}>{text}     •     {text}</span>
    </div>
  </div>;
}

// ═══ VENDOR GOALS EDITOR ═══
// ═══ CHART TYPES — universal renderers ═══
const CHART_TYPES=["area","bar","barH","pie","funnel","pyramid","gauge","wave","radar","scatter","composed"];
const CHART_TYPE_LABELS={area:"Linha/Área",bar:"Barras",barH:"Barras Horiz.",pie:"Pizza/Donut",funnel:"Funil",pyramid:"Pirâmide",gauge:"Velocímetro",wave:"Onda",radar:"Radar",scatter:"Dispersão",composed:"Composto"};

function UniversalChart({type,data,color,th,height=220,keys}){
  if(!data?.length)return<p style={{color:th.textDim,textAlign:"center",padding:20,fontSize:12}}>Sem dados</p>;
  const dk=keys?.[0]||"valor";const nk="name";
  const common={background:th.card,border:`1px solid ${th.border}`,borderRadius:10};
  const tipStyle={background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontSize:12,fontFamily:NUM};
  const axTick={fill:th.textMid,fontSize:9,fontFamily:NUM};
  const axLine={stroke:th.borderLight};
  const grid=<CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/>;

  if(type==="area")return<ResponsiveContainer width="100%" height={height}><AreaChart data={data}>
    <defs><linearGradient id="ug" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={.25}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
    {grid}<XAxis dataKey={nk} tick={axTick} axisLine={axLine}/><YAxis tick={axTick} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <Tooltip contentStyle={tipStyle} formatter={v=>[fmtBRL(v),"Valor"]}/><Area type="monotone" dataKey={dk} stroke={color} strokeWidth={2.5} fill="url(#ug)" dot={{fill:color,r:3}}/></AreaChart></ResponsiveContainer>;

  if(type==="bar")return<ResponsiveContainer width="100%" height={height}><BarChart data={data}>
    {grid}<XAxis dataKey={nk} tick={axTick} axisLine={axLine}/><YAxis tick={axTick} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <Tooltip contentStyle={tipStyle} formatter={v=>[fmtBRL(v),"Valor"]}/>
    {keys&&keys.length>1?keys.map((k,i)=><Bar key={k} dataKey={k} fill={PAL[i%8]} radius={[4,4,0,0]} barSize={16}/>)
      :<Bar dataKey={dk} radius={[4,4,0,0]}>{data.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Bar>}
    {keys&&keys.length>1&&<Legend wrapperStyle={{fontSize:10,fontFamily:NUM}}/>}</BarChart></ResponsiveContainer>;

  if(type==="barH")return<ResponsiveContainer width="100%" height={Math.max(height,data.length*30)}><BarChart data={data} layout="vertical">
    {grid}<XAxis type="number" tick={axTick} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <YAxis type="category" dataKey={nk} tick={{...axTick,fontSize:9}} width={95} axisLine={axLine}/>
    <Tooltip contentStyle={tipStyle} formatter={v=>[fmtBRL(v),"Valor"]}/><Bar dataKey={dk} radius={[0,6,6,0]}>{data.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Bar></BarChart></ResponsiveContainer>;

  if(type==="pie")return<ResponsiveContainer width="100%" height={height}><PieChart><Pie data={data} cx="50%" cy="50%" innerRadius={height*.18} outerRadius={height*.35} paddingAngle={3} dataKey={data[0]?.value!=null?"value":dk}
    label={({name,percent})=>percent>.04?`${name} ${(percent*100).toFixed(0)}%`:""} labelLine={{stroke:th.textDim}}>{data.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Pie>
    <Tooltip contentStyle={tipStyle}/></PieChart></ResponsiveContainer>;

  if(type==="funnel")return<FunnelChart data={data} th={th} height={Math.max(height,data.length*45)}/>;
  if(type==="pyramid")return<PyramidChart data={data} th={th} height={Math.max(height,data.length*45)}/>;

  if(type==="gauge"&&data.length)return<div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
    {data.slice(0,8).map((d,i)=><GaugeChart key={i} value={d.valor||d.value||0} max={d.meta||Math.max(...data.map(x=>x.valor||x.value||0))} label={d.name} color={PAL[i%8]} th={th}/>)}</div>;

  if(type==="wave")return<WaveChart data={data} color={color} th={th} height={height}/>;

  if(type==="scatter"&&data.length>1)return<ResponsiveContainer width="100%" height={height}><ScatterChart>
    {grid}<XAxis dataKey="x" tick={axTick} axisLine={axLine}/><YAxis dataKey="y" tick={axTick} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <Tooltip contentStyle={tipStyle}/><Scatter data={data} fill={color}>{data.map((d,i)=><Cell key={i} fill={d.fill||PAL[i%8]}/>)}</Scatter></ScatterChart></ResponsiveContainer>;

  if(type==="radar"&&data.length)return<ResponsiveContainer width="100%" height={height}><RadarChart data={data}>
    <PolarGrid stroke={th.borderLight}/><PolarAngleAxis dataKey="dim" tick={{fill:th.textMid,fontSize:9}}/>
    <PolarRadiusAxis tick={{fill:th.textDim,fontSize:8}} domain={[0,100]}/>
    {(keys||[]).map((k,i)=><Radar key={k} name={k} dataKey={k} stroke={PAL[i%8]} fill={PAL[i%8]} fillOpacity={.15} strokeWidth={2}/>)}
    <Legend wrapperStyle={{fontSize:10,fontFamily:NUM}}/></RadarChart></ResponsiveContainer>;

  if(type==="composed")return<ResponsiveContainer width="100%" height={height}><ComposedChart data={data}>
    {grid}<XAxis dataKey={nk} tick={axTick} axisLine={axLine}/>
    <YAxis yAxisId="left" tick={axTick} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <YAxis yAxisId="right" orientation="right" tick={{...axTick,fill:PAL[4]}} axisLine={axLine} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
    <Tooltip contentStyle={tipStyle} formatter={v=>[fmtBRL(v)]}/>
    <Bar yAxisId="left" dataKey={dk} fill={color} radius={[4,4,0,0]} opacity={.7}/>
    {data[0]?.acumulado!=null&&<Line yAxisId="right" type="monotone" dataKey="acumulado" stroke={PAL[4]} strokeWidth={2.5} dot={{r:3}}/>}
    <Legend wrapperStyle={{fontSize:10,fontFamily:NUM}}/></ComposedChart></ResponsiveContainer>;

  return<p style={{color:th.textDim,textAlign:"center",padding:20}}>Tipo não suportado</p>;
}

// ═══ SMART CHART BOX (with type selector) ═══
function SmartChartBox({id,title,icon:Icon,color,data,allData,columns,defaultType,focused,onFocus,th,chartH,keys,children}){
  const[chartType,setChartType]=useState(defaultType||"area");
  const[metricCol,setMetricCol]=useState("");
  const[proportion,setProportion]=useState("SUM");
  const[filters,setFilters]=useState([]);
  const[showCfg,setShowCfg]=useState(false);
  const isFocused=focused===id;const isOther=focused&&!isFocused;
  const h=isFocused?400:chartH||220;

  // Apply local filters to allData if provided, else use data
  const localData=useMemo(()=>{
    if(!allData||!filters.length)return data;
    let rows=[...allData];
    filters.forEach(f=>{if(!f.col||!f.val)return;
      rows=rows.filter(r=>String(r[f.col]||"").trim().toUpperCase()===f.val.toUpperCase());});
    if(!metricCol)return data;// no metric override
    // Rebuild chart data from filtered rows
    const groupCol=columns?.find(c=>c!==metricCol&&rows.some(r=>r[c]))||"";
    if(!groupCol)return data;
    const g={};rows.forEach(r=>{const k=String(r[groupCol]||"").trim();if(!k||k==="-")return;
      if(!g[k])g[k]=0;
      if(proportion==="COUNT")g[k]+=1;
      else if(proportion==="AVG"){g[k]={s:(g[k]?.s||0)+parseBRL(r[metricCol]),c:(g[k]?.c||0)+1};}
      else g[k]+=parseBRL(r[metricCol]);});
    if(proportion==="AVG")return Object.entries(g).sort((a,b)=>(b[1].s/b[1].c)-(a[1].s/a[1].c)).slice(0,15).map(([name,d])=>({name,valor:d.s/d.c}));
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([name,valor])=>({name,valor,value:valor}));
  },[data,allData,filters,metricCol,proportion,columns]);

  const addFilter=()=>setFilters([...filters,{col:"",val:""}]);
  const updFilter=(i,k,v)=>{const f=[...filters];f[i]={...f[i],[k]:v};setFilters(f);};
  const rmFilter=i=>setFilters(filters.filter((_,j)=>j!==i));
  const filterVals=(col)=>{if(!allData||!col)return[];return[...new Set(allData.map(r=>String(r[col]||"").trim()).filter(Boolean))].sort();};
  const numCols=columns?.filter(c=>{const v=(allData||[]).slice(0,30).map(r=>r[c]).filter(Boolean);return v.filter(x=>!isNaN(Number(x))||String(x).match(/\d/)).length>v.length*.3;})||[];

  const sel={padding:"3px 6px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg,color:th.textMid,fontSize:9,outline:"none",cursor:"pointer",fontFamily:NUM};

  return<div onClick={e=>{e.stopPropagation();onFocus(isFocused?null:id)}} style={{
    flex:isOther?"0 0 80px":isFocused?"1 1 100%":"1 1 45%",
    minWidth:isOther?80:isFocused?"100%":280,maxHeight:isOther?80:"none",width:isFocused?"100%":"auto",
    background:th.card,borderRadius:isFocused?20:16,padding:isOther?8:isFocused?24:18,
    border:`1px solid ${isFocused?color+"88":th.border}`,overflow:"hidden",cursor:"pointer",
    transition:"all .6s cubic-bezier(.16,1,.3,1)",boxShadow:isFocused?`0 8px 40px ${color}30`:"none",
    opacity:isOther?.4:1,order:isFocused?-1:0}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:isOther?2:isFocused?16:12,flexWrap:"wrap"}}>
      <Icon size={isOther?10:isFocused?18:14} color={color}/>
      <span style={{fontSize:isOther?9:isFocused?16:13,fontWeight:isFocused?700:600,color:th.text}}>{title}</span>
      {!isOther&&<div style={{marginLeft:"auto",display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
        {/* Labeled selectors */}
        <div style={{display:"flex",alignItems:"center",gap:2}}>
          <span style={{fontSize:8,color:th.textDim,fontWeight:600}}>Tipo</span>
          <select value={chartType} onChange={e=>setChartType(e.target.value)} style={sel}>
            {CHART_TYPES.map(t=><option key={t} value={t}>{CHART_TYPE_LABELS[t]}</option>)}</select></div>
        {allData&&<button onClick={()=>setShowCfg(!showCfg)} style={{padding:"2px 6px",borderRadius:5,border:`1px solid ${showCfg?color+"66":th.border}`,background:showCfg?`${color}12`:th.bg,color:showCfg?color:th.textDim,fontSize:8,cursor:"pointer",fontWeight:600}}>
          Filtros {filters.length>0?`(${filters.length})`:""}</button>}
      </div>}
    </div>
    {/* Filter config panel */}
    {!isOther&&showCfg&&allData&&<div style={{marginBottom:12,padding:10,borderRadius:10,background:th.bg,border:`1px solid ${th.borderLight}`}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <span style={{fontSize:8,color:th.textDim,fontWeight:600}}>Métrica</span>
          <select value={metricCol} onChange={e=>setMetricCol(e.target.value)} style={sel}>
            <option value="">Padrão</option>{numCols.map(c=><option key={c} value={c}>{c.replace(/:/g,"")}</option>)}</select></div>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <span style={{fontSize:8,color:th.textDim,fontWeight:600}}>Proporção</span>
          <select value={proportion} onChange={e=>setProportion(e.target.value)} style={sel}>
            <option value="SUM">Soma (R$)</option><option value="COUNT">Contagem</option><option value="AVG">Média</option></select></div>
        <button onClick={addFilter} style={{padding:"2px 8px",borderRadius:5,border:`1px solid ${color}44`,background:`${color}08`,color,fontSize:9,cursor:"pointer",fontWeight:600}}>+ Filtro</button>
      </div>
      {filters.map((f,i)=><div key={i} style={{display:"flex",gap:4,alignItems:"center",marginBottom:4}}>
        <select value={f.col} onChange={e=>updFilter(i,"col",e.target.value)} style={{...sel,flex:1}}>
          <option value="">Coluna</option>{columns?.map(c=><option key={c} value={c}>{c.replace(/:/g,"")}</option>)}</select>
        <span style={{fontSize:9,color:th.textDim}}>=</span>
        <select value={f.val} onChange={e=>updFilter(i,"val",e.target.value)} style={{...sel,flex:1}}>
          <option value="">Valor</option>{filterVals(f.col).map(v=><option key={v} value={v}>{v}</option>)}</select>
        <button onClick={()=>rmFilter(i)} style={{background:"transparent",border:"none",cursor:"pointer",color:th.danger,fontSize:10}}>✕</button>
      </div>)}
    </div>}
    {!isOther&&(localData?<UniversalChart type={chartType} data={localData} color={color} th={th} height={h} keys={keys}/>:children)}
  </div>;
}

// ═══ MONTHLY GOALS WIZARD ═══
function GoalsWizard({data,columns,vendorGoals,setVendorGoals,goals,setGoals,th}){
  const[open,setOpen]=useState(false);
  const[step,setStep]=useState(0);
  const[paramCol,setParamCol]=useState("");
  const[selected,setSelected]=useState(()=>Object.keys(vendorGoals||{}).filter(v=>vendorGoals[v]>0));

  const uniqueVals=useMemo(()=>{
    if(!paramCol||!data?.length)return[];
    return[...new Set(data.map(r=>String(r[paramCol]||"").trim()).filter(v=>v&&v!=="-"))].sort();
  },[data,paramCol]);

  // Auto-detect vendor column
  useEffect(()=>{if(!paramCol&&columns?.length){const vc=columns.find(c=>c.toUpperCase().includes("VENDEDOR"));if(vc)setParamCol(vc);}},[columns,paramCol]);
  // Pre-load selected from vendorGoals
  useEffect(()=>{const k=Object.keys(vendorGoals||{}).filter(v=>vendorGoals[v]>0);if(k.length&&!selected.length)setSelected(k);},[vendorGoals]);

  const toggleSel=v=>setSelected(prev=>prev.includes(v)?prev.filter(x=>x!==v):[...prev,v]);
  const inp={padding:"7px 10px",borderRadius:8,border:`1px solid ${th.border}`,background:th.inputBg,color:th.text,fontSize:12,outline:"none",fontFamily:NUM,width:"100%"};
  const now=new Date();const mesAtual=now.toLocaleDateString("pt-BR",{month:"long",year:"numeric"});

  if(!open)return<button onClick={()=>setOpen(true)} style={{padding:"8px 16px",borderRadius:10,border:`1px solid ${th.primary}44`,background:th.card,cursor:"pointer",color:th.primary,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
    <Crosshair size={14}/> Metas Mensais ({Object.keys(vendorGoals||{}).filter(v=>vendorGoals[v]>0).length} vendedores)</button>;

  return<div style={{background:th.card,borderRadius:16,padding:20,border:`2px solid ${th.primary}33`,marginBottom:12,flex:"1 1 100%"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <h3 style={{fontSize:15,fontWeight:700,color:th.text,display:"flex",alignItems:"center",gap:8}}><Crosshair size={16} color={th.primary}/> Metas Mensais</h3>
      <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:th.textDim}}><X size={16}/></button></div>
    <p style={{fontSize:11,color:th.primary,fontWeight:600,marginBottom:14,background:th.primaryLight,padding:"4px 10px",borderRadius:6,display:"inline-block"}}>
      Período: {mesAtual} (contabilizado automaticamente)</p>

    {/* Steps */}
    <div style={{display:"flex",gap:4,marginBottom:16}}>
      {["Coluna dos vendedores","Selecionar vendedores","Definir metas individuais"].map((s,i)=><div key={i} onClick={()=>i<=step&&setStep(i)} style={{flex:1,padding:"6px 0",borderRadius:8,textAlign:"center",
        background:i===step?th.primaryLight:i<step?`${th.success}14`:th.bg,color:i===step?th.primary:i<step?th.success:th.textDim,
        fontSize:10,fontWeight:i===step?700:500,cursor:i<=step?"pointer":"default",border:`1px solid ${i===step?th.primary+"44":th.borderLight}`}}>
        {i+1}. {s}</div>)}
    </div>

    {step===0&&<div>
      <p style={{fontSize:12,color:th.textMid,marginBottom:10}}>Selecione a coluna que identifica os vendedores:</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {columns.filter(c=>c.trim()).map(c=>{const act=paramCol===c;
          return<button key={c} onClick={()=>{setParamCol(c);setStep(1)}} style={{padding:"6px 12px",borderRadius:8,
            border:act?`2px solid ${th.primary}`:`1px solid ${th.border}`,background:act?th.primaryLight:th.bg,
            color:act?th.primary:th.textMid,fontSize:11,fontWeight:act?700:400,cursor:"pointer"}}>{c.replace(/:/g,"")}</button>;})}
      </div>
      <div style={{marginTop:16,padding:12,borderRadius:10,background:th.bg,border:`1px solid ${th.borderLight}`}}>
        <label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>Meta global da equipe (R$):</label>
        <input type="number" value={goals.teamGoal||""} onChange={e=>setGoals({...goals,teamGoal:Number(e.target.value)})} placeholder="R$ Meta mensal da equipe" style={inp}/>
      </div>
    </div>}

    {step===1&&<div>
      <p style={{fontSize:12,color:th.textMid,marginBottom:10}}>Selecione os vendedores que terão metas definidas:</p>
      <div style={{display:"flex",gap:4,marginBottom:10}}>
        <button onClick={()=>setSelected(uniqueVals)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.primary}44`,background:th.primaryLight,color:th.primary,fontSize:10,cursor:"pointer",fontWeight:600}}>Todos</button>
        <button onClick={()=>setSelected([])} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${th.border}`,background:th.bg,color:th.textDim,fontSize:10,cursor:"pointer"}}>Limpar</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,maxHeight:220,overflowY:"auto"}}>
        {uniqueVals.map(v=>{const act=selected.includes(v);
          return<button key={v} onClick={()=>toggleSel(v)} style={{padding:"5px 12px",borderRadius:8,
            border:act?`2px solid ${th.primary}`:`1px solid ${th.border}`,background:act?th.primaryLight:th.bg,
            color:act?th.primary:th.textMid,fontSize:11,fontWeight:act?600:400,cursor:"pointer"}}>{v}</button>;})}
      </div>
      {selected.length>0&&<button onClick={()=>setStep(2)} style={{marginTop:12,padding:"8px 20px",borderRadius:8,background:th.primary,border:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
        Próximo → Definir metas ({selected.length} vendedores)</button>}
    </div>}

    {step===2&&<div>
      <p style={{fontSize:12,color:th.textMid,marginBottom:10}}>Meta mensal individual por vendedor — quem não tiver venda neste mês aparece em <strong style={{color:th.danger}}>0%</strong>:</p>
      <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:320,overflowY:"auto"}}>
        {selected.map(v=><div key={v} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,border:`1px solid ${th.borderLight}`,background:th.bg}}>
          <span style={{fontSize:13,fontWeight:600,color:th.text,flex:1,minWidth:120}}>{v}</span>
          <span style={{fontSize:10,color:th.textDim,fontFamily:NUM}}>R$</span>
          <input type="number" value={vendorGoals?.[v]||""} onChange={e=>setVendorGoals({...vendorGoals,[v]:Number(e.target.value)||0})}
            placeholder="Meta mensal" style={{...inp,width:130,textAlign:"right"}}/>
          {vendorGoals?.[v]>0&&<span style={{fontSize:11,color:th.success,fontWeight:700}}>✓</span>}
        </div>)}
      </div>
      <div style={{marginTop:12,padding:10,borderRadius:8,background:`${th.warning}08`,border:`1px solid ${th.warning}22`}}>
        <label style={{fontSize:10,color:th.warning,fontWeight:600,display:"block",marginBottom:4}}>Meta padrão (vendedores sem meta específica):</label>
        <input type="number" value={goals.individualGoal||""} onChange={e=>setGoals({...goals,individualGoal:Number(e.target.value)})}
          placeholder="R$ Padrão mensal" style={{...inp,marginTop:4}}/>
      </div>
      <button onClick={()=>setOpen(false)} style={{marginTop:16,width:"100%",padding:"12px 0",borderRadius:10,border:"none",
        background:`linear-gradient(135deg,${th.primary},${th.teal})`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:FONT,
        display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
        <Save size={16}/> Salvar Metas ({selected.filter(v=>vendorGoals?.[v]>0).length}/{selected.length} definidas)
      </button>
    </div>}
  </div>;
}

function VendorGoalsEditor({vendorGoals,setVendorGoals,ranking,th}){
  const[open,setOpen]=useState(false);
  if(!open)return<button onClick={()=>setOpen(true)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${th.border}`,background:th.card,cursor:"pointer",color:th.textMid,fontSize:11,fontWeight:500,display:"flex",alignItems:"center",gap:5}}>
    <Crosshair size={12}/> Metas rápidas</button>;
  return<div style={{background:th.card,borderRadius:16,padding:18,border:`1px solid ${th.border}`,marginBottom:10}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <h3 style={{fontSize:13,fontWeight:600,color:th.text,display:"flex",alignItems:"center",gap:6}}><Crosshair size={14} color={th.primary}/> Metas Rápidas</h3>
      <button onClick={()=>setOpen(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:th.textDim}}><X size={14}/></button></div>
    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
      {(ranking||[]).map(r=><div key={r.name} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderRadius:8,border:`1px solid ${th.border}`,background:th.bg}}>
        <span style={{fontSize:11,fontWeight:500,color:th.text,minWidth:80}}>{r.name.split(" ").slice(0,2).join(" ")}</span>
        <input type="number" value={vendorGoals?.[r.name]||""} placeholder="Meta R$" onChange={e=>setVendorGoals({...vendorGoals,[r.name]:Number(e.target.value)||0})}
          style={{width:90,padding:"4px 6px",borderRadius:6,border:`1px solid ${th.border}`,background:th.inputBg,color:th.text,fontSize:11,outline:"none",fontFamily:NUM}}/>
      </div>)}
    </div></div>;
}

// ═══ DATE COLUMN SELECTOR ═══
function DateColSelector({dateCols,selected,onChange,th}){
  if(!dateCols?.length)return null;
  return<div style={{display:"flex",gap:3,alignItems:"center"}}>
    <Clock size={10} color={th.textDim}/>
    <select value={selected||""} onChange={e=>onChange(e.target.value)}
      style={{padding:"3px 6px",borderRadius:6,border:`1px solid ${th.border}`,background:th.card,color:th.textMid,fontSize:9,outline:"none",cursor:"pointer",fontFamily:NUM}}>
      {dateCols.map(c=><option key={c} value={c}>{c.replace(/:/g,"")}</option>)}
    </select>
  </div>;
}

// ═══ METRIC BUILDER (compact) ═══
function MetricBuilder({metrics,setMetrics,columns,th}){
  const[open,setOpen]=useState(null);
  const inp={padding:"7px 10px",borderRadius:8,border:`1px solid ${th.border}`,background:th.inputBg,color:th.text,fontSize:12,outline:"none",fontFamily:FONT,width:"100%",boxSizing:"border-box"};
  const sel={...inp,cursor:"pointer"};const upd=(id,u)=>setMetrics(metrics.map(m=>m.id===id?{...m,...u}:m));
  return<div style={{marginBottom:20}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
      <h2 style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:8,color:th.text}}><Calculator size={15} color={th.primary}/> Métricas</h2>
      <button onClick={()=>{const id=`c${Date.now()}`;setMetrics([...metrics,{id,name:"Nova",format:"currency",color:PAL[metrics.length%8],icon:"dollar",
        rules:[{column:columns.find(c=>c.includes("VALOR"))||columns[0],operation:"SUM",conditions:[]}]}]);setOpen(id);}}
        style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,background:th.primary,border:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>
        <Plus size={13}/> Nova</button></div>
    {metrics.map(m=>{const isO=open===m.id;return<div key={m.id} style={{background:th.card,borderRadius:12,border:`1px solid ${th.border}`,marginBottom:6,borderLeft:`3px solid ${m.color}`,overflow:"hidden"}}>
      <div onClick={()=>setOpen(isO?null:m.id)} style={{padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}><span style={{width:8,height:8,borderRadius:"50%",background:m.color,flexShrink:0}}/>
          <span style={{fontSize:13,fontWeight:600,color:th.text}}>{m.name}</span></div>
        <div style={{display:"flex",gap:6,flexShrink:0}}><button onClick={e=>{e.stopPropagation();setMetrics(metrics.filter(x=>x.id!==m.id))}} style={{background:"transparent",border:"none",cursor:"pointer",color:th.textDim}}><Trash2 size={12}/></button>
          <ChevronDown size={13} color={th.textMid} style={{transform:isO?"rotate(180deg)":"none",transition:".2s"}}/></div></div>
      {isO&&<div style={{padding:"0 14px 14px",borderTop:`1px solid ${th.borderLight}`}}>
        <div style={{display:"flex",gap:8,marginTop:10,marginBottom:10,flexWrap:"wrap"}}>
          <div style={{flex:"2 1 150px"}}><label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>NOME</label>
            <input value={m.name} onChange={e=>upd(m.id,{name:e.target.value})} style={inp}/></div>
          <div style={{flex:"1 1 100px"}}><label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>FORMATO</label>
            <select value={m.format} onChange={e=>upd(m.id,{format:e.target.value})} style={sel}><option value="currency">R$</option><option value="number">Nº</option></select></div>
          <div style={{flex:"0 0 50px"}}><label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>COR</label>
            <input type="color" value={m.color} onChange={e=>upd(m.id,{color:e.target.value})} style={{width:"100%",height:33,borderRadius:8,border:`1px solid ${th.border}`,cursor:"pointer"}}/></div></div>
        {m.rules?.map((rule,ri)=><div key={ri} style={{background:th.bg,borderRadius:10,padding:10,marginBottom:6,border:`1px solid ${th.borderLight}`}}>
          {ri>0&&<div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}><span style={{fontSize:10,color:th.textMid,fontWeight:600}}>OP:</span>
            <select value={rule.combineOp||"+"} onChange={e=>{const rs=[...m.rules];rs[ri]={...rs[ri],combineOp:e.target.value};upd(m.id,{rules:rs})}} style={{...sel,width:100}}>
              <option value="+">+ Somar</option><option value="-">− Subtrair</option><option value="*">×</option><option value="/">÷</option></select></div>}
          <div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>
            <select value={rule.operation} onChange={e=>{const rs=[...m.rules];rs[ri]={...rs[ri],operation:e.target.value};upd(m.id,{rules:rs})}} style={{...sel,flex:"1 1 100px"}}>
              <option value="SUM">SOMA</option><option value="COUNT">CONTAGEM</option><option value="AVG">MÉDIA</option></select>
            <select value={rule.column} onChange={e=>{const rs=[...m.rules];rs[ri]={...rs[ri],column:e.target.value};upd(m.id,{rules:rs})}} style={{...sel,flex:"2 1 150px"}}>
              {columns.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          {(rule.conditions||[]).map((co,ci)=><div key={ci} style={{display:"flex",gap:4,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
            {ci>0&&<select value={co.logic||"AND"} onChange={e=>{const rs=[...m.rules],cs=[...rs[ri].conditions];cs[ci]={...cs[ci],logic:e.target.value};rs[ri]={...rs[ri],conditions:cs};upd(m.id,{rules:rs})}}
              style={{...sel,flex:"0 0 55px",fontSize:10}}><option value="AND">E</option><option value="OR">OU</option></select>}
            <select value={co.column} onChange={e=>{const rs=[...m.rules],cs=[...rs[ri].conditions];cs[ci]={...cs[ci],column:e.target.value};rs[ri]={...rs[ri],conditions:cs};upd(m.id,{rules:rs})}}
              style={{...sel,flex:"2 1 120px"}}>{columns.map(c=><option key={c} value={c}>{c}</option>)}</select>
            <select value={co.operator} onChange={e=>{const rs=[...m.rules],cs=[...rs[ri].conditions];cs[ci]={...cs[ci],operator:e.target.value};rs[ri]={...rs[ri],conditions:cs};upd(m.id,{rules:rs})}}
              style={{...sel,flex:"1 1 75px",fontSize:10}}><option value="=">=</option><option value="!=">≠</option><option value="contains">Contém</option><option value="not_contains">!Contém</option></select>
            <input value={co.value} onChange={e=>{const rs=[...m.rules],cs=[...rs[ri].conditions];cs[ci]={...cs[ci],value:e.target.value};rs[ri]={...rs[ri],conditions:cs};upd(m.id,{rules:rs})}}
              placeholder="Valor" style={{...inp,flex:"2 1 100px"}}/>
            <button onClick={()=>{const rs=[...m.rules];rs[ri]={...rs[ri],conditions:rs[ri].conditions.filter((_,j)=>j!==ci)};upd(m.id,{rules:rs})}}
              style={{background:"transparent",border:"none",cursor:"pointer",color:th.danger,flexShrink:0}}><X size={12}/></button></div>)}
          <button onClick={()=>{const rs=[...m.rules];rs[ri]={...rs[ri],conditions:[...(rs[ri].conditions||[]),{column:"STATUS:",operator:"=",value:"",logic:"AND"}]};upd(m.id,{rules:rs})}}
            style={{background:th.primaryLight,border:`1px solid ${th.primary}22`,borderRadius:6,padding:"3px 10px",cursor:"pointer",color:th.primary,fontSize:10,fontWeight:600,marginTop:4}}>+ Condição</button>
        </div>)}
        <button onClick={()=>upd(m.id,{rules:[...m.rules,{column:columns.find(c=>c.includes("VALOR"))||columns[0],operation:"SUM",combineOp:"-",conditions:[]}]})}
          style={{width:"100%",padding:"7px 0",borderRadius:8,border:`1px dashed ${th.border}`,background:"transparent",color:th.textMid,fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          <Plus size={11}/> Operação</button></div>}
    </div>;})}
  </div>;
}

// ═══ SETUP ═══
function Setup({teams,setTeams,goals,setGoals,metrics,setMetrics,columns,onStart,loading,celebDur,setCelebDur,th,savedViews,onLoadView,onSaveView,refreshSec,setRefreshSec}){
  const inp={width:"100%",padding:"9px 12px",borderRadius:10,border:`1px solid ${th.border}`,background:th.inputBg,color:th.text,fontSize:13,outline:"none",fontFamily:FONT,boxSizing:"border-box"};
  const ok=teams.length>0&&teams.every(t=>t.name&&t.url);
  return<div style={{minHeight:"100vh",background:th.bg,display:"flex",justifyContent:"center",padding:"32px 16px",fontFamily:FONT}}>
    <div style={{width:"100%",maxWidth:700,animation:"fadeUp .5s ease-out"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:64,height:64,borderRadius:16,background:`linear-gradient(135deg,${th.primary},${th.teal})`,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <Layers size={28} color="#fff"/></div>
        <h1 style={{fontSize:24,fontWeight:700,color:th.text,marginBottom:4}}>Mission Control</h1>
        <p style={{color:th.textMid,fontSize:14}}>Configure equipes, métricas e fórmulas</p></div>
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <h2 style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:8,color:th.text}}><Users size={15} color={th.primary}/> Equipes</h2>
          <button onClick={()=>teams.length<6&&setTeams([...teams,{name:`Equipe ${teams.length+1}`,url:""}])} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 14px",borderRadius:8,background:th.primary,border:"none",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}><Plus size={13}/> Equipe</button></div>
        {teams.map((t,i)=>{const c=TCS[i%6];return<div key={i} style={{background:th.card,borderRadius:12,border:`1px solid ${th.border}`,padding:14,marginBottom:6,borderLeft:`3px solid ${c.p}`}}>
          <div style={{display:"flex",gap:8,marginBottom:6}}>
            <div style={{flex:1}}><label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:3}}>NOME</label>
              <input value={t.name} onChange={e=>{const ts=[...teams];ts[i]={...ts[i],name:e.target.value};setTeams(ts)}} style={inp}/></div>
            <button onClick={()=>setTeams(teams.filter((_,j)=>j!==i))} style={{alignSelf:"flex-end",padding:7,borderRadius:8,border:`1px solid ${th.border}`,background:"transparent",cursor:"pointer",color:th.textDim}}><Trash2 size={13}/></button></div>
          <label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:3}}>URL GOOGLE SHEETS</label>
          <input value={t.url} onChange={e=>{const ts=[...teams];ts[i]={...ts[i],url:e.target.value};setTeams(ts)}} placeholder="https://docs.google.com/spreadsheets/d/..." style={{...inp,fontFamily:NUM,fontSize:11}}/>
          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:6}}>
            <Link2 size={12} color={th.textDim}/>
            <input value={t.webhook||""} onChange={e=>{const ts=[...teams];ts[i]={...ts[i],webhook:e.target.value};setTeams(ts)}} placeholder="Webhook URL (opcional — fonte alternativa de dados)"
              style={{...inp,fontFamily:NUM,fontSize:10,flex:1,padding:"6px 10px",border:`1px dashed ${th.border}`}}/>
          </div>
        </div>;})}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
        {[["teamGoal","META EQUIPE (R$)"],["individualGoal","META INDIVIDUAL (R$)"]].map(([k,l])=>
          <div key={k} style={{flex:"1 1 180px",background:th.card,borderRadius:12,padding:12,border:`1px solid ${th.border}`}}>
            <label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>{l}</label>
            <input type="number" value={goals[k]||""} onChange={e=>setGoals({...goals,[k]:Number(e.target.value)})} placeholder="0" style={{...inp,fontFamily:NUM}}/></div>)}
        <div style={{flex:"1 1 140px",background:th.card,borderRadius:12,padding:12,border:`1px solid ${th.border}`}}>
          <label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>CELEBRAÇÃO (seg)</label>
          <input type="number" value={celebDur} onChange={e=>setCelebDur(Number(e.target.value)||5)} style={{...inp,fontFamily:NUM}}/></div>
        <div style={{flex:"1 1 140px",background:th.card,borderRadius:12,padding:12,border:`1px solid ${th.border}`}}>
          <label style={{fontSize:10,color:th.textMid,fontWeight:600,display:"block",marginBottom:4}}>REFRESH (seg)</label>
          <input type="number" value={refreshSec} onChange={e=>setRefreshSec(Math.max(10,Number(e.target.value)||60))} style={{...inp,fontFamily:NUM}}/></div>
      </div>
      {columns.length>0&&<MetricBuilder metrics={metrics} setMetrics={setMetrics} columns={columns} th={th}/>}

      {/* Saved Views */}
      {savedViews?.length>0&&<div style={{marginBottom:20}}>
        <h2 style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:8,color:th.text,marginBottom:10}}><FolderOpen size={15} color={th.primary}/> Visões Salvas</h2>
        <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
          {savedViews.map((v,i)=><button key={i} onClick={()=>onLoadView(v)} style={{padding:"10px 16px",borderRadius:12,border:`1px solid ${th.border}`,background:th.card,cursor:"pointer",textAlign:"left",flex:"1 1 200px"}}>
            <div style={{fontSize:13,fontWeight:600,color:th.text,marginBottom:2}}>{v.name}</div>
            <div style={{fontSize:10,color:th.textMid}}>{v.teams?.length||0} equipe(s) · salvo {new Date(v._saved).toLocaleDateString("pt-BR")}</div>
          </button>)}
        </div>
      </div>}

      <div style={{display:"flex",gap:8}}>
        <button onClick={onStart} disabled={!ok||loading} style={{flex:1,padding:"13px 0",borderRadius:12,border:"none",
          background:ok?`linear-gradient(135deg,${th.primary},${th.teal})`:th.border,color:ok?"#fff":th.textDim,fontSize:15,fontWeight:700,
          cursor:ok?"pointer":"not-allowed",fontFamily:FONT,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          {loading?<><Loader2 size={16} style={{animation:"spin 1s linear infinite"}}/> Carregando...</>:<><Save size={16}/> Salvar & Iniciar</>}
        </button>
        {ok&&<button onClick={()=>{const name=prompt("Nome da visão:");if(name)onSaveView(name);}} style={{padding:"13px 16px",borderRadius:12,border:`1px solid ${th.border}`,background:th.card,cursor:"pointer",color:th.primary,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
          <BookmarkPlus size={16}/> Salvar Visão
        </button>}
      </div></div></div>;
}

// ═══ TEAM VIEW ═══
function TeamView({team,data,metrics,tc,goals,setGoals,dateRange,setDateRange,trans,layout,photos,th,presMode,fsConfig,fsPrimary,onExitPres,vendorGoals,setVendorGoals,columns}){
  const[fCol,setFCol]=useState(""),[fVal,setFVal]=useState("");
  const[selectedDateCol,setSelectedDateCol]=useState("");
  // Detect ALL date columns
  const allDateCols=useMemo(()=>{if(!data?.[0])return[];return Object.keys(data[0]).filter(c=>c.toUpperCase().includes("DATA"));},[data]);
  const dateCol=useMemo(()=>selectedDateCol||findCol(data,["DATAINCLUSÃO","DATAINCLUSAO","DATAINCLU","DATA"]),[data,selectedDateCol]);
  const vendorCol=useMemo(()=>findCol(data,["VENDEDOR"]),[data]);
  const statusCol=useMemo(()=>findCol(data,["STATUS"]),[data]);
  const valorCol=useMemo(()=>findCol(data,["VALOR"]),[data]);
  const vidasCol=useMemo(()=>findCol(data,["VIDAS","NVIDAS"]),[data]);
  const planoCol=useMemo(()=>findCol(data,["PLANO"]),[data]);
  const origemCol=useMemo(()=>findCol(data,["ORIGEM"]),[data]);
  const getSt=useCallback(r=>statusCol?String(r[statusCol]||"").trim().toUpperCase():"",[statusCol]);
  const getV=useCallback(r=>valorCol?parseBRL(r[valorCol]):0,[valorCol]);

  // ═══ CROSS-FILTER (Looker Studio style) ═══
  const[crossFilter,setCrossFilter]=useState(null); // {column,value}
  const toggleCross=(col,val)=>setCrossFilter(prev=>prev?.column===col&&prev?.value===val?null:{column:col,value:val});

  // ═══ FILTER CHAIN: data → date → column → crossFilter ═══
  const dateFiltered=useMemo(()=>{if(!data?.length)return[];if(!dateRange.start&&!dateRange.end)return data;
    const s=dateRange.start?new Date(dateRange.start+"T00:00:00"):null,e=dateRange.end?new Date(dateRange.end+"T23:59:59"):null;
    return data.filter(r=>{let d=dateCol?parseDate(r[dateCol]):null;
      if(!d){for(const c of Object.keys(r)){if(c.toUpperCase().includes("DATA")){d=parseDate(r[c]);if(d)break;}}}
      if(!d)return false;if(s&&d<s)return false;if(e&&d>e)return false;return true;});},[data,dateCol,dateRange]);

  const colFiltered=useMemo(()=>{if(!fCol||!fVal)return dateFiltered;return dateFiltered.filter(r=>String(r[fCol]||"").trim()===fVal);},[dateFiltered,fCol,fVal]);

  // Cross-filter applies on top
  const filtered=useMemo(()=>{if(!crossFilter)return colFiltered;
    return colFiltered.filter(r=>String(r[crossFilter.column]||"").trim().toUpperCase()===crossFilter.value.toUpperCase());},[colFiltered,crossFilter]);

  const textCols=useMemo(()=>{if(!data?.[0])return[];return Object.keys(data[0]).filter(c=>{const v=data.slice(0,50).map(r=>r[c]).filter(Boolean);return v.filter(x=>typeof x==="number"||(!isNaN(Number(x))&&x!=="")).length<v.length*.4&&v.length>0;});},[data]);
  const fVals=useMemo(()=>fCol?[...new Set(dateFiltered.map(r=>String(r[fCol]||"").trim()).filter(Boolean))].sort():[],[dateFiltered,fCol]);

  // ═══ ALL COMPUTATIONS USE `filtered` ═══
  const computed=useMemo(()=>metrics.map(m=>({...m,value:evalMetric(filtered,m)})),[filtered,metrics]);

  const buildRanking=useCallback((sourceData)=>{
    if(!vendorCol||!sourceData?.length)return[];const g={};
    sourceData.forEach(r=>{if(getSt(r)!=="FINALIZADO")return;const n=String(r[vendorCol]||"").trim();if(!n||n==="-")return;
      if(!g[n])g[n]={t:0,c:0,v:0};g[n].t+=getV(r);g[n].c+=1;g[n].v+=Number(r[vidasCol]||0)||0;});
    return Object.entries(g).map(([n,d])=>({name:n,total:d.t,count:d.c,vidas:d.v})).sort((a,b)=>b.total-a.total);
  },[vendorCol,vidasCol,getSt,getV]);

  const ranking=useMemo(()=>buildRanking(filtered),[filtered,buildRanking]);

  const byPlano=useMemo(()=>{if(!planoCol||!filtered?.length)return[];const g={};
    filtered.forEach(r=>{if(getSt(r)!=="FINALIZADO")return;g[String(r[planoCol]||"?").trim()]=(g[String(r[planoCol]||"?").trim()]||0)+getV(r);});
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([n,v])=>({name:n,valor:v}));},[filtered,planoCol,getSt,getV]);
  const monthly=useMemo(()=>{if(!filtered?.length)return[];const g={};
    filtered.forEach(r=>{if(getSt(r)!=="FINALIZADO")return;const d=dateCol?parseDate(r[dateCol]):null;if(!d)return;
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;g[k]=(g[k]||0)+getV(r);});
    return Object.entries(g).sort().slice(-12).map(([k,v])=>({name:k.split("-").reverse().join("/"),valor:v}));},[filtered,dateCol,getSt,getV]);
  const byOrigem=useMemo(()=>{if(!origemCol||!filtered?.length)return[];const g={};
    filtered.forEach(r=>{if(getSt(r)!=="FINALIZADO")return;const k=String(r[origemCol]||"").trim();if(!k||k==="-")return;g[k]=(g[k]||0)+1;});
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([n,v])=>({name:n,value:v}));},[filtered,origemCol,getSt]);

  // ─── NEW CHART 1: Status Pipeline (stacked horizontal) ───
  const statusPipeline=useMemo(()=>{if(!statusCol||!filtered?.length)return[];const g={};
    filtered.forEach(r=>{const st=String(r[statusCol]||"").trim();if(!st||st==="-")return;g[st]=(g[st]||0)+1;});
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,valor])=>({name,valor}));},[filtered,statusCol]);

  // ─── NEW CHART 2: Top Vendedores Race (bar race) ───
  const vendorRace=useMemo(()=>{if(!ranking?.length)return[];
    return ranking.slice(0,8).map(r=>({name:r.name.split(" ").slice(0,2).join(" "),valor:r.total,vidas:r.vidas}));},[ranking]);

  // ─── NEW CHART 3: Scatter — Valor vs Vidas per vendedor ───
  const scatterData=useMemo(()=>{if(!ranking?.length)return[];
    return ranking.slice(0,15).map((r,i)=>({name:r.name.split(" ")[0],x:r.count,y:r.total,z:r.vidas,fill:PAL[i%8]}));},[ranking]);

  // ─── NEW CHART 4: Monthly + Cumulative (composed) ───
  const monthlyCumul=useMemo(()=>{if(!monthly?.length)return[];let acc=0;
    return monthly.map(m=>{acc+=m.valor;return{...m,acumulado:acc};});},[monthly]);

  // ─── NEW CHART 5: Radar — Top 5 vendedores multi-dimension ───
  const radarData=useMemo(()=>{if(!ranking?.length||ranking.length<2)return[];
    const top=ranking.slice(0,5);const maxV=Math.max(...top.map(r=>r.total))||1;const maxC=Math.max(...top.map(r=>r.count))||1;
    const maxL=Math.max(...top.map(r=>r.vidas))||1;const maxT=goals.individualGoal||maxV;
    return[{dim:"Faturamento",...Object.fromEntries(top.map(r=>[r.name.split(" ")[0],(r.total/maxV)*100]))},
      {dim:"Qtd Vendas",...Object.fromEntries(top.map(r=>[r.name.split(" ")[0],(r.count/maxC)*100]))},
      {dim:"Vidas",...Object.fromEntries(top.map(r=>[r.name.split(" ")[0],(r.vidas/maxL)*100]))},
      {dim:"Ticket Médio",...Object.fromEntries(top.map(r=>[r.name.split(" ")[0],((r.total/(r.count||1))/maxT)*100]))},
      {dim:"Meta %",...Object.fromEntries(top.map(r=>[r.name.split(" ")[0],Math.min((r.total/maxT)*100,100)]))}];},[ranking,goals]);
  const radarKeys=useMemo(()=>ranking?.length?ranking.slice(0,5).map(r=>r.name.split(" ")[0]):[], [ranking]);

  // ─── VENDOR GOAL CHART (meta individual por vendedor) ───
  // ─── VENDOR GOAL — ALWAYS CURRENT MONTH, 0% for inactive ───
  const thisMonthData=useMemo(()=>{
    if(!data?.length)return[];
    const now=new Date(),y=now.getFullYear(),m=now.getMonth();
    return data.filter(r=>{
      let d=dateCol?parseDate(r[dateCol]):null;
      if(!d){for(const c of Object.keys(r)){if(c.toUpperCase().includes("DATA")){d=parseDate(r[c]);if(d)break;}}}
      return d&&d.getFullYear()===y&&d.getMonth()===m;
    });
  },[data,dateCol]);

  const monthlyRanking=useMemo(()=>buildRanking(thisMonthData),[thisMonthData,buildRanking]);

  const vendorGoalData=useMemo(()=>{
    // Get all vendors that have goals defined
    const allGoalVendors=Object.keys(vendorGoals||{}).filter(v=>vendorGoals[v]>0);
    const defaultGoal=goals.individualGoal||0;
    // Merge: vendors with goals + vendors with sales this month
    const vendorSet=new Set([...allGoalVendors,...monthlyRanking.map(r=>r.name)]);
    return[...vendorSet].map(name=>{
      const sale=monthlyRanking.find(r=>r.name===name);
      const meta=vendorGoals?.[name]||defaultGoal;
      if(!meta)return null;
      const valor=sale?.total||0;
      return{name:name.split(" ").slice(0,2).join(" "),fullName:name,valor,meta,pct:Math.round((valor/meta)*100),count:sale?.count||0,vidas:sale?.vidas||0};
    }).filter(Boolean).sort((a,b)=>b.pct-a.pct);
  },[monthlyRanking,goals.individualGoal,vendorGoals]);

  // ─── FUNNEL DATA (status flow) ───
  const funnelData=useMemo(()=>{
    if(!statusCol||!filtered?.length)return[];
    const g={};filtered.forEach(r=>{const st=String(r[statusCol]||"").trim();if(st&&st!=="-")g[st]=(g[st]||0)+getV(r);});
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
  },[filtered,statusCol,getV]);

  // ─── CROSS-COMPARISON (vendor × plano) ───
  const crossCompData=useMemo(()=>{
    if(!vendorCol||!planoCol||!filtered?.length)return{data:[],keys:[]};
    const topVendors=ranking.slice(0,5).map(r=>r.name);
    const topPlanos=[...new Set(filtered.map(r=>String(r[planoCol]||"").trim()).filter(Boolean))].slice(0,6);
    const g={};topPlanos.forEach(p=>{const row={name:p.length>15?p.slice(0,15)+"…":p};topVendors.forEach(v=>{row[v.split(" ")[0]]=0;});g[p]=row;});
    filtered.forEach(r=>{if(getSt(r)!=="FINALIZADO")return;const v=String(r[vendorCol]||"").trim(),p=String(r[planoCol]||"").trim();
      if(topVendors.includes(v)&&g[p])g[p][v.split(" ")[0]]+=getV(r);});
    return{data:Object.values(g),keys:topVendors.map(v=>v.split(" ")[0])};
  },[filtered,vendorCol,planoCol,ranking,getSt,getV]);

  // ─── NEWS TICKER ITEMS ───
  const tickerItems=useMemo(()=>{
    if(!filtered?.length)return[];
    const clientCol=findCol(data,["NOME","RAZÃO","RAZAO"]);
    return filtered.slice(-30).reverse().map(r=>{
      const v=vendorCol?String(r[vendorCol]||"").trim():"";
      const cl=clientCol?String(r[clientCol]||"").trim():"";
      const val=getV(r);const st=getSt(r);
      return`${v?v+" — ":""}${cl?cl+" — ":""}${fmtBRL(val)} [${st}]`;
    }).filter(Boolean);
  },[filtered,data,vendorCol,getV,getSt]);

  // ─── MINI RANKINGS — independent from main date filter ───
  const[miniPeriod1,setMiniPeriod1]=useState("today");
  const[miniPeriod2,setMiniPeriod2]=useState("week");

  // Parse all row dates once (cached)
  const rowDates=useMemo(()=>{
    if(!data?.length)return[];
    return data.map(r=>{
      let d=dateCol?parseDate(r[dateCol]):null;
      if(!d){for(const c of Object.keys(r)){if(c.toUpperCase().includes("DATA")){d=parseDate(r[c]);if(d)break;}}}
      return d;
    });
  },[data,dateCol]);

  const filterByPeriod=useCallback((period)=>{
    if(!data?.length)return[];
    if(period==="all")return data;
    const pr=datePreset(period);if(!pr.start&&!pr.end)return data;
    const s=new Date(pr.start+"T00:00:00"),e=new Date(pr.end+"T23:59:59");
    return data.filter((_,i)=>{const d=rowDates[i];if(!d)return false;return d>=s&&d<=e;});
  },[data,rowDates]);

  // Mini rankings use RAW data → period filter → buildRanking (bypass main date filter)
  const rankingMini1=useMemo(()=>buildRanking(filterByPeriod(miniPeriod1)),[miniPeriod1,filterByPeriod,buildRanking]);
  const rankingMini2=useMemo(()=>buildRanking(filterByPeriod(miniPeriod2)),[miniPeriod2,filterByPeriod,buildRanking]);

  const[focused,setFocused]=useState(null);

  const mainVal=computed.find(m=>m.id==="fin")?.value||computed[0]?.value||0;
  const goalPct=goals.teamGoal?(mainVal/goals.teamGoal)*100:null;
  const iconMap={dollar:DollarSign,trending:TrendingUp,users:Users,hash:Hash,star:Star,x:X,target:Target};
  const L=layout;const fs=L.metricFontSize;

  if(!data?.length)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"50vh"}}><Loader2 size={24} color={tc.p} style={{animation:"spin 1s linear infinite"}}/></div>;

  // ═══ PRESENTATION MODE ═══
  if(presMode&&fsConfig){
    const panels=fsConfig.panels||[];
    const pos=fsConfig.sidePos||"bottom";
    const isVert=pos==="left"||pos==="right";
    const flexDir=pos==="top"?"column-reverse":pos==="bottom"?"column":pos==="left"?"row-reverse":"row";
    const primaryId=panels[fsPrimary%Math.max(panels.length,1)];
    const secIds=panels.filter((_,i)=>i!==(fsPrimary%Math.max(panels.length,1)));
    const CH=Math.max(350,Math.floor(window.innerHeight*0.65)); // Fill most of screen

    // Panel content map
    const pm={};
    if(monthly.length>0)pm.monthly=<ResponsiveContainer width="100%" height={CH}><AreaChart data={monthly}>
      <defs><linearGradient id="pmg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={tc.p} stopOpacity={.2}/><stop offset="95%" stopColor={tc.p} stopOpacity={0}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis dataKey="name" tick={{fill:th.textMid,fontSize:12,fontFamily:NUM}}/><YAxis tick={{fill:th.textMid,fontSize:11,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontSize:13,fontFamily:NUM}} formatter={v=>[fmtBRL(v),"Valor"]}/>
      <Area type="monotone" dataKey="valor" stroke={tc.p} strokeWidth={3} fill="url(#pmg)" dot={{fill:tc.p,r:4}}/></AreaChart></ResponsiveContainer>;
    if(byOrigem.length>0)pm.origem=<ResponsiveContainer width="100%" height={CH}><PieChart><Pie data={byOrigem} cx="50%" cy="50%" innerRadius={60} outerRadius={130} paddingAngle={3} dataKey="value"
      label={({name,percent})=>percent>.04?`${name} ${(percent*100).toFixed(0)}%`:""} labelLine={{stroke:th.textDim}}>{byOrigem.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Pie>
      <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10}}/></PieChart></ResponsiveContainer>;
    if(monthlyCumul.length>0)pm.cumul=<ResponsiveContainer width="100%" height={CH}><ComposedChart data={monthlyCumul}>
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis dataKey="name" tick={{fill:th.textMid,fontSize:11,fontFamily:NUM}}/>
      <YAxis yAxisId="left" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <YAxis yAxisId="right" orientation="right" tick={{fill:PAL[4],fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}} formatter={v=>[fmtBRL(v)]}/>
      <Bar yAxisId="left" dataKey="valor" fill={tc.p} radius={[4,4,0,0]} opacity={.7}/><Line yAxisId="right" type="monotone" dataKey="acumulado" stroke={PAL[4]} strokeWidth={3} dot={{r:4}}/>
      <Legend wrapperStyle={{fontSize:11,fontFamily:NUM}}/></ComposedChart></ResponsiveContainer>;
    if(byPlano.length>0)pm.plano=<ResponsiveContainer width="100%" height={Math.max(200,byPlano.length*35)}><BarChart data={byPlano} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis type="number" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <YAxis type="category" dataKey="name" tick={{fill:th.textMid,fontSize:11}} width={100}/><Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}} formatter={v=>[fmtBRL(v),"Valor"]}/>
      <Bar dataKey="valor" radius={[0,8,8,0]}>{byPlano.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Bar></BarChart></ResponsiveContainer>;
    if(statusPipeline.length>0)pm.pipeline=<ResponsiveContainer width="100%" height={Math.max(150,statusPipeline.length*35)}><BarChart data={statusPipeline} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis type="number" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}}/>
      <YAxis type="category" dataKey="name" tick={{fill:th.textMid,fontSize:11}} width={110}/><Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}}/>
      <Bar dataKey="valor" radius={[0,8,8,0]}>{statusPipeline.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Bar></BarChart></ResponsiveContainer>;
    if(vendorRace.length>0)pm.race=<ResponsiveContainer width="100%" height={Math.max(200,vendorRace.length*40)}><BarChart data={vendorRace} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis type="number" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <YAxis type="category" dataKey="name" tick={{fill:th.textMid,fontSize:12,fontFamily:NUM,fontWeight:600}} width={80}/>
      <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}} formatter={v=>[fmtBRL(v),"Valor"]}/>
      <Bar dataKey="valor" radius={[0,8,8,0]} barSize={24}>{vendorRace.map((_,i)=><Cell key={i} fill={PAL[i%8]}/>)}</Bar></BarChart></ResponsiveContainer>;
    if(scatterData.length>1)pm.scatter=<ResponsiveContainer width="100%" height={CH}><ScatterChart>
      <CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/><XAxis dataKey="x" name="Vendas" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}}/>
      <YAxis dataKey="y" name="Valor" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <ZAxis dataKey="z" range={[60,400]} name="Vidas"/><Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}}/>
      <Scatter data={scatterData} fill={tc.p}>{scatterData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Scatter></ScatterChart></ResponsiveContainer>;
    if(radarData.length>0&&radarKeys.length>1)pm.radar=<ResponsiveContainer width="100%" height={CH}><RadarChart data={radarData}>
      <PolarGrid stroke={th.borderLight}/><PolarAngleAxis dataKey="dim" tick={{fill:th.textMid,fontSize:10}}/>
      <PolarRadiusAxis tick={{fill:th.textDim,fontSize:9}} domain={[0,100]}/>
      {radarKeys.map((k,i)=><Radar key={k} name={k} dataKey={k} stroke={PAL[i%8]} fill={PAL[i%8]} fillOpacity={.15} strokeWidth={2}/>)}
      <Legend wrapperStyle={{fontSize:11,fontFamily:NUM}}/></RadarChart></ResponsiveContainer>;
    if(vendorGoalData.length>0)pm.vendorGoal=<ResponsiveContainer width="100%" height={Math.max(250,vendorGoalData.length*38)}>
      <ComposedChart data={vendorGoalData} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke={th.borderLight}/>
      <XAxis type="number" tick={{fill:th.textMid,fontSize:10,fontFamily:NUM}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(0)}k`:v}/>
      <YAxis type="category" dataKey="name" tick={{fill:th.textMid,fontSize:11,fontFamily:NUM,fontWeight:600}} width={90}/>
      <Tooltip contentStyle={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,fontFamily:NUM}} formatter={(v,n)=>[fmtBRL(v),n==="meta"?"Meta":"Realizado"]}/>
      <Bar dataKey="valor" radius={[0,8,8,0]} barSize={20}>{vendorGoalData.map((d,i)=><Cell key={i} fill={d.pct>=100?th.success:d.pct>=70?th.warning:th.danger}/>)}</Bar>
      <Line type="stepAfter" dataKey="meta" stroke={th.danger} strokeWidth={2} strokeDasharray="6 3" dot={false}/><Legend wrapperStyle={{fontSize:10,fontFamily:NUM}} formatter={v=>v==="valor"?"Realizado":"Meta"}/></ComposedChart></ResponsiveContainer>;
    // Rankings for presentation
    const mkRank=(rk,color,max)=>rk.length?<div style={{maxHeight:"100%",overflowY:"auto"}}>{rk.slice(0,max||15).map((r,i)=>{const mc=i===0?"#FFD700":i===1?"#94A3B8":i===2?"#CD7F32":color;
      return<div key={i} style={{display:"flex",alignItems:"center",gap:"clamp(8px,1.5vw,14px)",padding:"clamp(6px,1vh,12px) 4px",borderBottom:i<rk.length-1?"1px solid #1a1f30":"none"}}>
        <span style={{width:"clamp(28px,4vw,44px)",height:"clamp(28px,4vw,44px)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",background:`${mc}20`,color:mc,fontSize:"clamp(12px,2vw,20px)",fontWeight:800,fontFamily:NUM,flexShrink:0}}>{i+1}</span>
        <VendorAvatar name={r.name} photos={photos} size={40}/>
        <div style={{flex:1}}><div style={{fontSize:"clamp(13px,1.8vw,20px)",fontWeight:700,color:"#E8ECF4"}}>{r.name}</div>
          <div style={{fontSize:"clamp(10px,1.2vw,14px)",color:"#6B7280"}}>{r.count} vendas · {r.vidas} vidas</div></div>
        <div style={{fontSize:"clamp(14px,2.2vw,24px)",fontWeight:800,fontFamily:NUM,color,flexShrink:0}}>{fmtBRL(r.total)}</div></div>;})}</div>
      :<p style={{color:"#555",textAlign:"center",padding:40,fontSize:16}}>Sem dados</p>;
    pm.ranking=mkRank(ranking,tc.p,20);
    pm.mini0=mkRank(rankingMini1,"#F59E0B",10);
    pm.mini1=mkRank(rankingMini2,"#4F46E5",10);

    // METRICS — BILLBOARD SCOREBOARD
    pm.metrics=<div style={{display:"flex",flexWrap:"wrap",gap:"clamp(8px,1.5vw,16px)",alignContent:"center",height:"100%"}}>
      {computed.map((m,i)=>{const Icon=iconMap[m.icon]||DollarSign;const val=m.format==="currency"?fmtBRL(m.value):fmtN(m.value);
        return<div key={m.id} style={{flex:"1 1 clamp(200px,28%,350px)",background:`linear-gradient(135deg,${m.color}12,${m.color}06)`,
          borderRadius:20,padding:"clamp(16px,3vw,32px)",border:`2px solid ${m.color}30`,position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:0,left:0,width:6,height:"100%",background:m.color,borderRadius:"20px 0 0 20px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:"clamp(8px,1.5vw,16px)",paddingLeft:8}}>
            <Icon size={24} color={m.color}/><span style={{color:"#8B93A7",fontSize:"clamp(12px,1.5vw,18px)",fontWeight:600}}>{m.name}</span></div>
          <div style={{fontSize:"clamp(28px,5vw,56px)",fontWeight:800,color:"#E8ECF4",fontFamily:NUM,paddingLeft:8,letterSpacing:"-1px",lineHeight:1}}>{val}</div>
        </div>;})}
      {goalPct!==null&&<div style={{flex:"1 1 100%",background:`linear-gradient(135deg,${tc.p}12,${tc.p}06)`,borderRadius:20,padding:"clamp(16px,2vw,24px)",border:`2px solid ${tc.p}30`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:"clamp(14px,1.5vw,18px)",fontWeight:700,color:"#8B93A7"}}>Meta da Equipe</span>
          <span style={{fontSize:"clamp(24px,4vw,48px)",fontWeight:800,color:goalPct>=100?"#34D399":tc.p,fontFamily:NUM}}>{goalPct.toFixed(1)}%</span></div>
        <PBar pct={goalPct} color={goalPct>=100?"#34D399":tc.p} h={12}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8}}>
          <span style={{fontSize:"clamp(12px,1.3vw,16px)",color:"#6B7280",fontFamily:NUM}}>{fmtBRL(mainVal)}</span>
          <span style={{fontSize:"clamp(12px,1.3vw,16px)",color:"#6B7280",fontFamily:NUM}}>Meta: {fmtBRL(goals.teamGoal)}</span></div></div>}
    </div>;

    // NEW CHART PANELS
    if(funnelData.length>0)pm.funnel=<FunnelChart data={funnelData} th={{...th,textMid:"#8B93A7",borderLight:"#1a1f30"}} height={Math.max(250,funnelData.length*50)}/>;
    if(funnelData.length>0)pm.pyramid=<PyramidChart data={funnelData} th={{...th,textMid:"#8B93A7"}} height={Math.max(250,funnelData.length*50)}/>;
    pm.gauge=<div style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",alignItems:"center",height:"100%"}}>
      {ranking.slice(0,6).map((r,i)=>{const g=vendorGoals?.[r.name]||goals.individualGoal||100000;
        return<div key={i} style={{textAlign:"center"}}><GaugeChart value={r.total} max={g} label={r.name.split(" ").slice(0,2).join(" ")} color={PAL[i%8]} th={{text:"#E8ECF4",textMid:"#8B93A7",textDim:"#555",borderLight:"#1a1f30"}}/></div>;})}</div>;
    if(monthly.length>0)pm.wave=<WaveChart data={monthly} color={tc.p} th={{...th,card:"#0d1220",border:"#1a1f30",textMid:"#8B93A7"}} height={CH}/>;
    if(crossCompData.data.length>0)pm.crossComp=<CrossCompChart data={crossCompData.data} keys={crossCompData.keys} th={{...th,card:"#0d1220",border:"#1a1f30",textMid:"#8B93A7",borderLight:"#1a1f30"}} height={CH}/>;

    return<><PresentationView panelMap={pm} fsConfig={fsConfig} fsPrimary={fsPrimary} th={th} onExit={onExitPres} teamName={team.name} tc={tc}/>
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:201}}><NewsTicker items={tickerItems} th={th} tc={tc}/></div></>;
  }

  return<div style={{opacity:trans?0:1,transform:trans?"translateX(16px)":"none",transition:"all .4s cubic-bezier(.16,1,.3,1)"}}>
    {/* Header + Filters */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,flexWrap:"wrap",gap:8}}>
      <div><h2 style={{fontSize:20,fontWeight:700,color:th.text,display:"flex",alignItems:"center",gap:8}}>
        <span style={{width:10,height:10,borderRadius:"50%",background:tc.p,flexShrink:0}}/>{team.name}</h2>
        <p style={{fontSize:11,color:th.textMid,marginTop:2}}>{filtered.length} de {data.length} registros</p></div>
      <div style={{display:"flex",gap:4,alignItems:"center",flexWrap:"wrap"}}>
        {[["today","Hoje"],["week","Esta semana"],["month","Este mês"],["3m","3 meses"],["6m","6 meses"],["year","1 ano"],["all","Tudo"]].map(([k,l])=>{
          const pr=datePreset(k);const act=(k==="all"&&!dateRange.start&&!dateRange.end)||(dateRange.start===pr.start&&dateRange.end===pr.end&&k!=="all");
          return<button key={k} onClick={()=>setDateRange(pr)} style={{padding:"4px 10px",borderRadius:8,border:act?`2px solid ${tc.p}`:`1px solid ${th.border}`,
            background:act?tc.l:th.card,color:act?tc.p:th.textMid,fontSize:11,fontWeight:act?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>{l}</button>;})}
        <div style={{display:"flex",alignItems:"center",gap:3,padding:"3px 8px",borderRadius:8,background:th.card,border:`1px solid ${th.border}`}}>
          <Calendar size={11} color={tc.p}/>
          <input type="date" value={dateRange.start} onChange={e=>setDateRange({...dateRange,start:e.target.value})} style={{padding:"2px 3px",border:"none",background:"transparent",color:th.text,fontSize:10,outline:"none",width:95}}/>
          <span style={{color:th.textDim,fontSize:9}}>–</span>
          <input type="date" value={dateRange.end} onChange={e=>setDateRange({...dateRange,end:e.target.value})} style={{padding:"2px 3px",border:"none",background:"transparent",color:th.text,fontSize:10,outline:"none",width:95}}/></div>
        <select value={fCol} onChange={e=>{setFCol(e.target.value);setFVal("")}} style={{padding:"4px 8px",borderRadius:8,border:`1px solid ${th.border}`,background:th.card,color:th.textMid,fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="">+ Filtro</option>{textCols.map(c=><option key={c} value={c}>{c}</option>)}</select>
        {fCol&&<select value={fVal} onChange={e=>setFVal(e.target.value)} style={{padding:"4px 8px",borderRadius:8,border:`1px solid ${tc.p}44`,background:tc.l,color:tc.p,fontSize:11,outline:"none",cursor:"pointer"}}>
          <option value="">Todos</option>{fVals.map(v=><option key={v} value={v}>{v}</option>)}</select>}
        {(dateRange.start||dateRange.end||fVal)&&<button onClick={()=>{setDateRange({start:"",end:""});setFCol("");setFVal("");setCrossFilter(null)}} style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${th.danger}33`,background:`${th.danger}08`,color:th.danger,fontSize:10,cursor:"pointer",fontWeight:600}}>Limpar</button>}
        {crossFilter&&<button onClick={()=>setCrossFilter(null)} style={{padding:"4px 10px",borderRadius:8,border:`2px solid ${tc.p}`,background:tc.l,color:tc.p,fontSize:10,cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
          <X size={10}/> {crossFilter.column.replace(/:/g,"")}: {crossFilter.value}</button>}
      </div></div>

    {/* Goal */}
    {goalPct!==null&&<div style={{background:th.card,borderRadius:16,padding:"14px 18px",marginBottom:12,border:`1px solid ${th.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{fontSize:12,fontWeight:600,color:th.textMid}}>Meta da Equipe</span>
        <span style={{fontSize:18,fontWeight:700,color:goalPct>=100?th.success:tc.p,fontFamily:NUM}}>{goalPct.toFixed(1)}%</span></div>
      <PBar pct={goalPct} color={goalPct>=100?th.success:tc.p}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}><span style={{fontSize:10,color:th.textDim,fontFamily:NUM}}>{fmtBRL(mainVal)}</span><span style={{fontSize:10,color:th.textDim,fontFamily:NUM}}>Meta: {fmtBRL(goals.teamGoal)}</span></div>
    </div>}

    {/* Metrics — TRUE FLEX */}
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:12}}>
      {computed.map((m,i)=>{const Icon=iconMap[m.icon]||DollarSign;
        return<div key={m.id} style={{flex:`1 1 ${100/L.metricCols-2}%`,minWidth:160,background:th.card,borderRadius:16,padding:"18px 16px",border:`1px solid ${th.border}`,position:"relative",animation:`fadeUp .4s ease-out ${i*50}ms both`}}>
          <div style={{position:"absolute",top:0,left:0,width:4,height:"100%",background:m.color,borderRadius:"16px 0 0 16px"}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingLeft:6}}>
            <div style={{width:34,height:34,borderRadius:10,background:`${m.color}12`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={16} color={m.color}/></div>
            <span style={{color:th.textMid,fontSize:12,fontWeight:500}}>{m.name}</span></div>
          <div style={{fontSize:fs,fontWeight:700,color:th.text,fontFamily:NUM,paddingLeft:6,letterSpacing:"-.5px",lineHeight:1.1}}>{m.format==="currency"?fmtBRL(m.value):fmtN(m.value)}</div>
        </div>;})}
    </div>

    {/* ALL CHARTS — UNIVERSAL WITH TYPE SELECTOR */}
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
      {monthly.length>0&&<SmartChartBox id="monthly" title="Evolução Mensal" icon={Activity} color={tc.p} data={monthly} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="area" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {byOrigem.length>0&&<SmartChartBox id="origem" title="Por Origem" icon={Globe} color={PAL[1]} data={byOrigem.map(d=>({...d,valor:d.value}))} defaultType="pie" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {monthlyCumul.length>0&&<SmartChartBox id="cumul" title="Mensal + Acumulado" icon={TrendingUp} color={PAL[4]} data={monthlyCumul} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="composed" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
      {byPlano.length>0&&<SmartChartBox id="plano" title="Vendas por Plano" icon={BarChart3} color={PAL[2]} data={byPlano} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="barH" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {statusPipeline.length>0&&<SmartChartBox id="pipeline" title="Pipeline por Status" icon={Activity} color={PAL[3]} data={statusPipeline} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="barH" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
      {vendorRace.length>0&&<SmartChartBox id="race" title="Top Vendedores" icon={Trophy} color={PAL[5]} data={vendorRace} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="barH" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {funnelData.length>0&&<SmartChartBox id="funnel" title="Funil de Vendas" icon={Activity} color={PAL[3]} data={funnelData} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="funnel" focused={focused} onFocus={setFocused} th={th} chartH={Math.max(180,funnelData.length*45)}/>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
      {scatterData.length>1&&<SmartChartBox id="scatter" title="Vendas x Faturamento" icon={Target} color={PAL[6]} data={scatterData} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="scatter" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {radarData.length>0&&radarKeys.length>1&&<SmartChartBox id="radar" title="Radar Vendedores" icon={Star} color={PAL[7]} data={radarData} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="radar" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight} keys={radarKeys}/>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
      {vendorGoalData.length>0&&<SmartChartBox id="vendorGoal" title="Meta por Vendedor" icon={Crosshair} color={PAL[5]} data={vendorGoalData} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="barH" focused={focused} onFocus={setFocused} th={th} chartH={Math.max(200,vendorGoalData.length*30)}/>}
      {monthly.length>0&&<SmartChartBox id="wave" title="Onda de Vendas" icon={Activity} color={tc.p} data={monthly} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="wave" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight}/>}
      {crossCompData.data.length>0&&<SmartChartBox id="crossComp" title="Comparacao Cruzada" icon={BarChart3} color={PAL[7]} data={crossCompData.data} allData={filtered} columns={Object.keys(data?.[0]||{})} defaultType="bar" focused={focused} onFocus={setFocused} th={th} chartH={L.chartHeight} keys={crossCompData.keys}/>}
    </div>
    <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
      {ranking.length>0&&<ChartBox id="ranking" title={`Ranking (${ranking.length})`} icon={Crown} color={th.warning} focused={focused} onFocus={setFocused} th={th}>
        <div style={{maxHeight:focused==="ranking"?600:L.chartHeight+60,overflowY:"auto"}}>{ranking.slice(0,focused==="ranking"?30:L.rankingMax).map((r,i)=>{
          const gp=(vendorGoals?.[r.name]||goals.individualGoal)?(r.total/(vendorGoals?.[r.name]||goals.individualGoal))*100:null;const mc=i===0?"#FFD700":i===1?"#94A3B8":i===2?"#CD7F32":tc.p;
          return<div key={i} onClick={e=>{e.stopPropagation();vendorCol&&toggleCross(vendorCol,r.name)}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 2px",borderBottom:i<ranking.length-1?`1px solid ${th.borderLight}`:"none",cursor:"pointer",borderRadius:6,background:crossFilter?.value===r.name?`${tc.p}10`:"transparent"}}>
            <span style={{width:28,height:28,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${mc}18`,color:mc,fontSize:12,fontWeight:700,fontFamily:NUM,flexShrink:0}}>{i+1}</span>
            <VendorAvatar name={r.name} photos={photos} size={32}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:L.rankingFontSize,fontWeight:600,color:crossFilter?.value===r.name?tc.p:th.text}}>{r.name}</div>
              <div style={{fontSize:10,color:th.textDim}}>{r.count} vendas . {r.vidas} vidas</div>
              {gp!==null&&<div style={{marginTop:3,width:"85%"}}><PBar pct={gp} color={gp>=100?th.success:tc.p} h={3}/></div>}</div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:L.rankingFontSize+1,fontWeight:700,fontFamily:NUM,color:tc.p}}>{fmtBRL(r.total)}</div>
              {gp!==null&&<div style={{fontSize:9,color:gp>=100?th.success:th.textDim,fontFamily:NUM}}>{gp.toFixed(0)}%</div>}</div>
          </div>;})}</div></ChartBox>}
      {ranking.length>0&&<ChartBox id="gauge" title="Velocimetro" icon={Crosshair} color={PAL[2]} focused={focused} onFocus={setFocused} th={th}>
        <div style={{display:"flex",flexWrap:"wrap",gap:12,justifyContent:"center"}}>
          {ranking.slice(0,focused==="gauge"?12:6).map((r,i)=>{const g=vendorGoals?.[r.name]||goals.individualGoal||100000;
            return<div key={i} style={{textAlign:"center"}}><GaugeChart value={r.total} max={g} label={r.name.split(" ").slice(0,2).join(" ")} color={PAL[i%8]} th={th}/></div>;})}</div></ChartBox>}
    </div>
    {/* MINI RANKINGS */}
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:12}}>
      {[{rk:rankingMini1,period:miniPeriod1,setPeriod:setMiniPeriod1,color:th.warning,icon:Zap,label:"Ranking Rapido 1"},
        {rk:rankingMini2,period:miniPeriod2,setPeriod:setMiniPeriod2,color:th.primary,icon:Calendar,label:"Ranking Rapido 2"}].map((cfg,ci)=>{
        const isFoc=focused===`mini${ci}`;const isOther=focused&&!isFoc;
        return<div key={ci} onClick={e=>{e.stopPropagation();setFocused(isFoc?null:`mini${ci}`)}} style={{
          flex:isOther?"0 0 80px":isFoc?"1 1 100%":"1 1 45%",minWidth:isOther?80:280,maxHeight:isOther?80:"none",
          background:th.card,borderRadius:16,padding:isOther?8:18,border:`2px solid ${cfg.color}44`,position:"relative",overflow:"hidden",
          cursor:"pointer",transition:"all .6s cubic-bezier(.16,1,.3,1)",opacity:isOther?.4:1,order:isFoc?-1:0}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:4,background:`linear-gradient(90deg,${cfg.color},${th.teal})`}}/>
          {!isOther&&<>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <div style={{width:28,height:28,borderRadius:8,background:`${cfg.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><cfg.icon size={14} color={cfg.color}/></div>
              <span style={{fontSize:isFoc?16:14,fontWeight:700,color:th.text}}>{cfg.label}</span>
              <div style={{display:"flex",gap:3,marginLeft:"auto",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                {[["today","Hoje"],["week","Semana"],["month","Mes"],["3m","3M"],["6m","6M"],["year","Ano"],["all","Tudo"]].map(([k,l])=>{
                  const act=cfg.period===k;
                  return<button key={k} onClick={e=>{e.stopPropagation();cfg.setPeriod(k)}} style={{padding:"2px 8px",borderRadius:6,border:act?`2px solid ${cfg.color}`:`1px solid ${th.border}`,
                    background:act?`${cfg.color}14`:th.card,color:act?cfg.color:th.textDim,fontSize:9,fontWeight:act?700:400,cursor:"pointer"}}>{l}</button>;})}
              </div></div>
            <div style={{maxHeight:isFoc?600:280,overflowY:"auto"}}>
              {cfg.rk.length===0?<p style={{fontSize:12,color:th.textDim,textAlign:"center",padding:20}}>Sem vendas neste periodo</p>:
              cfg.rk.slice(0,isFoc?30:10).map((r,i)=>{const mc=i===0?"#FFD700":i===1?"#94A3B8":i===2?"#CD7F32":cfg.color;
                return<div key={i} onClick={e=>{e.stopPropagation();vendorCol&&toggleCross(vendorCol,r.name)}}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"8px 2px",borderBottom:i<cfg.rk.length-1?`1px solid ${th.borderLight}`:"none",
                    cursor:"pointer",borderRadius:6,background:crossFilter?.value===r.name?`${cfg.color}10`:"transparent"}}>
                  <span style={{width:26,height:26,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",background:`${mc}20`,color:mc,fontSize:11,fontWeight:700,fontFamily:NUM,flexShrink:0}}>{i+1}</span>
                  <VendorAvatar name={r.name} photos={photos} size={28}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:crossFilter?.value===r.name?cfg.color:th.text}}>{r.name}</div>
                    <div style={{fontSize:10,color:th.textDim}}>{r.count} vendas . {r.vidas} vidas</div></div>
                  <div style={{fontSize:14,fontWeight:700,fontFamily:NUM,color:cfg.color,flexShrink:0}}>{fmtBRL(r.total)}</div>
                </div>;})}
            </div></>}
          {isOther&&<div style={{fontSize:9,fontWeight:600,color:th.textDim,display:"flex",alignItems:"center",gap:4}}><cfg.icon size={10}/>{cfg.label}</div>}
        </div>;})}
    </div>
    {/* GOALS WIZARD + DATE SELECTOR */}
    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:12,alignItems:"flex-start"}}>
      <GoalsWizard data={data} columns={columns||Object.keys(data?.[0]||{})} vendorGoals={vendorGoals} setVendorGoals={setVendorGoals} goals={goals} setGoals={setGoals} th={th}/>
      <VendorGoalsEditor vendorGoals={vendorGoals} setVendorGoals={setVendorGoals} ranking={ranking} th={th}/>
      <DateColSelector dateCols={allDateCols} selected={selectedDateCol||dateCol} onChange={setSelectedDateCol} th={th}/>
    </div>
  </div>;
}


// ═══ MAIN APP ═══
export default function App(){
  const[stage,setStage]=useState("init");
  const[dark,setDark]=useState(false);
  const[teams,setTeams]=useState([{name:"Equipe 1",url:""}]);
  const[goals,setGoals]=useState({teamGoal:0,individualGoal:0});
  const[metrics,setMetrics]=useState(DMET);
  const[columns,setColumns]=useState([]);
  const[teamsData,setTeamsData]=useState({});
  const[active,setActive]=useState(0);
  const[trans,setTrans]=useState(false);
  const[autoRot,setAutoRot]=useState(true);
  const[rotSec]=useState(15);
  const[soundOn,setSoundOn]=useState(true);
  const[notifs,setNotifs]=useState([]);
  const[dateRange,setDateRange]=useState({start:"",end:""});
  const[lastRefresh,setLastRefresh]=useState(null);
  const[refreshing,setRefreshing]=useState(false);
  const[loading,setLoading]=useState(false);
  const[celeb,setCeleb]=useState(null);
  const[celebDur,setCelebDur]=useState(5);
  const[refreshSec,setRefreshSec]=useState(60);
  const[layout,setLayout]=useState(DEF_LAYOUT);
  const[photos,setPhotos]=useState({});
  const[vendorGoals,setVendorGoals]=useState({});
  const[showPanel,setShowPanel]=useState(false);
  const[savedViews,setSavedViews]=useState([]);
  const[fsConfig,setFsConfig]=useState({panels:["metrics","monthly","ranking","vendorGoal"],rotate:true,rotateTime:10,sidePos:"bottom",mainPanel:"metrics"});
  const[fsPrimary,setFsPrimary]=useState(0);
  const[presMode,setPresMode]=useState(false);
  const[customColors,setCustomColors]=useState({});
  const celebQ=useRef([]);const prevSnap=useRef({});const prevCount=useRef({});const nid=useRef(0);const refreshRef=useRef(null);

  // Load saved views on mount
  useEffect(()=>{setSavedViews(viewsLoad())},[]);

  const handleSaveView=useCallback((name)=>{
    const view={name,teams,goals,metrics,columns,celebDur,layout,photos,dark,_saved:Date.now()};
    const views=[...savedViews.filter(v=>v.name!==name),view];
    setSavedViews(views);viewsSave(views);
  },[teams,goals,metrics,columns,celebDur,layout,photos,dark,savedViews]);

  const handleLoadView=useCallback((view)=>{
    if(view.teams)setTeams(view.teams);if(view.goals)setGoals(view.goals);
    if(view.metrics)setMetrics(view.metrics);if(view.columns)setColumns(view.columns);
    if(view.celebDur)setCelebDur(view.celebDur);if(view.layout)setLayout(view.layout);
    if(view.photos)setPhotos(view.photos);if(view.dark!=null)setDark(view.dark);
  },[]);

  const th=useMemo(()=>{const base=dark?DARK:LIGHT;return customColors&&Object.keys(customColors).length?{...base,...customColors}:base;},[dark,customColors]);
  const notify=useCallback((title,msg,color)=>{const id=++nid.current;setNotifs(p=>[...p,{id,title,msg,color}]);setTimeout(()=>setNotifs(p=>p.filter(n=>n.id!==id)),5000);},[]);
  const showCeleb=useCallback(item=>{celebQ.current.push(item);if(!celeb)setCeleb(celebQ.current.shift());},[celeb]);
  const nextCeleb=useCallback(()=>{setCeleb(null);setTimeout(()=>{if(celebQ.current.length)setCeleb(celebQ.current.shift());},400);},[]);

  const fetchSheet=useCallback(async url=>{const m=url.match(/\/d\/([a-zA-Z0-9-_]+)/);if(!m)throw new Error("URL inválida");
    const r=await fetch(`https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq?tqx=out:csv&_=${Date.now()}`);if(!r.ok)throw new Error(`HTTP ${r.status}`);
    return Papa.parse(await r.text(),{header:true,skipEmptyLines:true,dynamicTyping:false}).data;},[]);

  const fetchWebhook=useCallback(async url=>{
    const r=await fetch(url,{headers:{"Accept":"application/json"}});if(!r.ok)throw new Error(`Webhook ${r.status}`);
    const j=await r.json();if(Array.isArray(j))return j;if(j.data&&Array.isArray(j.data))return j.data;
    if(j.records&&Array.isArray(j.records))return j.records;
    if(j.values&&Array.isArray(j.values)){const[h,...rows]=j.values;return rows.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]||""])));}
    throw new Error("Formato não reconhecido");},[]);

  const loadAll=useCallback(async(tms,isRef=false)=>{setRefreshing(true);const nd={};
    for(let i=0;i<tms.length;i++){try{
      let data;if(tms[i].webhook){try{data=await fetchWebhook(tms[i].webhook)}catch(e){console.warn("Webhook fallback:",e)}}
      if(!data&&tms[i].url)data=await fetchSheet(tms[i].url);if(!data?.length)continue;nd[i]=data;
      const vc=findCol(data,["VENDEDOR"]),cc=findCol(data,["NOME","RAZÃO","RAZAO"]),sc=findCol(data,["STATUS"]),vlc=findCol(data,["VALOR"]);
      const prev=prevCount.current[i]||0,snap=prevSnap.current[i]||[];
      if(isRef&&prev>0){if(data.length>prev)data.slice(prev).forEach(row=>{const v=vc?String(row[vc]||"").trim():"",cl=cc?String(row[cc]||"").trim():"";
        if(v&&v!=="-"){if(soundOn)playChime();showCeleb({type:"proposta",vendor:v,client:cl,team:tms[i].name});}});
        if(sc&&snap.length)for(let ri=0;ri<Math.min(data.length,snap.length);ri++){const os=String(snap[ri]?.[sc]||"").trim().toUpperCase(),ns=String(data[ri]?.[sc]||"").trim().toUpperCase();
          if(os!=="FINALIZADO"&&ns==="FINALIZADO"){const v=vc?String(data[ri][vc]||"").trim():"",val=vlc?parseBRL(data[ri][vlc]):0,cl=cc?String(data[ri][cc]||"").trim():"";
            if(v&&v!=="-"){if(soundOn)playChime();showCeleb({type:"boleto",vendor:v,value:val,client:cl,team:tms[i].name});}}}}
      prevCount.current[i]=data.length;prevSnap.current[i]=data.map(r=>({...r}));
      if(i===0&&data[0])setColumns(Object.keys(data[0]).filter(c=>c.trim()));}catch(e){console.error(e);}}
    setTeamsData(nd);setLastRefresh(new Date());setRefreshing(false);return nd;},[fetchSheet,fetchWebhook,soundOn,showCeleb]);

  // Load saved config
  useEffect(()=>{const cfg=dbLoad();if(cfg){if(cfg.teams?.length)setTeams(cfg.teams);if(cfg.goals)setGoals(cfg.goals);if(cfg.metrics?.length)setMetrics(cfg.metrics);
    if(cfg.columns?.length)setColumns(cfg.columns);if(cfg.celebDur)setCelebDur(cfg.celebDur);if(cfg.refreshSec)setRefreshSec(cfg.refreshSec);if(cfg.layout)setLayout(cfg.layout);if(cfg.photos)setPhotos(cfg.photos);if(cfg.dark!=null)setDark(cfg.dark);
    if(cfg.fsConfig)setFsConfig(cfg.fsConfig);if(cfg.customColors)setCustomColors(cfg.customColors);if(cfg.vendorGoals)setVendorGoals(cfg.vendorGoals);
    if(cfg.teams?.length&&cfg.teams.every(t=>t.url||t.webhook)&&cfg.columns?.length){setStage("autostart");return;}}setStage("setup");},[]);
  useEffect(()=>{if(stage!=="autostart")return;(async()=>{setLoading(true);await loadAll(teams);setLoading(false);setStage("live");})();},[stage]);

  const handleStart=useCallback(async()=>{setLoading(true);const d=await loadAll(teams);
    if(columns.length===0&&d[0]?.[0]){setColumns(Object.keys(d[0][0]).filter(c=>c.trim()));setLoading(false);setStage("setup");return;}
    dbSave({teams,goals,metrics,columns,celebDur,refreshSec,vendorGoals,layout,photos,dark,fsConfig,customColors});setLoading(false);setStage("live");},[teams,goals,metrics,columns,loadAll,celebDur,layout,photos,dark,fsConfig,customColors]);

  // Auto-refresh — configurable interval
  useEffect(()=>{if(stage!=="live")return;if(refreshRef.current)clearInterval(refreshRef.current);
    refreshRef.current=setInterval(()=>loadAll(teams,true),refreshSec*1000);return()=>{if(refreshRef.current)clearInterval(refreshRef.current);};},[stage,teams,loadAll,refreshSec]);
  // Auto-rotate teams
  useEffect(()=>{if(!autoRot||stage!=="live"||teams.length<=1)return;
    const t=setInterval(()=>{setTrans(true);setTimeout(()=>{setActive(p=>(p+1)%teams.length);setTrans(false);},300);},rotSec*1000);return()=>clearInterval(t);},[autoRot,stage,teams.length,rotSec]);
  // Fullscreen panel rotation — ping pattern: main → sec1 → main → sec2 → ...
  useEffect(()=>{if(!fsConfig.rotate||!fsConfig.panels?.length||fsConfig.panels.length<2)return;
    const panels=fsConfig.panels;const mainId=fsConfig.mainPanel||panels[0];
    const secs=panels.filter(id=>id!==mainId);if(!secs.length)return;
    let secIdx=0;let showingMain=true;
    const t=setInterval(()=>{
      if(showingMain){
        // Switch to next secondary
        const idx=panels.indexOf(secs[secIdx%secs.length]);
        setFsPrimary(idx>=0?idx:0);
        showingMain=false;
      } else {
        // Return to main
        const idx=panels.indexOf(mainId);
        setFsPrimary(idx>=0?idx:0);
        secIdx++;
        showingMain=true;
      }
    },(fsConfig.rotateTime||10)*1000);
    // Start on main
    const mainIdx=panels.indexOf(mainId);setFsPrimary(mainIdx>=0?mainIdx:0);
    return()=>clearInterval(t);},[fsConfig]);
  const switchTeam=useCallback(i=>{if(i===active)return;setTrans(true);setTimeout(()=>{setActive(i);setTrans(false);},250);},[active]);
  // Save on change
  useEffect(()=>{if(stage==="live")dbSave({teams,goals,metrics,columns,celebDur,refreshSec,vendorGoals,layout,photos,dark,fsConfig,customColors});},[teams,goals,metrics,columns,celebDur,layout,photos,dark,stage,fsConfig,customColors]);

  const tc=TCS[active%6];
  // Loading screen
  if(stage==="init"||stage==="autostart")return<div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT}}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{textAlign:"center"}}><Loader2 size={32} color={th.primary} style={{animation:"spin 1s linear infinite",marginBottom:16}}/>
      <p style={{color:th.textMid,fontSize:14}}>{stage==="autostart"?"Carregando dashboard salvo...":"Iniciando..."}</p></div></div>;

  return<div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:FONT}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Space+Grotesk:wght@300..700&display=swap');
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
      @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
      @keyframes spin{to{transform:rotate(360deg)}} @keyframes slideIn{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
      @keyframes timerBar{from{width:0%}to{width:100%}} @keyframes overlayIn{from{opacity:0}to{opacity:1}}
      @keyframes celebPop{from{opacity:0;transform:scale(.7)}50%{transform:scale(1.03)}to{opacity:1;transform:scale(1)}}
      @keyframes celebBounce{0%{transform:scale(.3)}50%{transform:scale(1.15)}70%{transform:scale(.95)}100%{transform:scale(1)}}
      *{margin:0;padding:0;box-sizing:border-box} ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${th.border};border-radius:3px}
      input[type="date"]{color-scheme:${dark?"dark":"light"}} input[type="range"]{height:4px}
    `}</style>
    <Toast items={notifs} th={th}/><Celebration item={celeb} dur={celebDur} onDone={nextCeleb} th={th}/>

    {stage==="setup"&&<Setup teams={teams} setTeams={setTeams} goals={goals} setGoals={setGoals} metrics={metrics} setMetrics={setMetrics}
      columns={columns} onStart={handleStart} loading={loading} celebDur={celebDur} setCelebDur={setCelebDur} th={th}
      savedViews={savedViews} onLoadView={handleLoadView} onSaveView={handleSaveView} refreshSec={refreshSec} setRefreshSec={setRefreshSec}/>}

    {stage==="live"&&<>
      <header style={{padding:"8px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${th.border}`,background:th.headerBg,backdropFilter:"blur(12px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{width:30,height:30,borderRadius:8,background:`linear-gradient(135deg,${th.primary},${th.teal})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Layers size={15} color="#fff"/></div>
          <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>{teams.map((t,i)=>{const c=TCS[i%6],act=i===active;return<button key={i} onClick={()=>switchTeam(i)} style={{padding:"5px 12px",borderRadius:8,border:act?`2px solid ${c.p}`:"2px solid transparent",
            background:act?`${c.p}14`:"transparent",color:act?c.p:th.textMid,fontSize:11,fontWeight:act?700:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,transition:"all .2s",fontFamily:FONT,whiteSpace:"nowrap"}}>
            <span style={{width:7,height:7,borderRadius:"50%",background:act?c.p:th.textDim}}/>{t.name}</button>;})}</div></div>
        <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
          <button onClick={()=>setAutoRot(!autoRot)} style={{background:autoRot?th.primaryLight:"transparent",border:`1px solid ${autoRot?th.primary+"44":th.border}`,borderRadius:8,padding:"4px 10px",cursor:"pointer",color:autoRot?th.primary:th.textMid,fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
            {autoRot?<Play size={10}/>:<Pause size={10}/>}{autoRot?`${rotSec}s`:"—"}</button>
          <button onClick={()=>setSoundOn(!soundOn)} style={{background:"transparent",border:`1px solid ${th.border}`,borderRadius:8,padding:"4px 7px",cursor:"pointer",color:soundOn?th.warning:th.textDim}}>{soundOn?<Volume2 size={12}/>:<VolumeX size={12}/>}</button>
          <button onClick={()=>{setDark(!dark);dbSave({teams,goals,metrics,columns,celebDur,refreshSec,vendorGoals,layout,photos,dark:!dark})}} style={{background:"transparent",border:`1px solid ${th.border}`,borderRadius:8,padding:"4px 7px",cursor:"pointer",color:th.textMid}}>{dark?<Sun size={12}/>:<Moon size={12}/>}</button>
          <button onClick={()=>setShowPanel(!showPanel)} style={{background:showPanel?th.primaryLight:"transparent",border:`1px solid ${showPanel?th.primary+"44":th.border}`,borderRadius:8,padding:"4px 7px",cursor:"pointer",color:showPanel?th.primary:th.textDim}}><Sliders size={12}/></button>
          <button onClick={()=>{const entering=!presMode;setPresMode(entering);if(entering&&!document.fullscreenElement)document.documentElement.requestFullscreen?.();
            if(!entering&&document.fullscreenElement)document.exitFullscreen?.();}} style={{background:`linear-gradient(135deg,${th.primary},${th.teal})`,border:"none",borderRadius:8,padding:"4px 10px",cursor:"pointer",color:"#fff",fontSize:10,fontWeight:600,display:"flex",alignItems:"center",gap:4}}>
            <Monitor size={11}/> {presMode?"Sair TV":"TV"}</button>
          <button onClick={()=>loadAll(teams,true)} disabled={refreshing} style={{background:"transparent",border:`1px solid ${th.border}`,borderRadius:8,padding:"4px 7px",cursor:"pointer",color:th.textMid}}>
            <RefreshCw size={12} style={refreshing?{animation:"spin 1s linear infinite"}:{}}/></button>
          <button onClick={async()=>{dbSave({teams,goals,metrics,columns,celebDur,refreshSec,vendorGoals,layout,photos,dark});setStage("setup")}} style={{background:"transparent",border:`1px solid ${th.border}`,borderRadius:8,padding:"4px 7px",cursor:"pointer",color:th.textDim}}><Settings size={12}/></button>
          <div style={{borderLeft:`1px solid ${th.border}`,paddingLeft:8}}><LiveClock th={th}/></div></div></header>

      {autoRot&&teams.length>1&&<div style={{height:3,background:th.borderLight}}><div key={active} style={{height:"100%",background:`linear-gradient(90deg,${tc.p},${th.teal})`,animation:`timerBar ${rotSec}s linear`}}/></div>}

      <div style={{padding:"14px 16px",maxWidth:1440,margin:"0 auto"}}>
        {showPanel&&<div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:10}}>
          <div style={{flex:"1 1 300px"}}><LayoutPanel layout={layout} setLayout={setLayout} th={th}/></div>
          <div style={{flex:"1 1 300px"}}><ThemeCustomizer customColors={customColors} setCustomColors={setCustomColors} th={th}/></div>
          <div style={{flex:"1 1 300px"}}><FullscreenConfig config={fsConfig} setConfig={setFsConfig} th={th}/></div>
          <div style={{flex:"1 1 300px"}}><PhotoManager photos={photos} setPhotos={setPhotos} ranking={Object.keys(teamsData[active]?.[0]||{}).find(c=>c.toUpperCase().includes("VENDEDOR"))?
            [...new Set((teamsData[active]||[]).map(r=>String(r[Object.keys(r).find(c=>c.toUpperCase().includes("VENDEDOR"))]||"").trim()).filter(v=>v&&v!=="-"))].map(n=>({name:n})):[]} th={th}/></div>
        </div>}
        <TeamView team={teams[active]} data={teamsData[active]} metrics={metrics} tc={tc} goals={goals}
          dateRange={dateRange} setDateRange={setDateRange} trans={trans} layout={layout} photos={photos} th={th}
          presMode={presMode} fsConfig={fsConfig} fsPrimary={fsPrimary} onExitPres={()=>{setPresMode(false);if(document.fullscreenElement)document.exitFullscreen?.();}}
          vendorGoals={vendorGoals} setVendorGoals={setVendorGoals} setGoals={setGoals} columns={columns}/>
      </div>

      {teams.length>1&&<div style={{position:"fixed",bottom:14,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6,padding:"6px 14px",
        background:th.headerBg,backdropFilter:"blur(10px)",borderRadius:16,border:`1px solid ${th.border}`}}>
        {teams.map((_,i)=>{const c=TCS[i%6];return<button key={i} onClick={()=>switchTeam(i)} style={{width:i===active?24:8,height:8,borderRadius:4,background:i===active?c.p:th.textDim,border:"none",cursor:"pointer",transition:"all .3s"}}/>;})}
      </div>}
    </>}
  </div>;
}
