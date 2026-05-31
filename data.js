const SITES = [
  {
    id: 'pier2', slug: 'pier2-parking.html', title: '駁二附近停車場與路邊停車格', name: '駁二藝術特區', category: '市區文創與港灣',
    keywords: ['駁二停車','駁二附近停車','駁二路邊停車格','大港橋停車','棧貳庫停車'],
    intro: '已經要去駁二時，先看附近停車場；停車場不合適時，再看哪些路段可嘗試找路邊停車格。',
    roads: [
      {type:'unknown', name:'大勇路周邊', distance:'距離駁二約 100–300m', note:'可先查看附近路邊停車格，但無即時空位資料，假日不建議反覆繞太久。', maps:'https://www.google.com/maps/search/?api=1&query=高雄大勇路駁二路邊停車'},
      {type:'unknown', name:'大義街／必信街周邊', distance:'距離駁二約 200–500m', note:'可作為停車場滿位時的備選路段，是否有格位需以現場標線與告示為準。', maps:'https://www.google.com/maps/search/?api=1&query=高雄大義街必信街停車'},
      {type:'avoid', name:'棧貳庫正前方周邊', distance:'靠近熱門人潮區', note:'假日與活動日人車多，不建議一直繞同一區找車位。', maps:'https://www.google.com/maps/search/?api=1&query=棧貳庫停車'}
    ],
    lots: [
      {status:'available', name:'大勇駁二停車場', distance:'距離駁二約 200m', weekday:'20/半小時', holiday:'30/半小時', cash:'不確定', epay:'有', plate:'有', updated:'示範資料', note:'靠近駁二大勇區，適合停不到路邊格時改停。', maps:'https://www.google.com/maps/search/?api=1&query=大勇駁二停車場'},
      {status:'unknown', name:'大義倉庫周邊停車場', distance:'距離駁二約 350m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'適合前往大義倉庫與輕軌周邊。', maps:'https://www.google.com/maps/search/?api=1&query=駁二大義倉庫停車場'},
      {status:'full', name:'棧貳庫周邊停車區', distance:'距離駁二約 500m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'示範狀態', note:'假日與活動日較容易滿。', maps:'https://www.google.com/maps/search/?api=1&query=棧貳庫停車場'}
    ]
  },
  {
    id:'kmc', slug:'kaohsiung-music-center-parking.html', title:'高雄流行音樂中心附近停車場與路邊停車格', name:'高雄流行音樂中心', category:'市區文創與港灣', keywords:['高流停車','高雄流行音樂中心停車','高流路邊停車格','愛河灣停車'], intro:'已經要去高流時，先看周邊停車場與導航；停車場不合適時，再看可嘗試路段。',
    roads:[
      {type:'unknown', name:'海邊路／真愛碼頭周邊', distance:'距離高流約 200–600m', note:'周邊可能有路邊停車格或停車空間，活動日不建議反覆繞同一圈。', maps:'https://www.google.com/maps/search/?api=1&query=高雄流行音樂中心 路邊停車'},
      {type:'avoid', name:'高流活動入口周邊', distance:'靠近活動人潮區', note:'演唱會或活動日車流集中，若找不到格位請直接改查停車場。', maps:'https://www.google.com/maps/search/?api=1&query=高雄流行音樂中心 停車'}
    ], lots:[
      {status:'unknown', name:'高流周邊停車場', distance:'距離高流約 300–600m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'活動日建議提早查詢。', maps:'https://www.google.com/maps/search/?api=1&query=高雄流行音樂中心停車場'},
      {status:'unknown', name:'愛河灣周邊停車區', distance:'距離高流約 600–900m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'適合散步至高流。', maps:'https://www.google.com/maps/search/?api=1&query=愛河灣停車場'}]
  },
  {
    id:'love-river', slug:'love-river-parking.html', title:'愛河附近停車場與路邊停車格', name:'愛河風景區', category:'市區文創與港灣', keywords:['愛河停車','愛河路邊停車格','愛之船停車'], intro:'已經要去愛河時，先看附近停車場；停車場不合適時，再看可嘗試路段。',
    roads:[
      {type:'unknown', name:'河西路／河東路周邊', distance:'距離愛河約 100–500m', note:'可先查看路邊停車格，傍晚與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=愛河 河西路 河東路 停車'},
      {type:'avoid', name:'熱門碼頭與活動周邊', distance:'靠近人潮區', note:'活動時段不建議一直繞，找不到格位請改查停車場。', maps:'https://www.google.com/maps/search/?api=1&query=愛河 停車場'}
    ], lots:[
      {status:'unknown', name:'愛河周邊停車場', distance:'距離愛河約 300–800m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'傍晚與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=愛河停車場'}]
  },
  {
    id:'xiziwan', slug:'xiziwan-parking.html', title:'西子灣附近停車場與路邊停車格', name:'西子灣', category:'海景與人文', keywords:['西子灣停車','西子灣路邊停車格','打狗英國領事館停車','鼓山渡船頭停車'], intro:'已經要去西子灣時，先看附近停車場；停車場不合適時，再看可嘗試找格位的路段。',
    roads:[
      {type:'unknown', name:'臨海二路周邊', distance:'距離西子灣約 300–800m', note:'可查看路邊停車格，夕陽時段與假日通常較難找。', maps:'https://www.google.com/maps/search/?api=1&query=臨海二路 西子灣 停車'},
      {type:'unknown', name:'鼓山渡船頭周邊道路', distance:'距離渡船頭約 100–400m', note:'適合轉往旗津前先找格位，是否可停請以現場標線為準。', maps:'https://www.google.com/maps/search/?api=1&query=鼓山渡船頭 路邊停車'},
      {type:'avoid', name:'中山大學入口附近', distance:'靠近熱門入口', note:'尖峰時段容易壅塞，不建議反覆繞入口周邊。', maps:'https://www.google.com/maps/search/?api=1&query=西子灣 中山大學 停車'}
    ], lots:[
      {status:'unknown', name:'西子灣遊客停車區', distance:'距離西子灣約 500–900m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'夕陽時段與假日較擁擠。', maps:'https://www.google.com/maps/search/?api=1&query=西子灣停車場'},
      {status:'unknown', name:'鼓山渡船頭周邊停車場', distance:'距離渡船頭約 300m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'也可作為前往旗津前的停車選擇。', maps:'https://www.google.com/maps/search/?api=1&query=鼓山渡船頭停車場'}]
  },
  {
    id:'cijin', slug:'cijin-parking.html', title:'旗津附近停車場與路邊停車格', name:'旗津', category:'海景與人文', keywords:['旗津停車','旗津路邊停車格','旗津老街停車','旗津渡輪停車'], intro:'已經要去旗津時，先看附近停車場；停車場不合適時，再看哪些路段可嘗試找路邊停車格，避免一直亂繞。',
    roads:[
      {type:'unknown', name:'旗津三路周邊', distance:'距離旗津老街約 200–600m', note:'可先查看路邊停車格，假日與用餐時段不建議繞太久。', maps:'https://www.google.com/maps/search/?api=1&query=旗津三路 路邊停車'},
      {type:'unknown', name:'海岸公園周邊道路', distance:'距離旗津海岸約 200–700m', note:'可作為老街周邊滿位時的備選路段。', maps:'https://www.google.com/maps/search/?api=1&query=旗津海岸公園 停車'},
      {type:'avoid', name:'廟前路／老街核心周邊', distance:'靠近人潮核心', note:'人潮多、車流複雜，不建議一直繞核心區找車位。', maps:'https://www.google.com/maps/search/?api=1&query=旗津老街 停車'}
    ], lots:[
      {status:'unknown', name:'旗津老街周邊停車場', distance:'距離旗津老街約 300–800m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'假日與用餐時間停車需求高。', maps:'https://www.google.com/maps/search/?api=1&query=旗津老街停車場'}]
  },
  {
    id:'lotus-pond', slug:'lotus-pond-parking.html', title:'蓮池潭附近停車場與路邊停車格', name:'蓮池潭', category:'海景與人文', keywords:['蓮池潭停車','蓮池潭路邊停車格','龍虎塔停車','左營孔廟停車'], intro:'蓮池潭範圍較大，先依你要去的點找附近停車場；停車場不合適時，再看附近路段。',
    roads:[
      {type:'unknown', name:'蓮潭路周邊', distance:'依龍虎塔／春秋閣位置而定', note:'可查看路邊停車格，景點分散，建議不要只繞單一入口。', maps:'https://www.google.com/maps/search/?api=1&query=蓮潭路 路邊停車'},
      {type:'unknown', name:'左營孔廟周邊道路', distance:'距離孔廟約 100–500m', note:'可作為孔廟與蓮池潭北側備選路段。', maps:'https://www.google.com/maps/search/?api=1&query=左營孔廟 停車'},
      {type:'avoid', name:'龍虎塔熱門入口周邊', distance:'靠近熱門人潮區', note:'假日人潮多，若繞不到格位請改查附近停車場。', maps:'https://www.google.com/maps/search/?api=1&query=龍虎塔 停車'}
    ], lots:[
      {status:'unknown', name:'蓮池潭周邊停車場', distance:'依目的區域而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'景點分散，建議依目的區域選停車場。', maps:'https://www.google.com/maps/search/?api=1&query=蓮池潭停車場'}]
  },
  {
    id:'weiwuying', slug:'weiwuying-parking.html', title:'衛武營附近停車場與路邊停車格', name:'衛武營', category:'藝術與室內景點', keywords:['衛武營停車','衛武營路邊停車格','衛武營國家藝術文化中心停車'], intro:'已經要去衛武營時，先看周邊停車場；停車場不合適時，再看周邊路段。',
    roads:[
      {type:'unknown', name:'三多一路周邊', distance:'距離衛武營約 300–800m', note:'可查看路邊停車格，表演日不建議繞太久。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營 三多一路 停車'},
      {type:'unknown', name:'南京路／輜汽路周邊', distance:'距離衛武營約 500–900m', note:'可作為周邊停車場滿位時的備選路段。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營 南京路 停車'},
      {type:'avoid', name:'表演廳入口周邊', distance:'靠近入口人潮區', note:'活動前後車流多，不建議反覆繞入口區。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營 停車場'}
    ], lots:[
      {status:'unknown', name:'衛武營周邊停車場', distance:'距離衛武營約 300–800m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'表演日與假日人潮較多。', maps:'https://www.google.com/maps/search/?api=1&query=衛武營停車場'}]
  },
  {
    id:'formosa', slug:'formosa-boulevard-parking.html', title:'美麗島站附近停車場與路邊停車格', name:'美麗島站 光之穹頂', category:'藝術與室內景點', keywords:['美麗島站停車','美麗島站路邊停車格','光之穹頂停車','六合夜市停車'], intro:'已經要去美麗島站或六合夜市附近時，先看附近停車場；停車場不合適時，再看可嘗試路段。',
    roads:[
      {type:'unknown', name:'中山一路／中正路周邊', distance:'距離美麗島站約 100–500m', note:'可查看路邊停車格，但路口車流多，請依標線與告示停車。', maps:'https://www.google.com/maps/search/?api=1&query=美麗島站 中山一路 停車'},
      {type:'unknown', name:'六合夜市外圍道路', distance:'距離六合夜市約 200–600m', note:'晚間人潮多，可先找外圍路段，不建議只繞夜市入口。', maps:'https://www.google.com/maps/search/?api=1&query=六合夜市 外圍 停車'},
      {type:'avoid', name:'六合夜市核心路段', distance:'靠近夜市人潮', note:'夜市時段不建議開進核心區反覆找車位。', maps:'https://www.google.com/maps/search/?api=1&query=六合夜市 停車場'}
    ], lots:[
      {status:'unknown', name:'美麗島站周邊停車場', distance:'距離美麗島站約 200–600m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'晚間可接六合夜市人潮。', maps:'https://www.google.com/maps/search/?api=1&query=美麗島站停車場'}]
  },
  {
    id:'fgs', slug:'fo-guang-shan-parking.html', title:'佛光山佛陀紀念館附近停車場與路邊停車格', name:'佛光山佛陀紀念館', category:'近郊景點', keywords:['佛光山停車','佛光山路邊停車格','佛陀紀念館停車'], intro:'近郊景點以園區停車場為主，仍保留周邊路段提醒，避免亂停或亂繞。',
    roads:[
      {type:'avoid', name:'園區入口與周邊道路', distance:'依入口而定', note:'近郊景點不建議隨意找路邊停車，請優先使用園區或官方指引停車空間。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山佛陀紀念館 停車'},
      {type:'unknown', name:'周邊道路停車資訊', distance:'依現場標線而定', note:'若現場有路邊停車格，請以標線與告示為準；無即時空位資料。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山 周邊停車'}
    ], lots:[
      {status:'unknown', name:'佛陀紀念館停車場', distance:'依入口而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'園區較大，建議依當日入口與活動安排停車。', maps:'https://www.google.com/maps/search/?api=1&query=佛光山佛陀紀念館停車場'}]
  },
  {
    id:'moon-world', slug:'moon-world-parking.html', title:'田寮月世界附近停車場與路邊停車格', name:'田寮月世界', category:'近郊景點', keywords:['月世界停車','月世界路邊停車格','田寮月世界停車'], intro:'近郊景點以停車場與現場指引為主，避免在不確定路段亂繞或亂停。',
    roads:[
      {type:'avoid', name:'園區入口周邊道路', distance:'依入口而定', note:'不建議隨意停在未標示路段，請優先使用園區停車空間。', maps:'https://www.google.com/maps/search/?api=1&query=田寮月世界 停車'},
      {type:'unknown', name:'周邊道路停車資訊', distance:'依現場標線而定', note:'如有路邊停車格，需以現場標線與告示為準；無即時空位資料。', maps:'https://www.google.com/maps/search/?api=1&query=月世界 周邊停車'}
    ], lots:[
      {status:'unknown', name:'田寮月世界停車場', distance:'依入口而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'近郊景點建議出發前確認營業與停車資訊。', maps:'https://www.google.com/maps/search/?api=1&query=田寮月世界停車場'}]
  },
  {
    id:'qishan', slug:'qishan-old-street-parking.html', title:'旗山老街附近停車場與路邊停車格', name:'旗山老街', category:'近郊景點', keywords:['旗山老街停車','旗山路邊停車格','旗山停車'], intro:'已經要去旗山老街時，先看老街周邊停車場；停車場不合適時，再看外圍可嘗試路段。',
    roads:[
      {type:'unknown', name:'中山路外圍周邊', distance:'距離旗山老街約 100–500m', note:'可先查看外圍路邊停車格，假日不建議開進老街核心反覆繞。', maps:'https://www.google.com/maps/search/?api=1&query=旗山老街 中山路 停車'},
      {type:'unknown', name:'延平一路周邊', distance:'距離旗山老街約 300–700m', note:'可作為老街核心周邊滿位時的備選路段。', maps:'https://www.google.com/maps/search/?api=1&query=旗山 延平一路 停車'},
      {type:'avoid', name:'老街核心入口周邊', distance:'靠近人潮核心', note:'假日人潮多，不建議一直繞核心區找車位。', maps:'https://www.google.com/maps/search/?api=1&query=旗山老街 停車場'}
    ], lots:[
      {status:'unknown', name:'旗山老街周邊停車場', distance:'距離老街約 300–800m', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'假日老街周邊人車較多。', maps:'https://www.google.com/maps/search/?api=1&query=旗山老街停車場'}]
  },
  {
    id:'meinong', slug:'meinong-parking.html', title:'美濃附近停車場與路邊停車格', name:'美濃', category:'近郊景點', keywords:['美濃停車','美濃路邊停車格','美濃老街停車','美濃民俗村停車'], intro:'美濃景點分散，先依目的地查看周邊停車場；停車場不合適時，再看周邊路段。',
    roads:[
      {type:'unknown', name:'美濃老街周邊道路', distance:'依目的地而定', note:'可查看路邊停車格，是否可停請以現場標線與告示為準。', maps:'https://www.google.com/maps/search/?api=1&query=美濃老街 路邊停車'},
      {type:'unknown', name:'美濃民俗村周邊道路', distance:'依目的地而定', note:'景點分散，建議不要只繞同一路段。', maps:'https://www.google.com/maps/search/?api=1&query=美濃民俗村 停車'},
      {type:'avoid', name:'狹窄巷弄或未標示路段', distance:'依現場而定', note:'不建議停在未標線或影響通行的位置。', maps:'https://www.google.com/maps/search/?api=1&query=美濃 停車場'}
    ], lots:[
      {status:'unknown', name:'美濃老街周邊停車場', distance:'依目的地而定', weekday:'需確認', holiday:'需確認', cash:'不確定', epay:'不確定', plate:'不確定', updated:'無即時資料', note:'美濃景點分散，建議依目的地導航。', maps:'https://www.google.com/maps/search/?api=1&query=美濃停車場'}]
  }
];
