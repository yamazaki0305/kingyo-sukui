/* スコア送信(デモ)
   - build(): ゲーム結果から送信用JSONを作る
   - send():  endpoint が設定されていればPOSTする。未設定(デモ)のときは送信しない
   - submit(): send() のあと、送信内容を見せる submit.html へ移動する */
(function(g){
  const KEY='kingyo_last_score';
  const KingyoScore={
    // 本番で使うときは、受け取り側のURLを入れる 例: 'https://example.com/api/scores'
    endpoint:null,

    build(r){
      const catches=r.catches||[];
      const top=catches.slice().sort((a,b)=>b.weightGrams-a.weightGrams)[0]||null;
      return {
        game:'kingyo-sukui',
        version:'1.0.0',
        playedAt:new Date().toISOString(),
        score:r.score,
        playSeconds:r.playSeconds,
        poiLeft:r.poiLeft,
        totalCaught:catches.length,
        biggest:top?{name:top.name,weightGrams:top.weightGrams}:null,
        catches
      };
    },

    async send(payload){
      if(!this.endpoint)return {ok:true,demo:true};
      const res=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      return {ok:res.ok,status:res.status,demo:false};
    },

    async submit(payload){
      let result;
      try{result=await this.send(payload)}catch(e){result={ok:false,error:String(e)}}
      const data=JSON.stringify({payload,result});
      let url='submit.html';
      try{sessionStorage.setItem(KEY,data)}
      catch(e){url+='#d='+btoa(unescape(encodeURIComponent(data)))}
      location.href=url;
    },

    // submit.html 側: 送信した内容を取り出す
    load(){
      try{const s=sessionStorage.getItem(KEY);if(s)return JSON.parse(s)}catch(e){}
      try{
        const m=location.hash.match(/^#d=(.+)$/);
        if(m)return JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      }catch(e){}
      return null;
    }
  };
  g.KingyoScore=KingyoScore;
})(window);
