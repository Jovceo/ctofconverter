const fs = require('fs');
const path = require('path');

const root = process.cwd();

function writeJson(relPath, data) {
  const filePath = path.join(root, relPath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function roomPage(data) {
  return {
    seo: {
      title: data.seoTitle,
      description: data.seoDescription,
    },
    header: {
      title: data.headerTitle,
      tagline: data.headerTagline,
    },
    conversion: {
      intro: data.conversionIntro,
    },
    strategy: {
      keywords: data.keywords,
    },
    comfortGuide: {
      title: data.guideTitle,
      subtitle: data.guideSubtitle,
      intro: data.guideIntro,
      chart: data.chart,
      table: data.table,
      note: data.note,
    },
    faq: data.faq,
    practicalApplications: {
      title: data.practicalTitle,
      cards: data.cards,
    },
  };
}

const roomPages = {
  fr: {
    16: roomPage({
      seoTitle: '16 °C en Fahrenheit (60,8 °F) | Guide de conversion',
      seoDescription:
        'Convertissez rapidement 16 °C en Fahrenheit. Découvrez que 16 °C correspondent à 60,8 °F et voyez si cette température paraît fraîche ou douce selon le contexte.',
      headerTitle: '16 °C en Fahrenheit (16 degrés Celsius en °F)',
      headerTagline:
        'Convertissez 16 °C en Fahrenheit avec des repères utiles pour l’intérieur, les petites couches, les sorties et les questions du quotidien.',
      conversionIntro: '16 °C correspondent à 60,8 °F.',
      keywords:
        '16 c en fahrenheit 16 celsius en fahrenheit 60,8 fahrenheit temps frais tenue température intérieure fièvre',
      guideTitle: 'Repères de confort à 16 °C',
      guideSubtitle: 'Assez frais pour une couche légère, mais facile à vivre',
      guideIntro:
        '16 °C (60,8 °F) donnent souvent une impression de fraîcheur légère. En marchant ou pendant un trajet, la température reste agréable. À l’intérieur, beaucoup de personnes préfèrent toutefois un pull fin ou une surchemise.',
      chart: {
        cold: {
          label: 'Frais',
          value: '10-15°C',
          desc: '50-59°F<br>Une veste légère aide souvent',
        },
        moderate: {
          label: 'Tempéré',
          value: '16-19°C',
          desc: '60.8-66.2°F<br>Confortable avec une couche légère',
        },
        warm: {
          label: 'Confortable',
          value: '20-22°C',
          desc: '68-71.6°F<br>Confort intérieur classique',
        },
      },
      table: {
        headers: {
          temperature: 'Température',
          description: 'Ressenti',
          typicalUse: 'Usage habituel',
        },
        rows: [
          { temp: '10°C (50°F)', desc: 'Frais', use: 'Une veste légère est souvent utile', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Frais et légèrement vif', use: 'Pratique pour marcher, se déplacer et rester dedans avec une petite couche', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Frais mais agréable', use: 'Souvent apprécié pour dormir ou rester au calme', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Confortablement frais', use: 'Bon équilibre intérieur sans impression de chaleur', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Température ambiante', use: 'Réglage fréquent à la maison ou au bureau', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Température corporelle normale', use: 'Utile si quelqu’un confond météo et fièvre', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Note :</strong> 16 °C semblent souvent plus agréables en mouvement qu’à l’arrêt. Le vent, l’humidité et l’ombre du matin peuvent accentuer la fraîcheur.',
      faq: [
        {
          question: 'Combien font 16 degrés Celsius en Fahrenheit ?',
          answerHtml:
            '<p>16 degrés Celsius correspondent à 60,8 degrés Fahrenheit. La formule est : °F = (°C × 9/5) + 32. En multipliant 16 par 1,8, on obtient 28,8, puis on ajoute 32 pour arriver à 60,8 °F.</p>',
        },
        {
          question: '16 °C, est-ce chaud ou froid ?',
          answerHtml:
            '<p>16 °C (60,8 °F) sont généralement décrits comme frais à doux. Ce n’est pas un froid d’hiver marqué, mais la plupart des gens apprécient quand même une couche légère.</p><p>Dehors, la température peut sembler vivifiante et agréable. Dedans, elle paraît un peu fraîche si l’on reste assis longtemps.</p>',
        },
        {
          question: 'Que valent -16 °C en Fahrenheit ?',
          answerHtml:
            '<p>-16 °C correspondent à 3,2 °F. Là, on parle d’un vrai froid hivernal, sans rapport avec 16 °C au-dessus de zéro.</p>',
        },
        {
          question: '16 °C correspondent-ils à une fièvre ?',
          answerHtml:
            '<p>Non. Une fièvre commence généralement autour de 38 °C (100,4 °F), alors que la température corporelle normale se situe autour de 37 °C (98,6 °F).</p><p>Si 16 °C étaient une température corporelle, ce serait extrêmement en dessous de la normale.</p>',
        },
        {
          question: 'Comment s’habiller quand il fait 16 °C ?',
          answerHtml:
            '<p>À 16 °C, des couches légères suffisent dans la plupart des cas.</p><ul><li>T-shirt ou haut manches longues avec gilet, surchemise ou veste légère</li><li>Jean, pantalon ou autre bas couvrant</li><li>Chaussures fermées ou baskets au quotidien</li></ul><p>S’il y a du vent ou de la bruine, une couche supplémentaire change souvent le confort.</p>',
        },
        {
          question: '16 °C sont-ils agréables pour les activités extérieures ?',
          answerHtml:
            '<p>Oui. 16 °C conviennent souvent très bien à la marche, aux déplacements, à une activité physique légère ou à un moment passé dehors. On ressent surtout de la fraîcheur, pas un froid agressif.</p>',
        },
        {
          question: 'Comment convertir 16 °C en Fahrenheit de tête ?',
          answerHtml:
            '<p>Une astuce rapide consiste à doubler la valeur en Celsius puis à ajouter environ 30. Pour 16 °C, cela donne environ 62 °F, ce qui reste proche du résultat exact de 60,8 °F.</p>',
        },
      ],
      practicalTitle: '16 °C (60,8 °F) dans la vie courante',
      cards: [
        { title: 'Une fraîcheur facile à vivre', body: 'À 16 °C, beaucoup de personnes sont bien dehors avec une seule couche légère. On sent la fraîcheur sans qu’elle soit dure.' },
        { title: 'À l’intérieur, c’est plus frais qu’on ne l’imagine', body: 'Dans une pièce, 16 °C sont souvent un peu en dessous du confort standard. Cela marche bien pour une chambre, mais pas toujours pour rester immobile longtemps.' },
        { title: 'Le mouvement change beaucoup le ressenti', body: 'Marcher ou faire un trajet à 16 °C est souvent agréable, alors qu’assis au même chiffre, on peut vite chercher un pull.' },
      ],
    }),
    17: roomPage({
      seoTitle: '17 °C en Fahrenheit (62,6 °F) | Guide et calculateur',
      seoDescription:
        'Convertissez rapidement 17 °C en Fahrenheit. Découvrez que 17 °C correspondent à 62,6 °F, voyez le calcul et comprenez le ressenti de cette température.',
      headerTitle: '17 °C en Fahrenheit (17 degrés Celsius en °F)',
      headerTagline:
        'Convertissez 17 °C en Fahrenheit avec des repères utiles pour le temps frais, les couches légères, le confort quotidien et la température intérieure.',
      conversionIntro: '17 °C correspondent à 62,6 °F.',
      keywords:
        '17 c en fahrenheit 17 celsius en fahrenheit 62,6 fahrenheit temps frais tenue température pièce fièvre',
      guideTitle: 'Repères de confort à 17 °C',
      guideSubtitle: 'Une température fraîche qui reste facile au quotidien',
      guideIntro:
        '17 °C (62,6 °F) semblent souvent agréablement frais. C’est un peu en dessous de la température ambiante classique, mais beaucoup de gens trouvent cela très confortable pour marcher, se déplacer ou vivre dans une pièce peu chauffée.',
      chart: {
        cold: {
          label: 'Frais',
          value: '10-15°C',
          desc: '50-59°F<br>Temps de veste légère',
        },
        moderate: {
          label: 'Doux',
          value: '16-18°C',
          desc: '60.8-64.4°F<br>Bien avec une petite couche',
        },
        warm: {
          label: 'Confortable',
          value: '19-21°C',
          desc: '66.2-69.8°F<br>Confort intérieur équilibré',
        },
      },
      table: {
        headers: {
          temperature: 'Température',
          description: 'Ressenti',
          typicalUse: 'Usage habituel',
        },
        rows: [
          { temp: '10°C (50°F)', desc: 'Temps frais', use: 'Une veste ou une couche en plus est généralement utile', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Frais et légèrement vif', use: 'Confortable pour les journées actives avec une couche légère', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'Frais à doux', use: 'Un bon équilibre pour les marches, trajets et pièces calmes', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Frais mais agréable', use: 'Souvent apprécié pour dormir ou rester tranquille', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Température ambiante classique', use: 'Objectif de confort pour beaucoup de foyers', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Température corporelle normale', use: 'Repère utile si la recherche mélange météo et fièvre', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Note :</strong> 17 °C paraissent souvent doux quand on bouge, mais plus frais dans une pièce immobile, le soir ou avec du vent.',
      faq: [
        {
          question: 'Combien font 17 degrés Celsius en Fahrenheit ?',
          answerHtml:
            '<p>17 degrés Celsius correspondent à 62,6 degrés Fahrenheit. La formule est : °F = (°C × 9/5) + 32. En multipliant 17 par 1,8, on obtient 30,6, puis on ajoute 32 pour atteindre 62,6 °F.</p>',
        },
        {
          question: '17 °C, est-ce chaud ou froid ?',
          answerHtml:
            '<p>17 °C (62,6 °F) sont généralement considérés comme frais à doux. C’est plus frais qu’une température ambiante classique, mais cela reste confortable pour beaucoup d’activités du quotidien.</p><p>La plupart des gens ne parleraient pas de froid marqué, mais ne s’habilleraient pas non plus comme en plein été.</p>',
        },
        {
          question: '17 °C correspondent-ils à une fièvre ?',
          answerHtml:
            '<p>Non. Une température corporelle normale tourne autour de 37 °C (98,6 °F), et la fièvre commence en général vers 38 °C (100,4 °F).</p>',
        },
        {
          question: 'À quel ressenti correspond 17 °C en Fahrenheit ?',
          answerHtml:
            '<p>17 °C font 62,6 °F, ce que beaucoup décrivent comme frais à doux. On sent clairement la fraîcheur, mais la température reste agréable pour des activités quotidiennes normales.</p>',
        },
        {
          question: 'Comment s’habiller par 17 °C ?',
          answerHtml:
            '<p>À 17 °C, une petite couche supplémentaire suffit généralement.</p><ul><li>T-shirt ou haut léger avec gilet, surchemise ou veste fine</li><li>Jean, pantalon ou autre bas confortable</li><li>Baskets ou chaussures fermées pour le quotidien</li></ul><p>Avec du soleil, on peut se sentir bien en tenue plus légère, mais le vent et l’ombre comptent encore.</p>',
        },
        {
          question: '17 °C sont-ils adaptés pour dormir ?',
          answerHtml:
            '<p>Oui, pour beaucoup de personnes. 17 °C restent dans une plage appréciée pour le sommeil, car une chambre un peu plus fraîche qu’un salon est souvent perçue comme plus agréable.</p>',
        },
        {
          question: 'Comment convertir -17 °C en Fahrenheit ?',
          answerHtml:
            '<p>-17 °C correspondent à 1,4 °F. C’est une vraie température de grand froid hivernal, très différente de 17 °C au-dessus de zéro.</p>',
        },
      ],
      practicalTitle: '17 °C (62,6 °F) dans la vie courante',
      cards: [
        { title: 'Une température intermédiaire très souple', body: '17 °C se situent dans cette zone utile où l’on ressent de la fraîcheur sans réelle gêne. Cela convient bien aux trajets, courses et journées mêlant intérieur et extérieur.' },
        { title: 'Souvent plus agréable qu’une pièce surchauffée', body: 'Beaucoup trouvent 17 °C plus confortables qu’un intérieur trop chaud, surtout pour dormir, se concentrer ou bouger dans la maison.' },
        { title: 'Pas encore une vraie météo en T-shirt pour tout le monde', body: 'Certaines personnes se sentent bien très légèrement habillées à 17 °C, mais beaucoup préfèrent encore un gilet ou une veste fine.' },
      ],
    }),
    19: roomPage({
      seoTitle: '19 °C en Fahrenheit (66,2 °F) | Guide et calculateur',
      seoDescription:
        'Convertissez rapidement 19 °C en Fahrenheit. Découvrez que 19 °C correspondent à 66,2 °F, voyez le calcul et comprenez le contexte de cette température.',
      headerTitle: '19 °C en Fahrenheit (19 degrés Celsius en °F)',
      headerTagline:
        'Convertissez 19 °C en Fahrenheit avec des repères utiles pour la température intérieure, le confort économe, le sommeil et la vie quotidienne.',
      conversionIntro: '19 °C correspondent à 66,2 °F.',
      keywords:
        '19 c en fahrenheit 19 celsius en fahrenheit 66,2 fahrenheit température pièce confort sommeil thermostat fièvre',
      guideTitle: 'Repères de confort à 19 °C',
      guideSubtitle: 'Une température agréable qui garde une légère fraîcheur',
      guideIntro:
        '19 °C (66,2 °F) sont souvent perçus comme une température intérieure confortable, avec une sensation légèrement fraîche. Cela marche bien pour dormir, travailler et chauffer raisonnablement un logement.',
      chart: {
        cold: {
          label: 'Frais',
          value: '15-17°C',
          desc: '59-62.6°F<br>Plus agréable avec une petite couche',
        },
        moderate: {
          label: 'Confortable',
          value: '18-21°C',
          desc: '64.4-69.8°F<br>Plage de confort classique',
        },
        warm: {
          label: 'Plus doux',
          value: '22-25°C',
          desc: '71.6-77°F<br>Moins de couches, plus de chaleur',
        },
      },
      table: {
        headers: {
          temperature: 'Température',
          description: 'Ressenti',
          typicalUse: 'Usage habituel',
        },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'Frais et légèrement vif', use: 'Bien pour rester actif à l’intérieur ou porter une petite couche', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'Frais mais agréable', use: 'Souvent idéal pour le sommeil et les routines calmes', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Confortable et légèrement frais', use: 'Bon réglage pour la maison, l’étude et un confort économe', highlight: true },
          { temp: '20°C (68°F)', desc: 'Température ambiante classique', use: 'Valeur courante pour le salon et le bureau', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'Confort intérieur', use: 'Un peu plus doux pour rester assis longtemps', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Température corporelle normale', use: 'Repère utile si la recherche touche au corps humain', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Note :</strong> 19 °C sont souvent confortables et économes à l’intérieur, mais le soleil, l’humidité et les courants d’air peuvent faire pencher le ressenti un peu plus chaud ou plus frais.',
      faq: [
        {
          question: 'Combien font 19 degrés Celsius en Fahrenheit ?',
          answerHtml:
            '<p>19 degrés Celsius correspondent à 66,2 degrés Fahrenheit. La formule est : °F = (°C × 9/5) + 32. En multipliant 19 par 1,8, on obtient 34,2, puis on ajoute 32 pour arriver à 66,2 °F.</p>',
        },
        {
          question: '19 °C correspondent-ils à une fièvre ?',
          answerHtml:
            '<p>Non. 19 °C ne correspondent pas à une fièvre. La température corporelle normale tourne autour de 37 °C (98,6 °F) et la fièvre commence généralement vers 38 °C (100,4 °F).</p>',
        },
        {
          question: 'Que valent 16 à 19 °C en Fahrenheit ?',
          answerHtml:
            '<p>La plage de 16 °C à 19 °C correspond à 60,8 °F à 66,2 °F. Cela couvre souvent une sensation intérieure fraîche mais confortable, ou un temps extérieur doux avec une couche légère.</p>',
        },
        {
          question: 'Que valent 19 à 20 °C en Fahrenheit ?',
          answerHtml:
            '<p>La plage de 19 °C à 20 °C correspond à 66,2 °F à 68 °F. C’est une plage très fréquente pour la température d’une maison, d’une chambre ou d’un bureau.</p>',
        },
        {
          question: 'Comment convertir -19 °C en Fahrenheit ?',
          answerHtml:
            '<p>-19 °C correspondent à -2,2 °F. C’est un froid hivernal marqué, sans rapport avec 19 °C au-dessus de zéro.</p>',
        },
        {
          question: '19 °C suffisent-ils pour chauffer une pièce ?',
          answerHtml:
            '<p>Oui. 19 °C suffisent largement pour une pièce, et beaucoup trouvent cela confortablement frais. C’est d’ailleurs un réglage fréquent quand on cherche à économiser le chauffage sans perdre en confort.</p>',
        },
      ],
      practicalTitle: '19 °C (66,2 °F) dans la vie courante',
      cards: [
        { title: 'Du confort sans lourdeur', body: 'À 19 °C, beaucoup de logements et de chambres restent agréables sans devenir étouffants ni trop chauds.' },
        { title: 'Un bon réglage de thermostat', body: '19 °C est souvent choisi comme consigne raisonnable, car on garde du confort tout en limitant un peu la demande de chauffage.' },
        { title: 'Bien adapté aux routines calmes', body: 'Lire, travailler, se détendre ou dormir se fait souvent facilement à 19 °C, car la pièce reste confortable sans sensation pesante.' },
      ],
    }),
  },
  de: {
    16: roomPage({
      seoTitle: '16 °C in Fahrenheit (60,8 °F) | Temperatur-Umrechner',
      seoDescription:
        'Rechne 16 °C schnell in Fahrenheit um. Erfahre, dass 16 °C genau 60,8 °F sind, und wie sich diese Temperatur im Alltag anfühlt.',
      headerTitle: '16 °C in Fahrenheit (16 Grad Celsius in °F)',
      headerTagline:
        'Wandle 16 °C in Fahrenheit um und bekomme praktische Hinweise zu frischer Raumluft, leichten Schichten, Alltagswetter und typischen Temperaturfragen.',
      conversionIntro: '16 °C entsprechen 60,8 °F.',
      keywords:
        '16 c in fahrenheit 16 celsius in fahrenheit 60,8 fahrenheit kühl wetter kleidung raumtemperatur fieber',
      guideTitle: 'Komfort bei 16 °C',
      guideSubtitle: 'Frisch genug für eine leichte Schicht, aber gut alltagstauglich',
      guideIntro:
        '16 °C (60,8 °F) fühlen sich meist frisch und leicht kühl an. Beim Gehen oder Pendeln ist das oft angenehm, in Innenräumen wünschen sich viele aber einen dünnen Pullover oder ein Overshirt.',
      chart: {
        cold: { label: 'Kühl', value: '10-15°C', desc: '50-59°F<br>Für viele Wetter für eine leichte Jacke' },
        moderate: { label: 'Frisch', value: '16-19°C', desc: '60.8-66.2°F<br>Angenehm mit einer leichten Lage' },
        warm: { label: 'Angenehm', value: '20-22°C', desc: '68-71.6°F<br>Klassischer Innenraumkomfort' },
      },
      table: {
        headers: { temperature: 'Temperatur', description: 'Beschreibung', typicalUse: 'Typische Nutzung' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Kühl', use: 'Eine leichte Jacke passt meistens gut', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Frisch und leicht kühl', use: 'Gut zum Gehen, Pendeln und für Räume mit leichter Zusatzschicht', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Kühl, aber angenehm', use: 'Wird oft zum Schlafen oder für ruhige Innenräume geschätzt', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Angenehm frisch', use: 'Ausgewogener Innenraumkomfort ohne stickige Wärme', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Raumtemperatur', use: 'Häufige Thermostateinstellung zu Hause und im Büro', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Normale Körpertemperatur', use: 'Hilfreicher Vergleich, wenn Wetter und Fieber verwechselt werden', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Hinweis:</strong> 16 °C fühlen sich in Bewegung oft angenehmer an als im Sitzen. Wind, Morgenkühle und feuchte Luft lassen die Temperatur schneller frischer wirken.',
      faq: [
        {
          question: 'Wie viel sind 16 Grad Celsius in Fahrenheit?',
          answerHtml:
            '<p>16 Grad Celsius sind 60,8 Grad Fahrenheit. Die Formel lautet: °F = (°C × 9/5) + 32. 16 mal 1,8 ergibt 28,8, plus 32 ergibt 60,8 °F.</p>',
        },
        {
          question: 'Sind 16 °C warm oder kalt?',
          answerHtml:
            '<p>16 °C (60,8 °F) gelten meist als kühl bis mild. Für schwere Winterkleidung ist es zu warm, aber die meisten Menschen tragen trotzdem gern eine leichte zusätzliche Schicht.</p><p>Draußen wirkt es oft frisch und angenehm. Drinnen kann es beim langen Sitzen leicht kühl wirken.</p>',
        },
        {
          question: 'Wie viel sind minus 16 °C in Fahrenheit?',
          answerHtml:
            '<p>-16 °C entsprechen 3,2 °F. Das ist echter Winterfrost und deutlich strenger als 16 °C über null.</p>',
        },
        {
          question: 'Sind 16 °C Fieber?',
          answerHtml:
            '<p>Nein. Fieber beginnt beim Menschen meist erst ab etwa 38 °C (100,4 °F), normale Körpertemperatur liegt bei rund 37 °C (98,6 °F).</p><p>Als Körpertemperatur wären 16 °C weit unter jedem lebensfähigen Bereich.</p>',
        },
        {
          question: 'Was sollte ich bei 16 °C anziehen?',
          answerHtml:
            '<p>Bei 16 °C reichen meistens leichte Schichten.</p><ul><li>T-Shirt oder dünnes Langarmshirt mit Cardigan, Overshirt oder leichter Jacke</li><li>Jeans, lange Hosen oder ähnliche Alltagskleidung</li><li>Geschlossene Schuhe oder Sneaker</li></ul><p>Bei Wind oder Nieselregen macht eine zusätzliche Lage schnell einen Unterschied.</p>',
        },
        {
          question: 'Sind 16 °C gut für Aktivitäten draußen?',
          answerHtml:
            '<p>Ja. 16 °C sind oft sehr angenehm zum Spazierengehen, Pendeln, für leichte Bewegung oder Zeit im Freien. Es fühlt sich eher frisch als unangenehm kalt an.</p>',
        },
        {
          question: 'Wie rechne ich 16 °C im Kopf in Fahrenheit um?',
          answerHtml:
            '<p>Eine schnelle Faustregel ist: Celsius verdoppeln und ungefähr 30 addieren. Bei 16 °C kommt man so auf etwa 62 °F, also nahe am exakten Wert von 60,8 °F.</p>',
        },
      ],
      practicalTitle: '16 °C (60,8 °F) im Alltag',
      cards: [
        { title: 'Frisch, aber gut machbar', body: 'Bei 16 °C fühlen sich viele draußen mit einer leichten Extraschicht wohl. Es ist frisch, aber nicht hart.' },
        { title: 'Innenräume wirken oft kühler als erwartet', body: 'Drinnen liegen 16 °C etwas unter klassischer Raumtemperatur. Fürs Schlafzimmer kann das gut sein, beim Arbeiten oder Lesen möchte mancher aber einen Pullover.' },
        { title: 'Bewegung verändert das Gefühl deutlich', body: 'Beim Laufen oder Pendeln sind 16 °C oft angenehm, im Sitzen bei derselben Temperatur kann es merklich kühler wirken.' },
      ],
    }),
    17: roomPage({
      seoTitle: '17 °C in Fahrenheit (62,6 °F) | Guide & Rechner',
      seoDescription:
        'Rechne 17 °C schnell in Fahrenheit um. Erfahre, dass 17 °C genau 62,6 °F sind, sieh die Rechenschritte und ordne die Temperatur besser ein.',
      headerTitle: '17 °C in Fahrenheit (17 Grad Celsius in °F)',
      headerTagline:
        'Wandle 17 °C in Fahrenheit um und nutze praktische Hinweise zu frischem Wetter, leichten Schichten, Alltagskomfort und Raumtemperatur.',
      conversionIntro: '17 °C entsprechen 62,6 °F.',
      keywords:
        '17 c in fahrenheit 17 celsius in fahrenheit 62,6 fahrenheit frisch wetter kleidung schlaf raumtemperatur fieber',
      guideTitle: 'Komfort bei 17 °C',
      guideSubtitle: 'Eine frische Temperatur zwischen kühl und angenehm',
      guideIntro:
        '17 °C (62,6 °F) fühlen sich oft angenehm frisch an. Das liegt etwas unter klassischer Raumtemperatur, wirkt aber für Wege, Erledigungen und wenig überheizte Räume auf viele Menschen sehr angenehm.',
      chart: {
        cold: { label: 'Kühl', value: '10-15°C', desc: '50-59°F<br>Typisches Wetter für eine leichte Jacke' },
        moderate: { label: 'Frisch', value: '16-18°C', desc: '60.8-64.4°F<br>Angenehm mit leichter Lage' },
        warm: { label: 'Angenehm', value: '19-21°C', desc: '66.2-69.8°F<br>Ausgewogener Innenraumkomfort' },
      },
      table: {
        headers: { temperature: 'Temperatur', description: 'Beschreibung', typicalUse: 'Typische Nutzung' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Kühles Außenwetter', use: 'Jacke oder Extraschicht ist meist sinnvoll', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Frisch und leicht kühl', use: 'Gut für aktive Tage mit leichter Lage', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'Kühl bis mild', use: 'Praktische Mitte für Spaziergänge, Erledigungen und ruhige Räume', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Kühl, aber angenehm', use: 'Wird oft fürs Schlafen und ruhige Innenräume geschätzt', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Klassische Raumtemperatur', use: 'Häufiges Komfortziel in Wohnungen', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Normale Körpertemperatur', use: 'Nützlich, wenn Wetter mit Fieberwerten verwechselt wird', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Hinweis:</strong> 17 °C fühlen sich in Bewegung meist mild an, können aber in stillen Räumen, nachts oder bei Wind deutlich frischer wirken.',
      faq: [
        {
          question: 'Wie viel sind 17 Grad Celsius in Fahrenheit?',
          answerHtml:
            '<p>17 Grad Celsius sind 62,6 Grad Fahrenheit. Die Formel lautet: °F = (°C × 9/5) + 32. 17 mal 1,8 ergibt 30,6, plus 32 ergibt 62,6 °F.</p>',
        },
        {
          question: 'Sind 17 °C heiß oder kalt?',
          answerHtml:
            '<p>17 °C (62,6 °F) gelten meist als kühl bis mild. Das liegt unter klassischer Raumtemperatur, bleibt aber für viele Alltagsaktivitäten angenehm.</p><p>Die meisten würden es nicht als richtig kalt bezeichnen, aber auch nicht wie Sommerwärme behandeln.</p>',
        },
        {
          question: 'Sind 17 °C Fieber?',
          answerHtml:
            '<p>Nein. Normale Körpertemperatur liegt bei etwa 37 °C (98,6 °F), und Fieber beginnt meist erst um 38 °C (100,4 °F).</p>',
        },
        {
          question: 'Wie warm sind 17 °C in Fahrenheit gefühlt?',
          answerHtml:
            '<p>17 °C entsprechen 62,6 °F. Die meisten empfinden das als frisch bis mild: merklich kühler als klassische Raumtemperatur, aber für normale Alltagswege meist sehr gut machbar.</p>',
        },
        {
          question: 'Was sollte ich bei 17 °C tragen?',
          answerHtml:
            '<p>Bei 17 °C reicht den meisten eine leichte Extraschicht.</p><ul><li>T-Shirt oder leichtes Langarmshirt mit Cardigan oder dünner Jacke</li><li>Jeans, lange Hosen oder ähnliche Alltagskleidung</li><li>Sneaker oder andere geschlossene Schuhe</li></ul><p>Bei Sonne kann es leichter gehen, aber Wind und Schatten spielen weiter eine Rolle.</p>',
        },
        {
          question: 'Sind 17 °C gut zum Schlafen?',
          answerHtml:
            '<p>Für viele ja. 17 °C liegen in einem Bereich, den viele fürs Schlafen mögen, weil ein Schlafzimmer oft etwas kühler angenehmer ist als ein Wohnraum.</p>',
        },
        {
          question: 'Wie rechne ich -17 °C in Fahrenheit um?',
          answerHtml:
            '<p>-17 °C entsprechen 1,4 °F. Das ist klarer Winterfrost und deutlich strenger als 17 °C über null.</p>',
        },
      ],
      practicalTitle: '17 °C (62,6 °F) im Alltag',
      cards: [
        { title: 'Eine flexible Zwischen-Temperatur', body: '17 °C liegen in dem Bereich, der frisch wirkt, aber selten unangenehm ist. Deshalb passt die Temperatur gut für Wege, Besorgungen und Tage mit Wechsel zwischen drinnen und draußen.' },
        { title: 'Oft angenehmer als überheizte Räume', body: 'Viele empfinden 17 °C als angenehmer als zu warme Räume, besonders beim Schlafen, Konzentrieren oder Bewegen in der Wohnung.' },
        { title: 'Für viele noch kein reines T-Shirt-Wetter', body: 'Manche kommen bei 17 °C schon mit sehr leichter Kleidung aus, viele greifen aber weiterhin gern zu Strickjacke, Overshirt oder dünner Jacke.' },
      ],
    }),
    19: roomPage({
      seoTitle: '19 °C in Fahrenheit (66,2 °F) | Guide & Rechner',
      seoDescription:
        'Rechne 19 °C schnell in Fahrenheit um. Erfahre, dass 19 °C genau 66,2 °F sind, sieh die Rechenschritte und ordne den Wert praktisch ein.',
      headerTitle: '19 °C in Fahrenheit (19 Grad Celsius in °F)',
      headerTagline:
        'Wandle 19 °C in Fahrenheit um und nutze praktische Hinweise zu Raumtemperatur, energiesparendem Komfort, Schlaf und Innenräumen.',
      conversionIntro: '19 °C entsprechen 66,2 °F.',
      keywords:
        '19 c in fahrenheit 19 celsius in fahrenheit 66,2 fahrenheit raumtemperatur komfort schlaf thermostat fieber',
      guideTitle: 'Komfort bei 19 °C',
      guideSubtitle: 'Angenehm temperiert und drinnen trotzdem noch frisch',
      guideIntro:
        '19 °C (66,2 °F) gelten oft als angenehme, leicht frische Raumtemperatur. Das funktioniert gut zum Schlafen, Arbeiten und für Wohnungen, die komfortabel, aber nicht zu warm sein sollen.',
      chart: {
        cold: { label: 'Frisch', value: '15-17°C', desc: '59-62.6°F<br>Mit leichter Lage meist angenehmer' },
        moderate: { label: 'Angenehm', value: '18-21°C', desc: '64.4-69.8°F<br>Klassischer Komfortbereich' },
        warm: { label: 'Wärmer', value: '22-25°C', desc: '71.6-77°F<br>Weniger Schichten, mehr Wärmegefühl' },
      },
      table: {
        headers: { temperature: 'Temperatur', description: 'Beschreibung', typicalUse: 'Typische Nutzung' },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'Frisch und leicht kühl', use: 'Gut für aktive Innenräume oder leichte Lagen', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'Kühl, aber angenehm', use: 'Wird oft fürs Schlafen und ruhige Routinen geschätzt', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Angenehm und leicht frisch', use: 'Ausgewogener Wert für Zuhause, Lernen und sparsames Heizen', highlight: true },
          { temp: '20°C (68°F)', desc: 'Klassische Raumtemperatur', use: 'Häufiger Zielwert für Wohnzimmer und Büros', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'Angenehmer Innenraum', use: 'Etwas wärmer für langes Sitzen oder Schreibtischarbeit', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Normale Körpertemperatur', use: 'Hilfreicher Vergleich bei Fragen zu Körpertemperatur', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Hinweis:</strong> 19 °C fühlen sich drinnen oft komfortabel und effizient an. Sonne, feuchte Luft und Zugluft können den Eindruck aber etwas wärmer oder kühler machen.',
      faq: [
        {
          question: 'Wie viel sind 19 Grad Celsius in Fahrenheit?',
          answerHtml:
            '<p>19 Grad Celsius sind 66,2 Grad Fahrenheit. Die Formel lautet: °F = (°C × 9/5) + 32. 19 mal 1,8 ergibt 34,2, plus 32 ergibt 66,2 °F.</p>',
        },
        {
          question: 'Sind 19 °C Fieber?',
          answerHtml:
            '<p>Nein. 19 °C sind keine Fiebertemperatur. Normale Körpertemperatur liegt bei etwa 37 °C (98,6 °F), Fieber beginnt meist um 38 °C (100,4 °F).</p>',
        },
        {
          question: 'Wie viel sind 16 bis 19 °C in Fahrenheit?',
          answerHtml:
            '<p>Der Bereich von 16 °C bis 19 °C entspricht 60,8 °F bis 66,2 °F. Das deckt oft frischen Innenraumkomfort und mildes Wetter draußen ab, bei dem eine leichte Schicht noch sinnvoll ist.</p>',
        },
        {
          question: 'Wie viel sind 19 bis 20 °C in Fahrenheit?',
          answerHtml:
            '<p>Der Bereich von 19 °C bis 20 °C entspricht 66,2 °F bis 68 °F. Das ist ein sehr typischer Temperaturbereich für Wohnräume, Schlafzimmer und Büros.</p>',
        },
        {
          question: 'Wie rechne ich -19 °C in Fahrenheit um?',
          answerHtml:
            '<p>-19 °C entsprechen -2,2 °F. Das ist deutliches Winterwetter und viel strenger als 19 °C über null.</p>',
        },
        {
          question: 'Sind 19 °C warm genug für einen Raum?',
          answerHtml:
            '<p>Ja. 19 °C sind für einen Raum warm genug, und viele empfinden das als angenehm frisch. Deshalb ist dieser Wert oft beliebt, wenn Komfort und sparsames Heizen zusammenpassen sollen.</p>',
        },
      ],
      practicalTitle: '19 °C (66,2 °F) im Alltag',
      cards: [
        { title: 'Komfort ohne stickige Wärme', body: 'Bei 19 °C fühlen sich viele Wohnungen und Schlafzimmer angenehm an, ohne schwer oder überheizt zu wirken.' },
        { title: 'Ein starker Thermostatwert', body: '19 °C wird oft als sinnvolle Thermostateinstellung genutzt, weil der Komfort bleibt und der Heizbedarf etwas niedriger bleibt.' },
        { title: 'Gut für ruhige Innenroutinen', body: 'Lesen, Arbeiten, Entspannen und Schlafen funktionieren bei 19 °C oft sehr gut, weil der Raum angenehm bleibt, ohne drückend zu wirken.' },
      ],
    }),
  },
  ja: {
    16: roomPage({
      seoTitle: '16°Cは華氏で何度？（60.8°F）| 換算ガイド',
      seoDescription:
        '16°Cを華氏にすばやく換算。16°C=60.8°Fであることや、涼しいのか過ごしやすいのかを日常の感覚で確認できます。',
      headerTitle: '16°Cを華氏へ（16°C = 60.8°F）',
      headerTagline:
        '16°Cを華氏に換算しつつ、室内の快適さ、薄手の羽織り、外出時の体感、日常での目安も分かりやすく整理します。',
      conversionIntro: '16°Cは華氏で60.8°Fです。',
      keywords:
        '16 c 華氏 16℃ 華氏 60.8°F 体感 涼しい 服装 室温 発熱',
      guideTitle: '16°Cの快適さの目安',
      guideSubtitle: '一枚あると安心な、少しひんやりした気温',
      guideIntro:
        '16°C（60.8°F）は、爽やかで少し涼しく感じやすい温度です。歩いていると快適でも、室内でじっとしていると薄手の上着が欲しくなる人が多いです。',
      chart: {
        cold: { label: 'やや涼しい', value: '10-15°C', desc: '50-59°F<br>薄手の上着があると安心' },
        moderate: { label: '快適寄り', value: '16-19°C', desc: '60.8-66.2°F<br>軽い重ね着で過ごしやすい' },
        warm: { label: '室内快適', value: '20-22°C', desc: '68-71.6°F<br>一般的な室温に近い' },
      },
      table: {
        headers: { temperature: '温度', description: '体感', typicalUse: 'よくある場面' },
        rows: [
          { temp: '10°C (50°F)', desc: '涼しい', use: '薄手のジャケットがあると安心', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: '爽やかで少し涼しい', use: '通勤や散歩、室内での軽い重ね着に合う', highlight: true },
          { temp: '18°C (64.4°F)', desc: '涼しいが快適', use: '睡眠や落ち着いた室内時間に向きやすい', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: '快適で少しひんやり', use: '室内でもバランスが取りやすい', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: '室温', use: '家庭やオフィスでよくある設定', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: '平熱', use: '気温と発熱を混同したときの比較用', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>メモ：</strong>16°Cは、座っていると少し涼しく感じても、歩いているとちょうどよく感じやすい温度です。風や朝の湿り気でさらに涼しく感じることがあります。',
      faq: [
        {
          question: '16度Cは華氏で何度ですか？',
          answerHtml:
            '<p>16度Cは60.8度Fです。計算式は「°F = (°C × 9/5) + 32」です。16に1.8を掛けると28.8、そこに32を足して60.8°Fになります。</p>',
        },
        {
          question: '16°Cは暖かいですか、それとも寒いですか？',
          answerHtml:
            '<p>16°C（60.8°F）は、一般的には「涼しいからやや快適」くらいの体感です。真冬の寒さではありませんが、多くの人は薄手の一枚を足したくなります。</p><p>屋外では爽やかに感じやすく、室内では長く座っていると少しひんやり感じることがあります。</p>',
        },
        {
          question: 'マイナス16°Cは華氏で何度ですか？',
          answerHtml:
            '<p>-16°Cは3.2°Fです。こちらは本格的な冬の寒さで、16°Cとはまったく別の体感になります。</p>',
        },
        {
          question: '16°Cは発熱の温度ですか？',
          answerHtml:
            '<p>いいえ。発熱は一般に38°C（100.4°F）前後からで、平熱は約37°C（98.6°F）です。</p><p>もし体温が16°Cなら、正常値を大きく下回る危険な状態です。</p>',
        },
        {
          question: '16°Cのときは何を着ればいいですか？',
          answerHtml:
            '<p>16°Cなら、軽い重ね着で十分なことが多いです。</p><ul><li>Tシャツや薄手の長袖に、カーディガン・シャツジャケット・軽い上着</li><li>ジーンズやロングパンツなどの定番ボトムス</li><li>スニーカーなどの普段履き</li></ul><p>風や小雨がある日は、もう一枚あると体感がかなり違います。</p>',
        },
        {
          question: '16°Cは外で過ごしやすいですか？',
          answerHtml:
            '<p>はい。16°Cは散歩、通勤、軽い運動、用事での外出などに向きやすい気温です。寒すぎるというより、ほどよく涼しいと感じる人が多いです。</p>',
        },
        {
          question: '16°Cを華氏に暗算で換算するには？',
          answerHtml:
            '<p>ざっくりなら「摂氏を2倍して30を足す」と覚える方法があります。16°Cなら約62°Fとなり、正確な60.8°Fにかなり近いです。</p>',
        },
      ],
      practicalTitle: '16°C（60.8°F）が日常で意味すること',
      cards: [
        { title: '涼しいけれど厳しくない', body: '16°Cでは、薄手の羽織りがあれば屋外でも過ごしやすい人が多いです。ひんやり感はあっても、強い寒さではありません。' },
        { title: '室内では思ったより涼しい', body: '16°Cは一般的な室温より少し低めです。寝室には合いやすい一方、座って作業する場面では上着が欲しくなることがあります。' },
        { title: '動くかどうかで印象が変わる', body: '歩いていると気持ちよく感じても、同じ16°Cでじっとしていると少し肌寒く感じやすいです。' },
      ],
    }),
    17: roomPage({
      seoTitle: '17°Cは華氏で何度？（62.6°F）| 換算ガイドと計算機',
      seoDescription:
        '17°Cを華氏にすばやく換算。17°C=62.6°Fであること、計算方法、体感の目安をまとめて確認できます。',
      headerTitle: '17°Cを華氏へ（17°C = 62.6°F）',
      headerTagline:
        '17°Cを華氏に換算しながら、少し涼しい日の服装、室温、日常の快適さも分かりやすく整理します。',
      conversionIntro: '17°Cは華氏で62.6°Fです。',
      keywords:
        '17 c 華氏 17℃ 華氏 62.6°F 体感 涼しい 室温 服装 睡眠 発熱',
      guideTitle: '17°Cの快適さの目安',
      guideSubtitle: '涼しさと過ごしやすさの中間にある温度',
      guideIntro:
        '17°C（62.6°F）は、爽やかで快適寄りに感じやすい温度です。一般的な室温よりやや低めですが、散歩や外出、暑すぎない室内ではちょうどよいと感じる人も多いです。',
      chart: {
        cold: { label: '涼しい', value: '10-15°C', desc: '50-59°F<br>軽い上着が欲しくなりやすい' },
        moderate: { label: '爽やか', value: '16-18°C', desc: '60.8-64.4°F<br>薄手の重ね着で快適' },
        warm: { label: '快適', value: '19-21°C', desc: '66.2-69.8°F<br>室内でもバランスが良い' },
      },
      table: {
        headers: { temperature: '温度', description: '体感', typicalUse: 'よくある場面' },
        rows: [
          { temp: '10°C (50°F)', desc: '外では涼しい', use: '上着やもう一枚が欲しくなりやすい', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: '爽やかで少し涼しい', use: '軽い重ね着で動きやすい', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: '涼しい〜やや快適', use: '散歩、用事、落ち着いた室内時間にちょうどよい', highlight: true },
          { temp: '18°C (64.4°F)', desc: '涼しいが快適', use: '睡眠や静かな室内時間に向きやすい', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: '標準的な室温', use: '多くの家庭で快適と感じやすい', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: '平熱', use: '気温と発熱を混同したときの比較用', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>メモ：</strong>17°Cは動いていると過ごしやすく感じても、夜や風のある場所、空気が動かない室内では少し涼しめに感じることがあります。',
      faq: [
        {
          question: '17度Cは華氏で何度ですか？',
          answerHtml:
            '<p>17度Cは62.6度Fです。計算式は「°F = (°C × 9/5) + 32」です。17に1.8を掛けて30.6、そこに32を足すと62.6°Fになります。</p>',
        },
        {
          question: '17°Cは暑いですか、それとも寒いですか？',
          answerHtml:
            '<p>17°C（62.6°F）は、一般的には涼しいからやや快適くらいの温度です。典型的な室温より少し低いものの、日常の活動には十分過ごしやすいことが多いです。</p><p>真冬ほど寒くはありませんが、夏のように軽装だけで済むと感じる人ばかりでもありません。</p>',
        },
        {
          question: '17°Cは発熱ですか？',
          answerHtml:
            '<p>いいえ。平熱は約37°C（98.6°F）で、発熱は一般に38°C（100.4°F）前後からです。</p>',
        },
        {
          question: '17°Cは華氏でどのくらいの暖かさですか？',
          answerHtml:
            '<p>17°Cは62.6°Fです。体感としては「少し涼しいけれど快適寄り」で、一般的な室温よりは低めでも、外出や日常の動きにはちょうどよいと感じる人が多いです。</p>',
        },
        {
          question: '17°Cの服装はどうすればいいですか？',
          answerHtml:
            '<p>17°Cなら、薄手の一枚を足すくらいがちょうどよいことが多いです。</p><ul><li>Tシャツや薄手の長袖に、カーディガンやライトジャケット</li><li>ジーンズやロングパンツなどの定番ボトムス</li><li>スニーカーや閉じた靴</li></ul><p>日差しがあれば軽めでも大丈夫ですが、風や日陰はまだ体感に影響します。</p>',
        },
        {
          question: '17°Cは寝るのに向いていますか？',
          answerHtml:
            '<p>はい、多くの人にとっては向いています。寝室はリビングより少し涼しいほうが快適と感じやすく、17°Cはその範囲に入りやすいです。</p>',
        },
        {
          question: 'マイナス17°Cは華氏で何度ですか？',
          answerHtml:
            '<p>-17°Cは1.4°Fです。こちらは真冬の厳しい寒さで、17°Cとはまったく違う状況です。</p>',
        },
      ],
      practicalTitle: '17°C（62.6°F）が日常で意味すること',
      cards: [
        { title: '幅広く使いやすい中間温度', body: '17°Cは、涼しさを感じつつも不快になりにくい帯です。通勤、買い物、室内外を行き来する日に向いています。' },
        { title: '暖房の効きすぎた部屋より好む人も多い', body: '睡眠や集中、家の中での軽い動きでは、17°Cくらいのほうが暑すぎず快適だと感じる人もいます。' },
        { title: '人によってはまだTシャツ一枚ではない', body: '17°Cで軽装でも平気な人はいますが、多くの人は薄手の羽織りがあると安心します。' },
      ],
    }),
    19: roomPage({
      seoTitle: '19°Cは華氏で何度？（66.2°F）| 換算ガイドと計算機',
      seoDescription:
        '19°Cを華氏にすばやく換算。19°C=66.2°Fであることや、室温としての快適さ、計算方法を確認できます。',
      headerTitle: '19°Cを華氏へ（19°C = 66.2°F）',
      headerTagline:
        '19°Cを華氏に換算しながら、室温、省エネの快適さ、睡眠、日常の室内環境の目安を整理します。',
      conversionIntro: '19°Cは華氏で66.2°Fです。',
      keywords:
        '19 c 華氏 19℃ 華氏 66.2°F 室温 快適 睡眠 サーモスタット 発熱',
      guideTitle: '19°Cの快適さの目安',
      guideSubtitle: '少しひんやり感が残る、ちょうどよい室温',
      guideIntro:
        '19°C（66.2°F）は、少し涼しさが残る快適な室温としてよく捉えられます。睡眠、在宅作業、暖房を抑えた暮らしとも相性が良い温度です。',
      chart: {
        cold: { label: 'やや涼しい', value: '15-17°C', desc: '59-62.6°F<br>軽い重ね着があると快適' },
        moderate: { label: '快適', value: '18-21°C', desc: '64.4-69.8°F<br>定番の快適ゾーン' },
        warm: { label: 'やや暖かい', value: '22-25°C', desc: '71.6-77°F<br>軽装寄りになりやすい' },
      },
      table: {
        headers: { temperature: '温度', description: '体感', typicalUse: 'よくある場面' },
        rows: [
          { temp: '16°C (60.8°F)', desc: '爽やかで少し涼しい', use: '動きのある室内や軽い重ね着向き', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: '涼しいが快適', use: '睡眠や落ち着いた生活リズムに向きやすい', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: '快適で少しひんやり', use: '家庭、勉強、節度ある暖房設定に合う', highlight: true },
          { temp: '20°C (68°F)', desc: '標準的な室温', use: 'リビングやオフィスで一般的', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: '快適な室温', use: '座り仕事ではやや暖かく感じやすい', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: '平熱', use: '体温との比較に便利', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>メモ：</strong>19°Cは室内では快適かつ効率的に感じられることが多いですが、日差し、湿度、空気の流れで少し暖かくも涼しくも感じます。',
      faq: [
        {
          question: '19度Cは華氏で何度ですか？',
          answerHtml:
            '<p>19度Cは66.2度Fです。計算式は「°F = (°C × 9/5) + 32」です。19に1.8を掛けると34.2、そこに32を足して66.2°Fになります。</p>',
        },
        {
          question: '19°Cは発熱ですか？',
          answerHtml:
            '<p>いいえ。平熱は約37°C（98.6°F）で、発熱は一般に38°C（100.4°F）前後からです。19°Cは体温としてはまったく別の値です。</p>',
        },
        {
          question: '16〜19°Cは華氏で何度ですか？',
          answerHtml:
            '<p>16°Cから19°Cは、華氏では60.8°Fから66.2°Fです。少し涼しい室内快適さや、軽い羽織りが合う穏やかな気候にあたることが多いです。</p>',
        },
        {
          question: '19〜20°Cは華氏で何度ですか？',
          answerHtml:
            '<p>19°Cから20°Cは、華氏では66.2°Fから68°Fです。家庭、寝室、オフィスでよく見られる室温帯です。</p>',
        },
        {
          question: 'マイナス19°Cは華氏で何度ですか？',
          answerHtml:
            '<p>-19°Cは-2.2°Fです。こちらはかなり厳しい冬の寒さで、19°Cとはまったく違う体感になります。</p>',
        },
        {
          question: '19°Cは部屋に十分暖かいですか？',
          answerHtml:
            '<p>はい。19°Cは部屋の温度として十分暖かく、多くの人にとって「少し涼しくて快適」な範囲です。暑苦しくなりにくいので、省エネ寄りの設定としてもよく使われます。</p>',
        },
      ],
      practicalTitle: '19°C（66.2°F）が日常で意味すること',
      cards: [
        { title: '暑苦しさのない快適さ', body: '19°Cでは、部屋が暖まりすぎず、寝室や生活空間が快適に感じられることが多いです。' },
        { title: 'サーモスタット設定として優秀', body: '19°Cは快適さを保ちながら暖房負荷も抑えやすいため、現実的な設定温度としてよく選ばれます。' },
        { title: '静かな室内時間に向いている', body: '読書、仕事、くつろぎ、睡眠など、落ち着いた時間を過ごしやすい温度です。' },
      ],
    }),
  },
  ar: {
    16: roomPage({
      seoTitle: '16°C إلى فهرنهايت (60.8°F) | دليل التحويل',
      seoDescription:
        'حوّل 16 درجة مئوية إلى فهرنهايت بسرعة، وتعرّف أن 16°C تساوي 60.8°F وهل تبدو هذه الدرجة باردة أم معتدلة في الاستخدام اليومي.',
      headerTitle: '16°C إلى فهرنهايت (16 درجة مئوية إلى °F)',
      headerTagline:
        'حوّل 16°C إلى فهرنهايت مع شرح عملي لراحة الجو داخل المنزل، والطبقات الخفيفة، والخروج اليومي، والأسئلة الشائعة عن الإحساس بهذه الدرجة.',
      conversionIntro: '16°C تساوي 60.8°F.',
      keywords:
        '16 مئوية إلى فهرنهايت 16 c to f 60.8 فهرنهايت جو معتدل ملابس درجة الغرفة حمى',
      guideTitle: 'دليل الراحة عند 16°C',
      guideSubtitle: 'درجة منعشة وتحتاج غالباً إلى طبقة خفيفة',
      guideIntro:
        '16°C (60.8°F) تبدو عادة منعشة ومائلة للبرودة الخفيفة. أثناء المشي أو الحركة تكون مريحة، لكن داخل المنزل قد يفضّل كثير من الناس طبقة خفيفة إضافية.',
      chart: {
        cold: { label: 'أبرد', value: '10-15°C', desc: '50-59°F<br>غالباً تحتاج إلى جاكيت خفيف' },
        moderate: { label: 'منعش', value: '16-19°C', desc: '60.8-66.2°F<br>مريح مع طبقة خفيفة' },
        warm: { label: 'مريح', value: '20-22°C', desc: '68-71.6°F<br>أقرب إلى حرارة الغرفة المعتادة' },
      },
      table: {
        headers: { temperature: 'الحرارة', description: 'الإحساس', typicalUse: 'الاستخدام المعتاد' },
        rows: [
          { temp: '10°C (50°F)', desc: 'بارد نسبياً', use: 'الجاكيت الخفيف مناسب غالباً', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'منعش ويميل للبرودة', use: 'مناسب للمشي والتنقل والجلوس مع طبقة خفيفة', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'لطيف مع برودة بسيطة', use: 'مريح للنوم والجلوس الهادئ', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'مريح مع إحساس منعش', use: 'توازن جيد داخل المنزل', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'حرارة غرفة', use: 'إعداد شائع في البيت والمكتب', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'حرارة جسم طبيعية', use: 'مقارنة مفيدة عند الخلط بين الطقس والحمّى', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>ملاحظة:</strong> 16°C تبدو ألطف أثناء الحركة مقارنة بالجلوس الطويل. الرياح والرطوبة وظل الصباح قد تجعلها أبرد من الرقم نفسه.',
      faq: [
        {
          question: 'كم تساوي 16 درجة مئوية بالفهرنهايت؟',
          answerHtml:
            '<p>16 درجة مئوية تساوي 60.8 درجة فهرنهايت. المعادلة هي: °F = (°C × 9/5) + 32. نضرب 16 في 1.8 فنحصل على 28.8، ثم نضيف 32 لنصل إلى 60.8°F.</p>',
        },
        {
          question: 'هل 16°C تعتبر دافئة أم باردة؟',
          answerHtml:
            '<p>16°C (60.8°F) تُعد غالباً درجة منعشة أو مائلة للبرودة الخفيفة. ليست باردة جداً، لكنها ليست حرارة صيفية أيضاً، لذلك يفضّل كثير من الناس طبقة خفيفة.</p><p>في الخارج قد تبدو لطيفة، أما داخل المنزل ومع الجلوس الطويل فقد تشعر ببرودة بسيطة.</p>',
        },
        {
          question: 'كم تساوي -16°C بالفهرنهايت؟',
          answerHtml:
            '<p>-16°C تساوي 3.2°F، وهذه درجة شتوية شديدة البرودة مقارنة بـ 16°C فوق الصفر.</p>',
        },
        {
          question: 'هل 16°C تعني حمّى؟',
          answerHtml:
            '<p>لا. الحمى تبدأ عادة قرب 38°C (100.4°F)، بينما حرارة الجسم الطبيعية تقارب 37°C (98.6°F).</p><p>ولو كانت 16°C حرارة جسم، فستكون أقل بكثير من الطبيعي وبعيدة تماماً عن الحمى.</p>',
        },
        {
          question: 'ماذا أرتدي عند 16°C؟',
          answerHtml:
            '<p>عند 16°C تكفي عادة طبقات خفيفة.</p><ul><li>قميص أو كم طويل خفيف مع كارديغان أو جاكيت خفيف</li><li>جينز أو بنطال طويل مريح</li><li>حذاء مغلق أو رياضي للاستخدام اليومي</li></ul><p>إذا كان هناك هواء أو رذاذ، فطبقة إضافية بسيطة تصنع فرقاً واضحاً.</p>',
        },
        {
          question: 'هل 16°C مناسبة للأنشطة الخارجية؟',
          answerHtml:
            '<p>نعم. 16°C غالباً مناسبة للمشي والتنقل والنشاط الخفيف في الخارج. الإحساس يكون منعشاً أكثر من كونه قاسياً.</p>',
        },
        {
          question: 'كيف أحوّل 16°C إلى فهرنهايت ذهنياً؟',
          answerHtml:
            '<p>طريقة تقريبية سريعة هي مضاعفة الرقم المئوي ثم إضافة نحو 30. عند 16°C ستحصل تقريباً على 62°F، وهو قريب من النتيجة الدقيقة 60.8°F.</p>',
        },
      ],
      practicalTitle: 'كيف تبدو 16°C (60.8°F) في الحياة اليومية',
      cards: [
        { title: 'جو منعش وسهل', body: 'عند 16°C يشعر كثير من الناس بالارتياح خارج المنزل مع طبقة خفيفة واحدة فقط. الجو منعش لكنه ليس قاسياً.' },
        { title: 'داخل المنزل تبدو أبرد قليلاً', body: 'في الداخل، 16°C أقل من حرارة الغرفة المعتادة قليلاً. قد تناسب غرفة النوم، لكن بعض الناس يفضلون بلوزة خفيفة عند القراءة أو العمل.' },
        { title: 'الحركة تغيّر الإحساس', body: 'المشي أو التنقل عند 16°C يبدو مريحاً غالباً، بينما الجلوس الطويل في الدرجة نفسها قد يجعلك تشعر ببرودة أوضح.' },
      ],
    }),
    17: roomPage({
      seoTitle: '17°C إلى فهرنهايت (62.6°F) | دليل التحويل والحاسبة',
      seoDescription:
        'حوّل 17 درجة مئوية إلى فهرنهايت بسرعة. تعرّف أن 17°C تساوي 62.6°F وشاهد طريقة الحساب ومعنى هذه الدرجة في الواقع.',
      headerTitle: '17°C إلى فهرنهايت (17 درجة مئوية إلى °F)',
      headerTagline:
        'حوّل 17°C إلى فهرنهايت مع شرح عملي للطقس المنعش، والملابس المناسبة، ودرجة الغرفة، والراحة اليومية.',
      conversionIntro: '17°C تساوي 62.6°F.',
      keywords:
        '17 مئوية إلى فهرنهايت 17 c to f 62.6 فهرنهايت جو لطيف ملابس نوم حرارة الغرفة حمى',
      guideTitle: 'دليل الراحة عند 17°C',
      guideSubtitle: 'درجة بين البرودة الخفيفة والراحة',
      guideIntro:
        '17°C (62.6°F) تبدو غالباً لطيفة ومنعشة. هي أقل قليلاً من حرارة الغرفة المعتادة، لكنها مريحة لكثير من الناس أثناء المشي والتنقل والجلوس في مكان غير دافئ أكثر من اللازم.',
      chart: {
        cold: { label: 'بارد نسبياً', value: '10-15°C', desc: '50-59°F<br>الجاكيت الخفيف مناسب' },
        moderate: { label: 'منعش', value: '16-18°C', desc: '60.8-64.4°F<br>طبقة خفيفة تكفي غالباً' },
        warm: { label: 'مريح', value: '19-21°C', desc: '66.2-69.8°F<br>راحة داخلية متوازنة' },
      },
      table: {
        headers: { temperature: 'الحرارة', description: 'الإحساس', typicalUse: 'الاستخدام المعتاد' },
        rows: [
          { temp: '10°C (50°F)', desc: 'جو خارجي بارد نسبياً', use: 'تحتاج غالباً إلى جاكيت أو طبقة إضافية', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'منعش ويميل للبرودة', use: 'مناسب ليوم نشيط مع طبقة خفيفة', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'بارد لطيف', use: 'منتصف مناسب للمشي، والمهام اليومية، والأماكن الهادئة', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'لطيف مع برودة خفيفة', use: 'يعجب كثيرين للنوم والجلوس الهادئ', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'حرارة غرفة معتادة', use: 'هدف شائع للراحة المنزلية', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'حرارة جسم طبيعية', use: 'مرجع مفيد عند الخلط بين الطقس والحمّى', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>ملاحظة:</strong> 17°C قد تبدو مريحة أثناء الحركة، لكنها تميل إلى البرودة أكثر داخل غرفة ساكنة أو في الليل أو مع وجود هواء.',
      faq: [
        {
          question: 'كم تساوي 17 درجة مئوية بالفهرنهايت؟',
          answerHtml:
            '<p>17 درجة مئوية تساوي 62.6 درجة فهرنهايت. نستخدم المعادلة °F = (°C × 9/5) + 32. نضرب 17 في 1.8 فنحصل على 30.6 ثم نضيف 32 لنصل إلى 62.6°F.</p>',
        },
        {
          question: 'هل 17°C حارة أم باردة؟',
          answerHtml:
            '<p>17°C (62.6°F) تُعد عادة باردة بشكل لطيف أو معتدلة مائلة للبرودة. هي أقل من حرارة الغرفة التقليدية، لكنها تبقى مريحة لكثير من الأنشطة اليومية.</p><p>معظم الناس لا يعتبرونها برداً شديداً، لكنها أيضاً ليست حرارة صيفية.</p>',
        },
        {
          question: 'هل 17°C تعني حمّى؟',
          answerHtml:
            '<p>لا. حرارة الجسم الطبيعية تقارب 37°C (98.6°F)، والحمّى تبدأ عادة قرب 38°C (100.4°F).</p>',
        },
        {
          question: 'كيف تبدو 17°C من ناحية الإحساس؟',
          answerHtml:
            '<p>17°C تساوي 62.6°F، ويصفها كثيرون بأنها منعشة ومريحة. هي أبرد من حرارة الغرفة المعتادة، لكنها غالباً مناسبة جداً للحركة والخروج اليومي.</p>',
        },
        {
          question: 'ماذا أرتدي عند 17°C؟',
          answerHtml:
            '<p>في 17°C يكفي غالباً إضافة طبقة خفيفة.</p><ul><li>قميص أو كم طويل خفيف مع كارديغان أو جاكيت خفيف</li><li>جينز أو بنطال طويل مريح</li><li>حذاء رياضي أو مغلق</li></ul><p>الشمس قد تجعل الإحساس ألطف، لكن الظل والهواء ما زالا مؤثرين.</p>',
        },
        {
          question: 'هل 17°C مناسبة للنوم؟',
          answerHtml:
            '<p>نعم بالنسبة لكثير من الناس. غرف النوم تكون مريحة أحياناً عندما تكون أبرد قليلاً من غرف الجلوس، و17°C تدخل ضمن هذا النطاق.</p>',
        },
        {
          question: 'كم تساوي -17°C بالفهرنهايت؟',
          answerHtml:
            '<p>-17°C تساوي 1.4°F، وهذه درجة شتوية قاسية جداً مقارنة بـ 17°C فوق الصفر.</p>',
        },
      ],
      practicalTitle: 'كيف تبدو 17°C (62.6°F) في الحياة اليومية',
      cards: [
        { title: 'درجة مرنة وسهلة', body: '17°C تقع في نطاق منعش من دون أن تكون مزعجة عادة، ولهذا تناسب التنقلات، والمشاوير، والأيام التي تجمع بين الداخل والخارج.' },
        { title: 'أحياناً ألطف من الغرف الدافئة جداً', body: 'كثير من الناس يفضلون 17°C على الغرف الحارة، خصوصاً عند النوم أو التركيز أو الحركة داخل المنزل.' },
        { title: 'ليست دائماً درجة ملابس صيفية', body: 'بعض الناس يكتفون بملابس خفيفة جداً عند 17°C، لكن كثيرين ما زالوا يفضلون طبقة خفيفة فوقها.' },
      ],
    }),
    19: roomPage({
      seoTitle: '19°C إلى فهرنهايت (66.2°F) | دليل التحويل والحاسبة',
      seoDescription:
        'حوّل 19 درجة مئوية إلى فهرنهايت بسرعة. تعرّف أن 19°C تساوي 66.2°F وافهم لماذا تُعد هذه الدرجة مريحة داخل المنزل.',
      headerTitle: '19°C إلى فهرنهايت (19 درجة مئوية إلى °F)',
      headerTagline:
        'حوّل 19°C إلى فهرنهايت مع شرح عملي لحرارة الغرفة، والراحة الموفّرة للطاقة، والنوم، والاستخدام اليومي داخل المنزل.',
      conversionIntro: '19°C تساوي 66.2°F.',
      keywords:
        '19 مئوية إلى فهرنهايت 19 c to f 66.2 فهرنهايت حرارة الغرفة مريح نوم ترموستات حمى',
      guideTitle: 'دليل الراحة عند 19°C',
      guideSubtitle: 'درجة مريحة مع لمسة انتعاش داخلية',
      guideIntro:
        '19°C (66.2°F) تُعد غالباً درجة مريحة داخل المنزل مع إحساس بسيط بالانتعاش. تناسب النوم والعمل والعيش بدرجة حرارة غير خانقة.',
      chart: {
        cold: { label: 'منعش', value: '15-17°C', desc: '59-62.6°F<br>طبقة خفيفة تجعلها ألطف' },
        moderate: { label: 'مريح', value: '18-21°C', desc: '64.4-69.8°F<br>نطاق الراحة التقليدي' },
        warm: { label: 'أدفأ', value: '22-25°C', desc: '71.6-77°F<br>دفء أوضح وملابس أخف' },
      },
      table: {
        headers: { temperature: 'الحرارة', description: 'الإحساس', typicalUse: 'الاستخدام المعتاد' },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'منعش ويميل للبرودة', use: 'مناسب للحركة أو طبقة خفيفة داخلية', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'لطيف مع برودة بسيطة', use: 'مفضل عند كثيرين للنوم والهدوء', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'مريح مع انتعاش خفيف', use: 'إعداد متوازن للمنزل والدراسة والراحة الاقتصادية', highlight: true },
          { temp: '20°C (68°F)', desc: 'حرارة غرفة معتادة', use: 'هدف شائع لغرف المعيشة والمكاتب', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'حرارة مريحة', use: 'أدفأ قليلاً عند الجلوس والعمل المكتبي', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'حرارة جسم طبيعية', use: 'مقارنة مفيدة عندما يكون السؤال عن الجسم', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>ملاحظة:</strong> 19°C تبدو مريحة وموفّرة للطاقة داخل المنزل، لكن الشمس والرطوبة وحركة الهواء قد تجعل الإحساس يميل قليلاً إلى الدفء أو البرودة.',
      faq: [
        {
          question: 'كم تساوي 19 درجة مئوية بالفهرنهايت؟',
          answerHtml:
            '<p>19 درجة مئوية تساوي 66.2 درجة فهرنهايت. المعادلة هي °F = (°C × 9/5) + 32. نضرب 19 في 1.8 فنحصل على 34.2 ثم نضيف 32 لنصل إلى 66.2°F.</p>',
        },
        {
          question: 'هل 19°C تعني حمّى؟',
          answerHtml:
            '<p>لا. حرارة الجسم الطبيعية تقارب 37°C (98.6°F)، والحمّى تبدأ عادة قرب 38°C (100.4°F). لذلك 19°C بعيدة تماماً عن حرارة الحمى.</p>',
        },
        {
          question: 'كم تساوي 16-19°C بالفهرنهايت؟',
          answerHtml:
            '<p>من 16°C إلى 19°C تساوي من 60.8°F إلى 66.2°F. هذا النطاق يغطي أجواء داخلية منعشة ومريحة أو طقساً لطيفاً مع طبقة خفيفة.</p>',
        },
        {
          question: 'كم تساوي 19-20°C بالفهرنهايت؟',
          answerHtml:
            '<p>من 19°C إلى 20°C تساوي من 66.2°F إلى 68°F، وهو نطاق شائع جداً لحرارة الغرفة في البيت أو المكتب أو غرفة النوم.</p>',
        },
        {
          question: 'كيف أحوّل -19°C إلى فهرنهايت؟',
          answerHtml:
            '<p>-19°C تساوي -2.2°F، وهي درجة شتوية شديدة البرودة تختلف تماماً عن 19°C فوق الصفر.</p>',
        },
        {
          question: 'هل 19°C كافية لتدفئة الغرفة؟',
          answerHtml:
            '<p>نعم. 19°C كافية لتكون الغرفة مريحة عند كثير من الناس، وتُستخدم كثيراً كإعداد عملي يجمع بين الراحة وتخفيف استهلاك التدفئة.</p>',
        },
      ],
      practicalTitle: 'كيف تبدو 19°C (66.2°F) في الحياة اليومية',
      cards: [
        { title: 'راحة من دون خنقة', body: 'عند 19°C تكون الغرف مريحة لكثير من الناس من دون أن تصبح حارة أو خانقة.' },
        { title: 'إعداد قوي للترموستات', body: '19°C تُستخدم كثيراً كدرجة عملية للترموستات لأنها تحقق توازناً جيداً بين الراحة وتقليل الطلب على التدفئة.' },
        { title: 'مناسبة للروتين الهادئ', body: 'القراءة، والعمل، والاسترخاء، والنوم كلها أنشطة غالباً ما تبدو سهلة عند 19°C لأن الإحساس يبقى مريحاً وخفيفاً.' },
      ],
    }),
  },
  hi: {
    16: roomPage({
      seoTitle: '16°C को फ़ॉरेनहाइट में कितना? (60.8°F) | कन्वर्ज़न गाइड',
      seoDescription:
        '16°C को जल्दी से फ़ॉरेनहाइट में बदलें। जानें कि 16°C = 60.8°F होता है और रोज़मर्रा में यह तापमान ठंडा लगता है या हल्का सुहावना।',
      headerTitle: '16°C से फ़ॉरेनहाइट (16 डिग्री सेल्सियस = 60.8°F)',
      headerTagline:
        '16°C को फ़ॉरेनहाइट में बदलें और साथ में जानें कि यह तापमान घर के अंदर, हल्की लेयर, बाहर निकलने और रोज़मर्रा के आराम के लिहाज़ से कैसा लगता है।',
      conversionIntro: '16°C, 60.8°F के बराबर होता है।',
      keywords:
        '16 c to f 16 डिग्री सेल्सियस फ़ॉरेनहाइट 60.8 फॉरेनहाइट मौसम कपड़े रूम टेम्परेचर बुखार',
      guideTitle: '16°C आराम गाइड',
      guideSubtitle: 'हल्की ठंडक, जहाँ एक लेयर काम आती है',
      guideIntro:
        '16°C (60.8°F) आम तौर पर ताज़ा और हल्का ठंडा लगता है। चलते-फिरते यह आरामदायक हो सकता है, लेकिन कमरे के अंदर बैठने पर बहुत से लोगों को हल्का स्वेटर या ओवरशर्ट अच्छा लगता है।',
      chart: {
        cold: { label: 'ठंडा', value: '10-15°C', desc: '50-59°F<br>हल्की जैकेट उपयोगी रहती है' },
        moderate: { label: 'फ्रेश', value: '16-19°C', desc: '60.8-66.2°F<br>एक हल्की लेयर के साथ आरामदायक' },
        warm: { label: 'आरामदायक', value: '20-22°C', desc: '68-71.6°F<br>सामान्य कमरे जैसा आराम' },
      },
      table: {
        headers: { temperature: 'तापमान', description: 'अहसास', typicalUse: 'आम उपयोग' },
        rows: [
          { temp: '10°C (50°F)', desc: 'ठंडा', use: 'हल्की जैकेट अच्छी लगती है', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'फ्रेश और थोड़ा ठंडा', use: 'चलने, बाहर निकलने और कमरे में हल्की लेयर के साथ ठीक', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'ठंडा लेकिन आरामदायक', use: 'नींद और शांत इनडोर समय के लिए अच्छा', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'आरामदायक हल्की ठंडक', use: 'घर के अंदर संतुलित आराम', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'रूम टेम्परेचर', use: 'घर और ऑफिस में आम सेटिंग', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'सामान्य शरीर तापमान', use: 'मौसम और बुखार में फर्क समझने के लिए', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>नोट:</strong> 16°C चलते समय ज़्यादा ठीक लग सकता है, लेकिन बैठने पर थोड़ा ठंडा महसूस हो सकता है। हवा और नमी इसे और ठंडा महसूस करा सकती है।',
      faq: [
        {
          question: '16 डिग्री सेल्सियस फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>16 डिग्री सेल्सियस, 60.8 डिग्री फ़ॉरेनहाइट के बराबर होता है। फ़ॉर्मूला है: °F = (°C × 9/5) + 32. 16 को 1.8 से गुणा करने पर 28.8 मिलता है और उसमें 32 जोड़ने पर 60.8°F आता है।</p>',
        },
        {
          question: 'क्या 16°C गर्म है या ठंडा?',
          answerHtml:
            '<p>16°C (60.8°F) आम तौर पर ठंडा नहीं, बल्कि हल्का ठंडा या फ्रेश महसूस होता है। बहुत भारी सर्दियों के कपड़ों की ज़रूरत नहीं होती, लेकिन हल्की लेयर ज़्यादातर लोगों को अच्छी लगती है।</p><p>बाहर यह मौसम ताज़गीभरा लगता है, जबकि अंदर लंबे समय तक बैठने पर थोड़ा ठंडा महसूस हो सकता है।</p>',
        },
        {
          question: '-16°C फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>-16°C, 3.2°F के बराबर होता है। यह असली सर्दियों वाली ठंड है और 16°C से बिल्कुल अलग महसूस होती है।</p>',
        },
        {
          question: 'क्या 16°C बुखार होता है?',
          answerHtml:
            '<p>नहीं। बुखार आम तौर पर 38°C (100.4°F) के आसपास शुरू होता है और सामान्य शरीर तापमान लगभग 37°C (98.6°F) होता है।</p><p>अगर शरीर का तापमान 16°C हो, तो वह सामान्य से बहुत नीचे और खतरनाक होगा।</p>',
        },
        {
          question: '16°C में क्या पहनना चाहिए?',
          answerHtml:
            '<p>16°C पर हल्की लेयरिंग काफी रहती है।</p><ul><li>टी-शर्ट या पतली फुल-स्लीव के साथ कार्डिगन, ओवरशर्ट या हल्की जैकेट</li><li>जींस, ट्राउज़र या पूरा ढकने वाला बॉटम</li><li>स्नीकर या बंद जूते</li></ul><p>अगर हवा या हल्की बारिश हो तो एक अतिरिक्त लेयर बड़ा फर्क लाती है।</p>',
        },
        {
          question: 'क्या 16°C बाहर की गतिविधियों के लिए अच्छा है?',
          answerHtml:
            '<p>हाँ। 16°C अक्सर चलने, बाहर निकलने, हल्की एक्सरसाइज़ या रोज़मर्रा के कामों के लिए अच्छा तापमान होता है। ज़्यादातर लोगों को यह मौसम तेज ठंड के बजाय ताज़ा लगता है।</p>',
        },
        {
          question: '16°C को दिमाग में जल्दी फ़ॉरेनहाइट में कैसे बदलें?',
          answerHtml:
            '<p>एक आसान अनुमान है: सेल्सियस को लगभग दोगुना करें और 30 जोड़ दें। 16°C के लिए इससे करीब 62°F मिलता है, जो सही उत्तर 60.8°F के काफी करीब है।</p>',
        },
      ],
      practicalTitle: '16°C (60.8°F) रोज़मर्रा में कैसा लगता है',
      cards: [
        { title: 'फ्रेश लेकिन संभालने में आसान', body: '16°C पर हल्की लेयर के साथ बाहर रहना ज़्यादातर लोगों को ठीक लगता है। मौसम फ्रेश रहता है, बहुत कड़ा नहीं।' },
        { title: 'अंदर थोड़ा ज़्यादा ठंडा लग सकता है', body: 'कमरे के अंदर 16°C सामान्य रूम टेम्परेचर से थोड़ा नीचे लगता है। बेडरूम के लिए ठीक हो सकता है, लेकिन काम करते समय हल्का स्वेटर अच्छा लग सकता है।' },
        { title: 'चलते-फिरते और बैठने में फर्क पड़ता है', body: '16°C पर चलते समय आराम लगता है, लेकिन उसी तापमान में देर तक बैठने पर हल्की ठंड महसूस हो सकती है।' },
      ],
    }),
    17: roomPage({
      seoTitle: '17°C को फ़ॉरेनहाइट में कितना? (62.6°F) | कन्वर्ज़न गाइड और कैलकुलेटर',
      seoDescription:
        '17°C को जल्दी से फ़ॉरेनहाइट में बदलें। जानें कि 17°C = 62.6°F होता है, कैलकुलेशन कैसे होता है, और यह तापमान महसूस कैसा होता है।',
      headerTitle: '17°C से फ़ॉरेनहाइट (17 डिग्री सेल्सियस = 62.6°F)',
      headerTagline:
        '17°C को फ़ॉरेनहाइट में बदलें और साथ में जानें कि यह मौसम, कपड़ों, कमरे के तापमान और रोज़मर्रा के आराम के लिहाज़ से कैसा है।',
      conversionIntro: '17°C, 62.6°F के बराबर होता है।',
      keywords:
        '17 c to f 17 डिग्री सेल्सियस फ़ॉरेनहाइट 62.6 फॉरेनहाइट मौसम कपड़े नींद रूम टेम्परेचर बुखार',
      guideTitle: '17°C आराम गाइड',
      guideSubtitle: 'हल्की ठंडक और आराम के बीच की स्थिति',
      guideIntro:
        '17°C (62.6°F) कई लोगों को सुखद और फ्रेश लगता है। यह सामान्य कमरे के तापमान से थोड़ा नीचे है, लेकिन चलने-फिरने और बिना ज़्यादा गरम कमरे में रहने के लिए अच्छा लगता है।',
      chart: {
        cold: { label: 'ठंडा', value: '10-15°C', desc: '50-59°F<br>हल्की जैकेट वाला मौसम' },
        moderate: { label: 'फ्रेश', value: '16-18°C', desc: '60.8-64.4°F<br>हल्की लेयर के साथ आरामदायक' },
        warm: { label: 'आरामदायक', value: '19-21°C', desc: '66.2-69.8°F<br>अच्छा इनडोर संतुलन' },
      },
      table: {
        headers: { temperature: 'तापमान', description: 'अहसास', typicalUse: 'आम उपयोग' },
        rows: [
          { temp: '10°C (50°F)', desc: 'बाहर हल्की ठंड', use: 'जैकेट या अतिरिक्त लेयर ठीक रहती है', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'फ्रेश और थोड़ा ठंडा', use: 'हल्की लेयर के साथ एक्टिव दिन के लिए अच्छा', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'ठंडा-हल्का सुहावना', use: 'वॉक, रोज़मर्रा के काम और शांत इनडोर समय के लिए अच्छा', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'ठंडा लेकिन आरामदायक', use: 'नींद और शांत माहौल के लिए अच्छा', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'स्टैंडर्ड रूम टेम्परेचर', use: 'घर के आराम की सामान्य सीमा', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'सामान्य शरीर तापमान', use: 'मौसम और बुखार को अलग समझने के लिए', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>नोट:</strong> 17°C चलते समय आरामदायक लग सकता है, लेकिन हवा, रात या बंद कमरे में थोड़ा ज़्यादा ठंडा महसूस हो सकता है।',
      faq: [
        {
          question: '17 डिग्री सेल्सियस फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>17 डिग्री सेल्सियस, 62.6 डिग्री फ़ॉरेनहाइट के बराबर होता है। फ़ॉर्मूला है: °F = (°C × 9/5) + 32. 17 को 1.8 से गुणा करने पर 30.6 मिलता है और 32 जोड़ने पर 62.6°F आता है।</p>',
        },
        {
          question: 'क्या 17°C गर्म है या ठंडा?',
          answerHtml:
            '<p>17°C (62.6°F) आम तौर पर हल्का ठंडा या सुहावना माना जाता है। यह सामान्य रूम टेम्परेचर से थोड़ा कम है, लेकिन रोज़मर्रा के कामों के लिए काफ़ी आरामदायक रहता है।</p><p>ज़्यादातर लोग इसे बहुत ठंडा नहीं कहेंगे, लेकिन इसे गर्मियों जैसा मौसम भी नहीं मानेंगे।</p>',
        },
        {
          question: 'क्या 17°C बुखार है?',
          answerHtml:
            '<p>नहीं। सामान्य शरीर तापमान लगभग 37°C (98.6°F) होता है और बुखार आम तौर पर 38°C (100.4°F) के आसपास शुरू होता है।</p>',
        },
        {
          question: '17°C का अहसास कैसा होता है?',
          answerHtml:
            '<p>17°C, 62.6°F के बराबर है और इसे ज़्यादातर लोग हल्का ठंडा लेकिन आरामदायक मानते हैं। यह सामान्य कमरे की तुलना में थोड़ा ठंडा होता है, पर बाहर निकलने और रोज़मर्रा के कामों के लिए अच्छा रहता है।</p>',
        },
        {
          question: '17°C में क्या पहनें?',
          answerHtml:
            '<p>17°C पर ज़्यादातर लोगों के लिए एक हल्की अतिरिक्त लेयर पर्याप्त रहती है।</p><ul><li>टी-शर्ट या हल्की फुल-स्लीव के साथ कार्डिगन या हल्की जैकेट</li><li>जींस या फुल-लेंथ ट्राउज़र</li><li>स्नीकर या बंद जूते</li></ul><p>धूप हो तो हल्का कपड़ा चल सकता है, लेकिन हवा और छाँव अभी भी असर डालते हैं।</p>',
        },
        {
          question: 'क्या 17°C सोने के लिए अच्छा है?',
          answerHtml:
            '<p>हाँ, बहुत से लोगों के लिए। बेडरूम अक्सर लिविंग एरिया से थोड़ा ठंडा होने पर बेहतर लगता है, और 17°C उस रेंज में आता है।</p>',
        },
        {
          question: '-17°C फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>-17°C, 1.4°F के बराबर होता है। यह कड़ाके की सर्दी है और 17°C से बिल्कुल अलग महसूस होती है।</p>',
        },
      ],
      practicalTitle: '17°C (62.6°F) रोज़मर्रा में क्या मतलब रखता है',
      cards: [
        { title: 'लचीला और उपयोगी तापमान', body: '17°C वह तापमान है जिसमें हल्की ठंडक महसूस होती है, लेकिन आम तौर पर असुविधा नहीं होती। इसलिए यह बाहर-भीतर वाले दिन के लिए अच्छा रहता है।' },
        { title: 'ज़्यादा गरम कमरों से बेहतर लग सकता है', body: 'सोने, ध्यान लगाने या घर में चलते-फिरते रहने के लिए बहुत से लोगों को 17°C ज़्यादा आरामदायक लगता है।' },
        { title: 'हर किसी के लिए केवल टी-शर्ट वाला मौसम नहीं', body: 'कुछ लोग 17°C पर हल्के कपड़ों में ठीक रहते हैं, लेकिन बहुत से लोग कार्डिगन या पतली जैकेट पसंद करते हैं।' },
      ],
    }),
    19: roomPage({
      seoTitle: '19°C को फ़ॉरेनहाइट में कितना? (66.2°F) | कन्वर्ज़न गाइड और कैलकुलेटर',
      seoDescription:
        '19°C को जल्दी से फ़ॉरेनहाइट में बदलें। जानें कि 19°C = 66.2°F होता है और यह तापमान कमरे के आराम के हिसाब से कैसा माना जाता है।',
      headerTitle: '19°C से फ़ॉरेनहाइट (19 डिग्री सेल्सियस = 66.2°F)',
      headerTagline:
        '19°C को फ़ॉरेनहाइट में बदलें और साथ में समझें कि यह तापमान कमरे के आराम, ऊर्जा बचत, नींद और रोज़मर्रा की इनडोर जिंदगी में कैसा बैठता है।',
      conversionIntro: '19°C, 66.2°F के बराबर होता है।',
      keywords:
        '19 c to f 19 डिग्री सेल्सियस फ़ॉरेनहाइट 66.2 फॉरेनहाइट रूम टेम्परेचर आराम नींद थर्मोस्टेट बुखार',
      guideTitle: '19°C आराम गाइड',
      guideSubtitle: 'आरामदायक तापमान जिसमें हल्की ठंडक बनी रहती है',
      guideIntro:
        '19°C (66.2°F) को कई लोग थोड़ा फ्रेश लेकिन आरामदायक रूम टेम्परेचर मानते हैं। यह नींद, काम और घर में संतुलित आराम के लिए अच्छा बैठ सकता है।',
      chart: {
        cold: { label: 'फ्रेश', value: '15-17°C', desc: '59-62.6°F<br>हल्की लेयर के साथ बेहतर' },
        moderate: { label: 'आरामदायक', value: '18-21°C', desc: '64.4-69.8°F<br>क्लासिक कम्फर्ट रेंज' },
        warm: { label: 'थोड़ा गरम', value: '22-25°C', desc: '71.6-77°F<br>कम लेयर, ज्यादा गर्माहट' },
      },
      table: {
        headers: { temperature: 'तापमान', description: 'अहसास', typicalUse: 'आम उपयोग' },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'फ्रेश और थोड़ा ठंडा', use: 'हल्की लेयर के साथ इनडोर एक्टिविटी के लिए अच्छा', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'ठंडा लेकिन आरामदायक', use: 'नींद और शांत दिनचर्या के लिए अच्छा', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'आरामदायक और हल्का ठंडा', use: 'घर, पढ़ाई और संतुलित हीटिंग के लिए अच्छा', highlight: true },
          { temp: '20°C (68°F)', desc: 'स्टैंडर्ड रूम टेम्परेचर', use: 'लिविंग रूम और ऑफिस में आम', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'आरामदायक कमरा', use: 'बैठकर काम करने में थोड़ा ज़्यादा गरम लग सकता है', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'सामान्य शरीर तापमान', use: 'शरीर तापमान से तुलना के लिए उपयोगी', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>नोट:</strong> 19°C घर के अंदर आरामदायक और ऊर्जा-बचत वाला महसूस हो सकता है, लेकिन धूप, नमी और हवा से अनुभव थोड़ा बदल सकता है।',
      faq: [
        {
          question: '19 डिग्री सेल्सियस फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>19 डिग्री सेल्सियस, 66.2 डिग्री फ़ॉरेनहाइट के बराबर होता है। फ़ॉर्मूला है: °F = (°C × 9/5) + 32. 19 को 1.8 से गुणा करने पर 34.2 मिलता है और 32 जोड़ने पर 66.2°F आता है।</p>',
        },
        {
          question: 'क्या 19°C बुखार है?',
          answerHtml:
            '<p>नहीं। सामान्य शरीर तापमान लगभग 37°C (98.6°F) होता है और बुखार 38°C (100.4°F) के आसपास शुरू होता है। इसलिए 19°C शरीर के तापमान के लिहाज़ से बिल्कुल अलग मान है।</p>',
        },
        {
          question: '16-19°C फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>16°C से 19°C की रेंज, 60.8°F से 66.2°F तक होती है। यह अक्सर हल्की ठंडक वाले आरामदायक इनडोर या मौसम के लिए इस्तेमाल होती है।</p>',
        },
        {
          question: '19-20°C फ़ॉरेनहाइट में कितना होता है?',
          answerHtml:
            '<p>19°C से 20°C की रेंज, 66.2°F से 68°F तक होती है। यह घर, बेडरूम और ऑफिस के लिए बहुत आम रूम टेम्परेचर रेंज है।</p>',
        },
        {
          question: '-19°C को फ़ॉरेनहाइट में कैसे बदलें?',
          answerHtml:
            '<p>-19°C, -2.2°F के बराबर होता है। यह काफ़ी तेज़ सर्दी होती है और 19°C से बिल्कुल अलग महसूस होती है।</p>',
        },
        {
          question: 'क्या 19°C कमरे के लिए काफी गर्म है?',
          answerHtml:
            '<p>हाँ। 19°C कमरे के लिए काफी आरामदायक माना जाता है और बहुत से लोग इसे हल्की ताज़गी के साथ अच्छी इनडोर सेटिंग मानते हैं। इसलिए यह ऊर्जा बचत वाली हीटिंग सेटिंग के रूप में भी लोकप्रिय है।</p>',
        },
      ],
      practicalTitle: '19°C (66.2°F) रोज़मर्रा में कैसा लगता है',
      cards: [
        { title: 'बिना घुटन वाला आराम', body: '19°C पर घर और बेडरूम आरामदायक लगते हैं, लेकिन बहुत गरम या भारी महसूस नहीं होते।' },
        { title: 'थर्मोस्टेट के लिए अच्छी सेटिंग', body: '19°C अक्सर इसलिए चुना जाता है क्योंकि इसमें आराम भी मिलता है और हीटिंग की मांग भी थोड़ी कम रहती है।' },
        { title: 'शांत इनडोर रूटीन के लिए अच्छा', body: 'पढ़ना, काम करना, आराम करना और सोना 19°C पर आसान लगता है क्योंकि कमरा आरामदायक रहता है।' },
      ],
    }),
  },
  id: {
    16: roomPage({
      seoTitle: '16°C ke Fahrenheit berapa? (60.8°F) | Panduan Konversi',
      seoDescription:
        'Ubah 16°C ke Fahrenheit dengan cepat. Ketahui bahwa 16°C = 60.8°F dan pahami apakah suhu ini terasa sejuk, dingin ringan, atau nyaman dalam aktivitas harian.',
      headerTitle: '16°C ke Fahrenheit (16 derajat Celsius ke °F)',
      headerTagline:
        'Konversi 16°C ke Fahrenheit sambil melihat panduan praktis untuk kenyamanan indoor, layer tipis, cuaca segar, dan pertanyaan suhu sehari-hari.',
      conversionIntro: '16°C dalam Fahrenheit adalah 60.8°F.',
      keywords:
        '16 c ke f 16 celsius ke fahrenheit 60.8 fahrenheit cuaca sejuk baju suhu ruangan demam',
      guideTitle: 'Panduan kenyamanan 16°C',
      guideSubtitle: 'Cukup sejuk untuk butuh layer tipis, tapi masih mudah dijalani',
      guideIntro:
        '16°C (60.8°F) biasanya terasa segar dan sedikit sejuk. Saat berjalan atau beraktivitas terasa enak, tetapi di dalam ruangan banyak orang lebih nyaman dengan sweater tipis atau overshirt.',
      chart: {
        cold: { label: 'Sejuk', value: '10-15°C', desc: '50-59°F<br>Jaket tipis sering terasa pas' },
        moderate: { label: 'Segar', value: '16-19°C', desc: '60.8-66.2°F<br>Nyaman dengan satu layer ringan' },
        warm: { label: 'Nyaman', value: '20-22°C', desc: '68-71.6°F<br>Mendekati suhu ruang umum' },
      },
      table: {
        headers: { temperature: 'Suhu', description: 'Deskripsi', typicalUse: 'Kondisi umum' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Sejuk', use: 'Jaket tipis biasanya terasa pas', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Segar dan sedikit dingin', use: 'Cocok untuk jalan kaki, perjalanan, dan ruangan dengan layer ringan', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Sejuk tapi nyaman', use: 'Sering enak untuk tidur dan aktivitas indoor santai', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Nyaman dengan rasa sejuk', use: 'Keseimbangan yang enak untuk ruangan', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Suhu ruang', use: 'Setelan umum di rumah dan kantor', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Suhu tubuh normal', use: 'Perbandingan saat orang bingung antara cuaca dan demam', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Catatan:</strong> 16°C biasanya terasa lebih nyaman saat bergerak daripada saat duduk diam. Angin, udara lembap, dan suasana pagi bisa membuatnya terasa lebih dingin.',
      faq: [
        {
          question: '16 derajat Celsius sama dengan berapa Fahrenheit?',
          answerHtml:
            '<p>16 derajat Celsius sama dengan 60.8 derajat Fahrenheit. Rumusnya adalah °F = (°C × 9/5) + 32. Kalikan 16 dengan 1.8 sehingga hasilnya 28.8, lalu tambah 32 menjadi 60.8°F.</p>',
        },
        {
          question: '16°C terasa hangat atau dingin?',
          answerHtml:
            '<p>16°C (60.8°F) biasanya terasa sejuk ke ringan. Belum sedingin cuaca musim dingin berat, tetapi kebanyakan orang tetap lebih nyaman memakai layer tipis.</p><p>Di luar ruangan suhu ini sering terasa segar. Di dalam ruangan, kalau duduk lama, rasanya bisa sedikit dingin.</p>',
        },
        {
          question: 'Berapa Fahrenheit untuk -16°C?',
          answerHtml:
            '<p>-16°C setara dengan 3.2°F. Itu sudah masuk suhu dingin musim dingin yang nyata dan sangat berbeda dari 16°C di atas nol.</p>',
        },
        {
          question: 'Apakah 16°C termasuk demam?',
          answerHtml:
            '<p>Tidak. Demam manusia biasanya mulai sekitar 38°C (100.4°F), sedangkan suhu tubuh normal sekitar 37°C (98.6°F).</p><p>Kalau 16°C adalah suhu tubuh, itu justru jauh di bawah normal dan berbahaya.</p>',
        },
        {
          question: 'Pakaian apa yang cocok saat 16°C?',
          answerHtml:
            '<p>Pada 16°C, layer ringan biasanya sudah cukup.</p><ul><li>Kaos atau atasan lengan panjang tipis dengan cardigan, overshirt, atau jaket ringan</li><li>Jeans, celana panjang, atau bawahan tertutup lain</li><li>Sepatu tertutup atau sneakers</li></ul><p>Kalau ada angin atau gerimis, satu layer tambahan biasanya sangat membantu.</p>',
        },
        {
          question: 'Apakah 16°C bagus untuk aktivitas luar ruangan?',
          answerHtml:
            '<p>Ya. 16°C sering terasa pas untuk jalan kaki, commuting, aktivitas ringan, atau sekadar berada di luar. Rasanya segar, bukan menusuk dingin.</p>',
        },
        {
          question: 'Bagaimana cara cepat mengubah 16°C ke Fahrenheit di kepala?',
          answerHtml:
            '<p>Cara cepatnya adalah menggandakan angka Celsius lalu menambah sekitar 30. Untuk 16°C hasil kasarnya sekitar 62°F, cukup dekat dengan jawaban tepat 60.8°F.</p>',
        },
      ],
      practicalTitle: 'Seperti apa 16°C (60.8°F) dalam keseharian',
      cards: [
        { title: 'Segar tapi masih mudah dijalani', body: 'Pada 16°C, banyak orang tetap nyaman berada di luar dengan satu layer ringan. Terasa segar, tapi tidak keras.' },
        { title: 'Di dalam ruangan bisa terasa lebih dingin', body: 'Untuk indoor, 16°C sedikit di bawah suhu ruang biasa. Cocok untuk kamar tidur, tetapi saat kerja atau membaca mungkin ingin tambahan layer.' },
        { title: 'Banyak dipengaruhi gerak tubuh', body: 'Saat berjalan, 16°C sering terasa enak. Saat duduk diam pada suhu yang sama, rasa sejuknya lebih terasa.' },
      ],
    }),
    17: roomPage({
      seoTitle: '17°C ke Fahrenheit berapa? (62.6°F) | Panduan & Kalkulator',
      seoDescription:
        'Ubah 17°C ke Fahrenheit dengan cepat. Ketahui bahwa 17°C = 62.6°F, lihat cara hitungnya, dan pahami konteks suhu ini dalam kehidupan sehari-hari.',
      headerTitle: '17°C ke Fahrenheit (17 derajat Celsius ke °F)',
      headerTagline:
        'Konversi 17°C ke Fahrenheit dengan panduan praktis untuk cuaca sejuk, pakaian harian, suhu ruangan, dan kenyamanan sehari-hari.',
      conversionIntro: '17°C dalam Fahrenheit adalah 62.6°F.',
      keywords:
        '17 c ke f 17 celsius ke fahrenheit 62.6 fahrenheit sejuk pakaian tidur suhu ruangan demam',
      guideTitle: 'Panduan kenyamanan 17°C',
      guideSubtitle: 'Suhu segar yang berada di antara sejuk dan nyaman',
      guideIntro:
        '17°C (62.6°F) sering terasa segar dan enak. Ini sedikit di bawah suhu ruang biasa, tetapi banyak orang merasa nyaman untuk jalan kaki, rutinitas harian, dan ruangan yang tidak terlalu hangat.',
      chart: {
        cold: { label: 'Sejuk', value: '10-15°C', desc: '50-59°F<br>Cuaca jaket tipis' },
        moderate: { label: 'Segar', value: '16-18°C', desc: '60.8-64.4°F<br>Nyaman dengan layer ringan' },
        warm: { label: 'Nyaman', value: '19-21°C', desc: '66.2-69.8°F<br>Keseimbangan nyaman di dalam ruangan' },
      },
      table: {
        headers: { temperature: 'Suhu', description: 'Deskripsi', typicalUse: 'Kondisi umum' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Cuaca luar cukup sejuk', use: 'Jaket atau layer tambahan biasanya membantu', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Segar dan sedikit dingin', use: 'Pas untuk hari aktif dengan layer ringan', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'Sejuk ke sedang', use: 'Titik tengah yang enak untuk jalan, urusan harian, dan ruang tenang', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Sejuk tapi nyaman', use: 'Sering enak untuk tidur dan aktivitas indoor santai', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Suhu ruang umum', use: 'Target nyaman yang klasik', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Suhu tubuh normal', use: 'Patokan saat orang bingung antara cuaca dan demam', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Catatan:</strong> 17°C terasa cukup nyaman saat bergerak, tetapi bisa terasa lebih dingin di malam hari, di ruangan diam, atau saat berangin.',
      faq: [
        {
          question: '17 derajat Celsius sama dengan berapa Fahrenheit?',
          answerHtml:
            '<p>17 derajat Celsius sama dengan 62.6 derajat Fahrenheit. Rumusnya: °F = (°C × 9/5) + 32. Kalikan 17 dengan 1.8 untuk mendapatkan 30.6, lalu tambah 32 menjadi 62.6°F.</p>',
        },
        {
          question: '17°C itu panas atau dingin?',
          answerHtml:
            '<p>17°C (62.6°F) biasanya dianggap sejuk ke sedang. Suhu ini lebih rendah daripada suhu ruang klasik, tetapi tetap nyaman untuk banyak kegiatan harian.</p><p>Kebanyakan orang tidak akan menyebutnya dingin berat, tetapi juga belum seperti cuaca panas.</p>',
        },
        {
          question: 'Apakah 17°C termasuk demam?',
          answerHtml:
            '<p>Tidak. Suhu tubuh normal sekitar 37°C (98.6°F), dan demam biasanya mulai di sekitar 38°C (100.4°F).</p>',
        },
        {
          question: 'Sehangat apa 17°C itu?',
          answerHtml:
            '<p>17°C sama dengan 62.6°F. Kebanyakan orang menganggapnya segar dan nyaman: lebih dingin daripada suhu ruang biasa, tetapi masih enak untuk aktivitas harian.</p>',
        },
        {
          question: 'Pakaian apa yang cocok saat 17°C?',
          answerHtml:
            '<p>Pada 17°C, satu layer tambahan tipis biasanya sudah cukup.</p><ul><li>Kaos atau atasan ringan dengan cardigan atau jaket tipis</li><li>Jeans, celana panjang, atau bawahan nyaman</li><li>Sneakers atau sepatu tertutup</li></ul><p>Kalau ada matahari, pakaian lebih ringan mungkin cukup, tetapi angin dan teduh masih berpengaruh.</p>',
        },
        {
          question: 'Apakah 17°C cocok untuk tidur?',
          answerHtml:
            '<p>Ya, untuk banyak orang. Kamar tidur sering terasa lebih enak saat sedikit lebih sejuk daripada ruang keluarga, dan 17°C berada di rentang itu.</p>',
        },
        {
          question: 'Berapa Fahrenheit untuk -17°C?',
          answerHtml:
            '<p>-17°C setara dengan 1.4°F. Itu sudah masuk kondisi dingin musim dingin yang jelas, jauh berbeda dari 17°C di atas nol.</p>',
        },
      ],
      practicalTitle: 'Seperti apa 17°C (62.6°F) dalam keseharian',
      cards: [
        { title: 'Suhu tengah yang fleksibel', body: '17°C berada di zona yang terasa segar tetapi biasanya tidak mengganggu. Karena itu, suhu ini cocok untuk perjalanan, belanja, dan hari yang berganti antara indoor dan outdoor.' },
        { title: 'Sering terasa lebih enak daripada ruangan terlalu hangat', body: 'Banyak orang merasa 17°C lebih nyaman daripada ruangan yang terlalu panas, terutama saat tidur, fokus, atau bergerak di rumah.' },
        { title: 'Belum tentu cuaca kaos saja untuk semua orang', body: 'Ada yang sudah nyaman dengan pakaian ringan di 17°C, tetapi banyak juga yang tetap memilih cardigan atau jaket tipis.' },
      ],
    }),
    19: roomPage({
      seoTitle: '19°C ke Fahrenheit berapa? (66.2°F) | Panduan & Kalkulator',
      seoDescription:
        'Ubah 19°C ke Fahrenheit dengan cepat. Ketahui bahwa 19°C = 66.2°F dan pahami kenapa suhu ini sering dianggap nyaman untuk ruangan.',
      headerTitle: '19°C ke Fahrenheit (19 derajat Celsius ke °F)',
      headerTagline:
        'Konversi 19°C ke Fahrenheit sambil memahami suhu ruang, kenyamanan hemat energi, tidur, dan keseharian di dalam ruangan.',
      conversionIntro: '19°C dalam Fahrenheit adalah 66.2°F.',
      keywords:
        '19 c ke f 19 celsius ke fahrenheit 66.2 fahrenheit suhu ruang nyaman tidur thermostat demam',
      guideTitle: 'Panduan kenyamanan 19°C',
      guideSubtitle: 'Nyaman untuk ruangan tapi tetap terasa segar',
      guideIntro:
        '19°C (66.2°F) sering dianggap suhu ruang yang nyaman dengan rasa sedikit sejuk. Cocok untuk tidur, bekerja, dan menjaga rumah tetap nyaman tanpa terasa pengap.',
      chart: {
        cold: { label: 'Segar', value: '15-17°C', desc: '59-62.6°F<br>Biasanya lebih enak dengan layer ringan' },
        moderate: { label: 'Nyaman', value: '18-21°C', desc: '64.4-69.8°F<br>Rentang nyaman klasik' },
        warm: { label: 'Lebih hangat', value: '22-25°C', desc: '71.6-77°F<br>Layer lebih sedikit, rasa hangat lebih jelas' },
      },
      table: {
        headers: { temperature: 'Suhu', description: 'Deskripsi', typicalUse: 'Kondisi umum' },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'Segar dan sedikit dingin', use: 'Pas untuk aktif di dalam ruangan dengan layer ringan', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'Sejuk tapi nyaman', use: 'Sering ideal untuk tidur dan rutinitas santai', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Nyaman dan sedikit sejuk', use: 'Setelan yang seimbang untuk rumah, belajar, dan kenyamanan hemat energi', highlight: true },
          { temp: '20°C (68°F)', desc: 'Suhu ruang umum', use: 'Target umum untuk ruang keluarga dan kantor', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'Suhu ruang nyaman', use: 'Sedikit lebih hangat untuk duduk lama atau kerja meja', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Suhu tubuh normal', use: 'Perbandingan berguna jika pertanyaannya menyangkut suhu tubuh', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Catatan:</strong> 19°C sering terasa nyaman dan efisien di dalam ruangan, tetapi sinar matahari, kelembapan, dan aliran udara tetap bisa mengubah rasanya sedikit lebih hangat atau lebih sejuk.',
      faq: [
        {
          question: '19 derajat Celsius sama dengan berapa Fahrenheit?',
          answerHtml:
            '<p>19 derajat Celsius sama dengan 66.2 derajat Fahrenheit. Rumusnya adalah °F = (°C × 9/5) + 32. Kalikan 19 dengan 1.8 untuk mendapatkan 34.2, lalu tambah 32 menjadi 66.2°F.</p>',
        },
        {
          question: 'Apakah 19°C termasuk demam?',
          answerHtml:
            '<p>Tidak. Suhu tubuh normal sekitar 37°C (98.6°F), dan demam biasanya mulai sekitar 38°C (100.4°F). Jadi 19°C jelas bukan suhu demam.</p>',
        },
        {
          question: 'Berapa Fahrenheit untuk 16-19°C?',
          answerHtml:
            '<p>Rentang 16°C hingga 19°C setara dengan 60.8°F sampai 66.2°F. Ini biasanya mencakup kenyamanan indoor yang segar atau cuaca ringan yang masih cocok dengan satu layer tipis.</p>',
        },
        {
          question: 'Berapa Fahrenheit untuk 19-20°C?',
          answerHtml:
            '<p>Rentang 19°C hingga 20°C setara dengan 66.2°F sampai 68°F. Ini adalah rentang suhu ruang yang sangat umum untuk rumah, kamar tidur, dan kantor.</p>',
        },
        {
          question: 'Bagaimana mengubah -19°C ke Fahrenheit?',
          answerHtml:
            '<p>-19°C setara dengan -2.2°F. Itu adalah cuaca musim dingin yang sangat dingin dan jauh berbeda dari 19°C di atas nol.</p>',
        },
        {
          question: 'Apakah 19°C cukup hangat untuk ruangan?',
          answerHtml:
            '<p>Ya. 19°C cukup hangat untuk ruangan, dan banyak orang menilainya nyaman dengan rasa sedikit segar. Karena itu suhu ini sering dipilih sebagai setelan pemanas yang hemat energi.</p>',
        },
      ],
      practicalTitle: 'Seperti apa 19°C (66.2°F) dalam keseharian',
      cards: [
        { title: 'Nyaman tanpa terasa pengap', body: 'Pada 19°C, banyak rumah dan kamar tidur terasa nyaman tanpa menjadi terlalu panas atau berat.' },
        { title: 'Setelan thermostat yang kuat', body: '19°C sering dipakai sebagai target thermostat yang praktis karena memberi kenyamanan sambil menjaga kebutuhan pemanasan tetap lebih rendah.' },
        { title: 'Cocok untuk rutinitas indoor yang tenang', body: 'Membaca, bekerja, bersantai, dan tidur sering terasa pas pada 19°C karena ruangan tetap nyaman tanpa terasa berat.' },
      ],
    }),
  },
  'pt-br': {
    16: roomPage({
      seoTitle: '16°C em Fahrenheit (60,8°F) | Guia de conversão',
      seoDescription:
        'Converta 16°C para Fahrenheit rapidamente. Veja que 16°C = 60,8°F e entenda se essa temperatura parece fresca, fria leve ou confortável no dia a dia.',
      headerTitle: '16°C para Fahrenheit (16 graus Celsius em °F)',
      headerTagline:
        'Converta 16°C para Fahrenheit com dicas práticas sobre conforto em ambientes internos, roupa em camadas, clima fresco e dúvidas comuns do cotidiano.',
      conversionIntro: '16°C em Fahrenheit são 60,8°F.',
      keywords:
        '16 c em fahrenheit 16 celsius em fahrenheit 60,8 fahrenheit clima fresco roupa temperatura ambiente febre',
      guideTitle: 'Guia de conforto para 16°C',
      guideSubtitle: 'Fresco o suficiente para pedir uma camada leve',
      guideIntro:
        '16°C (60,8°F) costumam parecer frescos e levemente frios. Caminhando ou se movimentando, muita gente acha agradável; em ambientes internos, porém, é comum preferir um casaco leve ou uma sobrecamisa.',
      chart: {
        cold: { label: 'Fresco', value: '10-15°C', desc: '50-59°F<br>Tempo de jaqueta leve para muita gente' },
        moderate: { label: 'Agradável', value: '16-19°C', desc: '60.8-66.2°F<br>Confortável com uma camada leve' },
        warm: { label: 'Confortável', value: '20-22°C', desc: '68-71.6°F<br>Perto da temperatura ambiente comum' },
      },
      table: {
        headers: { temperature: 'Temperatura', description: 'Sensação', typicalUse: 'Uso comum' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Fresco', use: 'Uma jaqueta leve costuma cair bem', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Fresco e um pouco frio', use: 'Bom para caminhar, se deslocar e ficar em ambientes internos com camada leve', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Fresco, mas confortável', use: 'Muita gente gosta para dormir e para momentos tranquilos em casa', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Confortavelmente fresco', use: 'Conforto interno equilibrado sem sensação abafada', href: '/19-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Temperatura ambiente', use: 'Ajuste comum em casa e no escritório', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Temperatura corporal normal', use: 'Útil para comparar quando alguém confunde clima com febre', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Nota:</strong> 16°C costumam parecer melhores em movimento do que parado. Vento, umidade e sombra pela manhã podem deixar a sensação mais fria.',
      faq: [
        {
          question: 'Quanto é 16 graus Celsius em Fahrenheit?',
          answerHtml:
            '<p>16 graus Celsius equivalem a 60,8 graus Fahrenheit. A fórmula é: °F = (°C × 9/5) + 32. Multiplicando 16 por 1,8, você chega a 28,8; somando 32, o resultado é 60,8°F.</p>',
        },
        {
          question: '16°C é quente ou frio?',
          answerHtml:
            '<p>16°C (60,8°F) normalmente são vistos como frescos a amenos. Não é frio de inverno pesado, mas a maioria das pessoas ainda prefere uma camada leve.</p><p>Ao ar livre, a sensação costuma ser agradável e fresca. Em ambientes internos, pode parecer um pouco frio se você ficar muito tempo parado.</p>',
        },
        {
          question: 'Quanto é -16°C em Fahrenheit?',
          answerHtml:
            '<p>-16°C equivalem a 3,2°F. Aí já estamos falando de frio forte de inverno, bem diferente de 16°C acima de zero.</p>',
        },
        {
          question: '16°C é febre?',
          answerHtml:
            '<p>Não. Febre em humanos geralmente começa perto de 38°C (100,4°F), enquanto a temperatura corporal normal fica em torno de 37°C (98,6°F).</p><p>Se 16°C fosse uma medição corporal, estaria muito abaixo do normal e seria algo grave.</p>',
        },
        {
          question: 'Que roupa usar com 16°C?',
          answerHtml:
            '<p>Com 16°C, camadas leves costumam ser suficientes.</p><ul><li>Camiseta ou manga longa fina com cardigan, sobrecamisa ou jaqueta leve</li><li>Jeans, calça comprida ou outra peça confortável</li><li>Tênis ou sapato fechado no dia a dia</li></ul><p>Se houver vento ou garoa, uma camada extra costuma fazer bastante diferença.</p>',
        },
        {
          question: '16°C são bons para atividades ao ar livre?',
          answerHtml:
            '<p>Sim. 16°C costumam ser ótimos para caminhar, se deslocar, fazer atividade leve e passar um tempo do lado de fora. A sensação é mais de frescor do que de frio duro.</p>',
        },
        {
          question: 'Como converter 16°C para Fahrenheit de cabeça?',
          answerHtml:
            '<p>Uma aproximação rápida é dobrar o valor em Celsius e somar cerca de 30. Para 16°C, isso dá perto de 62°F, bem próximo do valor exato de 60,8°F.</p>',
        },
      ],
      practicalTitle: '16°C (60,8°F) no dia a dia',
      cards: [
        { title: 'Fresco, mas fácil de encarar', body: 'Com 16°C, muita gente fica bem ao ar livre usando apenas uma camada leve. É fresco, mas não agressivo.' },
        { title: 'Dentro de casa parece mais frio do que muita gente imagina', body: 'Em ambientes internos, 16°C ficam um pouco abaixo da temperatura ambiente mais comum. Pode funcionar bem para quartos, mas quem trabalha parado costuma querer um agasalho leve.' },
        { title: 'Estar em movimento muda bastante a sensação', body: 'Caminhar ou se deslocar com 16°C costuma ser agradável. Já ficar parado na mesma temperatura pode parecer bem mais frio.' },
      ],
    }),
    17: roomPage({
      seoTitle: '17°C em Fahrenheit (62,6°F) | Guia e calculadora',
      seoDescription:
        'Converta 17°C para Fahrenheit rapidamente. Veja que 17°C = 62,6°F, confira o cálculo e entenda o contexto dessa temperatura no dia a dia.',
      headerTitle: '17°C para Fahrenheit (17 graus Celsius em °F)',
      headerTagline:
        'Converta 17°C para Fahrenheit com ajuda prática para clima fresco, roupas em camadas, temperatura de ambiente e conforto cotidiano.',
      conversionIntro: '17°C em Fahrenheit são 62,6°F.',
      keywords:
        '17 c em fahrenheit 17 celsius em fahrenheit 62,6 fahrenheit clima fresco roupa sono temperatura ambiente febre',
      guideTitle: 'Guia de conforto para 17°C',
      guideSubtitle: 'Uma faixa fresca que fica entre o frio leve e o confortável',
      guideIntro:
        '17°C (62,6°F) costumam parecer agradavelmente frescos. É um pouco abaixo da temperatura ambiente clássica, mas ainda muito confortável para caminhadas, deslocamentos e ambientes sem excesso de aquecimento.',
      chart: {
        cold: { label: 'Fresco', value: '10-15°C', desc: '50-59°F<br>Tempo típico de jaqueta leve' },
        moderate: { label: 'Ameno', value: '16-18°C', desc: '60.8-64.4°F<br>Confortável com camada leve' },
        warm: { label: 'Confortável', value: '19-21°C', desc: '66.2-69.8°F<br>Bom equilíbrio em ambientes internos' },
      },
      table: {
        headers: { temperature: 'Temperatura', description: 'Sensação', typicalUse: 'Uso comum' },
        rows: [
          { temp: '10°C (50°F)', desc: 'Clima fresco lá fora', use: 'Jaqueta ou camada extra costuma ajudar', href: '/10-c-to-f' },
          { temp: '16°C (60.8°F)', desc: 'Fresco e levemente frio', use: 'Bom para dias ativos com camada leve', href: '/16-c-to-f' },
          { temp: '17°C (62.6°F)', desc: 'Fresco para ameno', use: 'Boa faixa para caminhar, resolver coisas e ficar em ambientes tranquilos', highlight: true },
          { temp: '18°C (64.4°F)', desc: 'Fresco, mas confortável', use: 'Muito usado como referência para dormir melhor', href: '/18-c-to-f' },
          { temp: '20°C (68°F)', desc: 'Temperatura ambiente clássica', use: 'Meta comum de conforto em casa', href: '/20-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Temperatura corporal normal', use: 'Útil quando a dúvida mistura clima e febre', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Nota:</strong> 17°C costumam parecer amenos quando você está em movimento, mas podem ficar mais frios à noite, em locais com vento ou em ambientes parados.',
      faq: [
        {
          question: 'Quanto é 17 graus Celsius em Fahrenheit?',
          answerHtml:
            '<p>17 graus Celsius equivalem a 62,6 graus Fahrenheit. A fórmula é: °F = (°C × 9/5) + 32. Multiplicando 17 por 1,8, o resultado é 30,6; somando 32, chegamos a 62,6°F.</p>',
        },
        {
          question: '17°C é quente ou frio?',
          answerHtml:
            '<p>17°C (62,6°F) normalmente são considerados frescos para amenos. É uma temperatura abaixo da referência clássica de ambiente, mas ainda confortável para muitas atividades normais.</p><p>A maioria das pessoas não chamaria isso de frio forte, mas também não trataria como calor de verão.</p>',
        },
        {
          question: '17°C é febre?',
          answerHtml:
            '<p>Não. A temperatura corporal normal fica perto de 37°C (98,6°F), e a febre costuma começar em torno de 38°C (100,4°F).</p>',
        },
        {
          question: 'Quão quente são 17°C em Fahrenheit?',
          answerHtml:
            '<p>17°C equivalem a 62,6°F. Em termos práticos, a sensação costuma ser de clima fresco para ameno: mais fresco que a temperatura ambiente padrão, mas ainda muito tranquilo para a rotina.</p>',
        },
        {
          question: 'Que roupa usar com 17°C?',
          answerHtml:
            '<p>Em 17°C, normalmente basta uma camada leve extra.</p><ul><li>Camiseta ou manga longa fina com cardigan ou jaqueta leve</li><li>Jeans, calça comprida ou outra peça confortável</li><li>Tênis ou sapato fechado</li></ul><p>Se houver sol, a roupa mais leve pode bastar, mas vento e sombra ainda contam bastante.</p>',
        },
        {
          question: '17°C são bons para dormir?',
          answerHtml:
            '<p>Para muita gente, sim. Quartos costumam parecer mais agradáveis quando ficam um pouco mais frescos do que a sala, e 17°C entram nessa faixa.</p>',
        },
        {
          question: 'Quanto é -17°C em Fahrenheit?',
          answerHtml:
            '<p>-17°C equivalem a 1,4°F. Isso já é frio forte de inverno e não tem nada a ver com 17°C acima de zero.</p>',
        },
      ],
      practicalTitle: '17°C (62,6°F) no dia a dia',
      cards: [
        { title: 'Uma faixa intermediária muito versátil', body: '17°C ficam naquele ponto em que o clima parece fresco, mas normalmente não chega a incomodar. Por isso funciona bem para deslocamentos, tarefas e dias mistos entre rua e ambiente interno.' },
        { title: 'Muitas vezes melhor do que um ambiente superaquecido', body: 'Muita gente acha 17°C mais agradável do que ambientes quentes demais, especialmente para dormir, se concentrar ou se movimentar em casa.' },
        { title: 'Ainda não é clima de camiseta para todo mundo', body: 'Algumas pessoas ficam bem com roupa bem leve a 17°C, mas muitas ainda preferem um cardigan, uma sobrecamisa ou uma jaqueta fina.' },
      ],
    }),
    19: roomPage({
      seoTitle: '19°C em Fahrenheit (66,2°F) | Guia e calculadora',
      seoDescription:
        'Converta 19°C para Fahrenheit rapidamente. Veja que 19°C = 66,2°F e entenda por que essa faixa costuma ser vista como confortável em ambientes internos.',
      headerTitle: '19°C para Fahrenheit (19 graus Celsius em °F)',
      headerTagline:
        'Converta 19°C para Fahrenheit com contexto prático sobre temperatura ambiente, conforto com economia de energia, sono e rotina dentro de casa.',
      conversionIntro: '19°C em Fahrenheit são 66,2°F.',
      keywords:
        '19 c em fahrenheit 19 celsius em fahrenheit 66,2 fahrenheit temperatura ambiente conforto sono termostato febre',
      guideTitle: 'Guia de conforto para 19°C',
      guideSubtitle: 'Confortável, mas ainda com sensação fresca',
      guideIntro:
        '19°C (66,2°F) costumam ser vistos como uma temperatura interna confortável, com leve sensação de frescor. Funciona bem para dormir, estudar, trabalhar e aquecer a casa sem exagero.',
      chart: {
        cold: { label: 'Fresco', value: '15-17°C', desc: '59-62.6°F<br>Camada leve costuma ajudar' },
        moderate: { label: 'Confortável', value: '18-21°C', desc: '64.4-69.8°F<br>Faixa clássica de conforto' },
        warm: { label: 'Mais quente', value: '22-25°C', desc: '71.6-77°F<br>Menos camadas e sensação mais morna' },
      },
      table: {
        headers: { temperature: 'Temperatura', description: 'Sensação', typicalUse: 'Uso comum' },
        rows: [
          { temp: '16°C (60.8°F)', desc: 'Fresco e um pouco frio', use: 'Bom para ambientes internos mais ativos ou com layer leve', href: '/16-c-to-f' },
          { temp: '18°C (64.4°F)', desc: 'Fresco, mas confortável', use: 'Muito usado como referência para dormir e rotina tranquila', href: '/18-c-to-f' },
          { temp: '19°C (66.2°F)', desc: 'Confortável e levemente fresco', use: 'Boa configuração para casa, estudo e conforto com economia', highlight: true },
          { temp: '20°C (68°F)', desc: 'Temperatura ambiente clássica', use: 'Alvo comum para sala e escritório', href: '/20-c-to-f' },
          { temp: '21°C (69.8°F)', desc: 'Ambiente confortável', use: 'Parece um pouco mais quente para ficar muito tempo sentado', href: '/21-c-to-f' },
          { temp: '37°C (98.6°F)', desc: 'Temperatura corporal normal', use: 'Comparação útil quando a busca envolve o corpo humano', href: '/37-c-to-f' },
        ],
      },
      note:
        '<strong>Nota:</strong> 19°C costumam parecer confortáveis e eficientes dentro de casa, mas sol, umidade e circulação de ar ainda podem puxar a sensação para mais quente ou mais fresca.',
      faq: [
        {
          question: 'Quanto é 19 graus Celsius em Fahrenheit?',
          answerHtml:
            '<p>19 graus Celsius equivalem a 66,2 graus Fahrenheit. A fórmula é: °F = (°C × 9/5) + 32. Multiplicando 19 por 1,8, você chega a 34,2; somando 32, o resultado é 66,2°F.</p>',
        },
        {
          question: '19°C é febre?',
          answerHtml:
            '<p>Não. A temperatura corporal normal gira em torno de 37°C (98,6°F), e a febre geralmente começa perto de 38°C (100,4°F). Portanto, 19°C não têm relação com febre.</p>',
        },
        {
          question: 'Quanto é 16-19°C em Fahrenheit?',
          answerHtml:
            '<p>A faixa de 16°C a 19°C corresponde a 60,8°F a 66,2°F. Isso costuma cobrir temperaturas internas mais frescas e confortáveis ou clima ameno com necessidade de camada leve.</p>',
        },
        {
          question: 'Quanto é 19-20°C em Fahrenheit?',
          answerHtml:
            '<p>A faixa de 19°C a 20°C corresponde a 66,2°F a 68°F. É uma faixa muito comum para casas, quartos e escritórios.</p>',
        },
        {
          question: 'Como converter -19°C para Fahrenheit?',
          answerHtml:
            '<p>-19°C equivalem a -2,2°F. Isso já é frio forte de inverno e muito diferente de 19°C acima de zero.</p>',
        },
        {
          question: '19°C são quentes o suficiente para um ambiente?',
          answerHtml:
            '<p>Sim. 19°C são quentes o suficiente para um ambiente, e muita gente considera essa faixa confortavelmente fresca. Por isso é um ajuste bastante usado para equilibrar conforto e economia no aquecimento.</p>',
        },
      ],
      practicalTitle: '19°C (66,2°F) no dia a dia',
      cards: [
        { title: 'Conforto sem abafamento', body: 'Com 19°C, muitas casas e quartos ficam agradáveis sem parecer quentes demais ou abafados.' },
        { title: 'Boa temperatura de termostato', body: '19°C são usados com frequência como ajuste prático de termostato porque equilibram conforto e menor demanda de aquecimento.' },
        { title: 'Ótimos para rotinas calmas em ambientes internos', body: 'Ler, trabalhar, relaxar e dormir costumam ficar fáceis nessa temperatura porque o ambiente permanece confortável sem pesar.' },
      ],
    }),
  },
};

const lowPages = {
  fr: {
    page: {
      title: '1 Celsius en Fahrenheit | Calculatrice, formule et tableau',
      description:
        'Convertissez instantanément 1 degré Celsius en Fahrenheit. Retrouvez la formule (1 °C = 33,8 °F), des repères utiles et le contexte météo autour de cette température proche du gel.',
      intro:
        '1 °C (33,8 °F) se situe juste au-dessus du point de congélation de l’eau. Dans la vie courante, c’est typiquement une température où le givre, le vent froid et les surfaces glissantes commencent à compter.',
    },
    warning: {
      title: 'Prudence par temps froid à 1 °C (33,8 °F)',
      content:
        '<strong>1 °C n’est pas un grand froid, mais c’est suffisamment proche de 0 °C pour que les conditions changent vite.</strong> Routes humides, ponts, pare-brise, pelouses et trottoirs peuvent devenir glissants avant même que l’air ne passe officiellement sous zéro.',
    },
    context: {
      weather: {
        title: 'Ce que 1 °C veut dire côté météo',
        content:
          'En météo, 1 °C donne une sensation froide et très proche du gel. On voit souvent cette valeur lors des matins d’hiver, des trajets nocturnes ou des débuts de printemps encore exposés au givre.',
        items: [
          'Un manteau d’hiver ou plusieurs couches chaudes sont souvent adaptés',
          'Le vent rend 1 °C nettement plus piquant',
          'Le givre matinal reste possible même si la prévision reste au-dessus de zéro',
          'Rester immobile devient vite inconfortable',
        ],
      },
      safety: {
        title: 'Pourquoi 1 °C compte pour la sécurité',
        content:
          'Même à 1 °C, les surfaces ne suivent pas toujours exactement la température de l’air. L’ombre, l’altitude ou le refroidissement nocturne peuvent créer des plaques glissantes avant 0 °C.',
        items: [
          'Surveillez les ponts, trottoirs et pare-brise tôt le matin',
          'L’air froid et humide paraît souvent plus rude que le chiffre seul',
          'Habillez-vous chaudement si vous attendez dehors ou marchez longtemps',
          'Animaux, plantes et tuyaux exposés peuvent encore avoir besoin de protection',
        ],
      },
      environmental: {
        title: '1 °C dans son contexte',
        content:
          '1 °C se trouve juste au-dessus de l’un des seuils les plus importants du quotidien : le gel. C’est pour cela que beaucoup recherchent cette valeur avant de conduire, sortir ou vérifier la météo.',
        items: [
          '1 °C = 33,8 °F, donc juste au-dessus du point de congélation',
          'L’eau gèle à 0 °C (32 °F), soit seulement 1 degré plus bas',
          'La pluie froide à cette température paraît souvent plus dure qu’un air sec',
          'Certaines recherches mélangent 1 °C et température corporelle, d’où l’intérêt d’une comparaison avec la fièvre',
        ],
      },
    },
    negative: {
      result: '-1 °C en Fahrenheit',
      description:
        '-1 °C correspondent à <strong>{negativeFahrenheit} °F</strong>. Ce passage juste sous zéro change beaucoup en météo, car on entre réellement sous le point de congélation.',
    },
    faq: {
      items: [
        {
          question: 'Combien font 1 degré Celsius en Fahrenheit ?',
          answer: '1 degré Celsius correspond à 33,8 degrés Fahrenheit. La formule est : °F = (°C × 9/5) + 32. Pour 1 °C, on obtient donc (1 × 1,8) + 32 = 33,8 °F.',
        },
        {
          question: 'Quelle est la formule pour convertir 1 °C en Fahrenheit ?',
          answer: 'La formule est : °F = (°C × 9/5) + 32. Pour 1 °C, on multiplie 1 par 1,8 puis on ajoute 32 pour obtenir 33,8 °F.',
        },
        {
          question: 'Combien vaut 1 °C en Kelvin ?',
          answer: '1 °C correspond à 274,15 Kelvin. Pour convertir des degrés Celsius en Kelvin, on ajoute 273,15.',
        },
        {
          question: '1 °C correspond-il à de la fièvre ?',
          answer: 'Non. La fièvre humaine commence généralement autour de 38 °C (100,4 °F). 1 °C est extrêmement loin d’une température corporelle normale.',
        },
        {
          question: 'Comment convertir rapidement des Celsius en Fahrenheit ?',
          answer: 'Une astuce approximative consiste à doubler la valeur Celsius puis à ajouter environ 30. Pour 1 °C, cela donne environ 32 °F, ce qui reste proche du résultat exact de 33,8 °F.',
        },
        {
          question: 'À quelle température Celsius et Fahrenheit sont-ils égaux ?',
          answer: 'Les échelles Celsius et Fahrenheit se croisent à -40. Autrement dit, -40 °C = -40 °F.',
        },
        {
          question: 'Qu’est-ce que le zéro absolu en Celsius et en Fahrenheit ?',
          answer: 'Le zéro absolu correspond à -273,15 °C et à -459,67 °F. C’est la température théorique la plus basse possible.',
        },
      ],
    },
  },
  de: {
    page: {
      title: '1 Celsius in Fahrenheit | Rechner, Formel und Tabelle',
      description:
        'Wandle 1 Grad Celsius sofort in Fahrenheit um. Sieh die Formel (1 °C = 33,8 °F), praktische Vergleichswerte und den Wetterkontext knapp über dem Gefrierpunkt.',
      intro:
        '1 °C (33,8 °F) liegt knapp über dem Gefrierpunkt von Wasser. Im Alltag ist das genau der Bereich, in dem Frost, kalter Wind und rutschige Flächen relevant werden.',
    },
    warning: {
      title: 'Vorsicht bei 1 °C (33,8 °F)',
      content:
        '<strong>1 °C ist noch kein strenger Frost, aber nah genug am Gefrierpunkt, dass sich die Lage schnell ändern kann.</strong> Nasse Straßen, Brücken, Grasflächen und Autoscheiben können sich kälter anfühlen als die Luft und unter passenden Bedingungen bereits glatt werden.',
    },
    context: {
      weather: {
        title: 'Was 1 °C beim Wetter bedeutet',
        content:
          'Als Außentemperatur wirken 1 °C kalt und fast schon frostig. Dieser Wert kommt oft an Wintermorgen, bei späten Heimwegen oder an frühen Frühlingstagen mit Restfrost vor.',
        items: [
          'Ein Wintermantel oder mehrere warme Schichten passen meist gut',
          'Wind macht 1 °C deutlich schärfer',
          'Morgenfrost ist noch möglich, obwohl die Prognose knapp über null bleibt',
          'Wer stillsteht, friert bei dieser Temperatur schnell',
        ],
      },
      safety: {
        title: 'Warum 1 °C sicherheitsrelevant sind',
        content:
          'Auch bei 1 °C haben Oberflächen nicht immer exakt die gleiche Temperatur wie die Luft. Schatten, Höhe oder Auskühlung über Nacht können schon vor 0 °C für Glätte sorgen.',
        items: [
          'Brücken, Gehwege und Autoscheiben am Morgen im Blick behalten',
          'Kalte feuchte Luft wirkt oft härter als die Zahl allein',
          'Wer lange draußen wartet oder läuft, sollte sich warm anziehen',
          'Haustiere, Pflanzen und freiliegende Leitungen brauchen je nach Region weiter Schutz',
        ],
      },
      environmental: {
        title: '1 °C im Zusammenhang',
        content:
          '1 °C liegen direkt über einer der wichtigsten Alltagsschwellen: dem Gefrierpunkt. Genau deshalb wird dieser Wert oft bei Wetter, Straßen und Fahrtbedingungen gesucht.',
        items: [
          '1 °C = 33,8 °F, also knapp über dem Gefrierpunkt',
          'Wasser gefriert bei 0 °C (32 °F), nur 1 Grad darunter',
          'Kalter Regen wirkt bei dieser Temperatur oft unangenehmer als trockene Luft',
          'Manche Suchanfragen mischen 1 °C mit Körpertemperatur, daher hilft der Vergleich mit Fieberwerten',
        ],
      },
    },
    negative: {
      result: '-1 °C in Fahrenheit',
      description:
        '-1 °C entsprechen <strong>{negativeFahrenheit} °F</strong>. Dieser kleine Sprung unter null kann im Wetterbericht einen großen Unterschied machen, weil man damit tatsächlich unter dem Gefrierpunkt liegt.',
    },
    faq: {
      items: [
        {
          question: 'Wie viel sind 1 Grad Celsius in Fahrenheit?',
          answer: '1 Grad Celsius entsprechen 33,8 Grad Fahrenheit. Die Formel lautet: °F = (°C × 9/5) + 32. Für 1 °C ergibt sich also (1 × 1,8) + 32 = 33,8 °F.',
        },
        {
          question: 'Welche Formel nutze ich für 1 °C in Fahrenheit?',
          answer: 'Die Formel lautet: °F = (°C × 9/5) + 32. Bei 1 °C multipliziert man 1 mit 1,8 und addiert dann 32, um 33,8 °F zu erhalten.',
        },
        {
          question: 'Wie viel ist 1 °C in Kelvin?',
          answer: '1 °C entsprechen 274,15 Kelvin. Für die Umrechnung addiert man 273,15 zum Celsius-Wert.',
        },
        {
          question: 'Gilt 1 °C als Fieber?',
          answer: 'Nein. Fieber beginnt beim Menschen typischerweise erst um 38 °C (100,4 °F). 1 °C sind extrem weit von normaler Körpertemperatur entfernt.',
        },
        {
          question: 'Wie rechne ich Celsius schnell in Fahrenheit um?',
          answer: 'Als grobe Faustregel kann man den Celsius-Wert verdoppeln und etwa 30 addieren. Bei 1 °C kommt man so auf ungefähr 32 °F, nahe am exakten Wert von 33,8 °F.',
        },
        {
          question: 'Bei welcher Temperatur sind Celsius und Fahrenheit gleich?',
          answer: 'Die beiden Skalen treffen sich bei -40. Das heißt: -40 °C sind genau -40 °F.',
        },
        {
          question: 'Was ist der absolute Nullpunkt in Celsius und Fahrenheit?',
          answer: 'Der absolute Nullpunkt liegt bei -273,15 °C und -459,67 °F. Er beschreibt die theoretisch niedrigste mögliche Temperatur.',
        },
      ],
    },
  },
  ja: {
    page: {
      title: '1°Cを華氏に換算 | 計算機・公式・比較表',
      description:
        '1°Cをすぐに華氏へ換算できます。公式（1°C = 33.8°F）や比較の目安、氷点付近の天気としての意味も確認できます。',
      intro:
        '1°C（33.8°F）は、水の凍る温度のすぐ上です。日常では、霜、冷たい風、滑りやすい路面が気になり始める境目のような気温です。',
    },
    warning: {
      title: '1°C（33.8°F）付近では冷え込みに注意',
      content:
        '<strong>1°Cは真冬の厳しい寒さではありませんが、氷点に近いため状況が急に変わりやすい温度です。</strong> 濡れた道路、橋、草地、車の表面などは、条件次第で空気より先に凍り始めることがあります。',
    },
    context: {
      weather: {
        title: '1°Cという気温が意味するもの',
        content:
          '天気の感覚としては、1°Cはかなり寒く、ほぼ氷点といえる温度です。冬の朝や深夜の移動、霜が残る初春などによく見られます。',
        items: [
          '冬用コートや暖かい重ね着が合いやすい',
          '風があると1°Cはかなり鋭く感じる',
          '予報が0°C以上でも朝の霜は十分あり得る',
          '立ち止まっているとすぐに寒さを感じやすい',
        ],
      },
      safety: {
        title: '1°Cが安全面で重要な理由',
        content:
          '気温が1°Cでも、地面や金属の表面は必ずしも同じ温度とは限りません。日陰や放射冷却の影響で、公式気温が0°Cになる前から凍結する場所があります。',
        items: [
          '朝は橋、歩道、フロントガラスを特に確認する',
          '湿った冷気は数字以上に厳しく感じやすい',
          '長く外で待つならしっかり防寒した方がよい',
          '地域によっては植物、ペット、配管の保護もまだ必要',
        ],
      },
      environmental: {
        title: '1°Cを位置づけると',
        content:
          '1°Cは、日常生活でとても重要な境目である氷点のすぐ上です。そのため道路状況、車、外出予定、天気の確認でこの数値がよく検索されます。',
        items: [
          '1°C = 33.8°Fで、氷点のすぐ上',
          '水は0°C（32°F）で凍り、差はわずか1度',
          'この温度帯の冷たい雨は、乾いた空気より厳しく感じやすい',
          '1°Cを体温と勘違いする検索もあるため、発熱との比較が役立つ',
        ],
      },
    },
    negative: {
      result: '-1°Cを華氏に換算',
      description:
        '-1°Cは<strong>{negativeFahrenheit}°F</strong>です。天気ではこの1度の差で氷点下に入るため、路面状況や体感が大きく変わります。',
    },
    faq: {
      items: [
        {
          question: '1度Cは華氏で何度ですか？',
          answer: '1度Cは33.8度Fです。公式は「°F = (°C × 9/5) + 32」で、1°Cなら (1 × 1.8) + 32 = 33.8°F になります。',
        },
        {
          question: '1°Cを華氏に変える公式は何ですか？',
          answer: '公式は「°F = (°C × 9/5) + 32」です。1°Cの場合は1に1.8を掛けてから32を足し、33.8°Fになります。',
        },
        {
          question: '1°Cはケルビンでいくつですか？',
          answer: '1°Cは274.15 Kです。摂氏をケルビンに変えるときは、273.15を足します。',
        },
        {
          question: '1°Cは発熱ですか？',
          answer: 'いいえ。発熱は一般に38°C（100.4°F）前後からで、1°Cは体温としては正常値を大きく下回ります。',
        },
        {
          question: 'セルシウスをすばやく華氏に換算するには？',
          answer: 'ざっくりなら、摂氏を2倍して30を足す方法があります。1°Cなら約32°Fとなり、正確な33.8°Fに近い値になります。',
        },
        {
          question: '摂氏と華氏が同じ数字になるのは何度ですか？',
          answer: '摂氏と華氏が同じになるのは-40です。つまり、-40°C = -40°Fです。',
        },
        {
          question: '絶対零度は摂氏と華氏でいくつですか？',
          answer: '絶対零度は-273.15°C、-459.67°Fです。理論上もっとも低い温度です。',
        },
      ],
    },
  },
  ar: {
    page: {
      title: '1 مئوية إلى فهرنهايت | حاسبة وصيغة وجدول',
      description:
        'حوّل 1 درجة مئوية إلى فهرنهايت فوراً. تعرّف على الصيغة (1°C = 33.8°F) وعلى معنى هذه الدرجة عندما تكون الحرارة قريبة جداً من التجمد.',
      intro:
        '1°C (33.8°F) تقع مباشرة فوق نقطة تجمد الماء. في الحياة اليومية، هذه درجة يبدأ معها الصقيع والهواء البارد والأسطح الزلقة في أن تصبح مسألة مهمة.',
    },
    warning: {
      title: 'تنبيه للبرد عند 1°C (33.8°F)',
      content:
        '<strong>1°C ليست برداً قاسياً جداً، لكنها قريبة من التجمد بما يكفي لكي تتغيّر الظروف بسرعة.</strong> الطرق المبتلة، والجسور، والعشب، وزجاج السيارة قد تبرد أسرع من الهواء وتصبح زلقة في الظروف المناسبة.',
    },
    context: {
      weather: {
        title: 'ماذا تعني 1°C في الطقس؟',
        content:
          'من ناحية الطقس، 1°C تبدو باردة وقريبة جداً من التجمد. تظهر كثيراً في صباحات الشتاء، والتنقلات المتأخرة، وبدايات الربيع التي ما زال فيها احتمال للصقيع.',
        items: [
          'معطف شتوي أو عدة طبقات دافئة يكون مناسباً غالباً',
          'الهواء يجعل 1°C تبدو أبرد بشكل واضح',
          'الصقيع الصباحي ما يزال ممكناً حتى لو بقيت التوقعات فوق الصفر',
          'الوقوف بلا حركة يصبح غير مريح بسرعة',
        ],
      },
      safety: {
        title: 'لماذا تهم 1°C من ناحية السلامة؟',
        content:
          'حتى عند 1°C، لا تكون حرارة الأسطح دائماً مثل حرارة الهواء. الظل، والارتفاع، وبرودة الليل قد تجعل بعض الأماكن زلقة قبل أن يصل القياس الرسمي إلى 0°C.',
        items: [
          'راقب الجسور والأرصفة وزجاج السيارات في الصباح الباكر',
          'الهواء البارد الرطب يبدو أقسى من الرقم نفسه',
          'ارتدِ ملابس دافئة إذا كنت ستنتظر في الخارج أو تمشي لفترة',
          'في بعض المناطق ما تزال النباتات والحيوانات الأليفة والأنابيب المكشوفة بحاجة إلى حماية',
        ],
      },
      environmental: {
        title: '1°C في سياقها الصحيح',
        content:
          '1°C تقع مباشرة فوق أحد أهم الحدود الحرارية في الحياة اليومية: التجمد. لهذا يبحث الناس عن هذه الدرجة عند متابعة الطرق والطقس والسيارة والخطط الخارجية.',
        items: [
          '1°C = 33.8°F، أي أعلى بقليل من التجمد',
          'الماء يتجمد عند 0°C (32°F)، أي أقل بدرجة واحدة فقط',
          'المطر البارد عند هذه الدرجة يبدو أقسى من الهواء الجاف',
          'كثير من الناس يخلطون بين القيم الجوية المنخفضة وحرارة الجسم، لذلك يفيد ذكر الحمى للمقارنة',
        ],
      },
    },
    negative: {
      result: '-1 مئوية إلى فهرنهايت',
      description:
        '-1°C تساوي <strong>{negativeFahrenheit}°F</strong>. هذا الانتقال البسيط تحت الصفر قد يغيّر الكثير في التوقعات الجوية لأنك تصبح فعلياً تحت نقطة التجمد.',
    },
    faq: {
      items: [
        {
          question: 'كم تساوي 1 درجة مئوية بالفهرنهايت؟',
          answer: '1 درجة مئوية تساوي 33.8 درجة فهرنهايت. المعادلة هي °F = (°C × 9/5) + 32. بالنسبة إلى 1°C تصبح (1 × 1.8) + 32 = 33.8°F.',
        },
        {
          question: 'ما الصيغة لتحويل 1°C إلى فهرنهايت؟',
          answer: 'الصيغة هي °F = (°C × 9/5) + 32. عند 1°C نضرب 1 في 1.8 ثم نضيف 32 لنحصل على 33.8°F.',
        },
        {
          question: 'كم تساوي 1°C بالكلفن؟',
          answer: '1°C تساوي 274.15 كلفن. لتحويل مئوية إلى كلفن نضيف 273.15.',
        },
        {
          question: 'هل 1°C تعني حمّى؟',
          answer: 'لا. الحمى تبدأ عادة قرب 38°C (100.4°F)، لذا 1°C بعيدة جداً عن حرارة الجسم الطبيعية.',
        },
        {
          question: 'كيف أحوّل المئوية إلى فهرنهايت بسرعة؟',
          answer: 'هناك تقدير سريع وهو مضاعفة الرقم المئوي ثم إضافة نحو 30. عند 1°C يعطيك ذلك تقريباً 32°F، وهو قريب من الإجابة الدقيقة 33.8°F.',
        },
        {
          question: 'متى تتساوى المئوية والفهرنهايت؟',
          answer: 'تتساوى الدرجتان عند -40، أي إن -40°C تساوي تماماً -40°F.',
        },
        {
          question: 'ما الصفر المطلق بالمئوية والفهرنهايت؟',
          answer: 'الصفر المطلق يساوي -273.15°C و -459.67°F، وهو أدنى درجة حرارة ممكنة نظرياً.',
        },
      ],
    },
  },
  hi: {
    page: {
      title: '1 सेल्सियस को फ़ॉरेनहाइट में बदलें | कैलकुलेटर, फ़ॉर्मूला और चार्ट',
      description:
        '1 डिग्री सेल्सियस को तुरंत फ़ॉरेनहाइट में बदलें। फ़ॉर्मूला (1°C = 33.8°F), उपयोगी तुलना और जमाव बिंदु के आसपास के मौसम का मतलब समझें।',
      intro:
        '1°C (33.8°F) पानी के जमने के बिंदु से थोड़ा ऊपर होता है। रोज़मर्रा में यह वही तापमान है जहाँ पाला, ठंडी हवा और फिसलन जैसी चीज़ें अहम होने लगती हैं।',
    },
    warning: {
      title: '1°C (33.8°F) पर ठंड को हल्के में न लें',
      content:
        '<strong>1°C बहुत कड़ाके की ठंड नहीं है, लेकिन यह जमाव बिंदु के इतना पास है कि हालात जल्दी बदल सकते हैं।</strong> गीली सड़कें, पुल, घास और कार की सतहें हवा से ज़्यादा ठंडी होकर फिसलन पैदा कर सकती हैं।',
    },
    context: {
      weather: {
        title: 'मौसम के लिहाज़ से 1°C का मतलब',
        content:
          'मौसम में 1°C ठंडा और लगभग जमाव जैसा महसूस होता है। यह तापमान सर्द सुबह, देर रात के सफर और शुरुआती वसंत के उन दिनों में दिखता है जहाँ पाला अभी भी संभव होता है।',
        items: [
          'विंटर कोट या कई गरम लेयर आम तौर पर ठीक लगते हैं',
          'हवा चलने पर 1°C और भी तीखा लगता है',
          'पूर्वानुमान शून्य से ऊपर हो तब भी सुबह पाला पड़ सकता है',
          'कुछ देर स्थिर खड़े रहने पर जल्दी ठंड लगने लगती है',
        ],
      },
      safety: {
        title: 'सुरक्षा के लिहाज़ से 1°C क्यों अहम है',
        content:
          '1°C पर भी हर सतह का तापमान हवा के बराबर नहीं होता। छाया, ऊँचाई और रात की ठंडक से कुछ जगहें 0°C से पहले ही बर्फीली या फिसलन भरी हो सकती हैं।',
        items: [
          'सुबह पुल, फुटपाथ और कार के शीशे पर खास ध्यान दें',
          'ठंडी और नम हवा, असली तापमान से ज़्यादा कठोर लग सकती है',
          'अगर बाहर इंतज़ार या लंबी वॉक करनी है तो अच्छी तरह गरम कपड़े पहनें',
          'कुछ जगहों पर पालतू जानवर, पौधे और खुली पाइपलाइन को अभी भी सुरक्षा की ज़रूरत हो सकती है',
        ],
      },
      environmental: {
        title: '1°C को संदर्भ में समझें',
        content:
          '1°C रोज़मर्रा की ज़िंदगी की सबसे अहम सीमाओं में से एक, यानी freezing point, के ठीक ऊपर होता है। इसी वजह से लोग सड़क, मौसम, कार और बाहर जाने की योजना के लिए इस तापमान को खोजते हैं।',
        items: [
          '1°C = 33.8°F, यानी freezing point से थोड़ा ऊपर',
          'पानी 0°C (32°F) पर जमता है, जो सिर्फ 1 डिग्री कम है',
          'इस तापमान पर ठंडी बारिश, सूखी हवा से ज़्यादा कठोर लग सकती है',
          'कई लोग 1°C जैसे मौसम के तापमान को शरीर के तापमान से गड़बड़ा देते हैं, इसलिए बुखार से तुलना उपयोगी होती है',
        ],
      },
    },
    negative: {
      result: '-1°C को फ़ॉरेनहाइट में बदलें',
      description:
        '-1°C, <strong>{negativeFahrenheit}°F</strong> के बराबर होता है। मौसम के लिहाज़ से शून्य से नीचे की यह छोटी-सी छलांग भी बहुत फर्क डाल सकती है।',
    },
    faq: {
      items: [
        {
          question: '1 डिग्री सेल्सियस फ़ॉरेनहाइट में कितना होता है?',
          answer: '1 डिग्री सेल्सियस, 33.8 डिग्री फ़ॉरेनहाइट के बराबर होता है। फ़ॉर्मूला है: °F = (°C × 9/5) + 32. 1°C के लिए (1 × 1.8) + 32 = 33.8°F होता है।',
        },
        {
          question: '1°C को फ़ॉरेनहाइट में बदलने का फ़ॉर्मूला क्या है?',
          answer: 'फ़ॉर्मूला है: °F = (°C × 9/5) + 32. 1°C के लिए 1 को 1.8 से गुणा करें और 32 जोड़ें, तो 33.8°F मिलेगा।',
        },
        {
          question: '1°C केल्विन में कितना होता है?',
          answer: '1°C, 274.15 Kelvin के बराबर होता है। Celsius से Kelvin में जाने के लिए 273.15 जोड़ते हैं।',
        },
        {
          question: 'क्या 1°C बुखार माना जाता है?',
          answer: 'नहीं। इंसानों में बुखार आम तौर पर 38°C (100.4°F) के आसपास शुरू होता है। 1°C शरीर के सामान्य तापमान से बहुत नीचे है।',
        },
        {
          question: 'Celsius को जल्दी Fahrenheit में कैसे बदलें?',
          answer: 'एक आसान अंदाज़ा है कि Celsius को लगभग दोगुना करके 30 जोड़ दें। 1°C पर इससे करीब 32°F मिलता है, जो सही उत्तर 33.8°F के काफ़ी पास है।',
        },
        {
          question: 'Celsius और Fahrenheit कब बराबर होते हैं?',
          answer: 'दोनों स्केल -40 पर बराबर होते हैं। यानी -40°C और -40°F एक ही तापमान है।',
        },
        {
          question: 'Absolute zero Celsius और Fahrenheit में कितना होता है?',
          answer: 'Absolute zero, -273.15°C और -459.67°F होता है। यह सिद्धांततः सबसे कम संभव तापमान है।',
        },
      ],
    },
  },
  id: {
    page: {
      title: '1 Celsius ke Fahrenheit | Kalkulator, rumus, dan tabel',
      description:
        'Ubah 1 derajat Celsius ke Fahrenheit secara instan. Pelajari rumus (1°C = 33.8°F), lihat perbandingan praktis, dan pahami arti suhu yang sangat dekat dengan titik beku ini.',
      intro:
        '1°C (33.8°F) berada tepat di atas titik beku air. Dalam kehidupan sehari-hari, ini adalah suhu saat embun beku, angin dingin, dan permukaan licin mulai benar-benar terasa penting.',
    },
    warning: {
      title: 'Waspada dingin pada 1°C (33.8°F)',
      content:
        '<strong>1°C memang belum dingin ekstrem, tetapi cukup dekat ke titik beku sehingga kondisi bisa berubah cepat.</strong> Jalan basah, jembatan, rumput, dan kaca mobil bisa terasa lebih dingin daripada suhu udara dan mulai licin dalam kondisi tertentu.',
    },
    context: {
      weather: {
        title: 'Arti 1°C dalam cuaca',
        content:
          'Dalam konteks cuaca, 1°C terasa dingin dan sangat dekat ke titik beku. Suhu ini sering muncul pada pagi musim dingin, perjalanan malam, dan awal musim hujan atau musim semi yang masih berisiko embun beku.',
        items: [
          'Jaket tebal atau beberapa layer hangat biasanya cocok',
          'Angin membuat 1°C terasa jauh lebih tajam',
          'Embun beku pagi masih mungkin terjadi walau prakiraan sedikit di atas nol',
          'Berdiri diam lama-lama cepat terasa tidak nyaman',
        ],
      },
      safety: {
        title: 'Mengapa 1°C penting untuk keselamatan',
        content:
          'Pada 1°C, permukaan tidak selalu sama suhunya dengan udara. Area teduh, jembatan, dan permukaan yang melepas panas pada malam hari bisa menjadi licin sebelum suhu resmi mencapai 0°C.',
        items: [
          'Perhatikan jembatan, trotoar, dan kaca depan mobil di pagi hari',
          'Udara dingin yang lembap sering terasa lebih keras daripada angkanya',
          'Pakai pakaian hangat jika harus menunggu di luar atau berjalan lama',
          'Di beberapa daerah, tanaman, hewan peliharaan, dan pipa luar masih perlu perlindungan',
        ],
      },
      environmental: {
        title: 'Menempatkan 1°C dalam konteks',
        content:
          '1°C berada tepat di atas salah satu ambang paling penting dalam kehidupan sehari-hari: titik beku. Karena itu banyak orang mencari suhu ini saat memeriksa jalan, mobil, dan rencana di luar rumah.',
        items: [
          '1°C = 33.8°F, sedikit di atas titik beku',
          'Air membeku pada 0°C (32°F), hanya 1 derajat lebih rendah',
          'Hujan dingin pada suhu ini sering terasa lebih keras daripada udara kering',
          'Banyak orang juga membandingkan angka seperti 1°C dengan suhu tubuh, sehingga konteks demam masih relevan',
        ],
      },
    },
    negative: {
      result: '-1°C ke Fahrenheit',
      description:
        '-1°C sama dengan <strong>{negativeFahrenheit}°F</strong>. Turun hanya satu derajat ke bawah nol bisa mengubah banyak hal dalam prakiraan cuaca karena kita benar-benar masuk ke bawah titik beku.',
    },
    faq: {
      items: [
        {
          question: '1 derajat Celsius sama dengan berapa Fahrenheit?',
          answer: '1 derajat Celsius sama dengan 33.8 derajat Fahrenheit. Rumusnya adalah °F = (°C × 9/5) + 32. Untuk 1°C, hasilnya (1 × 1.8) + 32 = 33.8°F.',
        },
        {
          question: 'Apa rumus untuk mengubah 1°C ke Fahrenheit?',
          answer: 'Rumusnya adalah °F = (°C × 9/5) + 32. Pada 1°C, kita mengalikan 1 dengan 1.8 lalu menambah 32 untuk mendapatkan 33.8°F.',
        },
        {
          question: 'Berapa 1°C dalam Kelvin?',
          answer: '1°C sama dengan 274.15 Kelvin. Untuk mengubah Celsius ke Kelvin, tambahkan 273.15.',
        },
        {
          question: 'Apakah 1°C dianggap demam?',
          answer: 'Tidak. Demam manusia biasanya mulai di sekitar 38°C (100.4°F), jadi 1°C sangat jauh dari suhu tubuh normal.',
        },
        {
          question: 'Bagaimana cara cepat mengubah Celsius ke Fahrenheit?',
          answer: 'Trik kasar yang sering dipakai adalah menggandakan angka Celsius lalu menambah sekitar 30. Untuk 1°C hasilnya kira-kira 32°F, cukup dekat ke hasil tepat 33.8°F.',
        },
        {
          question: 'Pada suhu berapa Celsius dan Fahrenheit sama?',
          answer: 'Celsius dan Fahrenheit bernilai sama pada -40. Artinya -40°C sama persis dengan -40°F.',
        },
        {
          question: 'Berapa nol absolut dalam Celsius dan Fahrenheit?',
          answer: 'Nol absolut adalah -273.15°C dan -459.67°F. Itu adalah suhu teoretis paling rendah yang mungkin dicapai.',
        },
      ],
    },
  },
  'pt-br': {
    page: {
      title: '1 Celsius em Fahrenheit | Calculadora, fórmula e tabela',
      description:
        'Converta 1 grau Celsius em Fahrenheit instantaneamente. Veja a fórmula (1°C = 33,8°F), comparações práticas e o significado dessa temperatura tão próxima do ponto de congelamento.',
      intro:
        '1°C (33,8°F) fica logo acima do ponto de congelamento da água. No dia a dia, é aquela faixa em que geada, vento frio e superfícies escorregadias começam a importar de verdade.',
    },
    warning: {
      title: 'Cuidado com o frio em 1°C (33,8°F)',
      content:
        '<strong>1°C ainda não é frio extremo, mas está perto o bastante do congelamento para que as condições mudem rápido.</strong> Estradas molhadas, pontes, gramados e vidros do carro podem esfriar mais do que o ar e ficar escorregadios nas condições certas.',
    },
    context: {
      weather: {
        title: 'O que 1°C significa no tempo',
        content:
          'Em termos de clima, 1°C é frio e muito perto do congelamento. É comum em manhãs de inverno, deslocamentos à noite e dias de transição em que a geada ainda é possível.',
        items: [
          'Casaco de inverno ou várias camadas quentes costumam fazer sentido',
          'O vento deixa 1°C muito mais cortante',
          'Geada pela manhã ainda é possível mesmo com previsão um pouco acima de zero',
          'Ficar parado por muito tempo logo se torna desconfortável',
        ],
      },
      safety: {
        title: 'Por que 1°C importa para a segurança',
        content:
          'Mesmo a 1°C, as superfícies nem sempre têm a mesma temperatura do ar. Sombra, altitude e resfriamento noturno podem criar pontos escorregadios antes de a medição oficial chegar a 0°C.',
        items: [
          'Observe pontes, calçadas e para-brisas logo cedo',
          'Ar frio e úmido costuma parecer mais duro do que o número sugere',
          'Vale se agasalhar bem se você vai esperar ou caminhar por muito tempo',
          'Em algumas regiões, plantas, pets e canos expostos ainda precisam de proteção',
        ],
      },
      environmental: {
        title: '1°C em contexto',
        content:
          '1°C fica logo acima de um dos limites mais importantes da vida diária: o congelamento. Por isso tanta gente pesquisa essa temperatura ao conferir estradas, carro, tempo e planos ao ar livre.',
        items: [
          '1°C = 33,8°F, ou seja, um pouco acima do congelamento',
          'A água congela a 0°C (32°F), só 1 grau abaixo',
          'Chuva fria nessa faixa costuma parecer mais dura do que ar seco',
          'Muita gente também confunde 1°C com temperatura corporal, então a comparação com febre pode ajudar',
        ],
      },
    },
    negative: {
      result: '-1°C em Fahrenheit',
      description:
        '-1°C equivalem a <strong>{negativeFahrenheit}°F</strong>. Essa pequena descida abaixo de zero já muda bastante o cenário no tempo porque você passa de fato para abaixo do congelamento.',
    },
    faq: {
      items: [
        {
          question: 'Quanto é 1 grau Celsius em Fahrenheit?',
          answer: '1 grau Celsius equivale a 33,8 graus Fahrenheit. A fórmula é: °F = (°C × 9/5) + 32. Para 1°C, isso vira (1 × 1,8) + 32 = 33,8°F.',
        },
        {
          question: 'Qual é a fórmula para converter 1°C em Fahrenheit?',
          answer: 'A fórmula é: °F = (°C × 9/5) + 32. Em 1°C, basta multiplicar 1 por 1,8 e depois somar 32 para chegar a 33,8°F.',
        },
        {
          question: 'Quanto vale 1°C em Kelvin?',
          answer: '1°C equivalem a 274,15 Kelvin. Para converter Celsius em Kelvin, some 273,15.',
        },
        {
          question: '1°C é febre?',
          answer: 'Não. A febre humana normalmente começa em torno de 38°C (100,4°F). 1°C está muito longe da temperatura corporal normal.',
        },
        {
          question: 'Como converter Celsius em Fahrenheit rapidamente?',
          answer: 'Uma aproximação comum é dobrar o número em Celsius e somar cerca de 30. Para 1°C, isso dá perto de 32°F, bem próximo do valor exato de 33,8°F.',
        },
        {
          question: 'Em que temperatura Celsius e Fahrenheit são iguais?',
          answer: 'As duas escalas se igualam em -40. Ou seja: -40°C = -40°F.',
        },
        {
          question: 'Qual é o zero absoluto em Celsius e Fahrenheit?',
          answer: 'O zero absoluto é -273,15°C e -459,67°F. É a menor temperatura teoricamente possível.',
        },
      ],
    },
  },
};

for (const [locale, slugs] of Object.entries(roomPages)) {
  for (const [slug, data] of Object.entries(slugs)) {
    writeJson(path.join('locales', locale, `${slug}-c-to-f.json`), data);
  }
}

for (const [locale, data] of Object.entries(lowPages)) {
  writeJson(path.join('locales', locale, '1-c-to-f.json'), data);
}

console.log('Localized locale files generated for 16/17/19/1.');
