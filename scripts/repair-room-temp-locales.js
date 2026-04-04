const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const EN_DIR = path.join(ROOT, 'locales', 'en');
const LOCALES = ['zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const LOCALE_TAGS = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es-ES',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ja: 'ja-JP',
  fr: 'fr-FR',
  de: 'de-DE',
  id: 'id-ID',
  'pt-br': 'pt-BR',
};
const PAGES = {
  18: { slug: '18-c-to-f', c: 18, f: '64.4', nuance: 'coolSleep' },
  27: { slug: '27-c-to-f', c: 27, f: '80.6', nuance: 'outdoor' },
  28: { slug: '28-c-to-f', c: 28, f: '82.4', nuance: 'sleep' },
  29: { slug: '29-c-to-f', c: 29, f: '84.2', nuance: 'outdoor' },
  30: { slug: '30-c-to-f', c: 30, f: '86', nuance: 'ac' },
  31: { slug: '31-c-to-f', c: 31, f: '87.8', nuance: 'sleep' },
  32: { slug: '32-c-to-f', c: 32, f: '89.6', nuance: 'ac' },
  33: { slug: '33-c-to-f', c: 33, f: '91.4', nuance: 'ac' },
  34: { slug: '34-c-to-f', c: 34, f: '93.2', nuance: 'ac' },
  35: { slug: '35-c-to-f', c: 35, f: '95', nuance: 'heatwave' },
};

const PRACTICAL = {
  en: {
    title: '{c}°C ({f}°F) in daily life',
    cards: {
      coolSleep: [
        ['Cool enough to feel fresh', 'At {c}°C, many rooms feel pleasantly cool rather than cold. It is the kind of temperature where a light layer can change comfort quickly.'],
        ['Great for sleep and quiet indoor time', 'At {c}°C, bedrooms often feel comfortable for sleep, reading, or focused work without the room feeling stuffy.'],
        ['Outside, it usually means light layers', 'For walks and everyday errands, {c}°C often feels mild outdoors. Wind, shade, and cloud cover are what usually make it feel cooler.'],
      ],
      outdoor: [
        ['Warm but still manageable', 'At {c}°C, the day feels clearly warm, but many people still find it workable for walking, cafés, markets, and light outdoor plans if shade and water are nearby.'],
        ['Best for easy outdoor time', 'This temperature suits commuting, casual errands, terrace seating, and gentle movement better than intense sport. Sun and humidity decide how quickly it starts feeling hot.'],
        ['Indoors depend on airflow', 'Inside, {c}°C feels much easier with open windows, fans, or a breeze. Closed rooms usually feel warmer than the number suggests.'],
      ],
      sleep: [
        ['Warm day, warmer night', 'At {c}°C, daytime can still feel enjoyable, but the evening often stops feeling neutral. Bedrooms usually hold heat longer than living rooms do.'],
        ['Sleep comfort starts dropping', 'Many people begin sleeping less comfortably around this point, especially with humidity or weak airflow. Lighter bedding and moving air help a lot.'],
        ['Cooling makes a real difference', 'A fan, open window, or air conditioning matters much more at {c}°C than it does in milder weather.'],
      ],
      ac: [
        ['Midday feels properly hot', 'At {c}°C, late morning and afternoon usually feel genuinely hot, especially on pavement, in traffic, or under direct sun.'],
        ['Fans help, AC helps more', 'Indoors, cross-ventilation and fans still help, but many people start preferring air conditioning once rooms sit near {c}°C.'],
        ['Plan around the heat', 'Errands, workouts, and longer walks feel easier earlier or later in the day, with water and shade close by.'],
      ],
      heatwave: [
        ['Heat starts shaping the day', 'At {c}°C, the hottest hours often decide when people go out, exercise, or even run basic errands. The weather stops feeling merely summery and starts feeling demanding.'],
        ['Cooling becomes part of the routine', 'Shade, cold drinks, fans, and air conditioning matter more at {c}°C because the body has less margin for extra heat.'],
        ['Indoors can stay hot after sunset', 'At this temperature, rooms often hold onto the day’s heat. Even evenings can feel heavy if airflow is weak or humidity is high.'],
      ],
    },
  },
  zh: {
    title: '{c}°C（{f}°F）在日常里的常见场景',
    cards: {
      coolSleep: [
        ['偏凉，但通常不冷', '{c}°C 的房间多数时候会让人觉得清爽，而不是发冷。加一件薄外套或盖上薄毯，舒适度就会明显上来。'],
        ['很适合睡觉和安静待着', '{c}°C 常常落在很多人觉得好睡的区间里，也适合阅读、办公和在家慢慢待着，不容易觉得闷。'],
        ['出门多半只要轻薄加层', '在户外，{c}°C 往往更像舒服的春秋天。真正让人觉得凉的，通常是阴天、风大或晒不到太阳。'],
      ],
      outdoor: [
        ['偏暖，但还算好安排', '{c}°C 已经有明显暖意，不过多数人仍会觉得它适合散步、通勤、逛街或坐在户外喝点东西，只是最好顺手带水。'],
        ['更适合轻量户外活动', '这个温度更适合慢走、聊天、露台用餐和轻运动，不太适合长时间暴晒或高强度锻炼。'],
        ['室内更看通风', '在室内时，开窗、风扇和空气流动会明显提升舒适度；如果房间闷，体感往往比数字更热。'],
      ],
      sleep: [
        ['白天偏暖，夜里更明显', '{c}°C 白天还算能接受，但一到晚上，热感通常会更明显，卧室也更容易积热。'],
        ['睡眠舒适度开始下降', '很多人从这个温度开始觉得睡觉偏热，特别是湿度高、空气不流动的时候。'],
        ['风扇或空调更重要', '到了 {c}°C，风扇、通风和空调带来的差别会比温和天气时更明显。'],
      ],
      ac: [
        ['午后热感更突出', '{c}°C 到了中午和下午通常就不是“有点暖”了，而是会让人明显想找阴凉或降温。'],
        ['风扇有帮助，空调更稳', '在这个温度下，风扇和通风能缓解闷热，但很多人会更偏向直接开空调。'],
        ['出门和运动最好错峰', '跑腿、散步和运动放到早晚更轻松，白天则更需要水分和遮阳。'],
      ],
      heatwave: [
        ['一天会被高温重新安排', '{c}°C 往往会让人开始围着高温来安排一天：什么时候出门、什么时候运动、什么时候待在室内，都会明显受影响。'],
        ['降温不再只是舒服，而是必要', '到了 {c}°C，阴凉、水分、风扇和空调不只是提升舒适度，而是很实际的降温手段。'],
        ['夜里也未必轻松', '这种温度下，房间和墙体很容易把白天的热留到晚上，睡前和入夜后的闷热感通常更明显。'],
      ],
    },
  },
  es: {
    title: 'Dónde suele encajar {c} °C ({f} °F)',
    cards: {
      coolSleep: [
        ['Fresco, pero no frío', 'A {c} °C muchas habitaciones se sienten frescas y agradables, no frías. Una capa ligera suele bastar para cambiar mucho la sensación.'],
        ['Muy bueno para dormir y estar dentro', 'A {c} °C mucha gente duerme bien y también se siente cómoda leyendo, trabajando o descansando sin notar el aire cargado.'],
        ['Fuera suele bastar una capa ligera', 'En la calle, {c} °C suelen sentirse suaves. Lo que más enfría suele ser la sombra, el viento o un día nublado.'],
      ],
      outdoor: [
        ['Cálido pero llevadero', 'A {c} °C el día ya se siente claramente cálido, pero todavía encaja bien con paseos, terrazas, recados y planes suaves si hay agua y algo de sombra.'],
        ['Mejor para planes tranquilos', 'Esta temperatura va mejor con caminar, moverse con calma o estar al aire libre sin demasiada intensidad. El sol y la humedad marcan la diferencia.'],
        ['Dentro manda el aire', 'En interior, {c} °C se lleva mucho mejor con ventanas abiertas, ventilador o corriente. En un piso cerrado suele parecer más caliente.'],
      ],
      sleep: [
        ['Día cálido, noche más pesada', 'Con {c} °C el día aún puede ser agradable, pero por la noche la sensación suele volverse menos neutra y el dormitorio guarda más calor.'],
        ['Dormir empieza a costar', 'A partir de esta franja mucha gente duerme peor, sobre todo con humedad o poco movimiento de aire.'],
        ['Ventilar o enfriar ayuda', 'Ventilador, ventana abierta o aire acondicionado marcan bastante más diferencia a {c} °C que en temperaturas suaves.'],
      ],
      ac: [
        ['El mediodía ya se nota', 'A {c} °C las últimas horas de la mañana y la tarde suelen sentirse claramente calurosas, sobre todo con asfalto, tráfico o sol directo.'],
        ['Ventilador ayuda; AC ayuda más', 'Dentro de casa, el aire cruzado y los ventiladores sirven, pero muchas personas ya prefieren aire acondicionado en esta franja.'],
        ['Mejor mover los planes', 'Recados, deporte y caminatas largas suelen llevarse mejor a primera hora o al final del día, con agua a mano.'],
      ],
      heatwave: [
        ['El calor ya manda el horario', 'A {c} °C mucha gente empieza a organizar el día alrededor del calor: salir antes, moverse menos al mediodía y buscar sombra con más intención.'],
        ['Enfriar deja de ser un lujo', 'Sombra, agua, ventiladores y aire acondicionado dejan de sentirse opcionales y pasan a ser parte práctica del día.'],
        ['La noche también puede pesar', 'Con {c} °C, las casas suelen guardar calor durante más tiempo, así que incluso al anochecer el ambiente puede seguir cargado.'],
      ],
    },
  },
  hi: {
    title: '{c}°C ({f}°F) रोजमर्रा में कैसा लगता है',
    cards: {
      coolSleep: [
        ['हल्का ठंडा, लेकिन असुविधाजनक नहीं', '{c}°C पर कमरा अक्सर ठंडा नहीं बल्कि ताज़ा महसूस होता है। हल्की परत या पतला कंबल आराम को जल्दी बेहतर बना देता है।'],
        ['नींद और शांत इनडोर समय के लिए अच्छा', '{c}°C पर बहुत लोगों को सोना, पढ़ना या शांति से काम करना आसान लगता है क्योंकि कमरा घुटनभरा नहीं लगता।'],
        ['बाहर बस हल्की परत काफी रहती है', 'बाहर {c}°C अक्सर सुहावना लगता है। हवा, छाया और बादल ही इसे ज़्यादा ठंडा महसूस कराते हैं।'],
      ],
      outdoor: [
        ['गर्म, लेकिन संभालने लायक', '{c}°C पर मौसम साफ तौर पर गर्म लगता है, फिर भी टहलने, छोटे काम, हल्की आउटडोर प्लानिंग और कैफ़े जैसी चीज़ों के लिए ठीक रहता है, अगर पानी और थोड़ी छाया मिल जाए।'],
        ['हल्की आउटडोर गतिविधियों के लिए बेहतर', 'यह तापमान आराम से चलने-फिरने, हल्के व्यायाम और बाहर बैठने के लिए ठीक है, लेकिन तेज़ धूप में ज़्यादा मेहनत जल्दी भारी लग सकती है।'],
        ['कमरे में हवा ज़्यादा मायने रखती है', 'घर या कमरे के अंदर {c}°C खुली खिड़की, पंखे या हवा के बहाव के साथ काफी बेहतर लगता है। बंद कमरे जल्दी ज्यादा गर्म महसूस होते हैं।'],
      ],
      sleep: [
        ['दिन गर्म, रात और भारी', '{c}°C पर दिन तो किसी तरह ठीक लग सकता है, लेकिन रात में यही तापमान ज़्यादा चुभता है और बेडरूम में गर्मी टिक जाती है।'],
        ['नींद की आरामदायक सीमा नीचे जाती है', 'इस तापमान के आसपास बहुत लोगों को नींद हल्की या बेचैन लगने लगती है, खासकर जब नमी ज़्यादा हो या हवा कम हो।'],
        ['कूलिंग ज़्यादा ज़रूरी हो जाती है', 'पंखा, खुली खिड़की या AC जैसी चीज़ें {c}°C पर हल्के मौसम की तुलना में कहीं ज़्यादा फर्क डालती हैं।'],
      ],
      ac: [
        ['दोपहर सच में गर्म लगती है', '{c}°C पर देर सुबह और दोपहर का समय खास तौर पर गर्म महसूस होता है, खासकर धूप, सड़क और ट्रैफ़िक के बीच।'],
        ['पंखा मदद करता है, AC और ज्यादा', 'घर के अंदर हवा का बहाव और पंखा राहत देते हैं, लेकिन इस तापमान पर कई लोग AC को ज्यादा आरामदायक मानते हैं।'],
        ['काम समय देखकर करें', 'बाहर के काम, वॉक और वर्कआउट सुबह या शाम को आसान लगते हैं। दिन में पानी और छाया ज़्यादा जरूरी हो जाते हैं।'],
      ],
      heatwave: [
        ['दिन की रफ्तार गर्मी तय करती है', '{c}°C पर लोग अक्सर दिन की योजना ही गर्मी देखकर बनाते हैं—कब बाहर निकलना है, कब काम निपटाना है और कब ठंडी जगह ढूँढनी है।'],
        ['कूलिंग ज़रूरत बन जाती है', 'इस तापमान पर छाया, पानी, पंखा और AC केवल आराम की चीज़ें नहीं रहते, बल्कि शरीर को संभालने के साधन बन जाते हैं।'],
        ['रात भी जल्दी हल्की नहीं होती', '{c}°C पर कमरा अक्सर देर तक गर्म रहता है, इसलिए शाम और रात में भी घुटन या बेचैनी बनी रह सकती है।'],
      ],
    },
  },
  ar: {
    title: 'أين تناسب {c}°C ({f}°F) في الحياة اليومية',
    cards: {
      coolSleep: [
        ['مائل للبرودة لكنه غير مزعج', 'عند {c}°C تبدو كثير من الغرف منعشة أكثر من كونها باردة، وغالباً تكفي طبقة خفيفة لتعديل الإحساس بسرعة.'],
        ['مناسب للنوم والجلوس الهادئ', 'كثير من الناس يجدون {c}°C مريحاً للنوم والقراءة والعمل الهادئ لأن الجو لا يكون خانقاً.'],
        ['في الخارج تكفي طبقة خفيفة غالباً', 'في الخارج تبدو {c}°C معتدلة في العادة، وما يجعلها أبرد غالباً هو الظل أو الرياح أو غياب الشمس.'],
      ],
      outdoor: [
        ['دافئة لكن ما زالت محتملة', 'عند {c}°C يصبح الجو دافئاً بوضوح، لكنه ما زال مناسباً للمشي والمشاوير الخفيفة والجلوس في الخارج إذا توفّر ماء وظل قريب.'],
        ['أفضل للأنشطة الخفيفة', 'هذه الدرجة تناسب المشي الهادئ والتنقل اليومي والجلوس في الهواء الطلق أكثر من الرياضة القوية تحت الشمس.'],
        ['في الداخل يعتمد الأمر على التهوية', 'داخل المنزل تبدو {c}°C أريح مع نافذة مفتوحة أو مروحة أو حركة هواء. أما الغرف المغلقة فتبدو أحر من الرقم نفسه.'],
      ],
      sleep: [
        ['نهار دافئ وليل أثقل', 'عند {c}°C قد يكون النهار مقبولاً، لكن الليل غالباً لا يبقى محايداً، وتحتفظ غرف النوم بالحرارة مدة أطول.'],
        ['الراحة أثناء النوم تبدأ بالانخفاض', 'كثير من الناس يبدأون بالشعور بأن النوم أقل راحة عند هذه الدرجة، خصوصاً مع الرطوبة أو ضعف التهوية.'],
        ['التبريد يصنع فرقاً واضحاً', 'المروحة أو النافذة المفتوحة أو المكيف تصبح أهم بكثير عند {c}°C مقارنة بالأجواء الألطف.'],
      ],
      ac: [
        ['منتصف النهار يبدو حاراً فعلاً', 'عند {c}°C يتحول آخر الصباح وبعد الظهر إلى وقت حار فعلاً، خاصة فوق الإسفلت أو تحت الشمس المباشرة.'],
        ['المروحة تساعد والمكيف أكثر', 'في الداخل تفيد التهوية والمراوح، لكن كثيراً من الناس يفضّلون المكيف عندما تقترب الغرف من {c}°C.'],
        ['من الأفضل ترتيب اليوم حول الحر', 'المشاوير والرياضة والمشي الطويل تصبح أسهل صباحاً أو مساءً مع ماء وظل قريبين.'],
      ],
      heatwave: [
        ['الحر يبدأ بترتيب اليوم', 'عند {c}°C يبدأ كثير من الناس بتنظيم اليوم كله حول الحر: متى يخرجون، ومتى يتحركون، ومتى يبحثون عن مكان أبرد.'],
        ['التبريد يصبح حاجة عملية', 'الظل والماء والمراوح والمكيف لا تعود مجرد وسائل راحة، بل تصبح أدوات أساسية للتعامل مع الجو.'],
        ['الليل قد يبقى ثقيلاً', 'في هذه الدرجة تحتفظ البيوت بالحرارة لفترة أطول، لذلك قد يبقى المساء والليل خانقين حتى بعد غياب الشمس.'],
      ],
    },
  },
  ja: {
    title: '{c}°C（{f}°F）が日常でどう感じるか',
    cards: {
      coolSleep: [
        ['涼しめだが寒すぎない', '{c}°C の部屋は、寒いというより少しひんやりして気持ちいいと感じる人が多い温度です。薄手を一枚足すだけで快適さが変わりやすくなります。'],
        ['睡眠や静かな室内時間に向く', '{c}°C は寝室にも合いやすく、読書やデスクワーク、家でゆっくり過ごす時間にも向いています。'],
        ['外では薄手を一枚足す程度', '外では {c}°C は穏やかに感じやすく、肌寒さを決めるのは風や日陰、曇り空であることが多いです。'],
      ],
      outdoor: [
        ['暖かいが、まだ動きやすい', '{c}°C になると日中はしっかり暖かく感じますが、水分と日陰があれば散歩、買い物、カフェなどの軽い外出にはまだ向いています。'],
        ['軽めの外出向き', 'この気温はゆっくり歩く、短い移動をする、外で少し過ごすといった場面に向いていて、強い運動にはあまり向きません。'],
        ['室内は風通しで差が出る', '室内では窓を開ける、扇風機を使う、風が通るとかなり楽になります。閉め切った部屋は数字以上に暑く感じやすいです。'],
      ],
      sleep: [
        ['昼は平気でも夜は重い', '{c}°C では昼間はまだ過ごせても、夜になると熱がこもりやすく、寝室では暑さが残りやすくなります。'],
        ['睡眠の快適さが落ちやすい', 'このあたりの気温から、湿度や風の弱さによって寝苦しさを感じる人が増えてきます。'],
        ['冷やす工夫が効く', '扇風機、換気、エアコンの差が、穏やかな気温のときよりも {c}°C ではずっと大きくなります。'],
      ],
      ac: [
        ['昼前後はしっかり暑い', '{c}°C になると午前後半から午後にかけては、直射日光やアスファルトの上でかなり暑く感じやすくなります。'],
        ['扇風機も効くが、冷房が楽', '室内では風通しや扇風機でも助かりますが、この気温帯では冷房を入れたくなる人が増えます。'],
        ['予定は暑さを避けて組む', '買い物や運動、長めの移動は朝夕のほうが楽で、水分と日陰の確保が大切になります。'],
      ],
      heatwave: [
        ['一日の動きが暑さ中心になる', '{c}°C では、外に出る時間や移動の仕方を暑さに合わせて考える人が増えます。昼の行動はかなり重く感じやすくなります。'],
        ['冷やす工夫が実用品になる', '日陰、水分、扇風機、冷房は快適さのためだけでなく、体を保つための現実的な対策になります。'],
        ['夜も熱が残りやすい', 'この温度では部屋が昼の熱を抱え込みやすく、日が落ちても寝苦しさが残ることがあります。'],
      ],
    },
  },
  fr: {
    title: 'Où {c} °C ({f} °F) se placent dans la vie quotidienne',
    cards: {
      coolSleep: [
        ['Frais, sans être froid', 'À {c} °C, beaucoup de pièces paraissent fraîches et agréables plutôt que froides. Une couche légère suffit souvent à ajuster le confort.'],
        ['Très bon pour dormir et rester au calme', 'Autour de {c} °C, beaucoup de gens dorment bien et se sentent à l’aise pour lire, travailler ou se reposer sans sensation d’air lourd.'],
        ['Dehors, une couche légère suffit souvent', 'En extérieur, {c} °C donnent souvent une impression douce. Ce sont surtout le vent, l’ombre ou les nuages qui rendent l’air plus frais.'],
      ],
      outdoor: [
        ['Chaud, mais encore gérable', 'À {c} °C, la journée paraît clairement chaude, mais reste encore adaptée à la marche, aux courses, aux terrasses et aux sorties légères avec de l’eau et un peu d’ombre.'],
        ['Mieux pour les activités tranquilles', 'Cette température convient mieux aux déplacements calmes, à la promenade et à une activité légère qu’au sport intense en plein soleil.'],
        ['En intérieur, tout dépend de l’air', 'À l’intérieur, {c} °C passent beaucoup mieux avec de l’aération, une fenêtre ouverte ou un ventilateur. Une pièce fermée semble vite plus chaude.'],
      ],
      sleep: [
        ['Journée chaude, nuit plus lourde', 'Autour de {c} °C, la journée peut encore passer, mais la soirée perd souvent son côté neutre et la chambre garde davantage la chaleur.'],
        ['Le confort de sommeil baisse', 'Beaucoup de personnes commencent à moins bien dormir à cette température, surtout avec de l’humidité ou peu de circulation d’air.'],
        ['Le rafraîchissement compte vraiment', 'Ventilateur, fenêtre ouverte ou climatisation changent bien plus les choses à {c} °C qu’en météo plus douce.'],
      ],
      ac: [
        ['Le milieu de journée devient chaud', 'À {c} °C, la fin de matinée et l’après-midi paraissent franchement chaudes, surtout sur le bitume ou en plein soleil.'],
        ['Le ventilateur aide, la clim plus encore', 'En intérieur, l’aération aide encore, mais beaucoup préfèrent déjà la climatisation autour de {c} °C.'],
        ['Mieux vaut organiser sa journée', 'Courses, sport et longues marches sont souvent plus faciles tôt ou tard, avec de l’eau et un peu d’ombre.'],
      ],
      heatwave: [
        ['La chaleur commence à organiser la journée', 'À {c} °C, beaucoup de gens adaptent déjà leurs horaires au pic de chaleur: sortir plus tôt, ralentir à midi et chercher l’ombre plus souvent.'],
        ['Le rafraîchissement devient concret', 'L’ombre, l’eau, les ventilateurs et la climatisation ne relèvent plus seulement du confort: ils deviennent de vrais outils du quotidien.'],
        ['La soirée peut rester lourde', 'À cette température, les logements gardent souvent la chaleur plus longtemps, si bien que la nuit ne rafraîchit pas toujours assez vite.'],
      ],
    },
  },
  de: {
    title: '{c}°C ({f}°F) im Alltag',
    cards: {
      coolSleep: [
        ['Frisch, aber nicht kalt', 'Bei {c}°C fühlen sich viele Räume angenehm frisch statt richtig kalt an. Mit einer leichten Schicht lässt sich der Komfort schnell anpassen.'],
        ['Gut zum Schlafen und für ruhige Innenräume', '{c}°C passen oft gut zu Schlafzimmern, Lesen, konzentrierter Arbeit oder entspanntem Zuhause-Sein, ohne dass die Luft stickig wirkt.'],
        ['Draußen reicht oft eine leichte Schicht', 'Im Freien fühlen sich {c}°C meist mild an. Kälter wirkt es vor allem durch Wind, Schatten oder fehlende Sonne.'],
      ],
      outdoor: [
        ['Warm, aber noch gut machbar', 'Bei {c}°C fühlt sich der Tag klar warm an, ist für Spaziergänge, Erledigungen, Cafébesuche und lockere Außenpläne aber oft noch gut machbar, wenn Wasser und Schatten da sind.'],
        ['Besser für ruhige Outdoor-Zeit', 'Diese Temperatur passt eher zu lockerem Gehen, kurzen Wegen und entspannten Aktivitäten draußen als zu hartem Sport in der Sonne.'],
        ['Drinnen zählt Luftbewegung', 'In Innenräumen sind {c}°C mit offenen Fenstern, Ventilator oder Luftzug deutlich angenehmer. Geschlossene Räume fühlen sich meist wärmer an als die Zahl vermuten lässt.'],
      ],
      sleep: [
        ['Warmer Tag, schwerere Nacht', 'Rund um {c}°C kann der Tag noch okay sein, aber abends kippt das Gefühl oft ins Wärmere, und Schlafzimmer speichern Hitze länger.'],
        ['Schlaf wird weniger bequem', 'Ab dieser Temperatur schlafen viele Menschen schlechter, besonders bei hoher Luftfeuchtigkeit oder wenig Luftbewegung.'],
        ['Kühlung bringt deutlich mehr', 'Ventilator, offene Fenster oder Klimaanlage machen bei {c}°C deutlich mehr Unterschied als an milderen Tagen.'],
      ],
      ac: [
        ['Mittags wird es richtig heiß', 'Bei {c}°C fühlt sich besonders die Zeit vom späten Vormittag bis zum Nachmittag spürbar heiß an, vor allem auf Asphalt oder in direkter Sonne.'],
        ['Ventilator hilft, Klima oft mehr', 'Innen helfen Luftzug und Ventilator noch, aber viele empfinden bei Raumwerten um {c}°C eine Klimaanlage als deutlich angenehmer.'],
        ['Tagespläne an die Wärme anpassen', 'Erledigungen, Sport und längere Wege fühlen sich morgens oder abends leichter an, mit Wasser und Schatten in der Nähe.'],
      ],
      heatwave: [
        ['Die Hitze bestimmt den Tagesablauf', 'Bei {c}°C richten viele Menschen den Tag bereits nach der Wärme aus: früher raus, mittags weniger tun, schneller wieder in den Schatten.'],
        ['Kühlung wird praktisch notwendig', 'Schatten, Wasser, Ventilator und Klimaanlage wirken nicht mehr wie Extras, sondern wie echte Hilfen, um den Tag gut zu überstehen.'],
        ['Abends bleibt Wärme oft hängen', 'Bei dieser Temperatur speichern Wohnungen und Straßen viel Wärme, sodass sich auch der Abend noch schwer und heiß anfühlen kann.'],
      ],
    },
  },
  id: {
    title: '{c}°C ({f}°F) dalam keseharian',
    cards: {
      coolSleep: [
        ['Sejuk, tapi tidak dingin', 'Pada {c}°C, banyak ruangan terasa sejuk dan segar, bukan dingin. Lapisan tipis biasanya sudah cukup untuk menyesuaikan rasa nyaman.'],
        ['Cocok untuk tidur dan aktivitas indoor yang tenang', '{c}°C sering terasa pas untuk tidur, membaca, bekerja fokus, atau santai di rumah karena ruangannya tidak terasa pengap.'],
        ['Di luar biasanya cukup lapisan ringan', 'Di luar ruangan, {c}°C sering terasa ringan dan enak. Yang paling membuatnya terasa lebih dingin biasanya angin, bayangan, atau cuaca mendung.'],
      ],
      outdoor: [
        ['Hangat, tapi masih enak dijalani', 'Pada {c}°C, siang terasa jelas hangat, tetapi masih cocok untuk jalan santai, belanja ringan, nongkrong, dan aktivitas luar yang tidak terlalu berat kalau ada air dan tempat teduh.'],
        ['Lebih cocok untuk aktivitas ringan', 'Suhu ini lebih pas untuk jalan kaki, urusan harian, dan kegiatan santai di luar daripada olahraga berat di bawah matahari.'],
        ['Di dalam ruangan, angin sangat membantu', 'Di dalam rumah, {c}°C terasa jauh lebih nyaman kalau ada jendela terbuka, kipas, atau aliran udara. Ruangan tertutup biasanya terasa lebih panas dari angkanya.'],
      ],
      sleep: [
        ['Siang hangat, malam lebih terasa', 'Pada {c}°C, siang mungkin masih terasa oke, tetapi malam biasanya tidak lagi netral dan kamar tidur menahan panas lebih lama.'],
        ['Tidur mulai kurang nyaman', 'Banyak orang mulai merasa tidur kurang nyenyak pada suhu seperti ini, terutama jika lembap atau aliran udaranya lemah.'],
        ['Pendinginan jadi lebih penting', 'Kipas, jendela terbuka, atau AC memberi perbedaan jauh lebih besar pada {c}°C dibanding cuaca yang lebih sejuk.'],
      ],
      ac: [
        ['Tengah hari terasa benar-benar panas', 'Pada {c}°C, akhir pagi sampai sore biasanya sudah terasa panas sungguhan, apalagi di jalan aspal atau bawah matahari langsung.'],
        ['Kipas membantu, AC lebih terasa', 'Di dalam ruangan, ventilasi silang dan kipas tetap membantu, tetapi banyak orang mulai memilih AC saat suhu mendekati {c}°C.'],
        ['Atur aktivitas menghindari panas', 'Belanja, olahraga, dan jalan jauh biasanya terasa lebih enak pagi atau sore, sambil tetap dekat dengan air minum dan tempat teduh.'],
      ],
      heatwave: [
        ['Panas mulai mengatur ritme hari', 'Pada {c}°C, banyak orang mulai mengatur kegiatan berdasarkan panas: keluar lebih pagi, mengurangi aktivitas siang, dan lebih sering mencari tempat teduh.'],
        ['Pendinginan jadi kebutuhan nyata', 'Tempat teduh, air minum, kipas, dan AC terasa jauh lebih penting karena tubuh punya ruang lebih kecil untuk menahan tambahan panas.'],
        ['Malam pun bisa tetap gerah', 'Pada suhu ini, rumah sering menyimpan panas sampai malam, jadi suasana berat dan gerah bisa bertahan lebih lama.'],
      ],
    },
  },
  'pt-br': {
    title: 'Onde {c}°C ({f}°F) entram no dia a dia',
    cards: {
      coolSleep: [
        ['Fresco, sem ficar frio', 'Com {c}°C, muitos ambientes internos parecem frescos e agradáveis, não frios. Uma camada leve já muda bastante o conforto.'],
        ['Muito bom para dormir e ficar em casa', '{c}°C costumam funcionar bem para dormir, ler, trabalhar com calma ou ficar em casa sem sensação de abafamento.'],
        ['Na rua, uma camada leve costuma bastar', 'Ao ar livre, {c}°C geralmente parecem amenos. O que mais puxa para o frio costuma ser vento, sombra ou falta de sol.'],
      ],
      outdoor: [
        ['Quente, mas ainda dá para levar', 'Com {c}°C, o dia já fica claramente quente, mas ainda combina com caminhada, recados, café na rua e planos leves se houver água e um pouco de sombra.'],
        ['Melhor para programas tranquilos', 'Essa faixa combina mais com andar sem pressa, fazer pequenas saídas e ficar ao ar livre sem esforço pesado do que com exercício forte no sol.'],
        ['Dentro de casa, o ar faz diferença', 'Em ambiente interno, {c}°C ficam bem mais suportáveis com janela aberta, ventilador ou circulação de ar. Em cômodo fechado costuma parecer mais quente.'],
      ],
      sleep: [
        ['Dia quente, noite mais pesada', 'Em {c}°C o dia ainda pode passar bem, mas à noite a sensação costuma ficar menos neutra e o quarto segura calor por mais tempo.'],
        ['O sono perde conforto', 'Muita gente começa a dormir pior nessa faixa, especialmente com umidade alta ou pouco vento.'],
        ['Ventilar ou resfriar ajuda muito', 'Ventilador, janela aberta ou ar-condicionado fazem bem mais diferença em {c}°C do que em temperaturas mais suaves.'],
      ],
      ac: [
        ['O meio do dia já pesa', 'Com {c}°C, fim da manhã e tarde já costumam parecer realmente quentes, especialmente no asfalto, no trânsito ou no sol direto.'],
        ['Ventilador ajuda; ar ajuda mais', 'Dentro de casa, ventilação cruzada e ventilador aliviam, mas muita gente já prefere ar-condicionado quando o ambiente fica perto de {c}°C.'],
        ['Vale organizar o dia pelo calor', 'Caminhada, exercício e recados longos costumam render melhor cedo ou mais no fim do dia, com água e sombra por perto.'],
      ],
      heatwave: [
        ['O calor começa a mandar no dia', 'Com {c}°C, muita gente passa a organizar horários e deslocamentos em função do calor: sair cedo, fazer menos no pico e procurar sombra mais rápido.'],
        ['Resfriar deixa de ser luxo', 'Sombra, água, ventilador e ar-condicionado deixam de parecer extras e passam a ser recursos práticos para atravessar o dia.'],
        ['A noite também segura calor', 'Nessa faixa, casas e quartos costumam guardar o calor do dia por mais tempo, então o fim da tarde e a noite ainda podem pesar bastante.'],
      ],
    },
  },
};

const FAQ_OVERRIDES = {
  35: {
    en: [
      {
        question: 'Is 35°C hot or cold for weather?',
        answerHtml:
          '<p>For weather, 35°C (95°F) is very hot. In many places it is the kind of temperature where people change outdoor plans, look for shade, and treat the afternoon as serious heat rather than normal summer warmth.</p>',
      },
      {
        question: 'Is 35°C a fever temperature?',
        answerHtml:
          '<p>No. As a body-temperature reading, 35°C is actually below normal. Fever usually starts around 38°C (100.4°F), while 35°C body temperature points toward hypothermia, not fever.</p>',
      },
      {
        question: 'Is 35°C dangerous for a baby?',
        answerHtml:
          '<p>It can be risky. Babies heat up faster than adults and depend on adults to keep them cool, shaded, and hydrated.</p><ul><li>Limit direct sun and hot-stroller time</li><li>Keep air moving and dress them lightly</li><li>If a baby seems unusually sleepy, flushed, or hard to settle, cool them down and seek medical advice if needed</li></ul>',
      },
      {
        question: 'What is wet-bulb temperature and why is 35°C dangerous?',
        answerHtml:
          '<p>Wet-bulb temperature reflects how well sweating can cool the body. When humidity rises, sweat stops evaporating efficiently, so heat stress builds much faster.</p><p>A wet-bulb temperature near 35°C is considered critical because the body can no longer cool itself effectively, even in the shade.</p>',
      },
      {
        question: 'How do I convert 35 degrees Celsius to Fahrenheit in my head?',
        answerHtml:
          '<p>A quick mental shortcut is to double 35, subtract 10%, then add 32.</p><p>35 × 2 = 70, 70 - 7 = 63, and 63 + 32 = 95°F.</p><p>It is fast, and in this case it gives the exact answer.</p>',
      },
      {
        question: 'What other common temperatures are near 35°C?',
        answerHtml:
          '<p>Nearby temperatures help show where 35°C sits on the heat scale:</p><ul><li>33°C = 91.4°F, already very hot</li><li>35°C = 95°F, where heat precautions become more important</li><li>37°C = 98.6°F, normal human body temperature</li><li>40°C = 104°F, extreme heat in many regions</li></ul>',
      },
    ],
    zh: [
      { question: '35°C 算冷还是热？', answerHtml: '<p>如果是天气，35°C（95°F）已经属于明显炎热的范围。很多人会开始避开正午、缩短户外停留时间，并把防晒、补水和找阴凉当成必要安排。</p>' },
      { question: '35°C 是发烧吗？', answerHtml: '<p>不是。作为体温读数，35°C 反而低于正常值。人体发烧通常从 38°C（100.4°F）附近开始，而 35°C 体温更接近失温风险，不是发烧。</p>' },
      { question: '35°C 对婴儿危险吗？', answerHtml: '<p>有可能。婴儿比成年人更容易受热，也更依赖大人帮助降温。</p><ul><li>尽量避免暴晒和闷热的婴儿车环境</li><li>保持通风，穿轻薄透气的衣物</li><li>如果宝宝明显发红、烦躁、嗜睡或不容易安抚，要尽快降温并按情况咨询医生</li></ul>' },
      { question: '什么是湿球温度？为什么 35°C 会危险？', answerHtml: '<p>湿球温度反映的是人体靠出汗蒸发来散热的效率。空气越潮湿，汗越难蒸发，热压力就会上升得更快。</p><p>当湿球温度接近 35°C 时，人体几乎无法有效散热，即使在阴凉处也会非常危险。</p>' },
      { question: '35°C 怎么心算成华氏度？', answerHtml: '<p>一个好记的方法是先把 35 翻倍，再减去 10%，最后加 32。</p><p>35 × 2 = 70，70 - 7 = 63，63 + 32 = 95°F。</p><p>这个温度刚好可以算到精确值。</p>' },
      { question: '35°C 附近还有哪些常见温度？', answerHtml: '<p>附近几个温度能帮助判断 35°C 的位置：</p><ul><li>33°C = 91.4°F，已经很热</li><li>35°C = 95°F，高温防护要更认真</li><li>37°C = 98.6°F，正常人体体温</li><li>40°C = 104°F，很多地区会被视为极端高温</li></ul>' }
    ],
    es: [
      { question: '¿35 °C se siente frío o calor?', answerHtml: '<p>Si hablamos del tiempo, 35 °C (95 °F) ya es un calor fuerte. En muchas zonas es la clase de temperatura que hace cambiar horarios, buscar sombra y tratar la tarde como calor serio, no como simple verano agradable.</p>' },
      { question: '¿35 °C es fiebre?', answerHtml: '<p>No. Como temperatura corporal, 35 °C está por debajo de lo normal. La fiebre suele empezar cerca de 38 °C (100,4 °F), mientras que 35 °C en el cuerpo apunta más a hipotermia que a fiebre.</p>' },
      { question: '¿35 °C es peligroso para un bebé?', answerHtml: '<p>Puede serlo. Los bebés se recalientan más rápido y dependen de los adultos para mantenerse frescos.</p><ul><li>Evita el sol directo y el carrito caliente</li><li>Mantén el aire en movimiento y viste al bebé con ropa ligera</li><li>Si se ve muy rojo, adormilado o difícil de calmar, conviene enfriarlo y pedir consejo médico si hace falta</li></ul>' },
      { question: '¿Qué es la temperatura de bulbo húmedo y por qué 35 °C es peligrosa?', answerHtml: '<p>La temperatura de bulbo húmedo muestra hasta qué punto el sudor puede enfriar el cuerpo. Cuando hay mucha humedad, el sudor evapora peor y el estrés térmico sube mucho más rápido.</p><p>Un bulbo húmedo cercano a 35 °C se considera crítico porque el cuerpo deja de poder enfriarse bien, incluso a la sombra.</p>' },
      { question: '¿Cómo convierto 35 °C a Fahrenheit mentalmente?', answerHtml: '<p>Un truco rápido es doblar 35, restar un 10 % y sumar 32.</p><p>35 × 2 = 70, 70 - 7 = 63, y 63 + 32 = 95 °F.</p><p>En este caso, además, te da la cifra exacta.</p>' },
      { question: '¿Qué otras temperaturas comunes están cerca de 35 °C?', answerHtml: '<p>Estas referencias ayudan a ubicarlo:</p><ul><li>33 °C = 91,4 °F, ya muy caluroso</li><li>35 °C = 95 °F, donde las precauciones importan más</li><li>37 °C = 98,6 °F, temperatura corporal normal</li><li>40 °C = 104 °F, calor extremo en muchas regiones</li></ul>' }
    ],
    hi: [
      { question: '35°C मौसम के हिसाब से गर्म है या ठंडा?', answerHtml: '<p>मौसम के लिहाज़ से 35°C (95°F) बहुत गर्म माना जाता है। कई जगहों पर यह वह तापमान होता है जहाँ लोग दोपहर से बचते हैं, छाया ढूँढते हैं और बाहर की योजना बदल देते हैं।</p>' },
      { question: 'क्या 35°C बुखार है?', answerHtml: '<p>नहीं। अगर यह शरीर का तापमान हो, तो 35°C सामान्य से नीचे है। बुखार आम तौर पर 38°C (100.4°F) के आसपास शुरू होता है, जबकि 35°C शरीर के लिए हाइपोथर्मिया की तरफ इशारा करता है।</p>' },
      { question: 'क्या 35°C शिशु के लिए खतरनाक हो सकता है?', answerHtml: '<p>हाँ, जोखिम हो सकता है। छोटे बच्चे जल्दी गर्म होते हैं और उन्हें ठंडा रखना पूरी तरह बड़ों पर निर्भर रहता है।</p><ul><li>सीधी धूप और गरम स्ट्रोलर से बचाएँ</li><li>हल्के कपड़े पहनाएँ और हवा चलती रहे</li><li>अगर बच्चा बहुत लाल, सुस्त या चिड़चिड़ा लगे, तो उसे तुरंत ठंडा करें और जरूरत पड़े तो डॉक्टर से बात करें</li></ul>' },
      { question: 'वेट-बल्ब तापमान क्या है और 35°C क्यों खतरनाक माना जाता है?', answerHtml: '<p>वेट-बल्ब तापमान बताता है कि पसीने के ज़रिए शरीर कितनी अच्छी तरह ठंडा हो सकता है। नमी बढ़ने पर पसीना ठीक से सूख नहीं पाता और गर्मी का दबाव तेजी से बढ़ता है।</p><p>अगर वेट-बल्ब तापमान 35°C के करीब पहुँच जाए, तो शरीर प्रभावी रूप से खुद को ठंडा नहीं रख पाता।</p>' },
      { question: '35°C को दिमाग में Fahrenheit में कैसे बदलें?', answerHtml: '<p>एक आसान तरीका है 35 को दोगुना करें, फिर 10% घटाएँ, फिर 32 जोड़ दें।</p><p>35 × 2 = 70, 70 - 7 = 63, और 63 + 32 = 95°F।</p><p>इस तापमान पर यह शॉर्टकट बिल्कुल सही जवाब देता है।</p>' },
      { question: '35°C के आसपास कौन-से आम तापमान आते हैं?', answerHtml: '<p>यह कुछ पास के तापमान हैं:</p><ul><li>33°C = 91.4°F, पहले से बहुत गर्म</li><li>35°C = 95°F, जहाँ गर्मी से बचाव ज़्यादा जरूरी हो जाता है</li><li>37°C = 98.6°F, सामान्य शरीर का तापमान</li><li>40°C = 104°F, कई जगहों पर अत्यधिक गर्मी</li></ul>' }
    ],
    ar: [
      { question: 'هل 35°C باردة أم حارة من ناحية الطقس؟', answerHtml: '<p>من ناحية الطقس، 35°C (95°F) تعني جواً حاراً جداً. في كثير من المناطق هي درجة تدفع الناس لتغيير المواعيد وتجنب الظهيرة والبحث عن الظل باستمرار.</p>' },
      { question: 'هل 35°C تعني حمى؟', answerHtml: '<p>لا. إذا كانت 35°C قراءة لحرارة الجسم فهي أقل من الطبيعي. الحمى تبدأ عادة قرب 38°C (100.4°F)، بينما 35°C كحرارة جسم تشير أكثر إلى انخفاض حرارة الجسم لا إلى الحمى.</p>' },
      { question: 'هل 35°C خطيرة على الرضيع؟', answerHtml: '<p>قد تكون كذلك. الرضع يسخنون أسرع من البالغين ويعتمدون على الكبار في إبقائهم في جو أبرد.</p><ul><li>تجنب الشمس المباشرة وعربات الأطفال الساخنة</li><li>حافظ على حركة الهواء وألبسه ملابس خفيفة</li><li>إذا بدا عليه احمرار شديد أو خمول أو صعوبة في الهدوء، فابدأ بتبريده واطلب مشورة طبية عند الحاجة</li></ul>' },
      { question: 'ما هي حرارة البصيلة الرطبة ولماذا تكون 35°C خطيرة؟', answerHtml: '<p>حرارة البصيلة الرطبة تعكس قدرة الجسم على التبريد عبر التعرق. عندما ترتفع الرطوبة، يقل تبخر العرق ويزداد الضغط الحراري بسرعة.</p><p>إذا اقتربت حرارة البصيلة الرطبة من 35°C، يصبح الجسم عاجزاً تقريباً عن تبريد نفسه بشكل فعال حتى في الظل.</p>' },
      { question: 'كيف أحول 35°C إلى فهرنهايت في ذهني؟', answerHtml: '<p>طريقة سريعة هي أن تضاعف 35، ثم تطرح 10%، ثم تضيف 32.</p><p>35 × 2 = 70، ثم 70 - 7 = 63، ثم 63 + 32 = 95°F.</p><p>وفي هذه الحالة تحصل على الإجابة الدقيقة.</p>' },
      { question: 'ما درجات الحرارة القريبة الشائعة من 35°C؟', answerHtml: '<p>هذه نقاط مرجعية مفيدة:</p><ul><li>33°C = 91.4°F وهي حارة جداً بالفعل</li><li>35°C = 95°F حيث تصبح احتياطات الحر أكثر أهمية</li><li>37°C = 98.6°F وهي حرارة جسم طبيعية</li><li>40°C = 104°F وهي حرارة شديدة في كثير من المناطق</li></ul>' }
    ],
    ja: [
      { question: '35°Cは天気として暑いですか、それとも寒いですか？', answerHtml: '<p>天気としての 35°C（95°F）はかなり暑い部類です。多くの地域では、外出時間をずらしたり、真昼を避けたり、日陰を探したりするレベルの暑さです。</p>' },
      { question: '35°Cは発熱ですか？', answerHtml: '<p>いいえ。体温として 35°C はむしろ平熱より低めです。発熱は通常 38°C（100.4°F）前後からで、35°C の体温は低体温側の心配になります。</p>' },
      { question: '35°Cは赤ちゃんに危険ですか？', answerHtml: '<p>注意が必要です。赤ちゃんは大人より熱がこもりやすく、自分でうまく調整できません。</p><ul><li>直射日光や暑いベビーカーを避ける</li><li>薄着にして風を通す</li><li>赤みが強い、ぐったりしている、機嫌が極端に悪いときは早めに涼しくする</li></ul>' },
      { question: '湿球温度とは何ですか？なぜ35°Cが危険なのですか？', answerHtml: '<p>湿球温度は、汗の蒸発で体をどれだけ冷やせるかを表す指標です。湿度が高いほど汗が蒸発しにくくなり、体に熱がたまりやすくなります。</p><p>湿球温度が 35°C 近くになると、日陰でも体が十分に熱を逃がせなくなるため、非常に危険と考えられています。</p>' },
      { question: '35°Cを頭の中で華氏に換算するには？', answerHtml: '<p>35 を 2 倍し、そこから 10% 引いて、最後に 32 を足す方法が使えます。</p><p>35 × 2 = 70、70 - 7 = 63、63 + 32 = 95°F です。</p><p>この温度ではちょうど正確な答えになります。</p>' },
      { question: '35°Cの近くにはどんな代表的な温度がありますか？', answerHtml: '<p>近い温度を並べると位置づけが分かりやすくなります。</p><ul><li>33°C = 91.4°F、すでにかなり暑い</li><li>35°C = 95°F、暑さ対策が重要になる</li><li>37°C = 98.6°F、平熱の目安</li><li>40°C = 104°F、多くの地域で厳しい猛暑</li></ul>' }
    ],
    fr: [
      { question: '35 °C, c’est chaud ou froid pour la météo ?', answerHtml: '<p>Pour la météo, 35 °C (95 °F) correspondent à une forte chaleur. Dans beaucoup de régions, c’est une température qui pousse à éviter midi, chercher l’ombre et ralentir les activités extérieures.</p>' },
      { question: '35 °C, est-ce une fièvre ?', answerHtml: '<p>Non. Comme température corporelle, 35 °C sont en dessous de la normale. La fièvre commence généralement autour de 38 °C (100,4 °F), alors que 35 °C évoquent plutôt une hypothermie qu’une fièvre.</p>' },
      { question: '35 °C sont-ils dangereux pour un bébé ?', answerHtml: '<p>Oui, cela peut l’être. Les bébés montent en température plus vite et comptent sur les adultes pour rester au frais.</p><ul><li>Éviter le soleil direct et les poussettes qui chauffent</li><li>Mettre des vêtements légers et garder de l’air en mouvement</li><li>Si le bébé paraît très rouge, somnolent ou difficile à calmer, il faut le rafraîchir vite et demander un avis médical si besoin</li></ul>' },
      { question: 'Qu’est-ce que la température au thermomètre mouillé et pourquoi 35 °C sont-ils dangereux ?', answerHtml: '<p>La température au thermomètre mouillé reflète la capacité du corps à se refroidir par évaporation de la sueur. Quand l’humidité grimpe, cette évaporation marche moins bien et le stress thermique augmente plus vite.</p><p>Un thermomètre mouillé proche de 35 °C est considéré comme critique, car le corps ne parvient alors presque plus à se refroidir correctement, même à l’ombre.</p>' },
      { question: 'Comment convertir 35 °C en Fahrenheit de tête ?', answerHtml: '<p>Un raccourci mental simple consiste à doubler 35, retirer 10 %, puis ajouter 32.</p><p>35 × 2 = 70, 70 - 7 = 63, puis 63 + 32 = 95 °F.</p><p>Ici, ce calcul donne même le résultat exact.</p>' },
      { question: 'Quelles températures courantes sont proches de 35 °C ?', answerHtml: '<p>Quelques repères utiles :</p><ul><li>33 °C = 91,4 °F, déjà très chaud</li><li>35 °C = 95 °F, où les précautions chaleur comptent davantage</li><li>37 °C = 98,6 °F, température corporelle normale</li><li>40 °C = 104 °F, chaleur extrême dans de nombreuses régions</li></ul>' }
    ],
    de: [
      { question: 'Sind 35°C wetterbezogen heiß oder kalt?', answerHtml: '<p>Als Wettertemperatur sind 35°C (95°F) klar sehr heiß. In vielen Regionen ist das die Art von Hitze, bei der Menschen ihre Tagesplanung anpassen, Mittagssonne meiden und gezielt Schatten suchen.</p>' },
      { question: 'Sind 35°C Fieber?', answerHtml: '<p>Nein. Als Körpertemperatur liegen 35°C unter dem Normalbereich. Fieber beginnt meist erst in der Nähe von 38°C (100.4°F), während 35°C eher auf Unterkühlung als auf Fieber hindeuten.</p>' },
      { question: 'Sind 35°C für ein Baby gefährlich?', answerHtml: '<p>Das kann riskant sein. Babys überhitzen schneller als Erwachsene und brauchen Hilfe von außen, um kühl zu bleiben.</p><ul><li>Direkte Sonne und aufgeheizte Kinderwagen meiden</li><li>Leicht anziehen und Luft bewegen</li><li>Wenn ein Baby stark gerötet, ungewöhnlich schläfrig oder schwer zu beruhigen ist, sollte es schnell gekühlt werden</li></ul>' },
      { question: 'Was ist die Feuchtkugeltemperatur und warum sind 35°C gefährlich?', answerHtml: '<p>Die Feuchtkugeltemperatur zeigt, wie gut der Körper sich durch Verdunstungskälte abkühlen kann. Bei hoher Luftfeuchtigkeit verdunstet Schweiß schlechter und Hitzestress steigt schneller.</p><p>Eine Feuchtkugeltemperatur nahe 35°C gilt als kritisch, weil der Körper dann selbst im Schatten kaum noch wirksam Wärme abgeben kann.</p>' },
      { question: 'Wie rechnet man 35°C im Kopf in Fahrenheit um?', answerHtml: '<p>Ein einfacher Merktrick: 35 verdoppeln, 10 % abziehen, dann 32 addieren.</p><p>35 × 2 = 70, 70 - 7 = 63 und 63 + 32 = 95°F.</p><p>In diesem Fall liefert die Faustregel sogar den exakten Wert.</p>' },
      { question: 'Welche typischen Temperaturen liegen nahe bei 35°C?', answerHtml: '<p>Ein paar Vergleichswerte helfen:</p><ul><li>33°C = 91.4°F, bereits sehr heiß</li><li>35°C = 95°F, wo Hitzeschutz wichtiger wird</li><li>37°C = 98.6°F, normale Körpertemperatur</li><li>40°C = 104°F, extreme Hitze in vielen Regionen</li></ul>' }
    ],
    id: [
      { question: 'Apakah 35°C termasuk panas atau dingin untuk cuaca?', answerHtml: '<p>Untuk cuaca, 35°C (95°F) jelas termasuk sangat panas. Di banyak tempat, suhu seperti ini membuat orang mengubah jadwal, menghindari tengah hari, dan lebih sering mencari tempat teduh.</p>' },
      { question: 'Apakah 35°C termasuk demam?', answerHtml: '<p>Tidak. Jika itu suhu tubuh, 35°C justru lebih rendah dari normal. Demam biasanya mulai mendekati 38°C (100.4°F), sedangkan 35°C lebih mengarah ke risiko hipotermia.</p>' },
      { question: 'Apakah 35°C berbahaya untuk bayi?', answerHtml: '<p>Bisa berisiko. Bayi lebih cepat kepanasan dan bergantung pada orang dewasa untuk tetap sejuk.</p><ul><li>Hindari matahari langsung dan stroller yang panas</li><li>Pakaikan baju tipis dan jaga aliran udara</li><li>Jika bayi terlihat sangat merah, lemas, atau sulit ditenangkan, segera bantu mendinginkannya</li></ul>' },
      { question: 'Apa itu suhu wet-bulb dan mengapa 35°C dianggap berbahaya?', answerHtml: '<p>Suhu wet-bulb menunjukkan seberapa efektif tubuh bisa mendingin lewat penguapan keringat. Saat kelembapan tinggi, keringat lebih sulit menguap dan stres panas naik jauh lebih cepat.</p><p>Wet-bulb mendekati 35°C dianggap kritis karena tubuh hampir tidak bisa lagi membuang panas dengan efektif, bahkan di tempat teduh.</p>' },
      { question: 'Bagaimana cara menghitung 35°C ke Fahrenheit di kepala?', answerHtml: '<p>Cara cepatnya adalah menggandakan 35, kurangi 10%, lalu tambah 32.</p><p>35 × 2 = 70, 70 - 7 = 63, lalu 63 + 32 = 95°F.</p><p>Pada suhu ini, hasilnya juga tepat.</p>' },
      { question: 'Suhu umum apa yang dekat dengan 35°C?', answerHtml: '<p>Beberapa patokan yang dekat:</p><ul><li>33°C = 91.4°F, sudah sangat panas</li><li>35°C = 95°F, saat perlindungan dari panas makin penting</li><li>37°C = 98.6°F, suhu tubuh normal</li><li>40°C = 104°F, panas ekstrem di banyak wilayah</li></ul>' }
    ],
    'pt-br': [
      { question: '35°C é quente ou frio para o clima?', answerHtml: '<p>Para o clima, 35°C (95°F) já representam calor forte. Em muitas regiões, é a temperatura que faz as pessoas mudar horários, evitar o sol do meio do dia e procurar sombra com mais frequência.</p>' },
      { question: '35°C é febre?', answerHtml: '<p>Não. Como temperatura corporal, 35°C ficam abaixo do normal. A febre costuma começar perto de 38°C (100.4°F), enquanto 35°C no corpo apontam mais para hipotermia do que para febre.</p>' },
      { question: '35°C podem ser perigosos para um bebê?', answerHtml: '<p>Podem sim. Bebês esquentam mais rápido que adultos e dependem dos adultos para continuar frescos.</p><ul><li>Evite sol direto e carrinho superaquecido</li><li>Use roupa leve e mantenha o ar circulando</li><li>Se o bebê parecer muito vermelho, sonolento ou difícil de acalmar, vale resfriar rápido e buscar orientação médica se necessário</li></ul>' },
      { question: 'O que é temperatura de bulbo úmido e por que 35°C são perigosos?', answerHtml: '<p>A temperatura de bulbo úmido mostra o quanto o suor ainda consegue resfriar o corpo. Quando a umidade sobe, a evaporação piora e o estresse térmico aumenta muito mais rápido.</p><p>Bulbo úmido perto de 35°C é considerado crítico porque o corpo praticamente deixa de conseguir se resfriar bem, mesmo na sombra.</p>' },
      { question: 'Como converter 35°C para Fahrenheit de cabeça?', answerHtml: '<p>Um atalho simples é dobrar 35, tirar 10% e depois somar 32.</p><p>35 × 2 = 70, 70 - 7 = 63, e 63 + 32 = 95°F.</p><p>Neste caso, o atalho dá exatamente o valor final.</p>' },
      { question: 'Quais temperaturas comuns ficam perto de 35°C?', answerHtml: '<p>Alguns pontos de comparação ajudam:</p><ul><li>33°C = 91.4°F, já muito quente</li><li>35°C = 95°F, quando o cuidado com o calor pesa mais</li><li>37°C = 98.6°F, temperatura corporal normal</li><li>40°C = 104°F, calor extremo em muitas regiões</li></ul>' }
    ]
  }
};

function fill(template, tokens) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(tokens[key] ?? `{${key}}`));
}

function formatNumber(locale, value) {
  const rounded = Math.round(value * 10) / 10;
  const isInt = Math.abs(rounded - Math.round(rounded)) < 1e-9;
  return new Intl.NumberFormat(`${LOCALE_TAGS[locale]}-u-nu-latn`, {
    minimumFractionDigits: isInt ? 0 : 1,
    maximumFractionDigits: isInt ? 0 : 1,
    useGrouping: false,
  }).format(rounded);
}

function deepClean(value) {
  if (typeof value === 'string') {
    return value
      .replace(/\?C/g, '°C')
      .replace(/\?F/g, '°F')
      .replace(/ \? /g, ' × ')
      .replace(/\uFFFD/g, '');
  }

  if (Array.isArray(value)) {
    return value.map(deepClean);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, deepClean(child)]));
  }

  return value;
}

function buildPractical(locale, profile) {
  const copy = PRACTICAL[locale];
  const tokens = { c: formatNumber(locale, profile.c), f: formatNumber(locale, Number(profile.f)) };
  const nuance = profile.c === 18 ? 'coolSleep' : profile.nuance;
  return {
    title: fill(copy.title, tokens),
    cards: copy.cards[nuance].map(([title, body]) => ({
      title: fill(title, tokens),
      body: fill(body, tokens),
    })),
  };
}

for (const profile of Object.values(PAGES)) {
  const filePath = path.join(EN_DIR, `${profile.slug}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const cleaned = deepClean(data);
  if (FAQ_OVERRIDES[profile.c]?.en) {
    cleaned.faq = FAQ_OVERRIDES[profile.c].en;
  }
  cleaned.practicalApplications = buildPractical('en', profile);
  fs.writeFileSync(filePath, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');
}

const scriptPath = path.join(__dirname, 'generate-room-temp-locales.js');
execFileSync(process.execPath, [scriptPath, ...Object.values(PAGES).map((profile) => profile.slug)], {
  cwd: ROOT,
  stdio: 'inherit',
});

for (const locale of LOCALES) {
  for (const profile of Object.values(PAGES)) {
    const filePath = path.join(ROOT, 'locales', locale, `${profile.slug}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (FAQ_OVERRIDES[profile.c]?.[locale]) {
      data.faq = FAQ_OVERRIDES[profile.c][locale];
    }
    data.practicalApplications = buildPractical(locale, profile);
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}
