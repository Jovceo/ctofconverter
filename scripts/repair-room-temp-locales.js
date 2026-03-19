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
  27: { slug: '27-c-to-f', c: 27, f: '80.6', nuance: 'outdoor' },
  28: { slug: '28-c-to-f', c: 28, f: '82.4', nuance: 'sleep' },
  29: { slug: '29-c-to-f', c: 29, f: '84.2', nuance: 'outdoor' },
  30: { slug: '30-c-to-f', c: 30, f: '86', nuance: 'ac' },
  31: { slug: '31-c-to-f', c: 31, f: '87.8', nuance: 'sleep' },
  32: { slug: '32-c-to-f', c: 32, f: '89.6', nuance: 'ac' },
};

const PRACTICAL = {
  en: {
    title: '{c}°C ({f}°F) in daily life',
    cards: {
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
    },
  },
  zh: {
    title: '{c}°C（{f}°F）在日常里的常见场景',
    cards: {
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
    },
  },
  es: {
    title: 'Dónde suele encajar {c} °C ({f} °F)',
    cards: {
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
    },
  },
  hi: {
    title: '{c}°C ({f}°F) रोजमर्रा में कैसा लगता है',
    cards: {
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
    },
  },
  ar: {
    title: 'أين تناسب {c}°C ({f}°F) في الحياة اليومية',
    cards: {
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
    },
  },
  ja: {
    title: '{c}°C（{f}°F）が日常でどう感じるか',
    cards: {
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
    },
  },
  fr: {
    title: 'Où {c} °C ({f} °F) se placent dans la vie quotidienne',
    cards: {
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
    },
  },
  de: {
    title: '{c}°C ({f}°F) im Alltag',
    cards: {
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
    },
  },
  id: {
    title: '{c}°C ({f}°F) dalam keseharian',
    cards: {
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
    },
  },
  'pt-br': {
    title: 'Onde {c}°C ({f}°F) entram no dia a dia',
    cards: {
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
    },
  },
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
  return {
    title: fill(copy.title, tokens),
    cards: copy.cards[profile.nuance].map(([title, body]) => ({
      title: fill(title, tokens),
      body: fill(body, tokens),
    })),
  };
}

for (const profile of Object.values(PAGES)) {
  const filePath = path.join(EN_DIR, `${profile.slug}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const cleaned = deepClean(data);
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
    data.practicalApplications = buildPractical(locale, profile);
    fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}
