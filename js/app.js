import { AnswerChecker } from 'https://tt-sensei.github.io/edu-components/index.js';

const SCALES={1000:{name:'1kgのはかり',step:5},2000:{name:'2kgのはかり',step:10},4000:{name:'4kgのはかり',step:20}};
const NAVIANS=Array.from({length:24},(_,i)=>`https://raw.githubusercontent.com/TT-sensei/navi-character-/main/assets/web/fantasy/monsters/zako/${['happa-squirrel-leafy','komorin-little-night-bat','purun-little-magic-slime','ember-frost-pup','sakura-snow-puff','star-bat','night-snow-puff','sunset-puru','mizutama-kappa','lantern-firefly','cloud-rain-rabbit','pebble-ram','rainbow-shell-snail','bubblefin-frog','ribbon-tailed-mouse','cobalt-blade-mantis','frostfang-weasel','thunderclaw-ram','skyfin-shark','lantern-eye-moth','pond-mirror-spirit','candy-coral-slug','mossy-porcupine','steam-sprocket-mole'][i]}.webp`);
let maxWeight=1000,step=5,target=0,anim=null,locked=false,currentNavian=-1;
const RECORDS_KEY='omosa-hakari-navian-records-v1';
let records=JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}');
function saveRecords(){localStorage.setItem(RECORDS_KEY,JSON.stringify(records));}
function recordWeight(weight){
  const key=String(currentNavian);
  const r=records[key]||{count:0,min:null,max:null,last:null};
  r.count++;
  r.min=r.min===null?weight:Math.min(r.min,weight);
  r.max=r.max===null?weight:Math.max(r.max,weight);
  r.last=weight;
  records[key]=r;
  saveRecords();
  renderBook();
}
function renderBook(){
  const grid=$('bookGrid'); if(!grid)return;
  grid.innerHTML=NAVIANS.map((src,i)=>{
    const r=records[String(i)];
    return '<article class="book-card'+(r?' recorded':'')+'"><img src="'+src+'" alt="ナビアン '+(i+1)+'"><div class="book-card-body"><h3>ナビアン '+String(i+1).padStart(2,'0')+'</h3>'+
      (r?'<div class="book-record"><span>測った回数 <strong>'+r.count+'</strong>回</span><span>最小 <strong>'+r.min+'</strong>g</span><span>最大 <strong>'+r.max+'</strong>g</span></div><p class="book-last">最近の記録　'+r.last+'g</p>':'<p class="book-unrecorded">まだ測っていないよ</p>')+
      '</div></article>';
  }).join('');
}
const $=id=>document.getElementById(id);
const checker=new AnswerChecker({numeric:true,eventTarget:document});

document.querySelectorAll('.scale-card').forEach(btn=>btn.addEventListener('click',()=>start(Number(btn.dataset.max))));
$('bookBtn').addEventListener('click',openBook);
$('bookClose').addEventListener('click',closeBook);
$('answerBtn').addEventListener('click',answer);$('hintBtn').addEventListener('click',showHint);
$('answer').addEventListener('keydown',e=>{if(e.key==='Enter')answer()});

function showTitle(){cancelAnimationFrame(anim);locked=false;$('book').classList.add('hidden');$('app').classList.add('hidden');$('start').classList.remove('hidden')}
function openBook(){renderBook();$('book').classList.remove('hidden')}
function closeBook(){$('book').classList.add('hidden')}
function start(max){maxWeight=max;step=SCALES[max].step;renderBook();$('start').classList.add('hidden');$('app').classList.remove('hidden');buildDial();spawn()}
function buildDial(){const svg=$('dialSvg');svg.innerHTML='';const NS='http://www.w3.org/2000/svg',cx=310,cy=310,r=255,intervals=maxWeight/step;
const circle=document.createElementNS(NS,'circle');circle.setAttribute('cx',cx);circle.setAttribute('cy',cy);circle.setAttribute('r',r);circle.setAttribute('fill','none');circle.setAttribute('stroke','#cbd3dc');circle.setAttribute('stroke-width','3');svg.appendChild(circle);
for(let i=0;i<=intervals;i++){const a=-Math.PI/2+(i/intervals)*Math.PI*2,major=i%20===0,mid=i%10===0,inner=r-(major?30:mid?22:14),x1=cx+Math.cos(a)*inner,y1=cy+Math.sin(a)*inner,x2=cx+Math.cos(a)*r,y2=cy+Math.sin(a)*r;
const line=document.createElementNS(NS,'line');line.setAttribute('x1',x1);line.setAttribute('y1',y1);line.setAttribute('x2',x2);line.setAttribute('y2',y2);line.setAttribute('stroke','#344054');line.setAttribute('stroke-width',major?'3':mid?'2':'1.2');svg.appendChild(line);
if(major&&i<intervals){const text=document.createElementNS(NS,'text');const tr=r-56;text.setAttribute('x',cx+Math.cos(a)*tr);text.setAttribute('y',cy+Math.sin(a)*tr+6);text.setAttribute('text-anchor','middle');text.textContent=Math.round((i/intervals)*maxWeight);text.setAttribute('font-size','19');text.setAttribute('font-weight','800');text.setAttribute('fill','#24344f');svg.appendChild(text)}}const unit=document.createElementNS(NS,'text');unit.setAttribute('x',cx);unit.setAttribute('y',cy+8);unit.setAttribute('text-anchor','middle');unit.textContent='g';unit.setAttribute('font-size','20');unit.setAttribute('font-weight','800');unit.setAttribute('fill','#667085');svg.appendChild(unit)}
function spawn(){cancelAnimationFrame(anim);locked=false;$('answer').value='';$('answer').disabled=true;$('answerBtn').disabled=true;$('nextBtn').classList.add('hidden');$('feedback').textContent='';$('feedback').className='feedback';$('hint').textContent='';$('hint').classList.add('hidden');$('message').textContent='ナビアンが はかりにのったよ。';$('message').className='question-message';target=(Math.floor(Math.random()*(maxWeight/step-1))+1)*step;currentNavian=Math.floor(Math.random()*NAVIANS.length);$('navian').className='navian on-pan';const img=NAVIANS[currentNavian];$('navian').src=img;const from=0,to=weightAngle(target),duration=900,t0=performance.now();function tick(t){const p=Math.min(1,(t-t0)/duration),e=1-Math.pow(1-p,3),deg=from+(to-from)*e;setPointer(deg);if(p<1)anim=requestAnimationFrame(tick);else{setPointer(to);locked=true;$('answer').disabled=false;$('answerBtn').disabled=false;$('message').textContent='針が止まったよ。目盛を読もう。';/* 入力欄へ自動フォーカスしない。はかりを見ることを優先する。 */}}anim=requestAnimationFrame(tick)}
function weightAngle(weight){return (weight/maxWeight)*360}
function setPointer(deg){$('pointer').style.transform=`rotate(${deg}deg)`}
function answer(){if(!locked)return;const value=Number($('answer').value);if(!Number.isFinite(value))return;locked=false;$('answer').disabled=true;$('answerBtn').disabled=true;
const exact=value===target;recordWeight(target);const accepted=checker.check(value,target,{numeric:true,comparator:(a,b)=>Math.abs(Number(a)-Number(b))<=step,detail:{target,scale:maxWeight,step,exact}});
if(accepted){if(exact){$('feedback').textContent='ぴったり！ '+target+'g';}else{$('feedback').textContent='おしい！ '+target+'g';} $('feedback').className='feedback correct';}
else{$('feedback').textContent='正解は '+target+'g。針の先と目盛をもう一度見よう。';$('feedback').className='feedback wrong';}
$('nextBtn').classList.remove('hidden')}
$('nextBtn').addEventListener('click',spawn);

function showHint(){if(!locked)return;$('hint').textContent='このはかりは、1めもり '+step+'g だよ。';$('hint').classList.remove('hidden');}

renderBook();
