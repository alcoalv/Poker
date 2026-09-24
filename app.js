/* Poker Table: static browser UI and preset-size poker wagering. */
(() => {
  'use strict';
  const P = window.Poker;
  const app = document.querySelector('#app');
  const AI_NAMES = ['Mira', 'Jude', 'Nora', 'Theo', 'Iris'];
  const STORAGE_KEY = 'poker-table-progression-v1';
  const TIERS = [
    { name:'No Tier', at:0, icon:'♠' },
    { name:'Silver Spoon', at:1000, icon:'🥄' },
    { name:'Gold Spoon', at:5000, icon:'🥇' },
    { name:'Platinum Spoon', at:15000, icon:'✦' },
    { name:'Challenger Spoon', at:40000, icon:'♛' },
    { name:'Legendary Spoon', at:100000, icon:'★' }
  ];
  const HANDS = [
    ['로열 스트레이트 플러시', '10♠ J♠ Q♠ K♠ A♠', '같은 무늬의 10부터 A'],
    ['스트레이트 플러시', '5♥ 6♥ 7♥ 8♥ 9♥', '같은 무늬로 연속 5장'],
    ['포카드', 'Q♠ Q♥ Q♦ Q♣ 7♠', '같은 숫자 4장'],
    ['풀하우스', '10♠ 10♥ 10♦ 7♠ 7♥', '트리플 + 원페어'],
    ['플러시', 'A♦ J♦ 8♦ 5♦ 2♦', '같은 무늬 5장'],
    ['스트레이트', '8♠ 9♦ 10♣ J♥ Q♠', '연속 5장'],
    ['트리플', '7♠ 7♥ 7♦ K♣ 2♠', '같은 숫자 3장'],
    ['투페어', 'A♠ A♥ 8♣ 8♦ 3♠', '서로 다른 페어 2개'],
    ['원페어', 'Q♠ Q♦ A♥ 9♣ 4♠', '같은 숫자 2장'],
    ['하이 카드', 'A♠ J♦ 9♣ 6♥ 3♠', '조합이 없으면 높은 카드 순']
  ];
  const TUTORIALS = {
    holdem: [
      { title: '테이블과 목표', text: '각자 비공개 카드(Hole Cards) 2장을 받고, 모두가 공유하는 커뮤니티 카드 5장과 합쳐 가장 강한 5장을 만듭니다. 패가 같으면 5장의 숫자를 차례대로 비교합니다.', prompt: '먼저 카드가 놓이는 자리를 살펴보세요.', button: '카드 받기' },
      { title: '버튼과 블라인드', text: '버튼(Button)은 딜러 자리 표시입니다. 버튼 왼쪽의 스몰 블라인드 10칩, 그다음 빅 블라인드 20칩이 먼저 들어갑니다. 팟(Pot)은 이 판에 걸린 칩의 합계입니다.', prompt: '당신의 A♠ K♠는 다른 사람에게 보이지 않는 홀 카드입니다.', button: '프리플랍 시작' },
      { title: '프리플랍 · 첫 결정', text: '공용 카드가 열리기 전입니다. 폴드(Fold)는 포기, 콜(Call)은 현재 베팅에 맞추기, 레이즈(Raise)는 올리기입니다. 레이즈는 1·2·4배 중 선택하며, ALL-IN은 남은 칩 전부를 겁니다. 지금은 빅 블라인드 20칩에 콜합니다.', prompt: '직접 CALL을 눌러 보세요.', button: 'CALL', action: true },
      { title: '플랍 · 처음 세 장', text: '플랍(Flop)은 처음 공개되는 공용 카드 3장입니다. A♦가 열려 내 A♠와 원페어가 됐습니다. 체크(Check)는 추가 베팅 없이 차례를 넘기는 행동입니다.', prompt: '현재 베팅이 없으니 CHECK를 해보세요.', button: 'CHECK', action: true },
      { title: '턴 · 네 번째 카드', text: '턴(Turn)에서 K♦가 열려 A와 K의 투페어가 됐습니다. 베트(Bet)는 아무도 베팅하지 않았을 때 처음 거는 행동입니다. 다른 사람이 베팅하면 콜·레이즈·폴드 중 선택합니다.', prompt: '이번에는 BET로 먼저 베팅해 보세요.', button: 'BET', action: true },
      { title: '리버 · 마지막 카드', text: '리버(River)에 K♣가 열렸습니다. 현재 최선의 5장은 K♠ K♦ K♣ A♠ A♦, 즉 K 풀하우스입니다. 내 카드 2장을 반드시 모두 쓸 필요는 없고, 공용 카드만 5장 써도 됩니다.', prompt: 'CALL로 마지막 베팅을 맞추고 쇼다운에 가보세요.', button: 'CALL', action: true },
      { title: '쇼다운과 팟 분배', text: '쇼다운(Showdown)에서 남은 사람이 카드를 공개합니다. 상대의 A♥ Q♦는 A와 K 투페어이고, 내 K 풀하우스가 이깁니다. 족보가 완전히 같으면 무늬로 승자를 정하지 않고 팟을 나눕니다.', prompt: '마지막으로 열 가지 족보의 채점 순서를 확인해 보세요.', button: '족보 살펴보기' },
      { title: '족보와 채점', text: '로열 스트레이트 플러시가 최강, 하이 카드가 최약입니다. 같은 족보끼리는 핵심 숫자와 키커를 높은 순으로 비교합니다. A는 A-2-3-4-5에서만 낮게 쓸 수 있고 무늬에는 우열이 없습니다.', prompt: '아래 족보표를 확인했습니다. 플레이 중에는 ? HAND GUIDE를 언제든 열 수 있습니다.', button: '튜토리얼 완료' }
    ],
    stud: [
      { title: '세븐 스터드의 목표', text: '공용 카드 없이 각자 일곱 장을 받습니다. 처음 두 장과 마지막 한 장은 비공개, 나머지 네 장은 공개하며 최선의 5장으로 승부합니다.', prompt: '상대의 공개 카드(Up Cards)를 보고 가능한 패를 추론합니다.', button: '카드 받기' },
      { title: '앤티와 서드 스트리트', text: '모두 앤티(Ante) 5칩을 냅니다. 처음에 비공개 2장(Down Cards)과 공개 1장(Door Card)을 받습니다. 가장 낮은 도어 카드를 가진 사람이 브링인(Bring-in)을 내고 베팅을 시작합니다.', prompt: '내 A♠ K♠는 비공개, Q♠는 도어 카드입니다.', button: 'CALL', action: true },
      { title: '포스 스트리트', text: '네 번째 카드 J♠가 앞면으로 열립니다. 여기부터는 공개된 카드가 가장 강한 사람부터 행동합니다. 체크는 베팅이 없을 때만 가능합니다.', prompt: '상대가 체크했습니다. CHECK를 선택하세요.', button: 'CHECK', action: true },
      { title: '피프스 스트리트', text: '다섯 번째 카드 10♠가 앞면으로 열립니다. 이제 비공개 A♠ K♠와 연결하면 로열 스트레이트 플러시가 완성됩니다. 기본 베팅 단위는 40칩으로 커지며 BET 1·2·4배나 ALL-IN을 선택할 수 있습니다.', prompt: 'BET으로 베팅해 보세요.', button: 'BET', action: true },
      { title: '식스스 스트리트', text: '여섯 번째 카드 4♦가 공개됩니다. 내 공개 카드 Q♠ J♠ 10♠ 4♦가 상대에게도 보입니다. 상대의 공개 카드 또한 상대가 가질 수 있는 패를 추론할 단서입니다.', prompt: '상대 베팅에 CALL하세요.', button: 'CALL', action: true },
      { title: '세븐스 스트리트 · 리버', text: '마지막 카드는 비공개(Down Card)로 받습니다. 일곱 장 중 최선의 다섯 장으로 판정하며 카드 무늬 자체에는 우열이 없습니다.', prompt: 'CHECK로 마지막 결정을 마치세요.', button: 'CHECK', action: true },
      { title: '쇼다운 · 최강의 패', text: '내 A♠ K♠ Q♠ J♠ 10♠는 로열 스트레이트 플러시로 최강의 족보입니다. 상대의 풀하우스를 이깁니다. 둘 다 같은 5장 가치라면 팟을 나눕니다.', prompt: '마지막으로 최강부터 최약까지 족보를 확인해 보세요.', button: '족보 살펴보기' },
      { title: '족보와 채점', text: '내 패는 1위 로열 스트레이트 플러시, 가장 약한 패는 10위 하이 카드입니다. 같은 족보라면 숫자와 키커를 비교하고, 무늬만 다르면 무승부로 팟을 나눕니다.', prompt: '아래 족보표를 확인했습니다. 플레이 중에는 ? HAND GUIDE를 언제든 열 수 있습니다.', button: '튜토리얼 완료' }
    ]
  };
  const tc = (r, s) => ({ r, s });
  function safeCount(n) { return Number.isSafeInteger(n) && n>=0 ? n : 0; }
  function loadProgress() {
    try {
      const raw=JSON.parse(window.localStorage.getItem(STORAGE_KEY)||'{}');
      return { earnings:safeCount(raw.earnings), wins:safeCount(raw.wins), hands:safeCount(raw.hands), persistent:true };
    } catch (_) { return { earnings:0, wins:0, hands:0, persistent:false }; }
  }
  let ui = { screen: 'home', mode: 'holdem', count: 4, difficulty: 'normal', guide: false, pause: false, tiers: false, lesson: 0, tutorialFeedback: '', game: null, epoch: 0, progress: loadProgress() };
  const label = mode => mode === 'stud' ? 'SEVEN CARD STUD' : "TEXAS HOLD’EM";
  const money = n => n.toLocaleString('ko-KR');
  function currentTier(earnings=ui.progress.earnings) { return TIERS.reduce((tier,candidate)=>earnings>=candidate.at?candidate:tier,TIERS[0]); }
  function nextTier() { return TIERS[TIERS.indexOf(currentTier())+1]||null; }
  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY,JSON.stringify({ earnings:ui.progress.earnings,wins:ui.progress.wins,hands:ui.progress.hands }));
      ui.progress.persistent=true;
    } catch (_) { ui.progress.persistent=false; }
  }
  function tierPanel(compact=false) {
    const tier=currentTier(),next=nextTier(),earned=ui.progress.earnings;
    const percentage=next?Math.min(100,Math.max(0,(earned-tier.at)/(next.at-tier.at)*100)):100;
    return `<div class="tier-panel ${compact?'compact':''}"><div class="tier-line"><span class="tier-medal">${tier.icon}</span><div><span class="eyebrow">${compact?'YOUR TIER':'YOUR SPOON TIER'}</span><strong>${tier.name}</strong></div><span class="tier-total">누적 상금 <b>● ${money(earned)}</b></span></div><div class="tier-track"><i style="width:${percentage}%"></i></div><div class="tier-next">${next?`다음 ${next.name}까지 ● ${money(next.at-earned)}`:'최고 티어 달성'} <button data-do="tiers">티어 기준 보기 →</button></div></div>`;
  }
  const seatAfter = (i, n) => (i + 1) % n;
  function cardHTML(c, opts = {}) {
    const cls = ['card', opts.small ? 'small' : '', opts.highlight ? 'highlight' : '', !c ? 'empty' : c === 'back' ? 'back' : ['h', 'd'].includes(c.s) ? 'red' : ''].filter(Boolean).join(' ');
    if (!c || c === 'back') return `<div class="${cls}" aria-label="${c ? '뒷면 카드' : '빈 자리'}"></div>`;
    const face = c.r > 10 ? ({ 11:'J', 12:'Q', 13:'K', 14:'A' })[c.r] : String(c.r);
    return `<div class="${cls}" aria-label="${P.face(c)}"><div class="corner">${face}<span>${P.glyph(c)}</span></div><div class="center">${P.glyph(c)}</div></div>`;
  }
  function header() {
    return `<header class="topbar"><div class="brand">♠ <span>POKER</span> TABLE <span class="hide-mobile">/ PLAY & LEARN</span></div><div class="top-actions">${ui.screen !== 'home' ? '<button class="ghost" data-do="home">⌂ 메인 메뉴</button>' : ''}${ui.screen === 'game' ? '<button class="ghost" data-do="pause">Ⅱ 일시정지</button>' : ''}<button class="chip-btn" data-do="tiers">♛ TIERS</button>${ui.screen !== 'home' ? '<button class="chip-btn" data-do="guide">? HAND GUIDE</button>' : ''}</div></header>`;
  }
  function homeView() {
    return `<main class="home"><section class="hero"><div><div class="eyebrow">A CARD GAME FOR CURIOUS MINDS</div><h1>Make your<br><em>move.</em></h1><p>카드를 읽고, 상대를 살피고, 한 장씩 배우세요. 세븐 스터드와 텍사스 홀덤을 AI 플레이어와 즐길 수 있습니다.</p><div class="hero-actions"><button class="primary" data-do="setup">START GAME &nbsp; ↗</button><button class="ghost" data-do="tutorial-menu">▶ TUTORIAL</button></div>${tierPanel()}<p class="tiny">무료 브라우저 게임 · 로그인 불필요 · 칩은 게임 내 가상 칩입니다</p></div><div class="hero-art" aria-hidden="true"><div class="art-label">The game is on.</div><div class="art-cards">${cardHTML(tc(14,'s'))}${cardHTML(tc(13,'s'))}${cardHTML(tc(12,'s'))}</div><div class="art-chip">100</div></div></section></main>`;
  }
  function menuView(tutorial) {
    return `<main class="setup-wrap"><div class="eyebrow">${tutorial ? 'LEARN BY PLAYING' : 'PICK YOUR TABLE'}</div><h1 class="screen-title">${tutorial ? '어떤 게임을 배울까요?' : '게임 설정'}</h1><p class="muted">${tutorial ? '각 모드의 한 판을 직접 진행하며 카드, 베팅, 족보를 익힙니다.' : '게임 모드와 AI 상대 수를 선택하세요. 모두 같은 1,000칩으로 시작합니다.'}</p><div class="mode-grid"><button class="mode-card ${!tutorial && ui.mode === 'stud' ? 'selected' : ''}" data-do="${tutorial ? 'learn-stud' : 'mode-stud'}"><span class="eyebrow">01 / NO SHARED CARDS</span><strong>Seven Card Stud</strong><small>7장을 각자 받으며 공개 카드와 비공개 카드로 겨룹니다. 앤티 · 브링인 · 서드부터 세븐스 스트리트.</small></button><button class="mode-card ${!tutorial && ui.mode === 'holdem' ? 'selected' : ''}" data-do="${tutorial ? 'learn-holdem' : 'mode-holdem'}"><span class="eyebrow">02 / SHARED BOARD</span><strong>Texas Hold’em</strong><small>개인 카드 2장과 공용 카드 5장. 블라인드 · 플랍 · 턴 · 리버.</small></button></div>${tutorial ? '<p class="tiny">각 튜토리얼은 약 5분 분량이며 ? HAND GUIDE로 족보를 확인할 수 있습니다.</p>' : `<div class="field-row"><label class="field">테이블 인원 (나 + AI)<select id="players">${[2,3,4,5,6].map(n=>`<option value="${n}" ${n===ui.count?'selected':''}>${n}명 · AI ${n-1}명</option>`).join('')}</select></label><label class="field">AI 난이도<select id="difficulty"><option value="easy" ${ui.difficulty==='easy'?'selected':''}>Easy · 기본 패 위주</option><option value="normal" ${ui.difficulty==='normal'?'selected':''}>Normal · 팟과 공개 카드 고려</option><option value="hard" ${ui.difficulty==='hard'?'selected':''}>Hard · 상대 범위와 블러핑 고려</option></select></label></div><div class="setup-footer"><span class="tiny">베팅 1×·2×·4×·올인 · 매 판 딜러 버튼 이동</span><button class="primary" data-do="start">테이블 입장 →</button></div>`}</main>`;
  }
  function eligible(g, i) { const p = g.players[i]; return !p.folded && p.stack > 0; }
  function live(g) { return g.players.filter(p => !p.folded); }
  function pot(g) { return g.players.reduce((sum, p) => sum + p.total, 0); }
  function pay(g, i, amount) { const p = g.players[i]; const paid = Math.min(p.stack, amount); p.stack -= paid; p.bet += paid; p.total += paid; return paid; }
  function draw(g) { const c = g.deck.pop(); if (!c) throw new Error('Deck exhausted'); return c; }
  function nextEligible(g, from, predicate = i => eligible(g, i)) {
    for (let step = 1; step <= g.players.length; step++) { const i = (from + step) % g.players.length; if (predicate(i)) return i; }
    return null;
  }
  function log(g, line) { g.logs.unshift(line); g.logs = g.logs.slice(0, 8); }
  function startGame() {
    ui.epoch++;
    ui.game = { mode: ui.mode, difficulty: ui.difficulty, players: Array.from({length: ui.count}, (_, i) => ({ name: i ? AI_NAMES[i-1] : 'YOU', stack: 1000, cards: [], folded: false, bet: 0, total: 0 })), dealer: -1, hand: 0, deck: [], board: [], street: 0, currentBet: 0, minRaise:20, pending: new Set(), acted:new Set(), actor: null, finished: false, logs: [], result: '', prize:0, tierPromotion:null, winners:[], refunds:0 };
    ui.screen = 'game'; newHand();
  }
  function newHand() {
    ui.epoch++;
    const g = ui.game;
    if (!g || g.players[0].stack === 0) { if (g) { g.result = '칩을 모두 사용했습니다. 다시 시작해 주세요.'; g.finished = true; render(); } return; }
    for (const p of g.players) { p.cards = []; p.folded = p.stack === 0; p.bet = 0; p.total = 0; }
    if (g.players.filter(p => !p.folded).length < 2) { g.result = 'AI 플레이어의 칩이 모두 소진됐습니다. 새 게임을 시작해 주세요.'; g.finished = true; render(); return; }
    g.dealer = nextEligible(g, g.dealer);
    g.hand++; g.street = 0; g.currentBet = 0; g.minRaise=20; g.acted=new Set(); g.finished = false; g.result = ''; g.prize=0; g.tierPromotion=null; g.winners=[]; g.refunds=0; g.logs = [];
    g.deck = P.shuffle(P.deck()); g.board = [];
    if (g.mode === 'holdem') {
      for (let k = 0; k < 2; k++) for (let i = 0; i < g.players.length; i++) if (!g.players[i].folded) g.players[i].cards.push(draw(g));
      g.board = Array.from({length:5}, () => draw(g));
      const sb = g.players.filter(p=>!p.folded).length===2 ? g.dealer : nextEligible(g, g.dealer);
      const bb = nextEligible(g, sb);
      pay(g, sb, 10); pay(g, bb, 20); g.currentBet = Math.max(g.players[sb].bet, g.players[bb].bet);
      log(g, `${g.players[sb].name} 스몰 블라인드 10 · ${g.players[bb].name} 빅 블라인드 20`);
      g.pending = new Set(g.players.map((_,i)=>i).filter(i=>eligible(g,i)));
      advance(g, bb);
    } else {
      for (let i=0;i<g.players.length;i++) if (!g.players[i].folded) pay(g,i,5);
      for (const p of g.players) p.bet=0; // Antes belong to the pot, not the first betting round.
      for (let k=0;k<3;k++) for (let i=0;i<g.players.length;i++) if (!g.players[i].folded) g.players[i].cards.push(draw(g));
      let bring = -1;
      const suitTies = { c:0, d:1, h:2, s:3 }; // Only the bring-in uses a suit tiebreak.
      for (let i=0;i<g.players.length;i++) if (!g.players[i].folded && (bring<0 || g.players[i].cards[2].r < g.players[bring].cards[2].r || (g.players[i].cards[2].r === g.players[bring].cards[2].r && suitTies[g.players[i].cards[2].s] < suitTies[g.players[bring].cards[2].s]))) bring=i;
      pay(g,bring,10); g.currentBet = g.players[bring].bet;
      log(g, `모두 앤티 5 · ${g.players[bring].name} 브링인 10`);
      g.pending = new Set(g.players.map((_,i)=>i).filter(i=>eligible(g,i)));
      advance(g,bring);
    }
  }
  function unit(g) { return g.street >= 2 ? 40 : 20; }
  function targetBet(g, multiple=1) { return g.currentBet<unit(g) ? unit(g)*multiple : g.currentBet+g.minRaise*multiple; }
  function actions(g, i) {
    const p = g.players[i], need = Math.max(0, g.currentBet - p.bet);
    const rivalCanAct=live(g).some(q=>q!==p && q.stack>0);
    const raiseRight=(!g.acted.has(i) || g.currentBet<unit(g)) && rivalCanAct;
    return { need, canRaise:raiseRight && p.stack>=targetBet(g)-p.bet, canAllIn:p.stack>0 && (p.bet+p.stack<=g.currentBet || raiseRight), canCheck:need===0, canCall:need>0&&p.stack>0, canFold:true };
  }
  function advance(g, from) {
    if (live(g).length === 1) { finish(g); return; }
    for (const i of [...g.pending]) if (!eligible(g,i)) g.pending.delete(i);
    if (g.pending.size === 0) { nextStreet(g); return; }
    const actor = nextEligible(g,from,i=>g.pending.has(i) && eligible(g,i));
    if (actor === null) { nextStreet(g); return; }
    g.actor = actor; render(); scheduleAI();
  }
  function exposedScore(cards) {
    const counts = new Map(); cards.forEach(c => counts.set(c.r,(counts.get(c.r)||0)+1));
    const groups = [...counts].map(([r,n])=>[n,r]).sort((a,b)=>b[0]-a[0]||b[1]-a[1]);
    return [...groups.flat(),...cards.map(c=>c.r).sort((a,b)=>b-a)];
  }
  function opener(g) {
    if (g.mode === 'holdem') return nextEligible(g,g.dealer);
    let best = null;
    for (let i=0;i<g.players.length;i++) if (eligible(g,i)) {
      const s = exposedScore(g.players[i].cards.slice(2,Math.min(g.players[i].cards.length,6)));
      if (best===null || P.compare(s,best.score)>0) best={i,score:s};
    }
    return best ? best.i : null;
  }
  function nextStreet(g) {
    g.street++;
    if (g.street >= (g.mode === 'holdem' ? 4 : 5)) { finish(g); return; }
    if (g.mode === 'stud') for (const p of g.players) if (!p.folded) p.cards.push(draw(g));
    for (const p of g.players) p.bet=0;
    g.currentBet=0; g.minRaise=unit(g); g.acted=new Set();
    g.pending=new Set(g.players.map((_,i)=>i).filter(i=>eligible(g,i)));
    log(g, streetName(g) + ' 시작');
    if (g.pending.size === 0 || g.pending.size === 1 && live(g).length === 1) { nextStreet(g); return; }
    const first=opener(g);
    if (first===null) { nextStreet(g); return; }
    advance(g,(first+g.players.length-1)%g.players.length);
  }
  function takeAction(kind) {
    const g=ui.game;
    if (!g || g.finished || ui.pause || ui.guide || ui.tiers || g.actor===null) return;
    const i=g.actor,p=g.players[i],allowed=actions(g,i);
    const isSized=/^(bet|raise)[124]$/.test(kind);
    if (kind==='check' && !allowed.canCheck || kind==='call' && !allowed.canCall || isSized && !allowed.canRaise || kind==='allin' && !allowed.canAllIn) return;
    if (kind==='fold') { p.folded=true; g.pending.delete(i); g.acted.add(i); log(g,`${p.name} 폴드`); }
    else if (kind==='check') { g.pending.delete(i); g.acted.add(i); log(g,`${p.name} 체크`); }
    else if (kind==='call') { const paid=pay(g,i,allowed.need); g.pending.delete(i); g.acted.add(i); log(g,`${p.name} ${paid===allowed.need?'콜':'올인 콜'} ${money(paid)}`); }
    else if (isSized) {
      const multiple=Number(kind.at(-1)),target=targetBet(g,multiple);
      if(p.stack<target-p.bet)return;
      const previous=g.currentBet;
      pay(g,i,target-p.bet); g.currentBet=target;
      g.minRaise=previous<unit(g)?Math.max(unit(g),target-previous):target-previous;
      g.acted=new Set([i]);
      g.pending=new Set(g.players.map((_,j)=>j).filter(j=>j!==i && eligible(g,j)));
      log(g,`${p.name} ${previous?'레이즈':'베트'} ×${multiple} → ${money(target)}`);
    } else if (kind==='allin') {
      const previous=g.currentBet,minimum=targetBet(g,1),target=p.bet+p.stack,paid=pay(g,i,p.stack);
      g.pending.delete(i); g.acted.add(i);
      if(target>previous){
        g.currentBet=target;
        if(target>=minimum){
          g.minRaise=previous<unit(g)?Math.max(unit(g),target-previous):target-previous;
          g.acted=new Set([i]);
          g.pending=new Set(g.players.map((_,j)=>j).filter(j=>j!==i && eligible(g,j)));
        }else for(let j=0;j<g.players.length;j++)if(j!==i && eligible(g,j) && g.players[j].bet<target)g.pending.add(j);
      }
      log(g,`${p.name} 올인 ${money(paid)} · 총 베팅 ${money(target)}`);
    } else return;
    advance(g,i);
  }
  function bestFor(g,p) { return P.evaluate(g.mode==='holdem' ? [...p.cards,...g.board] : p.cards); }
  function finish(g) {
    if(g.finished)return;
    g.finished=true; g.actor=null; ui.epoch++;
    const survivors=live(g);
    const ranks=new Map(survivors.map(p=>[p,bestFor(g,p)]));
    const levels=[...new Set(g.players.map(p=>p.total).filter(Boolean))].sort((a,b)=>a-b);
    let previous=0; const winnings=new Map(); g.refunds=0;
    for (const level of levels) {
      const participants=g.players.filter(p=>p.total>=level);
      const amount=(level-previous)*participants.length;
      if(participants.length===1){ // No opponent matched this portion; return it, without counting a prize.
        participants[0].stack+=amount;g.refunds+=amount;previous=level;continue;
      }
      let candidates=participants.filter(p=>!p.folded);
      if (!candidates.length) candidates=survivors; // Defensive fallback for a short unmatched wager.
      let winners=[];
      for (const p of candidates) {
        if (!winners.length) winners=[p];
        else { const cmp=ranks.get(p)&&ranks.get(winners[0]) ? P.compare(ranks.get(p).score,ranks.get(winners[0]).score) : 0; if (cmp>0) winners=[p]; else if (cmp===0) winners.push(p); }
      }
      const share=Math.floor(amount/winners.length),remainder=amount%winners.length;
      winners.forEach(p=>{ p.stack+=share; winnings.set(p,(winnings.get(p)||0)+share); });
      // Odd chips go clockwise from the dealer.
      const order=[]; for(let step=1;step<=g.players.length;step++) { const p=g.players[(g.dealer+step)%g.players.length]; if(winners.includes(p)) order.push(p); }
      for(let k=0;k<remainder;k++){order[k].stack++;winnings.set(order[k],winnings.get(order[k])+1);}
      previous=level;
    }
    g.winners=[...winnings].filter(([,v])=>v>0).map(([p,amount])=>({i:g.players.indexOf(p),name:p.name,amount}));
    const winners=g.winners.map(w=>`${w.name} +${money(w.amount)}`);
    const oldTier=currentTier();
    g.prize=winnings.get(g.players[0])||0;
    ui.progress.earnings=Math.min(Number.MAX_SAFE_INTEGER,ui.progress.earnings+g.prize);
    ui.progress.hands=Math.min(Number.MAX_SAFE_INTEGER,ui.progress.hands+1);
    if(g.prize>0)ui.progress.wins=Math.min(Number.MAX_SAFE_INTEGER,ui.progress.wins+1);
    if(currentTier()!==oldTier)g.tierPromotion=currentTier().name;
    saveProgress();
    g.result=`${survivors.length===1 ? '모두 폴드' : '쇼다운'} · ${winners.join(' · ')}`;
    log(g,g.result); render();
  }
  function knownCardsForAI(g,i) {
    const own=g.players[i].cards;
    const visible=g.mode==='holdem'?g.board.slice(0,[0,3,4,5][g.street]):g.players.flatMap((p,j)=>j===i?[]:p.folded?[]:p.cards.slice(2,Math.min(6,p.cards.length)));
    return [...own,...visible];
  }
  function estimateEquity(g,i,trials) {
    const me=g.players[i], opponents=g.players.map((p,j)=>({p,j})).filter(({p,j})=>j!==i&&!p.folded);
    if (!opponents.length) return 1;
    const known=knownCardsForAI(g,i),used=new Set(known.map(c=>P.face(c))),pool=P.deck().filter(c=>!used.has(P.face(c)));
    let win=0;
    for(let t=0;t<trials;t++){
      const d=P.shuffle(pool.slice());
      let mine,others=[];
      if(g.mode==='holdem'){
        const board=[...g.board.slice(0,[0,3,4,5][g.street])];while(board.length<5)board.push(d.pop());
        mine=P.evaluate([...me.cards,...board]);
        others=opponents.map(()=>P.evaluate([d.pop(),d.pop(),...board]));
      }else{
        const mineCards=me.cards.slice();while(mineCards.length<7)mineCards.push(d.pop());
        mine=P.evaluate(mineCards);
        others=opponents.map(({p})=>{const cards=[...p.cards.slice(2,Math.min(p.cards.length,6))];while(cards.length<7)cards.push(d.pop());return P.evaluate(cards);});
      }
      const better=others.some(r=>P.compare(r.score,mine.score)>0);
      const ties=others.filter(r=>P.compare(r.score,mine.score)===0).length;
      if(!better)win+=1/(ties+1);
    }
    return win/trials;
  }
  function aiChoice(g,i) {
    const a=actions(g,i),p=g.players[i],difficulty=g.difficulty;
    const known=g.mode==='holdem' ? [...p.cards,...g.board.slice(0,[0,3,4,5][g.street])] : p.cards;
    const made=P.evaluate(known);
    const count=live(g).length;
    let strength;
    if (difficulty==='easy') {
      strength=made ? Math.min(.9,.26+made.score[0]*.11) : (p.cards[0].r+p.cards[1].r)/62;
    } else strength=estimateEquity(g,i,difficulty==='hard'?70:28);
    const price=a.need/(pot(g)+a.need||1),noise=Math.random();
    const caution=difficulty==='easy'?.16:difficulty==='hard'?.05:.1;
    const foldThreshold=Math.max(.12,price*(difficulty==='hard'?1.1:1.5)+caution);
    const raiseThreshold=difficulty==='hard'?.68:.74;
    if(a.need>0 && strength<foldThreshold && noise>(difficulty==='hard'?.15:.07))return 'fold';
    if(a.canAllIn && difficulty==='hard' && strength>.93 && noise>.975 && count<=3 && p.stack>a.need+unit(g))return 'allin';
    if(a.canRaise && strength>raiseThreshold && noise>.36){
      const multiple=difficulty==='hard' && strength>.86 && noise>.76?4:strength>.79&&noise>.62?2:1;
      const affordable=[multiple,2,1].find(m=>p.stack>=targetBet(g,m)-p.bet)||1;
      return `${g.currentBet?'raise':'bet'}${affordable}`;
    }
    if(a.canRaise && difficulty==='hard' && strength>.34 && noise>.9 && count<=3)return g.currentBet?'raise1':'bet1';
    return a.need?'call':'check';
  }
  function scheduleAI() {
    const g=ui.game;if(!g||g.finished||g.actor===null||g.actor===0)return;
    const token=ui.epoch,hand=g.hand,actor=g.actor;
    setTimeout(()=>{
      if(ui.epoch!==token||ui.game!==g||g.hand!==hand||g.actor!==actor||g.finished)return;
      if(ui.guide||ui.pause||ui.tiers){scheduleAI();return;}
      takeAction(aiChoice(g,actor));
    },380+Math.random()*470);
  }
  function streetName(g) {return g.mode==='holdem'?['프리플랍','플랍','턴','리버'][g.street]:['서드 스트리트','포스 스트리트','피프스 스트리트','식스스 스트리트','세븐스 스트리트'][g.street];}
  function visibleCards(g,p,owner) {
    const reveal=owner||g.finished&&live(g).length>1&&!p.folded;
    if(g.mode==='holdem')return p.cards.map(c=>cardHTML(reveal?c:'back',{small:!owner})).join('');
    return p.cards.map((c,k)=>cardHTML(reveal||k>=2&&k<=5?c:'back',{small:!owner})).join('');
  }
  function opponentHTML(g,p,i) {
    const winner=g.finished&&g.winners?.some(w=>w.i===i);
    return `<div class="seat ${p.folded?'folded':''} ${g.actor===i?'turn':''} ${winner?'winner':''}"><div class="seat-name">${p.name} ${winner?'<span class="winner-tag">WINNER</span>':''} ${g.dealer===i?'<span class="badge">D</span>':''} ${p.stack===0&&p.total>0?'<span class="badge">ALL IN</span>':''}</div><div class="seat-stack">● ${money(p.stack)}</div><div class="seat-cards">${visibleCards(g,p,false)}</div><div class="seat-bet">${p.bet?`베팅 ${money(p.bet)}`:'&nbsp;'}</div></div>`;
  }
  function gameTable(g) {
    const self=g.players[0],showdown=g.finished&&live(g).length>1,rank=showdown&&!self.folded?bestFor(g,self):P.evaluate(g.mode==='holdem'?[...self.cards,...g.board.slice(0,[0,3,4,5][g.street])]:self.cards);
    const boardCount=[0,3,4,5][g.street]||0;
    return `<section class="table-stage ${g.mode==='stud'?'stud-table':''}"><div class="felt"><div class="opponents">${g.players.slice(1).map((p,i)=>opponentHTML(g,p,i+1)).join('')}</div><div class="table-middle"><div class="pot-label">TOTAL POT</div><div class="pot-value">● ${money(pot(g)-(g.finished?g.refunds||0:0))}</div>${g.mode==='holdem'?`<div class="community">${g.board.map((c,k)=>`<div class="board-slot">${cardHTML(k<boardCount||showdown?c:null)}<div class="board-caption">${k===0?'── FLOP ──':k===3?'TURN':k===4?'RIVER':'·'}</div></div>`).join('')}</div><div class="table-note">COMMUNITY CARDS · 모두가 공유하는 공용 카드</div>`:`<div class="table-note">NO COMMUNITY CARDS · 각자 7장을 받아 가장 강한 5장을 만듭니다</div>`}</div><div class="you-row ${g.finished&&g.winners?.some(w=>w.i===0)?'winner':''}"><div class="you-info"><strong>YOU ${g.dealer===0?'ⓓ':''} ${g.finished&&g.winners?.some(w=>w.i===0)?'<span class="winner-tag">WINNER</span>':''}</strong><small>● ${money(self.stack)}<br>${self.bet?`베팅 ${money(self.bet)}`:'당신의 카드'}</small></div><div class="your-cards ${g.mode==='stud'?'stud':''}">${visibleCards(g,self,true)}</div><div class="your-rank">${self.folded?'이번 판 폴드':rank?`현재 최선의 패<strong>${rank.name}</strong>`:'패를 만들어 보세요'}</div></div></div></section>`;
  }
  function controls(g) {
    if(g.finished){
      const winners=g.winners||[];
      const banner=winners.length?`<div class="winner-banner" role="status"><span class="winner-crown">♛</span><div><span class="winner-label">${winners.length>1?'POT WINNERS':'HAND WINNER'}</span><div class="winner-names">${winners.map(w=>`<span>${w.name} <b>+${money(w.amount)}</b></span>`).join('')}</div></div></div>`:'';
      return `<div class="result-wrap">${banner}<div class="action-panel"><div class="action-copy"><strong>${g.result}</strong><small>${live(g).length===1?'쇼다운 없이 팟 획득':live(g).map(p=>`${p.name}: ${bestFor(g,p)?.name||'패 없음'}`).join(' · ')}</small><div class="reward-summary">이번 판 상금 <b>● ${money(g.prize||0)}</b> · 누적 <b>● ${money(ui.progress.earnings)}</b>${g.tierPromotion?`<span class="tier-up">↗ ${g.tierPromotion} 승급!</span>`:''}</div></div><div class="action-buttons"><button class="raise" data-do="next-hand" ${g.players[0].stack===0?'disabled':''}>다음 판 →</button><button data-do="setup">새 게임</button></div></div></div>`;
    }
    if(g.actor!==0)return `<div class="action-panel"><div class="action-copy"><strong>${g.players[g.actor]?.name||'AI'} 생각 중…</strong><small>${streetName(g)} · AI의 행동을 기다려 주세요.</small></div></div>`;
    const a=actions(g,0),self=g.players[0];
    const sized=[1,2,4].map(m=>{
      const target=targetBet(g,m),possible=a.canRaise&&self.stack>=target-self.bet;
      return `<button class="raise size-option" data-do="${g.currentBet?'raise':'bet'}${m}" ${possible?'':'disabled'}><span>${g.currentBet?'RAISE':'BET'} ×${m}</span><small>총 ● ${money(target)}</small></button>`;
    }).join('');
    return `<div class="action-panel"><div class="action-copy"><strong>당신의 차례 · ${streetName(g)}</strong><small>현재 베팅 ${money(g.currentBet)} · ${a.need?`콜 ${money(Math.min(self.stack,a.need))}`:'추가 베팅 없음'} · 기본 단위 ${unit(g)}</small></div><div class="action-buttons"><button class="fold" data-do="fold">FOLD</button>${a.canCheck?'<button data-do="check">CHECK</button>':`<button data-do="call">CALL ${money(Math.min(self.stack,a.need))}</button>`}${sized}<button class="all-in" data-do="allin" ${a.canAllIn?'':'disabled'}><span>ALL-IN</span><small>총 ● ${money(self.bet+self.stack)}</small></button></div></div>`;
  }
  function gameView() {
    const g=ui.game;
    return `<main><div class="game-heading"><div><div class="eyebrow">${label(g.mode)} / HAND ${String(g.hand).padStart(2,'0')}</div><h2>${streetName(g)}</h2></div><div class="status-pill">${g.difficulty.toUpperCase()} AI · ${g.players.length} PLAYERS</div></div>${tierPanel(true)}${gameTable(g)}${controls(g)}<div class="feed"><b>TABLE LOG</b><span>${g.logs.slice(0,4).join('　 / 　')}</span></div></main>`;
  }
  function tutorialCards(mode,stage) {
    if(mode==='holdem')return {board:[tc(14,'d'),tc(7,'c'),tc(2,'s'),tc(13,'d'),tc(13,'c')],self:[tc(14,'s'),tc(13,'s')],opp:[tc(14,'h'),tc(12,'d')],count:stage<3?0:stage===3?3:stage===4?4:5};
    return {self:[tc(14,'s'),tc(13,'s'),tc(12,'s'),tc(11,'s'),tc(10,'s'),tc(4,'d'),tc(2,'c')],opp:[tc(9,'h'),tc(9,'d'),tc(9,'c'),tc(4,'c'),tc(4,'h'),tc(11,'d'),tc(2,'s')],count:stage===0?0:Math.min(stage+2,7)};
  }
  function tutorialTable() {
    const mode=ui.mode,stage=ui.lesson,d=tutorialCards(mode,stage),end=stage>=6;
    const oppCards=mode==='holdem'?(stage<2?[]:d.opp):d.opp.slice(0,d.count);
    const selfCards=mode==='holdem'?(stage<1?[]:d.self):d.self.slice(0,d.count);
    let board='';
    if(mode==='holdem')board=`<div class="community">${d.board.map((c,i)=>`<div class="board-slot">${cardHTML(i<d.count?c:null,{highlight:i<d.count&&i>=d.count-(stage===3?3:1)})}<div class="board-caption">${i===0?'── FLOP ──':i===3?'TURN':i===4?'RIVER':'·'}</div></div>`).join('')}</div><div class="annotation">COMMUNITY CARDS · 공용 카드</div>`;
    else board=`<div class="table-note">공용 카드 없음 · 내 카드 2장 비공개 → 4장 공개 → 마지막 1장 비공개</div><div class="annotation">${stage<=1?'DOOR CARD · 첫 공개 카드':stage>=6?'SHOWDOWN · 최선의 5장 판정':['','', 'FOURTH STREET','FIFTH STREET','SIXTH STREET','SEVENTH STREET'][stage]}</div>`;
    return `<section class="table-stage tutorial-table"><div class="felt"><div class="opponents"><div class="seat"><div class="seat-name">AI MIRA</div><div class="seat-stack">● 1,000</div><div class="seat-cards">${oppCards.map((c,i)=>cardHTML(end?c:mode==='stud'&&i>=2&&i<=5?c:'back',{small:true})).join('')}</div><div class="seat-bet">${end?'풀하우스':'상대의 패는 비공개'}</div></div></div><div class="table-middle"><div class="pot-label">TOTAL POT</div><div class="pot-value">● ${stage===0?0:mode==='holdem'?[0,30,80,120,200,280,280,280][stage]:[0,40,80,160,240,320,320,320][stage]}</div>${board}</div><div class="you-row"><div class="you-info"><strong>YOU ⓓ</strong><small>HOLE CARDS${mode==='stud'?' / DOWN CARDS':''}</small></div><div class="your-cards ${mode==='stud'?'stud':''}">${selfCards.map((c,i)=>cardHTML(c,{highlight:mode==='stud'&&i===2&&stage===1})).join('')||cardHTML(null)}</div><div class="your-rank">${end?`최종 패<strong>${mode==='holdem'?'풀하우스':'로열 스트레이트 플러시'}</strong>`:stage>=3&&mode==='holdem'?`현재 패<strong>${['','','','원페어','투페어','풀하우스'][stage]}</strong>`:'카드 아래 용어를 확인하세요'}</div></div></div></section>`;
  }
  function tutorialView() {
    const steps=TUTORIALS[ui.mode],s=steps[ui.lesson];
    return `<main class="tutorial-wrap"><div class="tutorial-head"><div><div class="eyebrow">GUIDED HAND / ${label(ui.mode)}</div><h1 class="screen-title" style="margin-bottom:0">직접 배우는 한 판</h1></div><div><div class="tiny">STEP ${ui.lesson+1} / ${steps.length}</div><div class="progress">${steps.map((_,i)=>`<i class="${i<=ui.lesson?'on':''}"></i>`).join('')}</div></div></div>${tutorialTable()}<div class="lesson"><div><div class="eyebrow">BOARD GAME STYLE / HOW TO PLAY</div><h3>${s.title}</h3><p>${s.text}</p><div class="prompt">${ui.tutorialFeedback||s.prompt}</div></div><div class="lesson-actions">${ui.lesson>0?'<button class="secondary" data-do="lesson-back">← 이전</button>':''}<button data-do="lesson-next">${s.button} →</button></div></div>${ui.lesson===steps.length-1?`<div class="rank-list">${HANDS.map((h,i)=>`<div class="rank-item"><span class="num">${String(i+1).padStart(2,'0')}</span><span><strong>${h[0]}</strong><small>${h[2]}</small></span><span class="example">${h[1]}</span></div>`).join('')}</div>`:''}</main>`;
  }
  function guideView() {
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="족보 가이드"><div class="modal"><div class="modal-header"><div><div class="eyebrow">HOW TO PLAY / SCORING</div><h2>Hand Rankings</h2><div class="muted">가장 강한 패 ↓ 가장 약한 패</div></div><button class="close" data-do="guide">닫기 ✕</button></div><div class="rank-list">${HANDS.map((h,i)=>`<div class="rank-item"><span class="num">${String(i+1).padStart(2,'0')}</span><span><strong>${h[0]}</strong><small>${h[2]}</small></span><span class="example">${h[1]}</span></div>`).join('')}</div><div class="rules-box"><b>동일 족보 승부:</b> 페어·트리플 등 핵심 숫자를 먼저, 같으면 남은 카드(키커)를 높은 순서대로 비교합니다. 투페어는 높은 페어 → 낮은 페어 → 키커, 풀하우스는 트리플 → 페어 순서입니다.<br><b>A의 예외:</b> A-K-Q-J-10은 가장 높은 스트레이트, A-2-3-4-5는 가장 낮은 스트레이트입니다. Q-K-A-2-3은 스트레이트가 아닙니다.<br><b>무늬:</b> 족보 판정에만 쓰며 ♠ ♥ ♦ ♣끼리 우열은 없습니다. 최선의 5장이 같으면 팟을 나눕니다.<br><b>두 게임 공통:</b> 7장 중 최선의 5장을 고릅니다. 홀덤은 공용 카드 5장과 개인 카드 2장, 스터드는 개인 카드 7장입니다.</div></div></div>`;
  }
  function tierView() {
    const current=currentTier();
    return `<div class="overlay" role="dialog" aria-modal="true" aria-label="상금 티어 기준"><div class="modal" style="max-width:650px"><div class="modal-header"><div><div class="eyebrow">PRIZE SYSTEM / SPOON TIERS</div><h2>상금 티어</h2><div class="muted">두 게임의 누적 획득 상금으로 승급합니다.</div></div><button class="close" data-do="tiers">닫기 ✕</button></div><div class="tier-rules">${TIERS.map((tier,i)=>`<div class="tier-rule ${current===tier?'current':''}"><span class="tier-rule-icon">${tier.icon}</span><div><strong>${tier.name}</strong><small>${i===TIERS.length-1?`누적 ● ${money(tier.at)} 이상`:`누적 ● ${money(tier.at)} ~ ${money(TIERS[i+1].at-1)}`}</small></div>${current===tier?'<span class="tier-now">CURRENT</span>':''}</div>`).join('')}</div><div class="rules-box"><b>상금 집계:</b> 게임 한 판에서 실제로 받은 팟 칩만 누적합니다. 패배한 판의 상금은 0이며 이미 획득한 상금과 티어는 줄지 않습니다. 튜토리얼은 집계하지 않습니다.<br><b>현재 기록:</b> 누적 상금 ● ${money(ui.progress.earnings)} · 상금 획득 ${money(ui.progress.wins)}판 / 플레이 ${money(ui.progress.hands)}판.<br><b>저장:</b> ${ui.progress.persistent?'이 브라우저의 로컬 저장소에 자동 보관됩니다.':'현재 브라우저에서 저장할 수 없어 페이지를 닫으면 기록이 사라질 수 있습니다.'} 다른 기기나 브라우저와는 동기화되지 않습니다.</div></div></div>`;
  }
  function pauseView() {return `<div class="overlay" role="dialog" aria-modal="true" aria-label="일시정지"><div class="modal" style="max-width:410px"><div class="eyebrow">TABLE PAUSED</div><h2>일시정지</h2><p class="muted">현재 판을 이어가거나 새로 시작할 수 있습니다.</p><div class="hero-actions"><button class="primary" data-do="pause">계속하기</button><button class="ghost" data-do="restart">새 게임</button><button class="ghost" data-do="home">메인 메뉴</button></div></div></div>`;}
  function render() { app.innerHTML=`<div class="shell">${header()}${ui.screen==='home'?homeView():ui.screen==='setup'?menuView(false):ui.screen==='tutorial-menu'?menuView(true):ui.screen==='tutorial'?tutorialView():gameView()}<div class="footer-note">POKER TABLE · 브라우저에서 즐기는 가상 칩 게임 · 기본 베팅 20 / 40 · 1× 2× 4× ALL-IN</div></div>${ui.tiers?tierView():ui.guide?guideView():ui.pause?pauseView():''}`; }
  app.addEventListener('click',e=>{
    const b=e.target.closest('[data-do]');if(!b)return;
    const cmd=b.dataset.do;
    if(cmd==='guide'){ui.guide=!ui.guide;ui.tiers=false;render();return;}
    if(cmd==='tiers'){ui.tiers=!ui.tiers;ui.guide=false;render();return;}
    if(cmd==='pause'){ui.pause=!ui.pause;render();if(!ui.pause)scheduleAI();return;}
    if(cmd==='home'){ui.epoch++;ui.game=null;ui.screen='home';ui.pause=false;ui.guide=false;ui.tiers=false;render();return;}
    if(cmd==='setup'||cmd==='restart'){ui.epoch++;ui.pause=false;ui.tiers=false;ui.screen='setup';ui.game=null;render();return;}
    if(cmd==='tutorial-menu'){ui.screen='tutorial-menu';render();return;}
    if(cmd==='mode-stud'||cmd==='mode-holdem'){ui.mode=cmd.split('-')[1];render();return;}
    if(cmd==='learn-stud'||cmd==='learn-holdem'){ui.mode=cmd.split('-')[1];ui.screen='tutorial';ui.lesson=0;ui.tutorialFeedback='';render();return;}
    if(cmd==='start'){ui.count=Number(document.querySelector('#players').value);ui.difficulty=document.querySelector('#difficulty').value;startGame();return;}
    if(cmd==='next-hand'){if(ui.game&&ui.game.finished)newHand();return;}
    if(cmd==='lesson-back'){ui.lesson=Math.max(0,ui.lesson-1);ui.tutorialFeedback='';render();return;}
    if(cmd==='lesson-next'){if(ui.lesson===TUTORIALS[ui.mode].length-1){ui.screen='tutorial-menu';ui.lesson=0;}else ui.lesson++;ui.tutorialFeedback='';render();return;}
    if(['fold','check','call','allin'].includes(cmd)||/^(bet|raise)[124]$/.test(cmd))takeAction(cmd);
  });
  app.addEventListener('change',e=>{if(e.target.id==='players')ui.count=Number(e.target.value);if(e.target.id==='difficulty')ui.difficulty=e.target.value;});
  window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(ui.tiers){ui.tiers=false;render();}else if(ui.guide){ui.guide=false;render();}else if(ui.screen==='game'){ui.pause=!ui.pause;render();if(!ui.pause)scheduleAI();}}});
  render();
})();
