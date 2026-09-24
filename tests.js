/* Run with: node tests.js. Checks hand ordering, split pots and full hand flow. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Poker = require('./poker.js');
const C = (r, s) => ({ r, s });
const hand = (...cards) => Poker.evaluate(cards.map(([r, s]) => C(r, s)));
const rank = [
  [[14,'s'],[13,'s'],[12,'s'],[11,'s'],[10,'s']],
  [[9,'h'],[8,'h'],[7,'h'],[6,'h'],[5,'h']],
  [[12,'s'],[12,'h'],[12,'d'],[12,'c'],[7,'s']],
  [[10,'s'],[10,'h'],[10,'d'],[7,'s'],[7,'h']],
  [[14,'d'],[11,'d'],[8,'d'],[5,'d'],[2,'d']],
  [[12,'s'],[11,'h'],[10,'c'],[9,'d'],[8,'s']],
  [[7,'s'],[7,'h'],[7,'d'],[13,'c'],[2,'s']],
  [[14,'s'],[14,'h'],[8,'c'],[8,'d'],[3,'s']],
  [[12,'s'],[12,'d'],[14,'h'],[9,'c'],[4,'s']],
  [[14,'s'],[11,'d'],[9,'c'],[6,'h'],[3,'s']]
].map(cards => hand(...cards));
for (let i = 0; i < rank.length - 1; i++) assert(Poker.compare(rank[i].score, rank[i + 1].score) > 0);
assert.equal(hand([14,'s'],[2,'h'],[3,'d'],[4,'c'],[5,'s']).score[1], 5, 'wheel');
assert.equal(hand([14,'s'],[13,'h'],[12,'d'],[2,'c'],[3,'s']).score[0], 0, 'no wraparound straight');
assert(Poker.compare(hand([14,'s'],[14,'h'],[13,'d'],[9,'c'],[4,'s']).score, hand([14,'c'],[14,'d'],[12,'d'],[11,'c'],[10,'s']).score) > 0, 'kicker');
assert.equal(Poker.compare(hand([14,'s'],[13,'h'],[12,'d'],[11,'c'],[9,'s']).score,hand([14,'c'],[13,'d'],[12,'h'],[11,'s'],[9,'c']).score),0,'suits do not break a tie');
assert.equal(Poker.evaluate([C(2,'h'),C(2,'d'),C(9,'h'),C(9,'d'),C(9,'c'),C(14,'s'),C(14,'d')]).score[0],6,'best five of seven');

const source = fs.readFileSync(require.resolve('./app.js'),'utf8').replace(/\}\)\(\);\s*$/, `globalThis.testApi={ui,startGame,newHand,actions,takeAction,finish,render,pot,currentTier,nextTier,TIERS};})();`);
let queue = [];
const app = { innerHTML: '', addEventListener() {} };
const elements = { '#app': app, '#players': { value:'4' }, '#difficulty': { value:'normal' } };
const saved=new Map();
const storage={getItem(k){return saved.get(k)||null},setItem(k,v){saved.set(k,v)}};
const ctx = { window:{ Poker, localStorage:storage, addEventListener(){} }, document:{querySelector(s){return elements[s]}}, setTimeout(fn){queue.push(fn)}, Math, console };
vm.createContext(ctx); vm.runInContext(source,ctx);
const api=ctx.testApi;
assert.equal(api.currentTier().name,'No Tier');
assert.deepEqual(Array.from(api.TIERS,t=>t.at),[0,1000,5000,15000,40000,100000]);
const sidePot = {
  mode:'stud', dealer:2, players:[
    {name:'YOU',stack:0,total:100,folded:false,cards:rank[0].cards.concat([C(2,'d'),C(3,'c')])},
    {name:'Mira',stack:0,total:200,folded:false,cards:rank[2].cards.concat([C(3,'d'),C(4,'s')])},
    {name:'Jude',stack:0,total:200,folded:false,cards:rank[8].cards.concat([C(5,'d'),C(6,'s')])}
  ], logs:[],finished:false,street:4,difficulty:'normal',hand:1
};
api.ui.game=sidePot;api.ui.screen='game';api.finish(sidePot);
assert.deepEqual(sidePot.players.map(p=>p.stack),[300,200,0],'main and side pots');
assert.equal(api.ui.progress.earnings,300,'actual awarded pot added once');
api.finish(sidePot);
assert.equal(api.ui.progress.earnings,300,'duplicate settlement ignored');
const promotion={mode:'stud',dealer:0,players:[
  {name:'YOU',stack:0,total:400,folded:false,cards:rank[0].cards.concat([C(2,'d'),C(3,'c')])},
  {name:'Mira',stack:0,total:400,folded:false,cards:rank[8].cards.concat([C(5,'d'),C(6,'s')])}
],logs:[],finished:false,street:4,difficulty:'normal',hand:2};
api.ui.game=promotion;api.finish(promotion);
assert.equal(api.ui.progress.earnings,1100);
assert.equal(api.currentTier().name,'Silver Spoon');
assert.equal(promotion.tierPromotion,'Silver Spoon');
assert.equal(JSON.parse(saved.get('poker-table-progression-v1')).earnings,1100,'browser persistence');
assert.match(app.innerHTML,/Silver Spoon 승급!/,'promotion appears with hand result');
api.ui.screen='home';api.render();
assert.match(app.innerHTML,/Gold Spoon까지 ● 3,900/,'home shows next threshold');
const reloaded={window:{Poker,localStorage:storage,addEventListener(){}},document:{querySelector(){return {innerHTML:'',addEventListener(){}}}},setTimeout(){},Math,console};
vm.createContext(reloaded);vm.runInContext(source,reloaded);
assert.equal(reloaded.testApi.ui.progress.earnings,1100,'restore after reopening');
assert.equal(reloaded.testApi.currentTier().name,'Silver Spoon');
api.ui.mode='holdem';api.ui.count=2;api.startGame();
assert.equal(api.ui.game.players[api.ui.game.dealer].bet,10,'heads-up dealer posts small blind');
assert.equal(api.ui.game.players[(api.ui.game.dealer+1)%2].bet,20,'heads-up opponent posts big blind');
api.ui.mode='stud';api.ui.count=4;api.startGame();
assert.equal(api.ui.game.currentBet,10,'bring-in wager');
assert.equal(api.ui.game.players.reduce((n,p)=>n+p.bet,0),10,'antes excluded from street bets');
assert.equal(api.pot(api.ui.game),30,'antes and bring-in in pot');
for (const mode of ['holdem','stud']) for (const count of [2,4,6]) {
  api.ui.mode=mode;api.ui.count=count;api.ui.difficulty='easy';api.startGame();
  let hands=0,iterations=0;
  while(hands<5 && iterations++<18000){
    const g=api.ui.game;
    if(g.finished){
      assert.equal(g.players.reduce((n,p)=>n+p.stack,0), count*1000, `${mode}: conserve chips`);
      assert.match(app.innerHTML,/다음 판|새 게임/);
      hands++;
      if(g.players[0].stack===0||g.players.filter(p=>p.stack>0).length<2)break;
      api.newHand();continue;
    }
    if(g.actor===0){const a=api.actions(g,0);api.takeAction(a.canCheck?'check':a.canCall?'call':'fold');}
    else {const job=queue.shift();assert(job,`${mode}: AI turn scheduled`);job();}
  }
  assert(hands>=1,`${mode}/${count}: at least one complete hand`);
  assert(iterations<18000,`${mode}/${count}: no endless betting loop`);
  queue=[];
}
console.log('All poker engine and complete-hand checks passed.');
