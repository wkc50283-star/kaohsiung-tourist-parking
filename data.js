const SITES = [
  {
    id: 'pier2', slug: 'pier2-parking.html', title: '駁二停車場推薦', name: '駁二藝術特區', category: '市區文創與港灣',
    keywords: ['駁二停車','駁二停車場','駁二藝術特區停車','大港橋停車','棧貳庫停車'],
    intro: '快速查看駁二附近停車場與可嘗試路邊停車路段。',
    lots: [
      {status:'available', name:'大勇駁二停車場', distance:'步行約 3 分鐘（200m）', weekday:'平日 20/半小時', holiday:'假日 30/半小時', epay:'電子支付', plate:'車牌辨識', note:'靠近駁二大勇區，適合直接導航前往。', maps:'https://www.google.com/maps/search/?api=1&query=大勇駁二停車場'},
      {status:'unknown', name:'大義倉庫周邊停車場', distance:'步行約 5 分鐘（350m）', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'適合前往大義倉庫與輕軌周邊。', maps:'https://www.google.com/maps/search/?api=1&query=駁二大義倉庫停車場'},
      {status:'full', name:'棧貳庫周邊停車區', distance:'步行約 8 分鐘（600m）', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'假日與活動日較容易滿，建議保留備案。', maps:'https://www.google.com/maps/search/?api=1&query=棧貳庫停車場'}
    ],
    roads:[
      {name:'大勇路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'靠近駁二大勇區，假日需看現場狀況。', maps:'https://www.google.com/maps/search/?api=1&query=高雄大勇路駁二'},
      {name:'必信街周邊', status:'🅿️ 可嘗試找路邊停車格', note:'距離駁二可接受，可作為停車場客滿時備案。', maps:'https://www.google.com/maps/search/?api=1&query=高雄必信街駁二'},
      {name:'大義街周邊', status:'⚠️ 不建議一直繞', note:'假日人潮多，若找不到格位建議改導航停車場。', maps:'https://www.google.com/maps/search/?api=1&query=高雄大義街駁二'}
    ]
  },
  {id:'kmc', slug:'kaohsiung-music-center-parking.html', title:'高流停車場推薦', name:'高雄流行音樂中心', category:'市區文創與港灣', keywords:['高流停車','高流停車場','高雄流行音樂中心停車','愛河灣停車'], intro:'快速查看高流附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'高流周邊停車場', distance:'步行約 3–6 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'活動日建議提早查詢與保留備案。', maps:'https://www.google.com/maps/search/?api=1&query=高雄流行音樂中心停車場'},
    {status:'unknown', name:'愛河灣周邊停車區', distance:'步行約 6–10 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'可作為高流周邊備案。', maps:'https://www.google.com/maps/search/?api=1&query=愛河灣停車場'}], roads:[
      {name:'海邊路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'活動日容易壅塞，請依現場標線停車。', maps:'https://www.google.com/maps/search/?api=1&query=高雄海邊路高流'},
      {name:'真愛碼頭周邊道路', status:'⚠️ 不建議一直繞', note:'人潮多時容易繞行耗時。', maps:'https://www.google.com/maps/search/?api=1&query=真愛碼頭停車'}]},
  {id:'love-river', slug:'love-river-parking.html', title:'愛河停車場推薦', name:'愛河風景區', category:'市區文創與港灣', keywords:['愛河停車','愛河停車場','愛河風景區停車','愛之船停車'], intro:'快速查看愛河附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'愛河周邊停車場', distance:'步行約 3–8 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'傍晚與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=愛河停車場'}], roads:[
      {name:'河東路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'靠近愛河沿岸，請看現場格位與告示。', maps:'https://www.google.com/maps/search/?api=1&query=高雄河東路愛河'},
      {name:'河西路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'可作為停車場客滿時備案。', maps:'https://www.google.com/maps/search/?api=1&query=高雄河西路愛河'}]},
  {id:'xiziwan', slug:'xiziwan-parking.html', title:'西子灣停車場推薦', name:'西子灣', category:'海景與人文', keywords:['西子灣停車','西子灣停車場','打狗英國領事館停車','鼓山渡船頭停車'], intro:'快速查看西子灣附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'西子灣遊客停車區', distance:'步行約 5–10 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'夕陽時段與假日較擁擠。', maps:'https://www.google.com/maps/search/?api=1&query=西子灣停車場'},
    {status:'unknown', name:'鼓山渡船頭周邊停車場', distance:'步行約 5 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'也可作為前往旗津前的停車選擇。', maps:'https://www.google.com/maps/search/?api=1&query=鼓山渡船頭停車場'}], roads:[
      {name:'臨海二路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'靠近渡船頭與西子灣周邊，請看現場標線。', maps:'https://www.google.com/maps/search/?api=1&query=高雄臨海二路西子灣'},
      {name:'麗雄街周邊', status:'⚠️ 不建議一直繞', note:'巷弄較多，不熟路況時建議改停停車場。', maps:'https://www.google.com/maps/search/?api=1&query=高雄麗雄街'}]},
  {id:'cijin', slug:'cijin-parking.html', title:'旗津停車場推薦', name:'旗津', category:'海景與人文', keywords:['旗津停車','旗津停車場','旗津老街停車','旗津渡輪停車'], intro:'快速查看旗津附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'旗津老街周邊停車場', distance:'步行約 3–8 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'假日與用餐時間停車需求高。', maps:'https://www.google.com/maps/search/?api=1&query=旗津老街停車場'}], roads:[
      {name:'旗津三路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'靠近旗津主要動線，假日需看現場狀況。', maps:'https://www.google.com/maps/search/?api=1&query=旗津三路'},
      {name:'廟前路周邊', status:'⚠️ 不建議一直繞', note:'人潮多、路幅較小，找不到時建議改停停車場。', maps:'https://www.google.com/maps/search/?api=1&query=旗津廟前路'}]},
  {id:'lotus-pond', slug:'lotus-pond-parking.html', title:'蓮池潭停車場推薦', name:'蓮池潭', category:'海景與人文', keywords:['蓮池潭停車','蓮池潭停車場','龍虎塔停車','左營孔廟停車'], intro:'快速查看蓮池潭附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'蓮池潭周邊停車場', distance:'步行約 3–10 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'景點分散，建議依目的區域選停車場。', maps:'https://www.google.com/maps/search/?api=1&query=蓮池潭停車場'}], roads:[
      {name:'蓮潭路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'依目的地區域查看現場停車格。', maps:'https://www.google.com/maps/search/?api=1&query=高雄蓮潭路'},
      {name:'勝利路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'可作為周邊備案路段。', maps:'https://www.google.com/maps/search/?api=1&query=高雄左營勝利路'}]},
  {id:'weiwuying', slug:'weiwuying-parking.html', title:'衛武營停車場推薦', name:'衛武營', category:'藝術與室內景點', keywords:['衛武營停車','衛武營停車場','衛武營國家藝術文化中心停車'], intro:'快速查看衛武營附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'衛武營周邊停車場', distance:'步行約 3–8 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'表演日與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營停車場'}], roads:[
      {name:'三多一路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'請依現場標線與告示停車。', maps:'https://www.google.com/maps/search/?api=1&query=高雄三多一路衛武營'},
      {name:'南京路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'可作為停車場客滿時備案。', maps:'https://www.google.com/maps/search/?api=1&query=高雄南京路衛武營'}]},
  {id:'formosa', slug:'formosa-boulevard-parking.html', title:'美麗島站停車場推薦', name:'美麗島站 光之穹頂', category:'藝術與室內景點', keywords:['美麗島站停車','美麗島站停車場','光之穹頂停車','六合夜市停車'], intro:'快速查看美麗島站附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'美麗島站周邊停車場', distance:'步行約 2–6 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'晚間可接六合夜市人潮。', maps:'https://www.google.com/maps/search/?api=1&query=美麗島站停車場'}], roads:[
      {name:'中山一路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'市中心車流多，請勿長時間繞行。', maps:'https://www.google.com/maps/search/?api=1&query=高雄中山一路美麗島站'},
      {name:'六合路周邊', status:'⚠️ 晚間不建議一直繞', note:'夜市時段人潮多，建議優先看停車場。', maps:'https://www.google.com/maps/search/?api=1&query=高雄六合路停車'}]},
  {id:'fgs', slug:'fo-guang-shan-parking.html', title:'佛光山停車場推薦', name:'佛光山佛陀紀念館', category:'近郊景點', keywords:['佛光山停車','佛光山停車場','佛陀紀念館停車'], intro:'快速查看佛光山附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'佛陀紀念館停車場', distance:'依入口而定', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'園區較大，建議依當日入口與活動安排停車。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山佛陀紀念館停車場'}], roads:[
      {name:'園區周邊道路', status:'⚪ 需看現場指引', note:'近郊大型景點，優先依園區停車指引。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山佛陀紀念館'}]},
  {id:'moon-world', slug:'moon-world-parking.html', title:'田寮月世界停車場推薦', name:'田寮月世界', category:'近郊景點', keywords:['月世界停車','月世界停車場','田寮月世界停車'], intro:'快速查看田寮月世界附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'田寮月世界停車場', distance:'依入口而定', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'近郊景點建議出發前確認營業與停車資訊。', maps:'https://www.google.com/maps/search/?api=1&query=田寮月世界停車場'}], roads:[
      {name:'月世界園區周邊道路', status:'⚪ 需看現場指引', note:'優先依園區停車指引，不建議任意停放。', maps:'https://www.google.com/maps/search/?api=1&query=田寮月世界'}]},
  {id:'qishan', slug:'qishan-old-street-parking.html', title:'旗山老街停車場推薦', name:'旗山老街', category:'近郊景點', keywords:['旗山老街停車','旗山停車','旗山老街停車場'], intro:'快速查看旗山老街附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'旗山老街周邊停車場', distance:'步行約 3–10 分鐘', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'假日老街周邊人車較多。', maps:'https://www.google.com/maps/search/?api=1&query=旗山老街停車場'}], roads:[
      {name:'中山路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'老街周邊人潮多，請看現場標線。', maps:'https://www.google.com/maps/search/?api=1&query=旗山中山路老街'},
      {name:'延平一路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'可作為老街停車備案。', maps:'https://www.google.com/maps/search/?api=1&query=旗山延平一路'}]},
  {id:'meinong', slug:'meinong-parking.html', title:'美濃停車場推薦', name:'美濃', category:'近郊景點', keywords:['美濃停車','美濃停車場','美濃老街停車','美濃民俗村停車'], intro:'快速查看美濃附近停車場與可嘗試路邊停車路段。', lots:[
    {status:'unknown', name:'美濃老街周邊停車場', distance:'依目的地而定', weekday:'價格需現場確認', holiday:'價格需現場確認', epay:'付款方式需確認', plate:'車牌辨識需確認', note:'美濃景點分散，建議依目的地導航。', maps:'https://www.google.com/maps/search/?api=1&query=美濃停車場'}], roads:[
      {name:'美濃老街周邊道路', status:'🅿️ 可嘗試找路邊停車格', note:'景點分散，請依目的地查看現場標線。', maps:'https://www.google.com/maps/search/?api=1&query=美濃老街'},
      {name:'中正路周邊', status:'🅿️ 可嘗試找路邊停車格', note:'可作為市區周邊備案路段。', maps:'https://www.google.com/maps/search/?api=1&query=美濃中正路'}]}
];
