export interface DuaItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ar: string;
  source_en: string;
  source_ar: string;
  surah_id: number;
  verse_number: number;
  category_en: string;
  category_ar: string;
}

export const DUAS_LIST: DuaItem[] = [
  {
    id: "rabbana-atina",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
    translation_en: "Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.",
    translation_ar: "طلب الخير في الدنيا والآخرة والوقاية من النار.",
    source_en: "Al-Baqarah 2:201",
    source_ar: "البقرة ٢:٢٠١",
    surah_id: 2,
    verse_number: 201,
    category_en: "Goodness & Protection",
    category_ar: "الخير والوقاية"
  },
  {
    id: "dua-parents",
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbi irhamhuma kama rabbayani saghira",
    translation_en: "My Lord, have mercy upon them as they brought me up [when I was] small.",
    translation_ar: "الدعاء للوالدين بالرحمة والمغفرة عرفاناً بجميلهما.",
    source_en: "Al-Isra 17:24",
    source_ar: "الإسراء ١٧:٢٤",
    surah_id: 17,
    verse_number: 24,
    category_en: "Parents",
    category_ar: "الوالدين"
  },
  {
    id: "prophet-yunus",
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu mina adh-dhalimin",
    translation_en: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    translation_ar: "دعاء ذي النون (يونس عليه السلام) في كشف الكروب والهموم.",
    source_en: "Al-Anbya 21:87",
    source_ar: "الأنبياء ٢١:٨٧",
    surah_id: 21,
    verse_number: 87,
    category_en: "Relief & Repentance",
    category_ar: "تفريج الهم والاستغفار"
  },
  {
    id: "prophet-musa-ease",
    arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
    transliteration: "Rabbi ishrah li sadri wa yassir li amri dunya vahlul 'uqdatan min lisani yafqahu qawli",
    translation_en: "My Lord, expand for me my breast [with assurance] and ease for me my task and untie the knot from my tongue that they may understand my speech.",
    translation_ar: "دعاء موسى عليه السلام لطلب تيسير الأمور وشرح الصدر وبلاغة القول.",
    source_en: "Ta-Ha 20:25-28",
    source_ar: "طه ٢٠:٢٥-٢٨",
    surah_id: 20,
    verse_number: 25,
    category_en: "Ease & Speech",
    category_ar: "تيسير الأمور والقول"
  },
  {
    id: "dua-guidance-mercy",
    arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    transliteration: "Rabbana atina min ladunka rahmatan wa hayyi' lana min amrina rashada",
    translation_en: "Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.",
    translation_ar: "دعاء أصحاب الكهف طلباً للرحمة الإلهية والثبات والهدى.",
    source_en: "Al-Kahf 18:10",
    source_ar: "الكهف ١٨:١٠",
    surah_id: 18,
    verse_number: 10,
    category_en: "Guidance & Mercy",
    category_ar: "الرحمة والرشد"
  },
  {
    id: "dua-patience",
    arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ",
    transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafirin",
    translation_en: "Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.",
    translation_ar: "سؤال الله جل وعلا الصبر والثبات والنصر والتمكين.",
    source_en: "Al-Baqarah 2:250",
    source_ar: "البقرة ٢:٢٥٠",
    surah_id: 2,
    verse_number: 250,
    category_en: "Patience & Victory",
    category_ar: "الصبر والثبات"
  },
  {
    id: "dua-forgiveness-short",
    arabic: "رَّبِّ اغْفِرْ وَارْحَمْ وَأَنتَ خَيْرُ الرَّاحِمِينَ",
    transliteration: "Rabbi ighfir warham wa anta khayru ar-rahimin",
    translation_en: "My Lord, forgive and have mercy, and You are the best of the merciful.",
    translation_ar: "طلب المغفرة والرحمة الواسعة من أرحم الراحمين سبحانه.",
    source_en: "Al-Mu'minun 23:118",
    source_ar: "المؤمنون ٢٣:١١٨",
    surah_id: 23,
    verse_number: 118,
    category_en: "Forgiveness",
    category_ar: "المغفرة والرحمة"
  },
  {
    id: "dua-knowledge",
    arabic: "رَّبِّ زِدْنِي عِلْمًا",
    transliteration: "Rabbi zidni 'ilma",
    translation_en: "My Lord, increase me in knowledge.",
    translation_ar: "طلب زيادة العلم النافع والتبصر في الدين والدنيا.",
    source_en: "Ta-Ha 20:114",
    source_ar: "طه ٢٠:١١٤",
    surah_id: 20,
    verse_number: 114,
    category_en: "Knowledge",
    category_ar: "زيادة العلم"
  },
  {
    id: "prophet-ibrahim-prayer",
    arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي ۚ رَبَّنَا وَتَقَبَّلْ دُعَاءِ",
    transliteration: "Rabbi ij'alni muqima as-salati wa min dhurriyyati Rabbana wa taqabbal du'a",
    translation_en: "My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.",
    translation_ar: "دعاء إبراهيم عليه السلام برعاية الصلاة وصلاح الذرية والقبول.",
    source_en: "Ibrahim 14:40",
    source_ar: "إبراهيم ١٤:٤٠",
    surah_id: 14,
    verse_number: 40,
    category_en: "Prayer & Family",
    category_ar: "إقامة الصلاة والذرية"
  },
  {
    id: "prophet-ibrahim-forgiveness",
    arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    transliteration: "Rabbana ighfir li wa liwalidayya wa lilmu'minina yawma yaqumul-hisab",
    translation_en: "Our Lord, forgive me and my parents and the believers the Day the account is established.",
    translation_ar: "دعاء الخليل عليه السلام بالمغفرة له ولوالديه والمؤمنين يوم الحساب.",
    source_en: "Ibrahim 14:41",
    source_ar: "إبراهيم ١٤:٤١",
    surah_id: 14,
    verse_number: 41,
    category_en: "Forgiveness",
    category_ar: "المغفرة والرحمة"
  },
  {
    id: "dua-good-family",
    arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj'alna lil-muttaqina imama",
    translation_en: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.",
    translation_ar: "دعاء عباد الرحمن بصلاح الزوجة والذرية والقيادة في التقوى والخير.",
    source_en: "Al-Furqan 25:74",
    source_ar: "الفرقان ٢٥:٧٤",
    surah_id: 25,
    verse_number: 74,
    category_en: "Prayer & Family",
    category_ar: "صلاح الأهل والذرية"
  },
  {
    id: "dua-forgiveness-abrar",
    arabic: "رَبَّنَا فَاغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ",
    transliteration: "Rabbana faghfir lana dhunubana wa kaffir 'anna sayyi'atina wa tawaffana ma'al-abrar",
    translation_en: "Our Lord, so forgive us our sins and remove from us our evil deeds and take our souls with the righteous.",
    translation_ar: "طلب التجاوز عن السيئات وحسن الخاتمة والوفاة مع الأبرار والشهداء.",
    source_en: "Ali 'Imran 3:193",
    source_ar: "آل عمران ٣:١٩٣",
    surah_id: 3,
    verse_number: 193,
    category_en: "Forgiveness",
    category_ar: "المغفرة والرحمة"
  },
  {
    id: "dua-avoid-oppression",
    arabic: "رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظَّالِمِينَ",
    transliteration: "Rabbana la taj'alna ma'al-qawmid-dhalimin",
    translation_en: "Our Lord, do not place us with the wrongdoing people.",
    translation_ar: "دعاء أصحاب الأعراف في الاستعاذة من مرافقة أو مصير الظالمين.",
    source_en: "Al-A'raf 7:47",
    source_ar: "الأعراف ٧:٤٧",
    surah_id: 7,
    verse_number: 47,
    category_en: "Goodness & Protection",
    category_ar: "الوقاية والبعد عن الظلم"
  },
  {
    id: "prophet-ayoub-distress",
    arabic: "أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ",
    transliteration: "Anni massaniya ad-durru wa anta arhamur-rahimin",
    translation_en: "Indeed, adversity has touched me, and you are the most merciful of the merciful.",
    translation_ar: "دعاء أيوب عليه السلام لطلب الشفاء وتيسير فرج البلاء والأسقام.",
    source_en: "Al-Anbya 21:83",
    source_ar: "الأنبياء ٢١:٨٣",
    surah_id: 21,
    verse_number: 83,
    category_en: "Relief & Repentance",
    category_ar: "الصبر والشفاء"
  },
  {
    id: "prophet-zakariya-offspring",
    arabic: "رَبِّ لَا تَذَرْنِي فَرْدًا وَأَنتَ خَيْرُ الْوَارِثِينَ",
    transliteration: "Rabbi la tadharni fardan wa anta khayrul-warithin",
    translation_en: "My Lord, do not leave me alone [with no heir], while you are the best of inheritors.",
    translation_ar: "نظام التضرع لله لطلب الذرية الصالحة الطيبة كدعاء زكريا.",
    source_en: "Al-Anbya 21:89",
    source_ar: "الأنبياء ٢١:٨٩",
    surah_id: 21,
    verse_number: 89,
    category_en: "Prayer & Family",
    category_ar: "طلب الذرية الصالحة"
  }
];
