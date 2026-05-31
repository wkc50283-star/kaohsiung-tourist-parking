const SITES = [
  {
    id: 'pier2', slug: 'pier2-parking.html', title: '駁二藝術特區停車即時推薦', name: '駁二藝術特區', category: '市區文創與港灣',
    keywords: ['駁二停車','駁二藝術特區停車','大港橋停車','棧貳庫停車'],
    intro: '快速查看駁二、大港橋、棧貳庫周邊停車場狀態、步行時間、價格與付款方式。',
    lots: [
      {status:'available', name:'大勇駁二停車場', walk:'約 3 分鐘', weekday:'20/半小時', holiday:'30/半小時', cash:'不確定', epay:'有', plate:'有', updated:'示範資料', note:'靠近駁二大勇區，假日人潮多。', maps:'https://www.google.com/maps/search/?api=1&query=大勇駁二停車場'},
      {status:'unknown', name:'大義倉庫周邊停車場', walk:'約 5 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'適合前往大義倉庫與輕軌周邊。', maps:'https://www.google.com/maps/search/?api=1&query=駁二大義倉庫停車場'},
      {status:'full', name:'棧貳庫周邊停車區', walk:'約 6–8 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'示範狀態', note:'假日與活動日較容易滿。', maps:'https://www.google.com/maps/search/?api=1&query=棧貳庫停車場'}
    ]
  },
  {id:'kmc', slug:'kaohsiung-music-center-parking.html', title:'高雄流行音樂中心停車即時推薦', name:'高雄流行音樂中心', category:'市區文創與港灣', keywords:['高流停車','高雄流行音樂中心停車','愛河灣停車'], intro:'查看高流與愛河灣周邊停車場、付款方式與 Google Maps 導航。', lots:[
    {status:'unknown', name:'高流周邊停車場', walk:'約 3–6 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'活動日建議提早查詢。', maps:'https://www.google.com/maps/search/?api=1&query=高雄流行音樂中心停車場'},
    {status:'unknown', name:'愛河灣周邊停車區', walk:'約 6–10 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'適合散步至高流。', maps:'https://www.google.com/maps/search/?api=1&query=愛河灣停車場'}]},
  {id:'love-river', slug:'love-river-parking.html', title:'愛河停車即時推薦', name:'愛河風景區', category:'市區文創與港灣', keywords:['愛河停車','愛河風景區停車','愛之船停車'], intro:'查看愛河風景區周邊停車選擇。', lots:[
    {status:'unknown', name:'愛河周邊停車場', walk:'約 3–8 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'傍晚與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=愛河停車場'}]},
  {id:'xiziwan', slug:'xiziwan-parking.html', title:'西子灣停車即時推薦', name:'西子灣', category:'海景與人文', keywords:['西子灣停車','打狗英國領事館停車','鼓山渡船頭停車'], intro:'查看西子灣、英國領事館、渡船頭周邊停車資訊。', lots:[
    {status:'unknown', name:'西子灣遊客停車區', walk:'約 5–10 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'夕陽時段與假日較擁擠。', maps:'https://www.google.com/maps/search/?api=1&query=西子灣停車場'},
    {status:'unknown', name:'鼓山渡船頭周邊停車場', walk:'約 5 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'也可作為前往旗津前的停車選擇。', maps:'https://www.google.com/maps/search/?api=1&query=鼓山渡船頭停車場'}]},
  {id:'cijin', slug:'cijin-parking.html', title:'旗津停車即時推薦', name:'旗津', category:'海景與人文', keywords:['旗津停車','旗津老街停車','旗津渡輪停車'], intro:'查看旗津老街、海岸與渡輪周邊停車資訊。', lots:[
    {status:'unknown', name:'旗津老街周邊停車場', walk:'約 3–8 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'假日與用餐時間停車需求高。', maps:'https://www.google.com/maps/search/?api=1&query=旗津老街停車場'}]},
  {id:'lotus-pond', slug:'lotus-pond-parking.html', title:'蓮池潭停車即時推薦', name:'蓮池潭', category:'海景與人文', keywords:['蓮池潭停車','龍虎塔停車','左營孔廟停車'], intro:'查看蓮池潭、龍虎塔、春秋閣周邊停車選擇。', lots:[
    {status:'unknown', name:'蓮池潭周邊停車場', walk:'約 3–10 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'景點分散，建議依目的區域選停車場。', maps:'https://www.google.com/maps/search/?api=1&query=蓮池潭停車場'}]},
  {id:'weiwuying', slug:'weiwuying-parking.html', title:'衛武營停車即時推薦', name:'衛武營', category:'藝術與室內景點', keywords:['衛武營停車','衛武營國家藝術文化中心停車'], intro:'查看衛武營與都會公園周邊停車資訊。', lots:[
    {status:'unknown', name:'衛武營周邊停車場', walk:'約 3–8 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'表演日與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營停車場'}]},
  {id:'formosa', slug:'formosa-boulevard-parking.html', title:'美麗島站停車即時推薦', name:'美麗島站 光之穹頂', category:'藝術與室內景點', keywords:['美麗島站停車','光之穹頂停車','六合夜市停車'], intro:'查看美麗島站、光之穹頂與六合夜市周邊停車資訊。', lots:[
    {status:'unknown', name:'美麗島站周邊停車場', walk:'約 2–6 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'晚間可接六合夜市人潮。', maps:'https://www.google.com/maps/search/?api=1&query=美麗島站停車場'}]},
  {id:'fgs', slug:'fo-guang-shan-parking.html', title:'佛光山佛陀紀念館停車推薦', name:'佛光山佛陀紀念館', category:'近郊景點', keywords:['佛光山停車','佛陀紀念館停車'], intro:'查看佛光山佛陀紀念館停車資訊。', lots:[
    {status:'unknown', name:'佛陀紀念館停車場', walk:'依入口而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'園區較大，建議依當日入口與活動安排停車。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山佛陀紀念館停車場'}]},
  {id:'moon-world', slug:'moon-world-parking.html', title:'田寮月世界停車推薦', name:'田寮月世界', category:'近郊景點', keywords:['月世界停車','田寮月世界停車'], intro:'查看田寮月世界周邊停車資訊。', lots:[
    {status:'unknown', name:'田寮月世界停車場', walk:'依入口而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'近郊景點建議出發前確認營業與停車資訊。', maps:'https://www.google.com/maps/search/?api=1&query=田寮月世界停車場'}]},
  {id:'qishan', slug:'qishan-old-street-parking.html', title:'旗山老街停車推薦', name:'旗山老街', category:'近郊景點', keywords:['旗山老街停車','旗山停車'], intro:'查看旗山老街周邊停車資訊。', lots:[
    {status:'unknown', name:'旗山老街周邊停車場', walk:'約 3–10 分鐘', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'假日老街周邊人車較多。', maps:'https://www.google.com/maps/search/?api=1&query=旗山老街停車場'}]},
  {id:'meinong', slug:'meinong-parking.html', title:'美濃停車推薦', name:'美濃', category:'近郊景點', keywords:['美濃停車','美濃老街停車','美濃民俗村停車'], intro:'查看美濃周邊停車資訊。', lots:[
    {status:'unknown', name:'美濃老街周邊停車場', walk:'依目的地而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'美濃景點分散，建議依目的地導航。', maps:'https://www.google.com/maps/search/?api=1&query=美濃停車場'}]}
];
