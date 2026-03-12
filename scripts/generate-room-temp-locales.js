const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EN_DIR = path.join(ROOT, 'locales', 'en');
const OUT_LOCALES = ['zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const LOCALE_TAGS = {
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
  21: { slug: '21-c-to-f', band: 'indoor', nuance: 'work' },
  22: { slug: '22-c-to-f', band: 'indoor', nuance: 'sleep' },
  23: { slug: '23-c-to-f', band: 'mild', nuance: 'season' },
  24: { slug: '24-c-to-f', band: 'mild', nuance: 'outdoor' },
  25: { slug: '25-c-to-f', band: 'summer', nuance: 'swim' },
  26: { slug: '26-c-to-f', band: 'summer', nuance: 'ac' },
};

const INTRO_TEMPLATES = {
  zh: '{c}°C 换算成华氏度是 {f}°F。',
  es: '{c} °C en Fahrenheit son {f} °F.',
  hi: '{c}°C का Fahrenheit मान {f}°F है।',
  ar: '{c}°C تساوي {f}°F.',
  ja: '{c}°C は華氏で {f}°F です。',
  fr: '{c} °C correspondent à {f} °F.',
  de: '{c}°C entsprechen {f}°F.',
  id: '{c}°C sama dengan {f}°F.',
  'pt-br': '{c}°C equivalem a {f}°F.',
};

const GUIDE_META = {
  zh: {
    labels: { cold: '偏凉', moderate: '舒适', warm: '偏暖' },
    headers: { temperature: '温度', description: '体感描述', typicalUse: '常见场景' },
    desc: { indoor: ['适合加薄层', '室内舒适区', '可能想开风扇'], mild: ['早晚偏凉', '外出舒服', '白天偏暖'], summer: ['有风更舒服', '可接受区间', '夏季偏暖'] },
    rowDesc: { veryCool: '偏凉', cool: '凉爽', neutral: '标准室温', comfortable: '舒适', mildWarm: '舒适偏暖', warm: '夏日偏暖', hot: '炎热', body: '正常体温' },
    rowUse: { veryCool: '适合加外套', cool: '春秋早晚', neutral: '办公和居家', comfortable: '久坐也舒服', mildWarm: '散步与通勤', warm: '短袖和轻装', hot: '补水与防晒', body: '与体温做对比' },
  },
  es: {
    labels: { cold: 'Fresco', moderate: 'Cómodo', warm: 'Cálido' },
    headers: { temperature: 'Temperatura', description: 'Sensación', typicalUse: 'Uso habitual' },
    desc: { indoor: ['Todavía pide una capa ligera', 'Zona cómoda para interior', 'Empieza a sentirse más cálido'], mild: ['Mañana fresca', 'Buena temperatura para salir', 'Más cálido al mediodía'], summer: ['Mejor con brisa', 'Todavía manejable', 'Calor suave de verano'] },
    rowDesc: { veryCool: 'Bastante fresco', cool: 'Fresco', neutral: 'Temperatura ambiente', comfortable: 'Cómodo', mildWarm: 'Templado', warm: 'Cálido agradable', hot: 'Caluroso', body: 'Temperatura corporal normal' },
    rowUse: { veryCool: 'Ventilar o llevar chaqueta ligera', cool: 'Mañanas y tardes frescas', neutral: 'Casa, oficina o estudio', comfortable: 'Interior cómodo para la mayoría', mildWarm: 'Terraza, paseo y ropa ligera', warm: 'Día de verano suave', hot: 'Conviene sombra e hidratación', body: 'Comparación con el cuerpo humano' },
  },
  hi: {
    labels: { cold: 'ठंडा', moderate: 'आरामदायक', warm: 'गर्म' },
    headers: { temperature: 'तापमान', description: 'फील', typicalUse: 'आम उपयोग' },
    desc: { indoor: ['हल्की परत अच्छी लगती है', 'घर और ऑफिस के लिए आरामदायक', 'कुछ लोगों को पंखा चाहिए'], mild: ['सुबह-शाम हल्की ठंडक', 'बाहर निकलने के लिए अच्छा', 'दिन में थोड़ा गर्म'], summer: ['हवा हो तो बेहतर', 'अब भी चल सकता है', 'गर्मियों की गर्माहट'] },
    rowDesc: { veryCool: 'काफी ठंडा', cool: 'हल्का ठंडा', neutral: 'सामान्य कमरा तापमान', comfortable: 'आरामदायक', mildWarm: 'थोड़ा गर्म', warm: 'गर्म लेकिन ठीक', hot: 'काफी गर्म', body: 'सामान्य शरीर तापमान' },
    rowUse: { veryCool: 'ठंडी सुबह या हल्की जैकेट', cool: 'सुबह-शाम या खुली हवा', neutral: 'ऑफिस और घर में आम', comfortable: 'बैठकर काम के लिए अच्छा', mildWarm: 'हल्के कपड़ों के साथ ठीक', warm: 'गर्मी जैसा मौसम', hot: 'पानी और छाया ज़रूरी', body: 'शरीर के तापमान से तुलना' },
  },
  ar: {
    labels: { cold: 'أبرد', moderate: 'مريح', warm: 'أدفأ' },
    headers: { temperature: 'الحرارة', description: 'الإحساس', typicalUse: 'الاستخدام المعتاد' },
    desc: { indoor: ['قد تحتاج طبقة خفيفة', 'مناسب للمنزل والعمل', 'قد تفيد المروحة'], mild: ['يميل للبرودة صباحاً', 'جو مناسب للخروج', 'أدفأ في الظهيرة'], summer: ['أفضل مع نسمة هواء', 'ما زال مقبولاً', 'دفء صيفي واضح'] },
    rowDesc: { veryCool: 'بارد نسبياً', cool: 'مائل للبرودة', neutral: 'حرارة غرفة', comfortable: 'مريح', mildWarm: 'مائل للدفء', warm: 'دافئ لطيف', hot: 'حار', body: 'حرارة جسم طبيعية' },
    rowUse: { veryCool: 'صباح بارد أو تهوية', cool: 'أجواء لطيفة مع طبقة خفيفة', neutral: 'بيت أو مكتب', comfortable: 'جلوس وعمل مريح', mildWarm: 'خروج يومي وملابس خفيفة', warm: 'جو صيفي خفيف', hot: 'ماء وظل وتبريد', body: 'مقارنة مع حرارة الجسم' },
  },
  ja: {
    labels: { cold: 'やや涼しい', moderate: '快適', warm: 'やや暖かい' },
    headers: { temperature: '温度', description: '体感', typicalUse: 'よくある場面' },
    desc: { indoor: ['薄手の羽織りが安心', '室内で快適', '送風が欲しくなることも'], mild: ['朝晩は少し涼しい', '外出しやすい', '日中は暖かめ'], summer: ['風があると快適', 'まだ許容しやすい', '夏らしい暖かさ'] },
    rowDesc: { veryCool: 'かなり涼しい', cool: '涼しい', neutral: '標準的な室温', comfortable: '快適', mildWarm: '少し暖かい', warm: '夏らしい暖かさ', hot: '暑い', body: '平熱の目安' },
    rowUse: { veryCool: '換気や薄手の上着向き', cool: '朝晩や春秋の外出', neutral: '家や仕事場で一般的', comfortable: '長時間の作業にも向く', mildWarm: '散歩や軽い外出にちょうどいい', warm: '初夏や暑い日の感覚', hot: '水分補給と日差し対策', body: '体温との比較' },
  },
  fr: {
    labels: { cold: 'Frais', moderate: 'Confortable', warm: 'Plus chaud' },
    headers: { temperature: 'Température', description: 'Ressenti', typicalUse: 'Usage typique' },
    desc: { indoor: ['Une couche légère aide encore', 'Zone confortable en intérieur', 'Commence à sembler plus chaud'], mild: ['Matin plus frais', 'Sortie agréable', 'Plus chaud à midi'], summer: ['Mieux avec un peu d’air', 'Encore supportable', 'Chaleur douce d’été'] },
    rowDesc: { veryCool: 'Assez frais', cool: 'Frais', neutral: 'Température ambiante', comfortable: 'Confortable', mildWarm: 'Doux et un peu chaud', warm: 'Chaud agréable', hot: 'Chaud', body: 'Température corporelle normale' },
    rowUse: { veryCool: 'Aération ou veste légère', cool: 'Matinée fraîche ou mi-saison', neutral: 'Maison et bureau', comfortable: 'Travail assis ou détente', mildWarm: 'Promenade, terrasse, sortie', warm: 'Journée d’été légère', hot: 'Hydratation et ombre utiles', body: 'Repère pour le corps humain' },
  },
  de: {
    labels: { cold: 'Kühler', moderate: 'Angenehm', warm: 'Wärmer' },
    headers: { temperature: 'Temperatur', description: 'Eindruck', typicalUse: 'Typischer Einsatz' },
    desc: { indoor: ['Leichte Schicht bleibt sinnvoll', 'Angenehm für Innenräume', 'Wird langsam wärmer'], mild: ['Morgens frischer', 'Gut für draußen', 'Mittags etwas wärmer'], summer: ['Mit Luftzug angenehmer', 'Noch gut machbar', 'Sommerlich warm'] },
    rowDesc: { veryCool: 'Ziemlich kühl', cool: 'Kühl', neutral: 'Normale Raumtemperatur', comfortable: 'Angenehm', mildWarm: 'Mild bis warm', warm: 'Sommerlich warm', hot: 'Heiß', body: 'Normale Körpertemperatur' },
    rowUse: { veryCool: 'Lüften oder leichte Jacke', cool: 'Frische Morgen- oder Abendluft', neutral: 'Wohnung und Büro', comfortable: 'Gut für ruhige Tätigkeiten', mildWarm: 'Spaziergang und leichte Kleidung', warm: 'Sommerlicher Alltag', hot: 'Schatten und Wasser wichtig', body: 'Vergleich zur Körpertemperatur' },
  },
  id: {
    labels: { cold: 'Lebih sejuk', moderate: 'Nyaman', warm: 'Lebih hangat' },
    headers: { temperature: 'Suhu', description: 'Kesan', typicalUse: 'Penggunaan umum' },
    desc: { indoor: ['Lapisan tipis masih berguna', 'Nyaman untuk dalam ruang', 'Mulai terasa lebih hangat'], mild: ['Pagi lebih sejuk', 'Enak untuk keluar', 'Siang terasa lebih hangat'], summer: ['Lebih nyaman kalau ada angin', 'Masih cukup nyaman', 'Hangat khas musim panas'] },
    rowDesc: { veryCool: 'Cukup sejuk', cool: 'Sejuk', neutral: 'Suhu ruangan biasa', comfortable: 'Nyaman', mildWarm: 'Sedikit hangat', warm: 'Hangat dan enak', hot: 'Panas', body: 'Suhu tubuh normal' },
    rowUse: { veryCool: 'Pagi sejuk atau ruangan berventilasi', cool: 'Cuaca santai dengan lapisan tipis', neutral: 'Rumah dan kantor', comfortable: 'Kerja dan belajar nyaman', mildWarm: 'Jalan santai dan pakaian ringan', warm: 'Cuaca hangat khas tropis', hot: 'Perlu air dan tempat teduh', body: 'Pembanding suhu tubuh' },
  },
  'pt-br': {
    labels: { cold: 'Mais fresco', moderate: 'Confortável', warm: 'Mais quente' },
    headers: { temperature: 'Temperatura', description: 'Sensação', typicalUse: 'Uso típico' },
    desc: { indoor: ['Ainda combina com camada leve', 'Faixa confortável para dentro', 'Começa a ficar mais quente'], mild: ['Manhã mais fresca', 'Boa temperatura para sair', 'Mais quente no meio do dia'], summer: ['Melhor com um pouco de vento', 'Ainda dá para levar', 'Calor leve de verão'] },
    rowDesc: { veryCool: 'Bem fresco', cool: 'Fresco', neutral: 'Temperatura ambiente', comfortable: 'Confortável', mildWarm: 'Morno', warm: 'Quente agradável', hot: 'Quente', body: 'Temperatura corporal normal' },
    rowUse: { veryCool: 'Ventilação ou camada leve', cool: 'Manhã ou fim de tarde', neutral: 'Casa e escritório', comfortable: 'Trabalho e descanso', mildWarm: 'Passeio e roupa leve', warm: 'Dia de verão', hot: 'Água e sombra ajudam', body: 'Comparação com o corpo humano' },
  },
};

function toF(c) {
  return (c * 9) / 5 + 32;
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

function fill(text, values) {
  return text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

function faqHtml(lead, items) {
  return `<p>${lead}</p><ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function parseTemp(tempText) {
  const match = tempText.match(/(-?\d+(?:\.\d+)?)°C/);
  return match ? parseFloat(match[1]) : 0;
}

function classifyTemp(temp) {
  if (temp >= 37) return 'body';
  if (temp <= 10) return 'veryCool';
  if (temp <= 18) return 'cool';
  if (temp <= 20) return 'neutral';
  if (temp <= 22) return 'comfortable';
  if (temp <= 24) return 'mildWarm';
  if (temp <= 26) return 'warm';
  return 'hot';
}

const L = {
  zh: {
    title: '{c}°C 转华氏度（{f}°F）',
    seo: {
      indoor: '{c}°C是多少华氏度（{f}°F）？室温、办公与睡眠建议',
      mild: '{c}°C是多少华氏度（{f}°F）？体感、天气与穿衣建议',
      summer: '{c}°C是多少华氏度（{f}°F）？夏季体感、空调与穿搭建议',
    },
    desc: {
      indoor: '把 {c}°C 换算成 {f}°F，并了解它在室温、办公和睡眠中的舒适度。',
      mild: '把 {c}°C 换算成 {f}°F，并了解它在天气、通勤和轻薄穿搭中的体感。',
      summer: '把 {c}°C 换算成 {f}°F，并了解它在夏季外出、空调和轻装中的实际感受。',
    },
    tag: {
      indoor: '免费温度换算工具，帮你快速把 {c}°C 换成 {f}°F，并判断是否适合办公、居家或睡眠。',
      mild: '免费温度换算工具，帮你快速把 {c}°C 换成 {f}°F，并判断它在天气和穿衣上的真实体感。',
      summer: '免费温度换算工具，帮你快速把 {c}°C 换成 {f}°F，并判断夏季出行、空调和轻装是否合适。',
    },
    guide: {
      indoor: ['{c}°C 室内舒适度参考', '更适合办公、居家还是睡眠？', '{c}°C（{f}°F）通常属于舒服的室温区间，很多家庭和办公室都会觉得它稳定好用。', '<strong>提示：</strong> 北方干燥房间里的 {c}°C 常常比较中性，南方湿度高时同样的数字会显得更闷。'],
      mild: ['{c}°C 体感与天气参考', '它更像舒适天气，还是偏暖温度？', '{c}°C（{f}°F）比标准室温略暖。室外通常很舒服，室内久坐时可能会觉得微微偏热。', '<strong>提示：</strong> {c}°C 在晴天、阴天、湿度高低之间的体感差异很大。'],
      summer: ['{c}°C 夏季体感参考', '它是舒服的夏天气温，还是需要空调的偏暖区间？', '{c}°C（{f}°F）已经带有明显的夏日体感。室外适合轻装出门，室内常会想开风扇或空调。', '<strong>提示：</strong> {c}°C 在户外有风时可能很舒服，但在通风差或湿度高的室内会显得更热。'],
    },
    faq: {
      hotColdQ: '{c}°C 算冷还是热？',
      hotColdA: { indoor: '{c}°C（{f}°F）通常不算冷也不算热，更接近很多人熟悉的舒适室温。', mild: '{c}°C（{f}°F）通常属于偏暖但仍舒服的范围。', summer: '{c}°C（{f}°F）已经是明显的暖和天气，更像夏天，而不是标准室温。' },
      formulaQ: '{c}°C 换成华氏度怎么计算？',
      formulaA: '公式是：°F = (°C × 9/5) + 32。{c} × 1.8 = {step}，再加 32 就是 {f}°F。',
      specialQ: { work: '{c}°C 适合办公室或教室吗？', sleep: '{c}°C 适合睡觉吗？', season: '{c}°C 在春秋季是什么体感？', outdoor: '{c}°C 适合户外活动吗？', swim: '{c}°C 适合游泳或去海边吗？', ac: '{c}°C 适合作为空调设定温度吗？' },
      specialA: { work: '{c}°C 很适合办公室、教室和图书馆这类久坐场景。', sleep: '{c}°C 对部分人可以睡，但对怕热的人可能稍微偏暖。', season: '在很多城市，{c}°C 会让人想到春末秋初的舒服天气。', outdoor: '{c}°C 适合散步、骑行、逛街或周末轻运动。', swim: '{c}°C 的空气温度通常适合泳池、海边或露台活动。', ac: '{c}°C 常被视为比较省电的空调设定温度。' },
      clothingQ: '{c}°C 出门穿什么更合适？',
      clothingLead: { indoor: '轻便日常搭配通常就够了：', mild: '这种偏暖天气里，轻薄透气的搭配通常最舒服：', summer: '这种温度更接近轻装夏季穿搭：' },
      clothingItems: { indoor: ['短袖、薄长袖或轻薄针织', '牛仔裤、休闲裤或长裙', '空调房里可带一件薄开衫'], mild: ['短袖、薄衬衫或轻薄外套', '长裤、裙装或透气面料', '早晚有风时加一件薄层'], summer: ['短袖、背心、轻薄连衣裙', '短裤、薄长裤或速干面料', '帽子、墨镜和防晒更实用'] },
      localQ: { indoor: '在中国南方和北方，{c}°C 的体感会一样吗？', mild: '{c}°C 在阴天和晴天会差很多吗？', summer: '{c}°C 在室内和室外的体感差异大吗？' },
      localA: { indoor: '北方干燥环境里 {c}°C 往往更中性，南方湿度高时会显得更闷。', mild: '会。晴天、无风时更暖，阴天或有风时会回到偏舒适的体感。', summer: '通常差异明显。室外有风时更舒服，室内如果湿度高就会显得更热。' },
      feverQ: '{c}°C 是发烧吗？',
      feverA: '不是。人体发烧通常接近或超过 38°C，{c}°C 如果是体温反而远低于正常值。',
    },
  },
  es: {
    title: '{c} °C a Fahrenheit ({f} °F)',
    seo: {
      indoor: '{c} °C a Fahrenheit ({f} °F): confort interior y descanso',
      mild: '{c} °C a Fahrenheit ({f} °F): sensación térmica, clima y ropa',
      summer: '{c} °C a Fahrenheit ({f} °F): calor suave, aire acondicionado y verano',
    },
    desc: {
      indoor: 'Convierte {c} °C a {f} °F y revisa si esta temperatura funciona bien para casa, oficina o dormitorio.',
      mild: 'Convierte {c} °C a {f} °F y entiende cómo se siente en primavera, otoño y salidas diarias.',
      summer: 'Convierte {c} °C a {f} °F y descubre si esta temperatura pide ropa ligera, ventilación o aire acondicionado.',
    },
    tag: {
      indoor: 'Herramienta gratuita para convertir {c} °C a {f} °F y valorar si la temperatura es cómoda para trabajar, estudiar o dormir.',
      mild: 'Herramienta gratuita para convertir {c} °C a {f} °F con contexto de clima, sensación térmica y ropa recomendada.',
      summer: 'Herramienta gratuita para convertir {c} °C a {f} °F con consejos sobre calor suave, aire acondicionado y ropa ligera.',
    },
    guide: {
      indoor: ['Guía de confort interior para {c} °C', '¿Mejor para casa, oficina o descanso?', '{c} °C ({f} °F) suele estar dentro del rango cómodo para interiores y se percibe bastante equilibrado.', '<strong>Nota:</strong> en ambientes secos {c} °C suele sentirse neutro; con humedad alta, la misma cifra puede parecer más cálida.'],
      mild: ['Guía de sensación térmica para {c} °C', '¿Se siente templado o ya algo cálido?', '{c} °C ({f} °F) ya se siente algo más cálido que la temperatura ambiente clásica. Afuera resulta agradable; dentro puede parecer tibio.', '<strong>Nota:</strong> a {c} °C cambian mucho el sol, la sombra, el viento y la humedad.'],
      summer: ['Guía de calor suave para {c} °C', '¿Es calor agradable o una temperatura para enfriar?', '{c} °C ({f} °F) ya transmite sensación de verano. Con ropa ligera suele ir bien, aunque en interiores cerrados apetece más ventilación.', '<strong>Nota:</strong> {c} °C puede sentirse bien con brisa, pero en un piso cerrado suele parecer bastante más cálido.'],
    },
    faq: {
      hotColdQ: '¿{c} °C se siente frío o calor?',
      hotColdA: { indoor: '{c} °C ({f} °F) suele sentirse cómodo, no especialmente frío ni caluroso.', mild: '{c} °C ({f} °F) suele sentirse templado tirando a cálido y bastante agradable para salir.', summer: '{c} °C ({f} °F) ya encaja con un día cálido de verano.' },
      formulaQ: '¿Cómo convierto {c} °C a Fahrenheit?',
      formulaA: 'La fórmula es: °F = (°C × 9/5) + 32. Si multiplicas {c} por 1,8 obtienes {step}; al sumar 32 llegas a {f} °F.',
      specialQ: { work: '¿{c} °C va bien para casa u oficina?', sleep: '¿{c} °C es buena temperatura para dormir?', season: '¿{c} °C se parece más a primavera u otoño?', outdoor: '¿{c} °C es buena temperatura para actividades al aire libre?', swim: '¿{c} °C es agradable para piscina o playa?', ac: '¿{c} °C funciona bien como ajuste del aire acondicionado?' },
      specialA: { work: '{c} °C suele funcionar bien para teletrabajo, oficina y estudio.', sleep: 'Puede ser aceptable, aunque a quien le guste dormir fresco le parecerá algo cálido.', season: 'En gran parte del mundo hispano, {c} °C recuerda a un día templado de primavera o de inicios de otoño.', outdoor: '{c} °C suele ir bien para caminar, ir a una terraza o hacer ejercicio suave.', swim: '{c} °C encaja bien con planes de piscina, playa o paseo marítimo.', ac: '{c} °C se ve a menudo como un ajuste razonable del aire acondicionado.' },
      clothingQ: '¿Qué ropa conviene con {c} °C?',
      clothingLead: { indoor: 'Lo normal es vestir ropa diaria ligera y cómoda:', mild: 'En esta franja suele funcionar mejor una combinación ligera:', summer: 'Con esta temperatura suele bastar ropa fresca y transpirable:' },
      clothingItems: { indoor: ['Camiseta o manga larga fina', 'Pantalón ligero, vaqueros o falda', 'Chaqueta fina para interiores con aire'], mild: ['Camiseta, blusa o camisa ligera', 'Pantalón fino, falda o vestido cómodo', 'Una capa ligera si anochece o corre aire'], summer: ['Camiseta, vestido ligero o ropa fresca', 'Pantalón corto o tejidos muy transpirables', 'Gafas de sol, gorra y protección solar'] },
      localQ: { indoor: '¿{c} °C se siente igual en interior seco que en costa húmeda?', mild: '¿A {c} °C cambia mucho la sensación entre sol y sombra?', summer: '¿{c} °C se lleva mejor en la calle que dentro de casa?' },
      localA: { indoor: 'En interior seco {c} °C suele sentirse equilibrado; en zonas húmedas puede dar una sensación algo más cálida.', mild: 'Sí. Con sol directo {c} °C puede sentirse bastante más cálido, mientras que en sombra o con viento se vuelve más suave.', summer: 'Con algo de brisa, {c} °C al aire libre puede resultar agradable; en un piso cerrado suele sentirse más pesado.' },
      feverQ: '¿{c} °C es fiebre?',
      feverA: 'No. La fiebre humana suele empezar cerca de 38 °C. Si {c} °C fuera temperatura corporal, estaría muy por debajo de lo normal.',
    },
  },
  hi: {
    title: '{c}°C से {f}°F',
    seo: {
      indoor: '{c}°C से {f}°F: कमरे का तापमान, काम और नींद',
      mild: '{c}°C से {f}°F: मौसम की अनुभूति, कपड़े और रोज़मर्रा उपयोग',
      summer: '{c}°C से {f}°F: गर्म मौसम, AC सेटिंग और हल्के कपड़े',
    },
    desc: {
      indoor: '{c}°C को {f}°F में बदलें और देखें कि यह तापमान घर, ऑफिस और बेडरूम के लिए कितना आरामदायक है।',
      mild: '{c}°C को {f}°F में बदलें और जानें कि यह मौसम, बाहर निकलने और हल्के कपड़ों के लिए कैसा लगता है।',
      summer: '{c}°C को {f}°F में बदलें और समझें कि यह गर्मियों, AC और आउटडोर प्लान के लिए कितना सही है।',
    },
    tag: {
      indoor: 'मुफ्त कन्वर्टर जो {c}°C को {f}°F में बदलता है और बताता है कि यह काम, पढ़ाई या नींद के लिए कैसा है।',
      mild: 'मुफ्त कन्वर्टर जो {c}°C को {f}°F में बदलता है और मौसम की अनुभूति, कपड़े और आराम को साथ में समझाता है।',
      summer: 'मुफ्त कन्वर्टर जो {c}°C को {f}°F में बदलता है और गर्मी, AC और हल्के कपड़ों पर उपयोगी सलाह देता है।',
    },
    guide: {
      indoor: ['{c}°C इंडोर कम्फर्ट गाइड', 'काम, घर या नींद के लिए कितना सही?', '{c}°C ({f}°F) आम तौर पर आरामदायक कमरे के तापमान में आता है और घर, ऑफिस व क्लासरूम में संतुलित लगता है।', '<strong>नोट:</strong> सूखे इलाके में {c}°C संतुलित लगता है, जबकि नम कमरे में यही तापमान थोड़ा ज्यादा गर्म लग सकता है।'],
      mild: ['{c}°C फील गाइड', 'हल्का गर्म या बस आरामदायक?', '{c}°C ({f}°F) सामान्य कमरे के तापमान से थोड़ा गर्म लग सकता है। बाहर यह अच्छा लगता है, लेकिन बंद कमरे में हल्की गर्माहट हो सकती है।', '<strong>नोट:</strong> {c}°C पर धूप, हवा और नमी का असर साफ़ दिखता है।'],
      summer: ['{c}°C गर्म मौसम गाइड', 'गर्मी आरामदायक है या AC की ज़रूरत है?', '{c}°C ({f}°F) साफ़ तौर पर गर्मियों जैसा महसूस होता है। बाहर हल्के कपड़े ठीक हैं, अंदर पंखा या AC अच्छा लगता है।', '<strong>नोट:</strong> {c}°C बाहर हवा के साथ ठीक लग सकता है, लेकिन बंद कमरे में काफी गर्म महसूस हो सकता है।'],
    },
    faq: {
      hotColdQ: 'क्या {c}°C ठंडा है या गर्म?',
      hotColdA: { indoor: '{c}°C ({f}°F) ज़्यादातर लोगों को आरामदायक लगता है।', mild: '{c}°C ({f}°F) हल्का गर्म महसूस हो सकता है, खासकर अगर धूप हो।', summer: '{c}°C ({f}°F) साफ़ तौर पर गर्म मौसम की तरफ जाता है।' },
      formulaQ: '{c}°C को Fahrenheit में कैसे बदलें?',
      formulaA: 'फ़ॉर्मूला है: °F = (°C × 9/5) + 32। {c} को 1.8 से गुणा करने पर {step} मिलता है, और 32 जोड़ने पर {f}°F बनता है।',
      specialQ: { work: 'क्या {c}°C ऑफिस या क्लासरूम के लिए ठीक है?', sleep: 'क्या {c}°C सोने के लिए सही है?', season: 'क्या {c}°C वसंत/शरद जैसा मौसम है?', outdoor: 'क्या {c}°C बाहर घूमने या हल्की एक्टिविटी के लिए ठीक है?', swim: 'क्या {c}°C पूल या आउटडोर प्लान के लिए अच्छा है?', ac: 'क्या {c}°C AC सेटिंग के लिए अच्छा है?' },
      specialA: { work: '{c}°C लंबे समय तक बैठकर काम, पढ़ाई या मीटिंग के लिए काफ़ी संतुलित तापमान है।', sleep: '{c}°C कुछ लोगों के लिए ठीक हो सकता है, लेकिन जिन्हें ठंडा कमरा पसंद है वे इसे थोड़ा गर्म मान सकते हैं।', season: 'भारत के कई हिस्सों में {c}°C ऐसा तापमान है जो न ज्यादा ठंडा लगता है और न ज्यादा गर्म।', outdoor: '{c}°C पैदल चलने, बाज़ार जाने या हल्की आउटडोर एक्टिविटी के लिए अच्छा रहता है।', swim: '{c}°C हवा के तापमान के रूप में पूल, पार्क या शाम की आउटिंग के लिए अच्छा माना जा सकता है।', ac: '{c}°C कई घरों और दफ्तरों में ऐसी AC सेटिंग मानी जाती है जो आराम और बिजली बचत के बीच संतुलन देती है।' },
      clothingQ: '{c}°C में क्या पहनना चाहिए?',
      clothingLead: { indoor: 'आम तौर पर हल्के और रोज़मर्रा के कपड़े काफी होते हैं:', mild: 'इस तापमान में आरामदायक और हल्के कपड़े अच्छे रहते हैं:', summer: 'इस तापमान में हल्के, सांस लेने वाले कपड़े सबसे अच्छे रहते हैं:' },
      clothingItems: { indoor: ['टी-शर्ट या हल्की फुल-स्लीव', 'जींस, ट्राउज़र या आरामदायक कपड़े', 'AC वाले कमरे के लिए हल्की लेयर'], mild: ['टी-शर्ट, पतली शर्ट या कुर्ती', 'हल्के पैंट, स्कर्ट या कॉटन कपड़े', 'सुबह-शाम के लिए पतली परत'], summer: ['टी-शर्ट, हल्की ड्रेस या सूती कपड़े', 'शॉर्ट्स या पतले लोअर', 'कैप, पानी और धूप से बचाव'] },
      localQ: { indoor: 'क्या {c}°C उत्तर भारत और तटीय शहरों में एक जैसा लगेगा?', mild: 'क्या {c}°C धूप और छाँव में अलग महसूस होता है?', summer: 'क्या {c}°C बाहर हवा में ज़्यादा अच्छा लगता है या कमरे के अंदर?' },
      localA: { indoor: 'सूखे इलाके में {c}°C संतुलित लगता है, जबकि नम तटीय शहरों में यही तापमान ज्यादा गर्म महसूस हो सकता है।', mild: 'हाँ। धूप में {c}°C जल्दी गर्म लग सकता है, जबकि छाँव या हवा में वही तापमान काफी आरामदायक रहता है।', summer: 'अक्सर बाहर हवा के साथ {c}°C बेहतर लगता है। बंद कमरे में यह कहीं ज्यादा गर्म लग सकता है।' },
      feverQ: 'क्या {c}°C बुखार है?',
      feverA: 'नहीं। बुखार आम तौर पर 38°C के आसपास या उससे ऊपर माना जाता है। {c}°C शरीर का तापमान हो तो यह सामान्य से बहुत नीचे होगा।',
    },
  },
  ar: {
    title: '{c}°C إلى {f}°F',
    seo: {
      indoor: '{c}°C إلى {f}°F: حرارة الغرفة والعمل والنوم',
      mild: '{c}°C إلى {f}°F: الإحساس الجوي والملابس والأنشطة',
      summer: '{c}°C إلى {f}°F: جو دافئ، تكييف، وصيف',
    },
    desc: {
      indoor: 'حوّل {c}°C إلى {f}°F وتعرّف هل هذه الدرجة مناسبة للمنزل أو المكتب أو غرفة النوم.',
      mild: 'حوّل {c}°C إلى {f}°F وافهم كيف تبدو هذه الدرجة مع الطقس والملابس والخروج اليومي.',
      summer: 'حوّل {c}°C إلى {f}°F واكتشف هل هذه الدرجة تناسب الأجواء الصيفية وإعدادات التكييف.',
    },
    tag: {
      indoor: 'أداة مجانية لتحويل {c}°C إلى {f}°F مع شرح ما إذا كانت الدرجة مريحة للعمل أو الدراسة أو النوم.',
      mild: 'أداة مجانية لتحويل {c}°C إلى {f}°F مع توضيح الإحساس بالجو والملابس المناسبة والراحة اليومية.',
      summer: 'أداة مجانية لتحويل {c}°C إلى {f}°F مع نصائح عن التكييف والملابس الخفيفة والتعامل مع الجو الدافئ.',
    },
    guide: {
      indoor: ['دليل الراحة الداخلية عند {c}°C', 'هل تناسب العمل أو البيت أو النوم؟', '{c}°C ({f}°F) تقع غالباً ضمن نطاق مريح داخل المنزل أو المكتب، ولا تميل بوضوح إلى البرودة أو الحر.', '<strong>ملاحظة:</strong> في الأجواء الجافة قد تبدو {c}°C متوازنة، بينما في البيئات الرطبة قد تبدو أكثر دفئاً.'],
      mild: ['دليل الإحساس الجوي عند {c}°C', 'هل تبدو معتدلة أم مائلة للدفء؟', '{c}°C ({f}°F) تميل إلى الدفء الخفيف. في الخارج تكون لطيفة غالباً، لكن داخل الأماكن المغلقة قد تبدو أدفأ من المعتاد.', '<strong>ملاحظة:</strong> عند {c}°C تتغير الإحساسات كثيراً بين الشمس والظل والرطوبة والهواء.'],
      summer: ['دليل الجو الدافئ عند {c}°C', 'هل هي حرارة صيف مريحة أم تحتاج تبريداً؟', '{c}°C ({f}°F) تعطي إحساساً صيفياً واضحاً. في الخارج مع ملابس خفيفة تكون مناسبة، وفي الداخل قد يفضّل البعض التهوية أو التكييف.', '<strong>ملاحظة:</strong> {c}°C قد تكون مريحة في الخارج مع نسمة هواء، لكنها قد تبدو أدفأ بكثير داخل المنزل أو السيارة.'],
    },
    faq: {
      hotColdQ: 'هل {c}°C باردة أم حارة؟',
      hotColdA: { indoor: '{c}°C ({f}°F) تُعد غالباً درجة مريحة، ليست باردة ولا حارة بشكل واضح.', mild: '{c}°C ({f}°F) تميل إلى الدفء الخفيف، وكثير من الناس يرونها مناسبة للخروج اليومي.', summer: '{c}°C ({f}°F) تعني غالباً جواً دافئاً صيفياً.' },
      formulaQ: 'كيف أحوّل {c}°C إلى فهرنهايت؟',
      formulaA: 'المعادلة هي: °F = (°C × 9/5) + 32. عندما تضرب {c} في 1.8 تحصل على {step}، ثم تضيف 32 لتصل إلى {f}°F.',
      specialQ: { work: 'هل {c}°C مناسبة للمكتب أو الدراسة؟', sleep: 'هل {c}°C مناسبة للنوم؟', season: 'هل {c}°C تشبه أجواء الربيع أو الخريف؟', outdoor: 'هل {c}°C مناسبة للنشاطات الخارجية؟', swim: 'هل {c}°C مناسبة للمسبح أو الجلسات الخارجية؟', ac: 'هل {c}°C مناسبة كإعداد للمكيّف؟' },
      specialA: { work: '{c}°C تناسب العمل المكتبي والدراسة والجلوس لفترات طويلة لأن الإحساس فيها عادة متوازن.', sleep: 'قد تكون مناسبة لبعض الناس، لكنها قد تبدو دافئة قليلاً لمن يفضّل غرفة أبرد أثناء النوم.', season: 'في كثير من بلدان المنطقة، {c}°C تشبه يوماً لطيفاً في الربيع أو بداية الخريف.', outdoor: '{c}°C جيدة للمشي والجلسات الخارجية والتسوق ما دام التعرض للشمس ليس طويلاً جداً.', swim: '{c}°C مناسبة للمسبح أو الجلسات المسائية في الخارج.', ac: '{c}°C تُعد لدى كثيرين إعداداً اقتصادياً ومريحاً للمكيّف.' },
      clothingQ: 'ماذا أرتدي عند {c}°C؟',
      clothingLead: { indoor: 'غالباً تكفي الملابس اليومية الخفيفة:', mild: 'في هذا الجو تنجح الملابس الخفيفة المريحة:', summer: 'هذه الدرجة تناسب ملابس صيفية خفيفة:' },
      clothingItems: { indoor: ['قميص خفيف أو كم طويل رقيق', 'بنطال خفيف أو ملابس يومية مريحة', 'طبقة خفيفة داخل الأماكن المكيّفة'], mild: ['تيشيرت أو قميص خفيف', 'بنطال خفيف أو فستان مريح', 'طبقة بسيطة للمساء أو الظل'], summer: ['ملابس خفيفة قابلة للتهوية', 'أقمشة صيفية أو سراويل قصيرة', 'نظارة شمسية وماء وغطاء للرأس عند اللزوم'] },
      localQ: { indoor: 'هل تبدو {c}°C نفسها في الخليج كما في بلاد الشام؟', mild: 'هل تختلف {c}°C بين الشمس والظل؟', summer: 'هل تبدو {c}°C أفضل في الخارج أم داخل الأماكن المغلقة؟' },
      localA: { indoor: 'في الأجواء الجافة أو المكيّفة تبدو {c}°C متوازنة، بينما في البيئات الرطبة قد تبدو أدفأ.', mild: 'مع الشمس المباشرة قد تبدو {c}°C أكثر دفئاً، بينما في الظل أو مع الهواء تصبح ألطف بكثير.', summer: 'غالباً تبدو {c}°C أفضل في الخارج مع نسمة هواء. داخل السيارة أو المنزل المغلق قد يرتفع الإحساس الحراري سريعاً.' },
      feverQ: 'هل {c}°C تعني حمى؟',
      feverA: 'لا. الحمى تبدأ عادة قرب 38°C أو أكثر. إذا كانت {c}°C حرارة جسم فستكون أقل بكثير من الطبيعي.',
    },
  },
  ja: {
    title: '{c}°C を華氏に変換（{f}°F）',
    seo: {
      indoor: '{c}°C は何°F？室温・仕事・睡眠の目安',
      mild: '{c}°C は何°F？体感、季節感、服装の目安',
      summer: '{c}°C は何°F？夏の体感、冷房設定、服装の目安',
    },
    desc: {
      indoor: '{c}°C を {f}°F に換算し、室温として快適か、仕事や睡眠に向くかを確認できます。',
      mild: '{c}°C を {f}°F に換算し、春秋の体感や外出時の服装イメージをつかめます。',
      summer: '{c}°C を {f}°F に換算し、夏の暑さ、冷房設定、軽い服装の目安を確認できます。',
    },
    tag: {
      indoor: '{c}°C を {f}°F にすばやく換算し、室温・在宅勤務・睡眠環境として快適かどうかを判断できます。',
      mild: '{c}°C を {f}°F にすばやく換算し、季節の体感や外出時の服装の目安を整理します。',
      summer: '{c}°C を {f}°F にすばやく換算し、夏日の体感、冷房、軽装のバランスを確認できます。',
    },
    guide: {
      indoor: ['{c}°C の室内快適ガイド', '在宅・仕事・睡眠でどう感じる温度？', '{c}°C（{f}°F）は、室内では快適と感じる人が多い温度帯で、仕事や勉強にも向きます。', '<strong>メモ:</strong> 乾燥した部屋では {c}°C がちょうどよく感じられても、湿度が高いと少し蒸し暑く感じます。'],
      mild: ['{c}°C の体感ガイド', '過ごしやすいのか、少し暖かいのか？', '{c}°C（{f}°F）は、標準的な室温より少し暖かめです。屋外では心地よく、屋内では少し暖かく感じることがあります。', '<strong>メモ:</strong> {c}°C は日差し・風・湿度の影響を受けやすいです。'],
      summer: ['{c}°C の夏向け体感ガイド', '夏として快適か、冷房が欲しくなるか？', '{c}°C（{f}°F）は、はっきりと夏らしい暖かさです。外では軽装で過ごしやすい一方、室内では送風や冷房を使いたくなる場面もあります。', '<strong>メモ:</strong> {c}°C は屋外の風があれば快適でも、梅雨時や風のない室内では数字以上に暑く感じやすいです。'],
    },
    faq: {
      hotColdQ: '{c}°C は寒い？暑い？',
      hotColdA: { indoor: '{c}°C（{f}°F）は、寒くも暑くもない「ちょうどいい」と感じる人が多い温度です。', mild: '{c}°C（{f}°F）は、やや暖かめですが不快な暑さではありません。', summer: '{c}°C（{f}°F）は、夏らしい暖かさです。' },
      formulaQ: '{c}°C を華氏に換算する方法は？',
      formulaA: '式は °F = (°C × 9/5) + 32 です。{c} に 1.8 を掛けると {step}、そこに 32 を足して {f}°F になります。',
      specialQ: { work: '{c}°C は在宅勤務やオフィスに向いている？', sleep: '{c}°C は寝室に向いている？', season: '{c}°C は春や秋の気温に近い？', outdoor: '{c}°C は散歩や外出に向いている？', swim: '{c}°C はプールやレジャー向き？', ac: '{c}°C は冷房設定としてちょうどいい？' },
      specialA: { work: '{c}°C は長時間のデスクワークや勉強でも疲れにくい、安定した室温になりやすいです。', sleep: '{c}°C は人によっては少し暖かく感じます。薄い寝具や除湿を組み合わせると快適さが上がります。', season: '日本では {c}°C は春の終わりや初秋のように感じられることが多いです。', outdoor: '{c}°C は散歩、買い物、軽い運動などに向くことが多いです。', swim: '{c}°C はプールや公園、テラス利用に向くことが多いです。', ac: '{c}°C は「冷やしすぎない」冷房設定として使われることが多いです。' },
      clothingQ: '{c}°C のときは何を着ればいい？',
      clothingLead: { indoor: '室内なら、基本は軽めの普段着で十分です:', mild: 'このくらいなら、軽くて動きやすい服装が合います:', summer: '夏向けの軽装がちょうどよい温度です:' },
      clothingItems: { indoor: ['Tシャツや薄手の長袖', 'ジーンズや軽いパンツ', '冷房対策に薄い羽織り'], mild: ['Tシャツ、シャツ、薄手の上着', '通気性の良いパンツやスカート', '朝晩用に一枚軽い羽織り'], summer: ['半袖、ワンピース、薄手素材', '通気性の高いパンツやショート丈', '日差し対策の帽子や水分'] },
      localQ: { indoor: '{c}°C は湿度が高い部屋でも同じように感じる？', mild: '{c}°C は日向と日陰でかなり違う？', summer: '{c}°C は外より室内のほうが暑く感じる？' },
      localA: { indoor: '湿度が高いと {c}°C でも少し蒸し暑く感じ、乾燥した部屋ではちょうどよく感じやすいです。', mild: 'はい。{c}°C は日向では暖かく、日陰や風がある場所ではぐっと過ごしやすくなります。', summer: '風がある外では快適でも、室内で風がなく湿度が高いと {c}°C でもかなり暑く感じることがあります。' },
      feverQ: '{c}°C は発熱？',
      feverA: 'いいえ。発熱は通常 38°C 近くからです。{c}°C が体温なら、むしろ平熱よりかなり低い数字です。',
    },
  },
  fr: {
    title: '{c} °C en Fahrenheit ({f} °F)',
    seo: {
      indoor: '{c} °C en Fahrenheit ({f} °F) : confort intérieur et sommeil',
      mild: '{c} °C en Fahrenheit ({f} °F) : ressenti, météo et tenue',
      summer: '{c} °C en Fahrenheit ({f} °F) : chaleur douce, climatisation et été',
    },
    desc: {
      indoor: 'Convertissez {c} °C en {f} °F et voyez si cette température convient à la maison, au bureau ou à la chambre.',
      mild: 'Convertissez {c} °C en {f} °F et comprenez comment cette température se ressent selon la météo et les vêtements.',
      summer: 'Convertissez {c} °C en {f} °F et voyez si cette température appelle une tenue légère, un ventilateur ou la climatisation.',
    },
    tag: {
      indoor: 'Outil gratuit pour convertir {c} °C en {f} °F et juger si cette température est agréable pour travailler, se reposer ou dormir.',
      mild: 'Outil gratuit pour convertir {c} °C en {f} °F avec un contexte clair sur le ressenti météo, la tenue et le confort.',
      summer: 'Outil gratuit pour convertir {c} °C en {f} °F avec des repères pratiques sur la chaleur, la climatisation et les vêtements légers.',
    },
    guide: {
      indoor: ['Guide de confort intérieur pour {c} °C', 'Mieux pour la maison, le bureau ou la nuit ?', '{c} °C ({f} °F) se situe souvent dans une zone agréable en intérieur. Beaucoup de personnes le trouvent stable et facile à vivre.', '<strong>Note :</strong> dans un logement sec, {c} °C paraît souvent neutre ; avec davantage d’humidité, la même valeur semble plus chaude.'],
      mild: ['Guide de ressenti pour {c} °C', 'Température douce ou déjà un peu chaude ?', '{c} °C ({f} °F) paraît un peu plus chaud que la température ambiante classique. Dehors, c’est souvent agréable ; dedans, cela peut sembler légèrement chaud.', '<strong>Note :</strong> à {c} °C, le soleil, l’ombre et le vent changent nettement le ressenti.'],
      summer: ['Guide de chaleur légère pour {c} °C', 'Chaleur d’été agréable ou besoin de rafraîchir ?', '{c} °C ({f} °F) correspond déjà à une vraie ambiance estivale. En extérieur, une tenue légère suffit souvent ; en intérieur, un peu d’air frais aide.', '<strong>Note :</strong> {c} °C peut être agréable dehors avec de l’air, mais plus lourd dans un appartement mal ventilé.'],
    },
    faq: {
      hotColdQ: '{c} °C, c’est froid ou chaud ?',
      hotColdA: { indoor: '{c} °C ({f} °F) est généralement perçu comme confortable, ni vraiment froid ni vraiment chaud.', mild: '{c} °C ({f} °F) donne une sensation douce à légèrement chaude.', summer: '{c} °C ({f} °F) correspond déjà à un temps chaud d’été.' },
      formulaQ: 'Comment convertir {c} °C en Fahrenheit ?',
      formulaA: 'La formule est : °F = (°C × 9/5) + 32. {c} multiplié par 1,8 donne {step}, puis on ajoute 32 pour obtenir {f} °F.',
      specialQ: { work: '{c} °C convient-il au bureau ou au télétravail ?', sleep: '{c} °C est-il adapté pour dormir ?', season: '{c} °C ressemble-t-il à un temps de printemps ou d’automne ?', outdoor: '{c} °C convient-il aux activités extérieures ?', swim: '{c} °C convient-il à la piscine ou à la terrasse ?', ac: '{c} °C est-il un bon réglage pour la climatisation ?' },
      specialA: { work: '{c} °C fonctionne bien pour un bureau ou une journée de télétravail.', sleep: '{c} °C peut convenir, mais certaines personnes le trouveront un peu chaud pour la nuit.', season: '{c} °C évoque souvent un beau jour de printemps ou de début d’automne.', outdoor: '{c} °C convient bien à la marche, aux terrasses ou à une activité légère.', swim: '{c} °C s’accorde bien avec la piscine, la plage ou un moment en terrasse.', ac: '{c} °C est souvent vu comme un réglage de climatisation raisonnable et économe.' },
      clothingQ: 'Que porter quand il fait {c} °C ?',
      clothingLead: { indoor: 'En général, une tenue légère du quotidien suffit :', mild: 'À cette température, une tenue souple et légère fonctionne bien :', summer: 'On peut souvent passer à des vêtements clairement estivaux :' },
      clothingItems: { indoor: ['T-shirt ou haut fin', 'Jean, pantalon léger ou jupe', 'Petite veste pour les lieux climatisés'], mild: ['T-shirt, chemise légère ou blouse', 'Pantalon léger ou robe fluide', 'Petite couche pour le soir'], summer: ['Tenue légère et respirante', 'Short ou tissu fin', 'Lunettes, eau et protection solaire'] },
      localQ: { indoor: '{c} °C se ressent-il pareil dans un appartement sec et dans une ville humide ?', mild: 'À {c} °C, le soleil et l’ombre changent-ils beaucoup la sensation ?', summer: '{c} °C se supporte-t-il mieux dehors qu’en intérieur ?' },
      localA: { indoor: 'Dans un logement sec, {c} °C paraît équilibré ; avec plus d’humidité, la même température semble plus chaude.', mild: 'Oui. En plein soleil, {c} °C paraît plus chaud ; avec de l’ombre et du vent, le ressenti redevient plus doux.', summer: 'Souvent oui. En extérieur avec un peu d’air, {c} °C peut rester agréable ; en intérieur, cela paraît rapidement plus chaud.' },
      feverQ: '{c} °C, est-ce une fièvre ?',
      feverA: 'Non. La fièvre commence généralement autour de 38 °C. Si {c} °C était une température corporelle, ce serait bien en dessous de la normale.',
    },
  },
  de: {
    title: '{c}°C in Fahrenheit ({f}°F)',
    seo: {
      indoor: '{c}°C in Fahrenheit ({f}°F): Raumtemperatur, Arbeit und Schlaf',
      mild: '{c}°C in Fahrenheit ({f}°F): Gefühlte Temperatur, Wetter und Kleidung',
      summer: '{c}°C in Fahrenheit ({f}°F): Sommerwärme, Klimaanlage und Alltag',
    },
    desc: {
      indoor: 'Wandle {c}°C in {f}°F um und prüfe, ob diese Temperatur für Wohnung, Büro oder Schlafzimmer angenehm ist.',
      mild: 'Wandle {c}°C in {f}°F um und verstehe, wie sich diese Temperatur draußen und im Alltag anfühlt.',
      summer: 'Wandle {c}°C in {f}°F um und finde heraus, ob diese Temperatur nach Sommerkleidung, Lüften oder Klimaanlage verlangt.',
    },
    tag: {
      indoor: 'Kostenloser Umrechner für {c}°C zu {f}°F mit Einordnung, ob die Temperatur für Wohnen, Arbeiten oder Schlafen angenehm ist.',
      mild: 'Kostenloser Umrechner für {c}°C zu {f}°F mit alltagsnaher Einschätzung zu Wettergefühl, Kleidung und Innenraumkomfort.',
      summer: 'Kostenloser Umrechner für {c}°C zu {f}°F mit Hinweisen zu Sommerwärme, leichter Kleidung und sinnvollen Klimaeinstellungen.',
    },
    guide: {
      indoor: ['Komfort-Guide für {c}°C innen', 'Eher ideal für Wohnung, Büro oder Schlafzimmer?', '{c}°C ({f}°F) liegen oft im angenehmen Bereich für Innenräume. Viele empfinden diese Temperatur als ausgewogen und leicht nutzbar.', '<strong>Hinweis:</strong> In trockenen Räumen wirken {c}°C oft neutral, bei höherer Luftfeuchtigkeit können sie deutlich wärmer erscheinen.'],
      mild: ['Gefühlte-Temperatur-Guide für {c}°C', 'Angenehm mild oder schon spürbar warm?', '{c}°C ({f}°F) fühlen sich bereits etwas wärmer als klassische Raumtemperatur an. Draußen oft angenehm, drinnen bei wenig Bewegung leicht warm.', '<strong>Hinweis:</strong> Bei {c}°C verändern Sonne, Schatten und Wind das Empfinden stark.'],
      summer: ['Sommer-Guide für {c}°C', 'Sommerlich angenehm oder eher ein Fall für Kühlung?', '{c}°C ({f}°F) wirken deutlich sommerlich. Im Freien mit leichter Kleidung meist gut, in Innenräumen aber oft schon warm genug für Ventilator oder Klima.', '<strong>Hinweis:</strong> {c}°C können draußen mit Luftzug angenehm sein, in einer warmen Wohnung aber deutlich drückender wirken.'],
    },
    faq: {
      hotColdQ: 'Sind {c}°C eher kalt oder warm?',
      hotColdA: { indoor: '{c}°C ({f}°F) gelten meist als angenehm und weder deutlich kalt noch heiß.', mild: '{c}°C ({f}°F) wirken meist mild bis leicht warm.', summer: '{c}°C ({f}°F) sind klar sommerlich.' },
      formulaQ: 'Wie rechnet man {c}°C in Fahrenheit um?',
      formulaA: 'Die Formel lautet: °F = (°C × 9/5) + 32. {c} mal 1,8 ergibt {step}; plus 32 sind es {f}°F.',
      specialQ: { work: 'Sind {c}°C gut für Büro oder Homeoffice?', sleep: 'Sind {c}°C gut zum Schlafen?', season: 'Fühlen sich {c}°C eher nach Frühling oder Herbst an?', outdoor: 'Sind {c}°C gut für Aktivitäten draußen?', swim: 'Passen {c}°C zu Freibad oder Terrasse?', ac: 'Sind {c}°C eine gute Einstellung für die Klimaanlage?' },
      specialA: { work: '{c}°C passen oft gut zu Büroarbeit, Lernen und ruhigen Innenräumen.', sleep: 'Für manche ja, für andere schon etwas warm. Wer kühl schläft, bevorzugt oft ein paar Grad weniger.', season: 'In Deutschland erinnern {c}°C oft an einen guten Frühlingstag oder an einen milden Herbstnachmittag.', outdoor: '{c}°C sind häufig gut für Spaziergänge, Radfahren oder Cafébesuche im Freien geeignet.', swim: '{c}°C passen oft gut zu Freibad, Terrasse oder Park.', ac: '{c}°C gelten häufig als vernünftige Klimaanlagen-Einstellung.' },
      clothingQ: 'Was trägt man bei {c}°C?',
      clothingLead: { indoor: 'Meist reicht leichte Alltagskleidung:', mild: 'Bei dieser Temperatur funktionieren lockere, leichte Sachen gut:', summer: 'Hier passt meist schon klar sommerliche Kleidung:' },
      clothingItems: { indoor: ['T-Shirt oder dünnes Langarmshirt', 'Jeans oder leichte Hose', 'Leichte Schicht für klimatisierte Räume'], mild: ['T-Shirt, Hemd oder leichte Bluse', 'Leichte Hose oder Rock', 'Dünne Jacke für Abend oder Wind'], summer: ['Leichte, luftige Kleidung', 'Kurze Hose oder dünne Stoffe', 'Wasser, Sonnenbrille und Kopfbedeckung'] },
      localQ: { indoor: 'Fühlen sich {c}°C in trockener Luft anders an als in feuchter Wohnungsluft?', mild: 'Machen Sonne und Schatten bei {c}°C einen großen Unterschied?', summer: 'Sind {c}°C draußen oft angenehmer als drinnen?' },
      localA: { indoor: 'In trockener Luft wirken {c}°C oft neutraler, bei hoher Luftfeuchtigkeit dagegen spürbar wärmer.', mild: 'Ja. In der Sonne können {c}°C deutlich wärmer wirken, während Schatten und Wind das Empfinden schnell wieder abmildern.', summer: 'Mit Luftzug draußen sind {c}°C oft angenehmer, während Innenräume ohne Lüftung schnell wärmer wirken.' },
      feverQ: 'Sind {c}°C Fieber?',
      feverA: 'Nein. Fieber beginnt meist erst in der Nähe von 38°C. Als Körpertemperatur wäre {c}°C deutlich zu niedrig.',
    },
  },
  id: {
    title: '{c}°C ke {f}°F',
    seo: {
      indoor: '{c}°C ke {f}°F: suhu ruangan, kerja, dan tidur',
      mild: '{c}°C ke {f}°F: rasa cuaca, pakaian, dan aktivitas harian',
      summer: '{c}°C ke {f}°F: cuaca hangat, AC, dan kebutuhan musim panas',
    },
    desc: {
      indoor: 'Ubah {c}°C ke {f}°F dan lihat apakah suhu ini nyaman untuk rumah, kantor, atau kamar tidur.',
      mild: 'Ubah {c}°C ke {f}°F dan pahami rasanya untuk cuaca sehari-hari, jalan santai, dan pakaian ringan.',
      summer: 'Ubah {c}°C ke {f}°F dan lihat apakah suhu ini cocok untuk cuaca tropis hangat, AC, dan aktivitas luar ruang.',
    },
    tag: {
      indoor: 'Konverter gratis untuk mengubah {c}°C ke {f}°F sambil menilai apakah suhu ini nyaman untuk bekerja, belajar, atau tidur.',
      mild: 'Konverter gratis untuk mengubah {c}°C ke {f}°F dengan panduan rasa suhu, pakaian, dan kenyamanan ruangan.',
      summer: 'Konverter gratis untuk mengubah {c}°C ke {f}°F dengan panduan soal cuaca hangat, kipas, AC, dan pakaian ringan.',
    },
    guide: {
      indoor: ['Panduan kenyamanan indoor untuk {c}°C', 'Lebih cocok untuk kerja, rumah, atau tidur?', '{c}°C ({f}°F) biasanya masuk rentang suhu ruangan yang nyaman. Di rumah atau kantor, banyak orang merasa suhu ini stabil dan mudah diterima.', '<strong>Catatan:</strong> di ruangan kering {c}°C bisa terasa netral, sedangkan di kota lembap suhu yang sama bisa terasa lebih hangat.'],
      mild: ['Panduan rasa cuaca untuk {c}°C', 'Masih nyaman atau sudah terasa hangat?', '{c}°C ({f}°F) terasa sedikit lebih hangat daripada suhu ruangan biasa. Di luar ruangan terasa enak, tetapi di dalam ruang tertutup bisa sedikit gerah.', '<strong>Catatan:</strong> pada {c}°C, sinar matahari, kelembapan, dan angin sangat memengaruhi rasa suhu.'],
      summer: ['Panduan cuaca hangat untuk {c}°C', 'Masih enak tanpa AC atau sudah perlu pendinginan?', '{c}°C ({f}°F) sudah terasa seperti hari hangat. Dengan pakaian ringan masih nyaman, tetapi di ruangan tanpa sirkulasi orang sering memilih kipas atau AC.', '<strong>Catatan:</strong> {c}°C bisa terasa nyaman di luar dengan angin, tetapi di ruangan tropis yang lembap bisa terasa jauh lebih panas.'],
    },
    faq: {
      hotColdQ: 'Apakah {c}°C terasa dingin atau panas?',
      hotColdA: { indoor: '{c}°C ({f}°F) biasanya terasa nyaman, tidak dingin dan tidak terlalu panas.', mild: '{c}°C ({f}°F) cenderung terasa hangat ringan.', summer: '{c}°C ({f}°F) sudah masuk kategori hangat.' },
      formulaQ: 'Bagaimana cara mengubah {c}°C ke Fahrenheit?',
      formulaA: 'Rumusnya adalah: °F = (°C × 9/5) + 32. {c} dikali 1,8 menghasilkan {step}, lalu ditambah 32 menjadi {f}°F.',
      specialQ: { work: 'Apakah {c}°C cocok untuk kantor atau belajar?', sleep: 'Apakah {c}°C enak untuk tidur?', season: 'Apakah {c}°C terasa seperti cuaca peralihan?', outdoor: 'Apakah {c}°C cocok untuk aktivitas luar ruang?', swim: 'Apakah {c}°C enak untuk kolam atau kegiatan santai di luar?', ac: 'Apakah {c}°C cocok sebagai setelan AC?' },
      specialA: { work: '{c}°C cukup nyaman untuk bekerja, belajar, atau aktivitas indoor yang tenang.', sleep: 'Bisa cocok untuk sebagian orang, tetapi yang mudah gerah mungkin ingin suhu sedikit lebih rendah.', season: 'Di banyak kota Indonesia, {c}°C terasa seperti cuaca hangat yang masih bersahabat.', outdoor: '{c}°C cocok untuk jalan kaki, belanja, atau olahraga ringan, terutama pagi atau sore hari.', swim: '{c}°C cocok untuk kolam, taman, atau nongkrong sore.', ac: '{c}°C sering dianggap setelan AC yang hemat energi dan tetap nyaman.' },
      clothingQ: 'Pakaian apa yang cocok pada {c}°C?',
      clothingLead: { indoor: 'Biasanya cukup pakaian harian yang ringan:', mild: 'Pada suhu ini, pakaian ringan dan mudah menyerap keringat paling nyaman:', summer: 'Pada suhu seperti ini, pakaian tipis dan adem biasanya paling pas:' },
      clothingItems: { indoor: ['Kaos atau atasan lengan panjang tipis', 'Celana ringan atau pakaian kasual', 'Lapisan tipis untuk ruang ber-AC'], mild: ['Kaos, kemeja tipis, atau blouse ringan', 'Celana ringan, rok, atau bahan adem', 'Lapisan tipis untuk sore atau angin'], summer: ['Kaos, dress ringan, atau bahan cepat kering', 'Celana pendek atau pakaian sangat adem', 'Topi, air minum, dan pelindung matahari'] },
      localQ: { indoor: 'Apakah {c}°C terasa sama di ruang ber-AC dan di kota lembap?', mild: 'Apakah {c}°C berbeda jauh antara matahari dan tempat teduh?', summer: 'Apakah {c}°C lebih enak di luar daripada di dalam ruangan?' },
      localA: { indoor: 'Di ruang ber-AC, {c}°C bisa terasa netral; di kota tropis yang lembap, suhu yang sama bisa terasa lebih hangat.', mild: 'Ya. Pada {c}°C, sinar matahari langsung bisa membuat suhu terasa naik cepat, sedangkan tempat teduh dan angin membuatnya jauh lebih nyaman.', summer: 'Dengan angin, {c}°C di luar bisa terasa enak; di ruangan tertutup tanpa sirkulasi bisa terasa jauh lebih panas.' },
      feverQ: 'Apakah {c}°C termasuk demam?',
      feverA: 'Tidak. Demam biasanya mulai mendekati 38°C. Jika {c}°C adalah suhu tubuh, nilainya justru jauh di bawah normal.',
    },
  },
  'pt-br': {
    title: '{c}°C para {f}°F',
    seo: {
      indoor: '{c}°C para {f}°F: temperatura ambiente, trabalho e sono',
      mild: '{c}°C para {f}°F: sensação térmica, clima e roupa',
      summer: '{c}°C para {f}°F: calor leve, ar-condicionado e verão',
    },
    desc: {
      indoor: 'Converta {c}°C para {f}°F e veja se essa temperatura funciona bem em casa, no escritório ou no quarto.',
      mild: 'Converta {c}°C para {f}°F e entenda como essa faixa se sente no dia a dia, com clima agradável e roupa leve.',
      summer: 'Converta {c}°C para {f}°F e descubra se essa temperatura combina com verão, ar-condicionado e atividades ao ar livre.',
    },
    tag: {
      indoor: 'Ferramenta gratuita para converter {c}°C em {f}°F e avaliar se a temperatura é boa para trabalhar, estudar ou dormir.',
      mild: 'Ferramenta gratuita para converter {c}°C em {f}°F com contexto de clima, sensação térmica e escolha de roupa.',
      summer: 'Ferramenta gratuita para converter {c}°C em {f}°F com orientação prática sobre calor, roupas leves e uso de ar-condicionado.',
    },
    guide: {
      indoor: ['Guia de conforto interno para {c}°C', 'Melhor para trabalhar, ficar em casa ou dormir?', '{c}°C ({f}°F) costuma ficar numa faixa confortável para ambientes internos. Em casa e no trabalho, muita gente sente essa temperatura como equilibrada.', '<strong>Nota:</strong> em regiões mais secas, {c}°C pode parecer bem neutro; em locais úmidos, a mesma marca costuma parecer mais quente.'],
      mild: ['Guia de sensação térmica para {c}°C', 'Parece clima agradável ou já fica quente?', '{c}°C ({f}°F) já passa da temperatura ambiente neutra e tende ao morno. Ao ar livre é agradável; em locais fechados pode parecer um pouco quente.', '<strong>Nota:</strong> com {c}°C, sol, sombra, vento e umidade fazem bastante diferença na sensação final.'],
      summer: ['Guia de calor leve para {c}°C', 'É um calor confortável de verão ou já pede refrigeração?', '{c}°C ({f}°F) já tem cara de dia quente. Com roupa leve costuma ser tranquilo, mas em ambientes fechados muita gente prefere ventilador ou ar-condicionado.', '<strong>Nota:</strong> {c}°C pode ser agradável na rua com vento, mas dentro de casa, sem ventilação, a sensação sobe rápido.'],
    },
    faq: {
      hotColdQ: '{c}°C é frio ou calor?',
      hotColdA: { indoor: '{c}°C ({f}°F) costuma ser visto como confortável, sem parecer frio nem calor forte.', mild: '{c}°C ({f}°F) tende a parecer agradável para sair, com uma sensação levemente morna.', summer: '{c}°C ({f}°F) já entra na faixa de dia quente.' },
      formulaQ: 'Como converter {c}°C para Fahrenheit?',
      formulaA: 'A fórmula é: °F = (°C × 9/5) + 32. {c} vezes 1,8 dá {step}; somando 32, o resultado é {f}°F.',
      specialQ: { work: '{c}°C é bom para casa ou escritório?', sleep: '{c}°C é bom para dormir?', season: '{c}°C lembra clima de primavera ou outono?', outdoor: '{c}°C é bom para atividades ao ar livre?', swim: '{c}°C combina com piscina ou praia?', ac: '{c}°C é uma boa configuração para o ar-condicionado?' },
      specialA: { work: '{c}°C costuma funcionar bem para home office, escritório e estudo.', sleep: 'Para algumas pessoas, sim. Para quem sente calor fácil, pode parecer um pouco quente.', season: 'Em muitas cidades do Brasil, {c}°C lembra um dia agradável de outono ou primavera.', outdoor: '{c}°C costuma ser bom para caminhar, correr leve, ir ao parque ou ficar em áreas externas.', swim: '{c}°C combina bem com piscina, praia ou passeio ao ar livre.', ac: '{c}°C costuma ser visto como um ajuste equilibrado do ar-condicionado.' },
      clothingQ: 'O que vestir com {c}°C?',
      clothingLead: { indoor: 'Em geral, roupa leve do dia a dia já resolve:', mild: 'Nessa faixa, roupas leves e confortáveis funcionam melhor:', summer: 'Aqui já vale apostar em peças mais frescas:' },
      clothingItems: { indoor: ['Camiseta ou manga longa fina', 'Calça leve, jeans ou saia', 'Camada fina para locais com ar-condicionado'], mild: ['Camiseta, camisa leve ou vestido confortável', 'Tecidos leves e respiráveis', 'Camada fina para fim de tarde'], summer: ['Roupa leve e fresca', 'Short, saia ou tecido fino', 'Boné, água e proteção solar'] },
      localQ: { indoor: '{c}°C parece igual no Sul e no litoral úmido?', mild: '{c}°C muda muito entre sol e sombra?', summer: '{c}°C costuma ser mais fácil na rua do que dentro de casa?' },
      localA: { indoor: 'Em locais secos, {c}°C parece mais neutro; em cidades úmidas, a mesma temperatura costuma parecer mais quente.', mild: 'No sol, {c}°C pode parecer bem mais quente; na sombra ou com vento, o clima fica bem mais agradável.', summer: 'Com vento, {c}°C na rua pode ser suportável; em casa sem ventilação, a sensação térmica sobe bastante.' },
      feverQ: '{c}°C é febre?',
      feverA: 'Não. Febre normalmente começa perto de 38°C. Se {c}°C fosse temperatura corporal, estaria muito abaixo do normal.',
    },
  },
};

function buildLocaleJson(locale, profile, english) {
  const data = L[locale];
  const c = Number(profile.slug.split('-')[0]);
  const f = toF(c);
  const tokens = { c: formatNumber(locale, c), f: formatNumber(locale, f), step: formatNumber(locale, c * 1.8) };
  const guide = data.guide[profile.band];
  const faq = data.faq;
  const guideMeta = GUIDE_META[locale];
  const fallbackChart = english.comfortGuide?.chart || {};
  const fallbackTable = english.comfortGuide?.table || {};

  return {
    seo: {
      title: fill(data.seo[profile.band], tokens),
      description: fill(data.desc[profile.band], tokens),
    },
    header: {
      title: fill(data.title, tokens),
      tagline: fill(data.tag[profile.band], tokens),
    },
    conversion: {
      intro: fill(INTRO_TEMPLATES[locale], tokens),
    },
    strategy: {
      keywords: fill(data.desc[profile.band], tokens),
    },
    comfortGuide: {
      title: fill(guide[0], tokens),
      subtitle: fill(guide[1], tokens),
      intro: fill(guide[2], tokens),
      chart: {
        cold: {
          ...(fallbackChart.cold || {}),
          label: guideMeta.labels.cold,
          desc: (fallbackChart.cold?.desc || '').replace(/<br>.*$/, `<br>${guideMeta.desc[profile.band][0]}`),
        },
        moderate: {
          ...(fallbackChart.moderate || {}),
          label: guideMeta.labels.moderate,
          desc: (fallbackChart.moderate?.desc || '').replace(/<br>.*$/, `<br>${guideMeta.desc[profile.band][1]}`),
        },
        warm: {
          ...(fallbackChart.warm || {}),
          label: guideMeta.labels.warm,
          desc: (fallbackChart.warm?.desc || '').replace(/<br>.*$/, `<br>${guideMeta.desc[profile.band][2]}`),
        },
      },
      table: {
        headers: guideMeta.headers,
        rows: (fallbackTable.rows || []).map((row) => {
          const temp = parseTemp(row.temp || '');
          const kind = classifyTemp(temp);
          return {
            ...(row.href ? { href: row.href } : {}),
            ...(row.highlight ? { highlight: true } : {}),
            temp: row.temp,
            desc: guideMeta.rowDesc[kind],
            use: guideMeta.rowUse[kind],
          };
        }),
      },
      note: fill(guide[3], tokens),
    },
    faq: [
      { question: fill(faq.hotColdQ, tokens), answerHtml: `<p>${fill(faq.hotColdA[profile.band], tokens)}</p>` },
      { question: fill(faq.formulaQ, tokens), answerHtml: `<p>${fill(faq.formulaA, tokens)}</p>` },
      { question: fill(faq.specialQ[profile.nuance], tokens), answerHtml: `<p>${fill(faq.specialA[profile.nuance], tokens)}</p>` },
      { question: fill(faq.clothingQ, tokens), answerHtml: faqHtml(fill(faq.clothingLead[profile.band], tokens), faq.clothingItems[profile.band].map((item) => fill(item, tokens))) },
      { question: fill(faq.localQ[profile.band], tokens), answerHtml: `<p>${fill(faq.localA[profile.band], tokens)}</p>` },
      { question: fill(faq.feverQ, tokens), answerHtml: `<p>${fill(faq.feverA, tokens)}</p>` },
    ],
  };
}

Object.values(PAGES).forEach((profile) => {
  const english = JSON.parse(fs.readFileSync(path.join(EN_DIR, `${profile.slug}.json`), 'utf8'));
  OUT_LOCALES.forEach((locale) => {
    const filePath = path.join(ROOT, 'locales', locale, `${profile.slug}.json`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const payload = buildLocaleJson(locale, profile, english);
    fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  });
});
