const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = [12, 13, 14, 15];

function toF(c) {
  return ((c * 9) / 5 + 32).toFixed(1).replace(/\.0$/, '');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function frSpec(c) {
  const f = toF(c).replace('.', ',');

  if (c === 12) {
    return {
      seoTitle: '12 \u00b0C en Fahrenheit (53,6 \u00b0F) : conversion, ressenti et v\u00eatements',
      seoDesc:
        'Convertissez 12 \u00b0C en 53,6 \u00b0F et voyez comment cette temp\u00e9rature se ressent au quotidien, dehors et c\u00f4t\u00e9 tenue.',
      subtitle: 'Assez frais pour penser \u00e0 une veste l\u00e9g\u00e8re',
      intro:
        '12 \u00b0C (53,6 \u00b0F) correspondent \u00e0 une temp\u00e9rature fra\u00eeche, mais pas vraiment froide. Beaucoup de gens pensent d\u00e9j\u00e0 \u00e0 une couche l\u00e9g\u00e8re, surtout pour marcher ou rester dehors un moment.',
      currentDesc: 'Frais mais supportable',
      currentUse: 'Une couche aide vite \u00e0 se sentir mieux',
      note:
        "\u00c0 cette temp\u00e9rature, l'ombre, l'air humide et le vent peuvent faire para\u00eetre la journ\u00e9e nettement plus fra\u00eeche.",
      faqs: [
        ['12 \u00b0C, cela fait combien en Fahrenheit ?', '12 \u00b0C correspondent \u00e0 53,6 \u00b0F.'],
        [
          '12 \u00b0C, est-ce plut\u00f4t frais ?',
          'Oui. 12 \u00b0C paraissent frais pour la plupart des gens, sans aller jusqu\u2019au froid dur.',
        ],
        ['Que valent -12 \u00b0C en Fahrenheit ?', '-12 \u00b0C correspondent \u00e0 10,4 \u00b0F.'],
        [
          'Que porter \u00e0 12 \u00b0C ?',
          'Une couche l\u00e9g\u00e8re, une petite veste ou un pull fin suffisent souvent.',
        ],
        [
          '12 \u00b0C, est-ce agr\u00e9able pour marcher ?',
          'Oui, avec une couche l\u00e9g\u00e8re, 12 \u00b0C conviennent bien \u00e0 la marche et aux petits trajets du quotidien.',
        ],
        [
          '12 \u00b0C, est-ce de la fi\u00e8vre ?',
          'Non. Chez l\u2019humain, la fi\u00e8vre commence en g\u00e9n\u00e9ral autour de 38 \u00b0C.',
        ],
      ],
      cards: [
        [
          'Une vraie temp\u00e9rature de veste l\u00e9g\u00e8re',
          "\u00c0 12 \u00b0C, on sort rarement en simple t-shirt. Une couche l\u00e9g\u00e8re change vite le confort.",
        ],
        [
          'Bien pour marcher, moins pour rester immobile',
          "\u00c0 12 \u00b0C, on est souvent bien en bougeant. \u00c0 l'arr\u00eat, surtout avec du vent, la fra\u00eecheur se remarque vite.",
        ],
        [
          "Le vent et l'humidit\u00e9 comptent beaucoup",
          "\u00c0 cette temp\u00e9rature, l'ombre, l'air humide et le vent peuvent faire para\u00eetre la journ\u00e9e nettement plus fra\u00eeche.",
        ],
      ],
    };
  }

  if (c === 13) {
    return {
      seoTitle: '13 \u00b0C en Fahrenheit (55,4 \u00b0F) : conversion, ressenti et v\u00eatements',
      seoDesc:
        'Convertissez 13 \u00b0C en 55,4 \u00b0F et voyez si cette temp\u00e9rature para\u00eet fra\u00eeche, douce ou facile \u00e0 vivre au quotidien.',
      subtitle: 'Toujours frais, mais plus simple \u00e0 g\u00e9rer',
      intro:
        '13 \u00b0C (55,4 \u00b0F) restent dans une zone fra\u00eeche, mais d\u00e9j\u00e0 plus facile \u00e0 vivre que 10 ou 12 \u00b0C. Cela fonctionne bien pour les trajets, la marche et les sorties ordinaires avec une couche l\u00e9g\u00e8re.',
      currentDesc: 'Frais mais assez facile',
      currentUse: 'Pratique pour marcher et se d\u00e9placer',
      note:
        "La meilleure option est souvent une couche qu'on peut garder dehors puis enlever \u00e0 l'int\u00e9rieur.",
      faqs: [
        ['13 \u00b0C, cela fait combien en Fahrenheit ?', '13 \u00b0C correspondent \u00e0 55,4 \u00b0F.'],
        [
          '13 \u00b0C, est-ce encore frais ?',
          'Oui. 13 \u00b0C restent frais, m\u00eame si la sensation est souvent plus souple qu\u2019\u00e0 12 \u00b0C.',
        ],
        ['Que valent -13 \u00b0C en Fahrenheit ?', '-13 \u00b0C correspondent \u00e0 8,6 \u00b0F.'],
        [
          'Que porter \u00e0 13 \u00b0C ?',
          'Une veste l\u00e9g\u00e8re, un sweat ou une surchemise fonctionnent bien avec un pantalon long.',
        ],
        [
          '13 \u00b0C, est-ce pratique pour les trajets quotidiens ?',
          'Oui. C\u2019est une temp\u00e9rature tr\u00e8s g\u00e9rable pour les d\u00e9placements ordinaires si l\u2019on est habill\u00e9 l\u00e9g\u00e8rement mais correctement.',
        ],
        [
          '13 \u00b0C, est-ce de la fi\u00e8vre ?',
          'Non. La fi\u00e8vre humaine commence plut\u00f4t vers 38 \u00b0C.',
        ],
      ],
      cards: [
        [
          'Un temps frais mais simple \u00e0 porter',
          '13 \u00b0C ne demandent pas une tenue lourde, mais une couche reste souvent bienvenue.',
        ],
        [
          'Tr\u00e8s correct pour la routine',
          'Cette temp\u00e9rature convient bien aux trajets, \u00e0 la marche et aux petites sorties du quotidien.',
        ],
        [
          'Une tenue facile \u00e0 enlever fonctionne bien',
          "La meilleure option est souvent une couche qu'on peut garder dehors puis enlever \u00e0 l'int\u00e9rieur.",
        ],
      ],
    };
  }

  if (c === 14) {
    return {
      seoTitle: '14 \u00b0C en Fahrenheit (57,2 \u00b0F) : conversion, ressenti et v\u00eatements',
      seoDesc:
        'Convertissez 14 \u00b0C en 57,2 \u00b0F et voyez si cette temp\u00e9rature para\u00eet fra\u00eeche, agr\u00e9able ou facile \u00e0 porter au quotidien.',
      subtitle: 'Frais et agr\u00e9able avec une couche l\u00e9g\u00e8re',
      intro:
        '14 \u00b0C (57,2 \u00b0F) donnent souvent une impression fra\u00eeche mais confortable. Beaucoup de gens y voient un temps agr\u00e9able pour marcher, sortir ou passer du temps dehors avec une veste l\u00e9g\u00e8re.',
      currentDesc: 'Frais et agr\u00e9able',
      currentUse: 'Bien avec une veste l\u00e9g\u00e8re',
      note:
        "En marchant, 14 \u00b0C paraissent souvent plus doux qu'en restant assis dans l'ombre.",
      faqs: [
        ['14 \u00b0C, cela fait combien en Fahrenheit ?', '14 \u00b0C correspondent \u00e0 57,2 \u00b0F.'],
        [
          '14 \u00b0C, est-ce encore frais ?',
          'Oui, mais souvent d\u2019une mani\u00e8re agr\u00e9able. On est plus dans la fra\u00eecheur confortable que dans le froid.',
        ],
        ['Que valent -14 \u00b0C en Fahrenheit ?', '-14 \u00b0C correspondent \u00e0 6,8 \u00b0F.'],
        [
          'Que porter \u00e0 14 \u00b0C ?',
          'Une veste l\u00e9g\u00e8re, un petit pull ou une surchemise suffisent souvent.',
        ],
        [
          '14 \u00b0C, est-ce une bonne temp\u00e9rature pour rester dehors ?',
          'Oui, dans beaucoup de cas. C\u2019est une temp\u00e9rature qui se pr\u00eate bien \u00e0 la marche et aux sorties ordinaires.',
        ],
        [
          '14 \u00b0C, est-ce de la fi\u00e8vre ?',
          'Non. La fi\u00e8vre ne commence pas \u00e0 14 \u00b0C, mais bien plus haut, autour de 38 \u00b0C.',
        ],
      ],
      cards: [
        [
          'Une fra\u00eecheur facile \u00e0 vivre',
          "14 \u00b0C donnent souvent envie d'une petite veste, mais restent confortables pour les sorties ordinaires.",
        ],
        [
          'Dehors, on est souvent bien',
          'Pour marcher, bouger ou passer un peu de temps dehors, cette temp\u00e9rature est souvent agr\u00e9able.',
        ],
        [
          'Le mouvement change beaucoup la sensation',
          "En marchant, 14 \u00b0C paraissent souvent plus doux qu'en restant assis dans l'ombre.",
        ],
      ],
    };
  }

  return {
    seoTitle: '15 \u00b0C en Fahrenheit (59 \u00b0F) : conversion, ressenti et v\u00eatements',
    seoDesc:
      'Convertissez 15 \u00b0C en 59 \u00b0F et voyez comment cette temp\u00e9rature se ressent entre fra\u00eecheur l\u00e9g\u00e8re et temps doux.',
    subtitle: 'Une m\u00e9t\u00e9o douce avec encore un fond frais',
    intro:
      '15 \u00b0C (59 \u00b0F) sont souvent per\u00e7us comme une temp\u00e9rature douce, avec encore une petite fra\u00eecheur. En ext\u00e9rieur, cela semble agr\u00e9able \u00e0 beaucoup de gens ; \u00e0 l\u2019ombre ou sans bouger, une couche l\u00e9g\u00e8re reste utile.',
    currentDesc: 'Doux avec un fond frais',
    currentUse: 'Tr\u00e8s correct pour sortir',
    note:
      "M\u00eame \u00e0 15 \u00b0C, une zone ombrag\u00e9e ou venteuse peut vite redonner une impression de fra\u00eecheur.",
    faqs: [
      ['15 \u00b0C, cela fait combien en Fahrenheit ?', '15 \u00b0C correspondent \u00e0 59 \u00b0F.'],
      [
        '15 \u00b0C, est-ce encore frais ?',
        '15 \u00b0C paraissent souvent doux, m\u00eame si l\u2019air garde encore un c\u00f4t\u00e9 frais.',
      ],
      ['Que valent -15 \u00b0C en Fahrenheit ?', '-15 \u00b0C correspondent \u00e0 5 \u00b0F.'],
      [
        'Que porter \u00e0 15 \u00b0C ?',
        'Une veste l\u00e9g\u00e8re, un gilet ou un haut \u00e0 manches longues fonctionnent bien dans cette plage.',
      ],
      [
        '15 \u00b0C, est-ce une temp\u00e9rature confortable ?',
        'Pour beaucoup de gens, oui, surtout dehors. \u00c0 l\u2019int\u00e9rieur ou avec du vent, une petite couche peut encore \u00eatre utile.',
      ],
      [
        '15 \u00b0C, est-ce de la fi\u00e8vre ?',
        'Non. Une fi\u00e8vre humaine se situe g\u00e9n\u00e9ralement autour de 38 \u00b0C ou plus.',
      ],
    ],
    cards: [
      [
        'D\u00e9j\u00e0 plus doux que froid',
        '\u00c0 15 \u00b0C, on n\u2019est plus vraiment dans la sensation de froid pour la plupart des gens.',
      ],
      [
        'Tr\u00e8s bien pour les plans du quotidien',
        'Cette temp\u00e9rature convient bien aux sorties, aux trajets et aux activit\u00e9s l\u00e9g\u00e8res.',
      ],
      [
        "L'ombre et le vent gardent de l'importance",
        'M\u00eame \u00e0 15 \u00b0C, une zone ombrag\u00e9e ou venteuse peut vite redonner une impression de fra\u00eecheur.',
      ],
    ],
  };
}

function deSpec(c) {
  const f = toF(c).replace('.', ',');

  if (c === 12) {
    return {
      seoTitle: '12\u00b0C in Fahrenheit (53,6\u00b0F): Umrechnung, Gef\u00fchl und Kleidung',
      seoDesc:
        'Rechnen Sie 12\u00b0C in 53,6\u00b0F um und sehen Sie, wie sich diese Temperatur drau\u00dfen, im Alltag und bei der Kleidung anf\u00fchlt.',
      subtitle: 'K\u00fchl genug f\u00fcr eine leichte Jacke',
      intro:
        '12\u00b0C (53,6\u00b0F) f\u00fchlen sich f\u00fcr viele Menschen klar k\u00fchl an, aber nicht hart kalt. Eine leichte Jacke oder zus\u00e4tzliche Schicht macht hier oft schon viel aus.',
      currentDesc: 'K\u00fchl, aber gut machbar',
      currentUse: 'Mit einer Schicht deutlich angenehmer',
      note: 'Wind, Schatten und feuchte Luft lassen 12\u00b0C deutlich k\u00fchler wirken.',
      faqs: [
        ['Wie viel sind 12\u00b0C in Fahrenheit?', '12\u00b0C entsprechen 53,6\u00b0F.'],
        [
          'F\u00fchlen sich 12\u00b0C eher k\u00fchl an?',
          'Ja. 12\u00b0C wirken f\u00fcr die meisten Menschen k\u00fchl, aber noch nicht unangenehm hart.',
        ],
        ['Wie viel sind minus 12\u00b0C in Fahrenheit?', '-12\u00b0C entsprechen 10,4\u00b0F.'],
        [
          'Was zieht man bei 12\u00b0C an?',
          'Eine leichte Jacke, ein d\u00fcnner Pullover oder eine zus\u00e4tzliche Schicht passt hier oft gut.',
        ],
        [
          'Sind 12\u00b0C gut zum Spazieren?',
          'Ja. Mit einer leichten Schicht sind 12\u00b0C meist gut f\u00fcr Spazierg\u00e4nge und normale Wege im Alltag geeignet.',
        ],
        ['Ist 12\u00b0C Fieber?', 'Nein. Fieber beginnt beim Menschen meist erst ab etwa 38\u00b0C.'],
      ],
      cards: [
        [
          'Eine klare Jacken-Temperatur',
          'Bei 12\u00b0C denken viele Menschen schon automatisch an eine leichte Jacke oder zus\u00e4tzliche Schicht.',
        ],
        [
          'In Bewegung meist angenehmer',
          'Beim Gehen f\u00fchlen sich 12\u00b0C oft besser an als beim stillen Warten im Schatten.',
        ],
        [
          'Wind und Feuchtigkeit z\u00e4hlen mit',
          'Wind, Schatten und feuchte Luft lassen 12\u00b0C deutlich k\u00fchler wirken.',
        ],
      ],
    };
  }

  if (c === 13) {
    return {
      seoTitle: '13\u00b0C in Fahrenheit (55,4\u00b0F): Umrechnung, Gef\u00fchl und Kleidung',
      seoDesc:
        'Rechnen Sie 13\u00b0C in 55,4\u00b0F um und sehen Sie, ob sich diese Temperatur eher frisch, mild oder gut alltagstauglich anf\u00fchlt.',
      subtitle: 'Noch k\u00fchl, aber schon leichter zu tragen',
      intro:
        '13\u00b0C (55,4\u00b0F) bleiben frisch, f\u00fchlen sich aber meist etwas leichter an als 10 oder 12\u00b0C. F\u00fcr Alltag, Wege und normale Au\u00dfenzeit ist das oft eine gut machbare Temperatur.',
      currentDesc: 'Frisch, aber gut alltagstauglich',
      currentUse: 'Passt gut zu Wegen und Alltag',
      note:
        'Am besten funktionieren leichte Lagen, die man drau\u00dfen tragen und drinnen schnell ablegen kann.',
      faqs: [
        ['Wie viel sind 13\u00b0C in Fahrenheit?', '13\u00b0C entsprechen 55,4\u00b0F.'],
        [
          'Sind 13\u00b0C noch eher k\u00fchl?',
          'Ja. 13\u00b0C bleiben klar frisch, auch wenn sie im Alltag oft schon recht angenehm wirken.',
        ],
        ['Wie viel sind minus 13\u00b0C in Fahrenheit?', '-13\u00b0C entsprechen 8,6\u00b0F.'],
        [
          'Was zieht man bei 13\u00b0C an?',
          'Eine leichte Jacke, ein Sweatshirt oder eine Overshirt-Schicht funktionieren hier meist gut.',
        ],
        [
          'Sind 13\u00b0C f\u00fcr Alltag und Wege angenehm?',
          'Ja. F\u00fcr kurze Wege, Pendeln und normale Erledigungen sind 13\u00b0C meist gut machbar.',
        ],
        [
          'Ist 13\u00b0C Fieber?',
          'Nein. Fieber liegt beim Menschen deutlich h\u00f6her, meist erst ab etwa 38\u00b0C.',
        ],
      ],
      cards: [
        [
          'Klar frisch, aber nicht schwer',
          '13\u00b0C f\u00fchlen sich noch k\u00fchl an, ohne gleich unangenehm zu werden.',
        ],
        [
          'Gut f\u00fcr den normalen Tagesablauf',
          'Wege, kurze Besorgungen und Bewegung drau\u00dfen passen oft gut zu dieser Temperatur.',
        ],
        [
          'Praktisch sind Schichten zum An- und Ausziehen',
          'Am besten funktionieren leichte Lagen, die man drau\u00dfen tragen und drinnen schnell ablegen kann.',
        ],
      ],
    };
  }

  if (c === 14) {
    return {
      seoTitle: '14\u00b0C in Fahrenheit (57,2\u00b0F): Umrechnung, Gef\u00fchl und Kleidung',
      seoDesc:
        'Rechnen Sie 14\u00b0C in 57,2\u00b0F um und sehen Sie, ob sich diese Temperatur eher frisch, angenehm oder leicht zu tragen anf\u00fchlt.',
      subtitle: 'Frisch und angenehm mit leichter Jacke',
      intro:
        '14\u00b0C (57,2\u00b0F) wirken oft frisch, aber angenehm. F\u00fcr Spazierg\u00e4nge, Alltag und drau\u00dfen sein ist das h\u00e4ufig eine Temperatur, die mit leichter Jacke sehr gut funktioniert.',
      currentDesc: 'Frisch und angenehm',
      currentUse: 'Gut f\u00fcr leichte Jacke',
      note:
        'Wer l\u00e4uft, empfindet 14\u00b0C meist milder als jemand, der still im Schatten sitzt.',
      faqs: [
        ['Wie viel sind 14\u00b0C in Fahrenheit?', '14\u00b0C entsprechen 57,2\u00b0F.'],
        [
          'Sind 14\u00b0C noch k\u00fchl?',
          'Ja, aber oft auf eine angenehme Art. Viele Menschen empfinden diese Temperatur eher als frisch als als kalt.',
        ],
        ['Wie viel sind minus 14\u00b0C in Fahrenheit?', '-14\u00b0C entsprechen 6,8\u00b0F.'],
        [
          'Was zieht man bei 14\u00b0C an?',
          'Eine leichte Jacke, ein d\u00fcnner Pullover oder eine zus\u00e4tzliche Lage reichen meist aus.',
        ],
        [
          'Sind 14\u00b0C angenehm f\u00fcr drau\u00dfen?',
          'Ja. F\u00fcr Spazierg\u00e4nge, Wege und normale Au\u00dfenaktivit\u00e4ten passen 14\u00b0C in vielen F\u00e4llen gut.',
        ],
        [
          'Ist 14\u00b0C Fieber?',
          'Nein. Eine K\u00f6rpertemperatur in diesem Bereich w\u00e4re viel zu niedrig, nicht zu hoch.',
        ],
      ],
      cards: [
        [
          'Frische, die gut funktioniert',
          '14\u00b0C sind oft genau die Art von Wetter, bei der eine leichte Jacke reicht und man sich drau\u00dfen gut bewegen kann.',
        ],
        [
          'F\u00fcr drau\u00dfen meist sehr brauchbar',
          'Spazieren, kurze Wege und Alltag drau\u00dfen f\u00fchlen sich bei dieser Temperatur oft angenehm an.',
        ],
        [
          'In Bewegung oft besser als im Sitzen',
          'Wer l\u00e4uft, empfindet 14\u00b0C meist milder als jemand, der still im Schatten sitzt.',
        ],
      ],
    };
  }

  return {
    seoTitle: '15\u00b0C in Fahrenheit (59\u00b0F): Umrechnung, Gef\u00fchl und Kleidung',
    seoDesc:
      'Rechnen Sie 15\u00b0C in 59\u00b0F um und sehen Sie, wie sich diese Temperatur zwischen leichter Frische und mildem Wetter anf\u00fchlt.',
    subtitle: 'Schon mild, aber noch mit etwas frischer Luft',
    intro:
      '15\u00b0C (59\u00b0F) wirken f\u00fcr viele Menschen schon recht mild, haben aber oft noch einen frischen Rand. Drau\u00dfen f\u00fchlt sich das meist angenehm an, w\u00e4hrend drinnen oder im Wind eine leichte Schicht weiter helfen kann.',
    currentDesc: 'Mild mit frischem Rand',
    currentUse: 'Gut f\u00fcr Spaziergang und Alltag',
    note:
      'Auch bei 15\u00b0C k\u00f6nnen Wind und Schatten die Temperatur noch einmal sp\u00fcrbar frischer wirken lassen.',
    faqs: [
      ['Wie viel sind 15\u00b0C in Fahrenheit?', '15\u00b0C entsprechen 59\u00b0F.'],
      ['F\u00fchlen sich 15\u00b0C noch frisch an?', 'Oft ja, aber eher mild-frisch als richtig k\u00fchl.'],
      ['Wie viel sind minus 15\u00b0C in Fahrenheit?', '-15\u00b0C entsprechen 5\u00b0F.'],
      [
        'Was zieht man bei 15\u00b0C an?',
        'Eine leichte Jacke, eine d\u00fcnne Strickschicht oder lange \u00c4rmel reichen oft schon aus.',
      ],
      [
        'Sind 15\u00b0C eine angenehme Temperatur?',
        'F\u00fcr viele Menschen ja, vor allem drau\u00dfen. Im Schatten oder bei Wind kann es aber noch frisch wirken.',
      ],
      [
        'Ist 15\u00b0C Fieber?',
        'Nein. Fieber beginnt beim Menschen in der Regel erst in der N\u00e4he von 38\u00b0C.',
      ],
    ],
    cards: [
      [
        'Mehr mild als kalt',
        'Bei 15\u00b0C f\u00fchlen sich viele schon eher in mildem Wetter als in K\u00e4lte.',
      ],
      [
        'Gut f\u00fcr Alltag und leichte Pl\u00e4ne drau\u00dfen',
        'Spazierg\u00e4nge, Wege und normale Au\u00dfenzeit funktionieren bei 15\u00b0C meist sehr gut.',
      ],
      [
        'Wind und Schatten bleiben wichtig',
        'Auch bei 15\u00b0C k\u00f6nnen Wind und Schatten die Temperatur noch einmal sp\u00fcrbar frischer wirken lassen.',
      ],
    ],
  };
}

function rewriteLocale(locale, specFactory) {
  for (const c of PAGES) {
    const file = path.join(ROOT, 'locales', locale, `${c}-c-to-f.json`);
    const data = readJson(file);
    const spec = specFactory(c);
    const ff = toF(c).replace('.', ',');

    data.seo.title = spec.seoTitle;
    data.seo.description = spec.seoDesc;
    data.header.title =
      locale === 'fr'
        ? `${c} \u00b0C en Fahrenheit (${ff} \u00b0F)`
        : `${c}\u00b0C in Fahrenheit (${ff}\u00b0F)`;
    data.header.tagline = spec.seoDesc;
    data.conversion.intro =
      locale === 'fr'
        ? `${c} \u00b0C correspondent \u00e0 ${ff} \u00b0F.`
        : `${c}\u00b0C entsprechen ${ff}\u00b0F.`;
    data.strategy.keywords =
      locale === 'fr'
        ? `${c} c en fahrenheit, ${c} celsius en fahrenheit, ${c} degr\u00e9s ressenti`
        : `${c} c in fahrenheit, ${c} celsius in fahrenheit, ${c} grad gef\u00fchl`;
    data.comfortGuide.title =
      locale === 'fr' ? `Ressenti autour de ${c} \u00b0C` : `So f\u00fchlen sich ${c}\u00b0C an`;
    data.comfortGuide.subtitle = spec.subtitle;
    data.comfortGuide.intro = spec.intro;
    data.comfortGuide.table.rows[2].desc = spec.currentDesc;
    data.comfortGuide.table.rows[2].use = spec.currentUse;
    data.comfortGuide.note =
      locale === 'fr'
        ? `<strong>Remarque :</strong> ${spec.note}`
        : `<strong>Hinweis:</strong> ${spec.note}`;
    data.faq = spec.faqs.map(([question, answer]) => ({
      question,
      answerHtml: `<p>${answer}</p>`,
    }));
    data.practicalApplications.title =
      locale === 'fr'
        ? `${c} \u00b0C (${ff} \u00b0F) au quotidien`
        : `${c}\u00b0C (${ff}\u00b0F) im Alltag`;
    data.practicalApplications.cards = spec.cards.map(([title, body]) => ({ title, body }));

    writeJson(file, data);
  }
}

rewriteLocale('fr', frSpec);
rewriteLocale('de', deSpec);

console.log('Rewrote fr/de cool-room pages 12-15 in clean UTF-8.');
