export interface Hadeeth {
  id: number;
  textAr: string;
  textEn: string;
  narratorAr: string;
  narratorEn: string;
  sourceAr: string;
  sourceEn: string;
  explanationAr: string;
  explanationEn: string;
}

export const AUTHENTIC_HADEETHS: Hadeeth[] = [
  {
    id: 1,
    textAr: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.",
    textEn: "Actions are but by intention and every man shall have but that which he intended.",
    narratorAr: "عمر بن الخطاب رضي الله عنه",
    narratorEn: "Umar ibn al-Khattab (RA)",
    sourceAr: "صحيح البخاري ومسلم",
    sourceEn: "Sahih al-Bukhari & Sahih Muslim",
    explanationAr: "هذا الحديث أصل عظيم من أصول الإسلام، وهو ميزان الأعمال الباطنة. فالنية هي الفارق بين العبادة والعادة، وبها يقبل العمل أو يرد.",
    explanationEn: "This Hadith is a foundational principle of Islam, serving as the scale for internal actions. Sincerity of intention distinguishes worship from routine habit."
  },
  {
    id: 2,
    textAr: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.",
    textEn: "A Muslim is the one from whose tongue and hands other Muslims are safe.",
    narratorAr: "عبد الله بن عمرو رضي الله عنهما",
    narratorEn: "Abdullah ibn Amr (RA)",
    sourceAr: "صحيح البخاري",
    sourceEn: "Sahih al-Bukhari",
    explanationAr: "يبين الحديث أن كمال الإسلام يقتضي كف الأذى عن الناس، بالقول كالغيبة والنميمة، أو بالفعل كالاعتداء والضرب.",
    explanationEn: "This Hadith emphasizes that true Islamic practice requires refraining from harming others, whether verbally (gossip) or physically."
  },
  {
    id: 3,
    textAr: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
    textEn: "None of you truly believes until he loves for his brother what he loves for himself.",
    narratorAr: "أنس بن مالك رضي الله عنه",
    narratorEn: "Anas ibn Malik (RA)",
    sourceAr: "صحيح البخاري ومسلم",
    sourceEn: "Sahih al-Bukhari & Sahih Muslim",
    explanationAr: "يرشد الحديث إلى أهمية سلامة الصدر ومحبة الخير للآخرين، وهو من أعظم علامات كمال الإيمان وزوال الأنانية والحسد.",
    explanationEn: "The Hadith guides us towards purity of heart and wanting good for others, which is one of the greatest signs of complete faith."
  },
  {
    id: 4,
    textAr: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.",
    textEn: "He who believes in Allah and the Last Day, let him speak good or remain silent.",
    narratorAr: "أبو هريرة رضي الله عنه",
    narratorEn: "Abu Hurayrah (RA)",
    sourceAr: "صحيح البخاري ومسلم",
    sourceEn: "Sahih al-Bukhari & Sahih Muslim",
    explanationAr: "يربط الحديث الإيمان بحفظ اللسان والتحكم بالقول، فالكلمة الطيبة صدقة، والصمت وقاية من السيئات.",
    explanationEn: "The Hadith connects true belief with guarding one's tongue, showing that a good word is charity, while silence is a shield against sin."
  },
  {
    id: 5,
    textAr: "يَسِّرُوا وَلاَ تُعَسِّرُوا، وَبَشِّرُوا وَلاَ تُنَفِّرُوا.",
    textEn: "Make things easy and do not make them difficult, cheer people up and do not repel them.",
    narratorAr: "أنس بن مالك رضي الله عنه",
    narratorEn: "Anas ibn Malik (RA)",
    sourceAr: "صحيح البخاري ومسلم",
    sourceEn: "Sahih al-Bukhari & Sahih Muslim",
    explanationAr: "منهج نبوي حكيم في الدعوة والتعامل مع الناس، مبني على التيسير والتبشير لجذب القلوب وتأليف النفوس للخير.",
    explanationEn: "A wise prophetic methodology in calling and interacting with people, built on facilitation and hope to soften and win over hearts."
  },
  {
    id: 6,
    textAr: "إِنَّ اللَّهَ جَمِيلٌ يُحِبُّ الْجَمَالَ.",
    textEn: "Indeed, Allah is beautiful and He loves beauty.",
    narratorAr: "عبد الله بن مسعود رضي الله عنه",
    narratorEn: "Abdullah ibn Mas'ud (RA)",
    sourceAr: "صحيح مسلم",
    sourceEn: "Sahih Muslim",
    explanationAr: "يدعو الحديث إلى التجمل والجمال في المظهر والمخبر، ونقاء القلب، وحسن السمت والخلق دون تكبر أو خيلاء.",
    explanationEn: "This Hadith encourages beauty in appearance, cleanliness of heart, and elegance in character without pride or arrogance."
  },
  {
    id: 7,
    textAr: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
    textEn: "He who treads a path in search of knowledge, Allah will direct him to a path leading to Paradise.",
    narratorAr: "أبو هريرة رضي الله عنه",
    narratorEn: "Abu Hurayrah (RA)",
    sourceAr: "صحيح مسلم",
    sourceEn: "Sahih Muslim",
    explanationAr: "فضيلة العلم ومكانة طالب العلم عظيمة في الإسلام، والبحث عن المعرفة وتدريسها هو سبيل ميسر ومبارك لدخول الجنة.",
    explanationEn: "The virtue and status of seeking knowledge is immense. Striving for truth and learning is an blessed, direct path to Paradise."
  },
  {
    id: 8,
    textAr: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.",
    textEn: "The best among you are those who learn the Quran and teach it.",
    narratorAr: "عثمان بن عفان رضي الله عنه",
    narratorEn: "Uthman ibn Affan (RA)",
    sourceAr: "صحيح البخاري",
    sourceEn: "Sahih al-Bukhari",
    explanationAr: "شرف القرآن الكريم يعلو على سائر العلوم، والخيرية المطلقة للمسلم تكون في تعهد كتاب الله تلاوة وحفظاً وتعليماً وعملاً.",
    explanationEn: "The Quran carries supreme status. The absolute best pursuits of a Muslim are engaged with learning, reciting, teaching, and practicing the Book of Allah."
  },
  {
    id: 9,
    textAr: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.",
    textEn: "Fear Allah wherever you are, and follow up a bad deed with a good deed which will wipe it out, and behave well towards people.",
    narratorAr: "أبو ذر الغفاري رضي الله عنه",
    narratorEn: "Abu Dharr al-Ghifari (RA)",
    sourceAr: "سنن الترمذي (حديث حسن)",
    sourceEn: "Sunan al-Tirmidhi (Hasan)",
    explanationAr: "وصية نبوية جامعة اشتملت على حق الله تعالى بمراقبته وتقواه، وحق النفس بإصلاح ما فسد بالطاعات، وحق العباد بالخلق الطيب.",
    explanationEn: "A comprehensive prophetic command encapsulating our duties to Allah (mindfulness), to ourselves (repenting through good deeds), and to other people (excellent manners)."
  },
  {
    id: 10,
    textAr: "مَنْ لَا يَرْحَمِ النَّاسَ لَا يَرْحَمْهُ اللَّهُ.",
    textEn: "He who does not show mercy to people, Allah will not show mercy to him.",
    narratorAr: "جرير بن عبد الله رضي الله عنه",
    narratorEn: "Jarir ibn Abdullah (RA)",
    sourceAr: "صحيح البخاري ومسلم",
    sourceEn: "Sahih al-Bukhari & Sahih Muslim",
    explanationAr: "يدل هذا الحديث على أن الجزاء من جنس العمل، وأن الرحمة بالعباد والتلطف بهم هي سبب لنيل رحمة الله الواسعة وفضله.",
    explanationEn: "This Hadith teaches that the reward corresponds to the deed; showing compassion to people invites the vast mercy and grace of Allah."
  }
];
