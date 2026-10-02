/* ============================================================================
 * What When / هجدول وأكلمك — DATA CONFIGURATION
 * ----------------------------------------------------------------------------
 * This file is the single source of truth for the tool.
 * Edit values here (or later via the admin page, Phase 3) to update the app.
 *
 * Schedule source: "FCAI Timetable 2026-2027 (First Semester) — Publish V3"
 *
 * Data conventions:
 *   - days:    'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu'
 *   - slots:   integers 1..7 (see SLOTS below for the time mapping)
 *   - lecture: { day, slots: [start, end], place, doctor }
 *   - section: { label: ['S1','S2'], day, slot, place }
 *
 * V3 CHANGE LOG (vs the previous data file):
 *   - CS352 ASE: new lab Sat S2 (S1,S2 · Lab 7).
 *   - CS321 Algorithms: several labs moved/corrected — IS Sat S6 is now
 *     (S5,S6 · Ben-ElSarayat 32) [was S9]; new DS labs (S5,S6 Tue S4 Lab 3);
 *     the IT Tue S1 (S3,S4) slot is now an IT&DC lab; AI Sun lab is S4 (not S3);
 *     Mon labs corrected to slot 6. See course block for the full list.
 *   - IT351 IT&DC: new lab Tue S1 (S3,S4 · Lab 8) [IT page]; the old
 *     Sat S1 (S1,S2 · Lab 3) entry no longer appears in V3 and was removed.
 *   - IT313 Computer Architecture: new lab Sun S5 (S3,S4 · Lab 8).
 *   - IT352 Pattern Recognition: new lab Tue S4 (S1,S2 · Lab 5).
 *   - IS321 File Management: Sat S1 is now (S5,S6); labs regrouped —
 *     (S7,S8 Sun S5 Lab 5), (S3,S4 Mon S6 Lab 3); old Sun S6 entry removed.
 *   - IS312 DBMS: new lab Sun S5 (S1,S2 · Lab 7); old Mon S5 entry removed.
 *   - DS341 Learning From Data: full lab list confirmed by V3 — five labs.
 *   - DS331 SysMod: Sun S2 lab moved to Lab 8.
 *   - DS312 Decision Support: LECTURE MOVED to Mon S3–S4 (was Wed S5–S6);
 *     labs: (S5,S6 Sun S3 Lab 6) [was Mon S4 Lab 5]; Wed labs confirmed.
 *   - CS423 Compilers: LECTURE MOVED to Tue S1–S2 (was Sun S3–S4).
 *   - CS465 Soft Computing: LECTURE MOVED to Tue S4–S5 (was Sun S5–S6).
 *   - IT443 Image Processing: labs confirmed — S1,S2 / S3,S4 / S5,S6 at
 *     Mon S4 / S5 / S6 (the old duplicate "S5" ambiguity is resolved).
 *   - IT424 Wireless: labs confirmed — S1,S2 / S3,S4 / S5,S6 at Mon S4/S5/S6.
 *   - IT416 Robotics: lab moved to Mon S1 (S1,S2 · Lab 3) [was Wed S3].
 *   - IS417 Selected Topics in Database: new lab Sat S6 (S1,S2 · Library Lab);
 *     old Tue S5 lab no longer appears in V3 and was removed.
 *   - DS425 Network Modeling: (S1,S2) lab moved to Wed S4 · Library Lab.
 *   - Intro to Logic doctor: Dr. Samar Taha (was Dr. Nermeen).
 *   - Brain-Computer Interfacing doctors: Prof. Eid Emary & Dr. Mahmoud Eid;
 *     labs confirmed — (S1,S2 Tue S1 Ben 32) / (S3,S4 Tue S2 Ben 35).
 *   - 4th-level AI Saturday lectures no longer overlap (GAN S1–2 / IAR S3–4 /
 *     Unsupervised S5–6) — the old auto-conflict disappears.
 *
 * REMAINING AMBIGUITY (verify against the official PDF):
 *   - IS page Wed S1: "Advanced Software Engineering (Lab) (Lab 7)" — the
 *     section labels are missing in the flattened PDF text; kept as (S5,S6)
 *     as in the previous version. Fix the label array in this file if wrong.
 * ========================================================================== */

const APP_CONFIG = {
  toolName: { ar: " هجدول وأكلمك", en: "What When" },
  academicTerm: { ar: "الفصل الدراسي الأول 2026–2027", en: "First Term 2026–2027" },

  whatsapp: {
    display: "+20 155 453 1921",
    link: "https://wa.me/201554531921",
  },

  // Google Analytics 4 Measurement ID (e.g. "G-XXXXXXXXXX")
  // Paste your Measurement ID here to track private visitors, schedules, & PNG exports
  googleAnalyticsId: "G-PVJS7FP8DC",

  departments: ["CS", "IT", "IS", "DS", "AI"],

  specializationHours: 45,
  minProjectHours: 85,
  creditHoursPerCourse: 3,
  groups: ["A", "B"],

  // Base bylaws credit limits (18h for >=2, 15h for >1 and <2, 12h for <=1)
  gpaThresholds: {
    high: 2.0,
    mid: 1.0,
  },

  // Overload allowance to 21h (Level 4 with GPA >= 2.0, OR any Level with GPA >= 3.0)
  overload: {
    maxHours: 21,
    minGpaAnyLevel: 3.0,
    minGpaLevel4: 2.0,
  },

  // Official college timetable published PDF (Google Drive embeddable)
  officialSchedule: {
    version: "V3",
    fileId: "1BGjzkHEeFkHhCvGIq9uIP-AkRlHLm-IH",
    previewUrl: "https://drive.google.com/file/d/1BGjzkHEeFkHhCvGIq9uIP-AkRlHLm-IH/preview",
    shareUrl: "https://drive.google.com/file/d/1BGjzkHEeFkHhCvGIq9uIP-AkRlHLm-IH/view?usp=sharing",
    lastUpdated: "2026-10",
  },

  // Graduation project: requires 85+ passed hours, takes 3h toward credit limit
  project: {
    creditHours: 3,
    minPassedHours: 85,
    label: { ar: "مشروع التخرج", en: "Graduation Project" },
  },
};

/* ---------------------------------------------------------------------------
 * Academic Bylaws Calculation Engine
 * Strictly follows Cairo University FCAI regulations
 * ------------------------------------------------------------------------- */
const ACADEMIC_BYLAWS = {
  calcLevel(passedHours) {
    const h = Number(passedHours) || 0;
    if (h < 27) return 1;
    if (h < 60) return 2;
    if (h < 96) return 3;
    return 4;
  },

  isSpecialized(passedHours) {
    return (Number(passedHours) || 0) >= APP_CONFIG.specializationHours;
  },

  canTakeProject(passedHours) {
    return (Number(passedHours) || 0) >= APP_CONFIG.minProjectHours;
  },

  calcBaseHours(gpa, isNewcomer = false) {
    if (isNewcomer) return 16;
    const val = Number(gpa);
    if (isNaN(val) || val < 0) return 18;
    if (val >= APP_CONFIG.gpaThresholds.high) return 18;
    if (val > APP_CONFIG.gpaThresholds.mid) return 15;
    return 12;
  },

  canOverload(passedHours, gpa) {
    const level = this.calcLevel(passedHours);
    const val = Number(gpa);
    if (isNaN(val) || val < 0) return false;
    return (level === 4 && val >= APP_CONFIG.overload.minGpaLevel4) ||
           (val >= APP_CONFIG.overload.minGpaAnyLevel);
  },

  requiresCohortGroup(passedHours) {
    return this.calcLevel(passedHours) <= 2;
  },
};

/* ---------------------------------------------------------------------------
 * Days & time slots — numbered 1..7, both durations as printed in the official
 * schedule (lecture-length / lab-length variants). Unchanged in V3.
 * ------------------------------------------------------------------------- */
const DAYS = [
  { key: "sat", ar: "السبت",   en: "Saturday" },
  { key: "sun", ar: "الأحد",   en: "Sunday" },
  { key: "mon", ar: "الاثنين", en: "Monday" },
  { key: "tue", ar: "الثلاثاء",en: "Tuesday" },
  { key: "wed", ar: "الأربعاء",en: "Wednesday" },
  { key: "thu", ar: "الخميس", en: "Thursday" },
];

const SLOTS = [
  { n: 1, short: "08:00–09:15", long: "08:00–09:30" },
  { n: 2, short: "09:30–10:45", long: "09:30–11:00" },
  { n: 3, short: "11:15–12:30", long: "11:15–12:45" },
  { n: 4, short: "12:45–02:00", long: "12:45–02:15" },
  { n: 5, short: "02:30–03:45", long: "02:30–04:00" },
  { n: 6, short: "04:15–05:30", long: "04:15–05:45" },
  { n: 7, short: "06:00–07:15", long: "06:00–07:30" },
];


/* Faculty-wide activity block printed in the official tables */
const FACULTY_ACTIVITY = { day: "tue", slot: 3,
  label: { ar: "نشاط كلية", en: "Faculty Activity" } };


const DEPT_NAMES = {
  GEN: { ar: "مواد عامة (رياضيات - مقررات إنسانية واجتماعية)", en: "General Courses (Math, Humanities & Social Sciences)" },
  CS:  { ar: "علوم الحاسب",                    en: "Computer Science" },
  IT:  { ar: "تكنولوجيا المعلومات",            en: "Information Technology" },
  IS:  { ar: "نظم المعلومات",                  en: "Information Systems" },
  DS:  { ar: "بحوث العمليات ودعم القرار",       en: "Operations Research & Decision Support" },
  AI:  { ar: "الذكاء الاصطناعي",               en: "Artificial Intelligence" },
};

/* ---------------------------------------------------------------------------
 * COURSES — every course appearing in the official schedule PDF (V3).
 * mandatoryFor: departments for which the bylaws list this course as
 *               compulsory. Empty array = optional for everyone (so far).
 * dept: owning department (by course code prefix, or schedule page when the
 *       code is unknown). Used for grouping in the catalog.
 * ------------------------------------------------------------------------- */
const COURSES = [
  /* ============================ LEVEL 1 ============================ */
  {
    code: "HU113",
    name: { ar: "التفكير الإبداعى ومهارات الاتصال", en: "Creative Thinking & Communication Skills" },
    dept: "GEN", level: 1, creditHours: 2, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [ { day: "sat", slots: [1], place: "Farag Hall", doctor: "Dr. Omima Saeid" } ],
        sections: [],
      },
      B: {
        lectures: [ { day: "sat", slots: [1], place: "Al-Shafei Hall", doctor: "Dr. Omima Saeid" } ],
        sections: [],
      },
    },
    lectures: [ { day: "sat", slots: [1], place: "Farag Hall", doctor: "Dr. Omima Saeid" } ],
    sections: [],
  },
  {
    code: "HU111",
    name: { ar: "كتابة التقارير الفنية", en: "Technical Report Writing" },
    dept: "GEN", level: 1, creditHours: 2, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [ { day: "sun", slots: [1], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" } ],
        sections: [],
      },
      B: {
        lectures: [ { day: "sun", slots: [1], place: "Al-Shafei Hall", doctor: "Prof. Ehab El-Khodary" } ],
        sections: [],
      },
    },
    lectures: [ { day: "sun", slots: [1], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" } ],
    sections: [],
  },
  {
    code: "CS111",
    name: { ar: "اساسيات علوم الحاسب", en: "Fundamentals of Computer Sciences" },
    dept: "GEN", level: 1, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "sun", slots: [2], place: "Farag Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
          { day: "thu", slots: [1], place: "Farag Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
        ],
        sections: [
          { label: ["S3", "S4"],   day: "sat", slot: 2, place: "Lab 8" },
          { label: ["S5", "S6"],   day: "sun", slot: 3, place: "Library Lab" },
          { label: ["S7", "S8"],   day: "sun", slot: 4, place: "Lab 7" },
          { label: ["S25", "S26"], day: "mon", slot: 1, place: "Lab 7" },
          { label: ["S9", "S10"],  day: "mon", slot: 4, place: "Lab 3" },
          { label: ["S11", "S12"], day: "mon", slot: 5, place: "Lab 6" },
          { label: ["S1", "S2"],   day: "mon", slot: 5, place: "Lab 7" },
          { label: ["S13", "S14"], day: "mon", slot: 6, place: "Lab 6" },
          { label: ["S15", "S16"], day: "tue", slot: 5, place: "Lab 6" },
          { label: ["S17", "S18"], day: "tue", slot: 5, place: "Lab 3" },
          { label: ["S19", "S20"], day: "tue", slot: 6, place: "Lab 6" },
          { label: ["S27", "S28"], day: "wed", slot: 5, place: "Lab 6" },
          { label: ["S29", "S30"], day: "wed", slot: 5, place: "Lab 7" },
          { label: ["S21", "S22"], day: "wed", slot: 6, place: "Library Lab" },
          { label: ["S23", "S24"], day: "thu", slot: 4, place: "Library Lab" },
          { label: ["S31", "S32"], day: "thu", slot: 5, place: "Library Lab" },
        ],
      },
      B: {
        lectures: [
          { day: "sun", slots: [2], place: "Al-Shafei Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
          { day: "thu", slots: [1], place: "Al-Shafei Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
        ],
        sections: [
          { label: ["S33", "S34"], day: "sat", slot: 2, place: "Lab 6" },
          { label: ["S35", "S36"], day: "sun", slot: 3, place: "Lab 7" },
          { label: ["S39", "S40"], day: "sun", slot: 4, place: "Lab 8" },
          { label: ["S45", "S46"], day: "mon", slot: 4, place: "Lab 7" },
          { label: ["S47", "S48"], day: "mon", slot: 5, place: "Lab 8" },
          { label: ["S49", "S50"], day: "tue", slot: 2, place: "Lab 8" },
          { label: ["S53", "S54"], day: "tue", slot: 5, place: "Library Lab" },
          { label: ["S37", "S38"], day: "tue", slot: 6, place: "Lab 7" },
          { label: ["S55", "S56"], day: "wed", slot: 3, place: "Lab 3" },
          { label: ["S57", "S58"], day: "wed", slot: 5, place: "Lab 5" },
          { label: ["S51", "S52"], day: "wed", slot: 6, place: "Lab 5" },
          { label: ["S43", "S44"], day: "wed", slot: 6, place: "Lab 7" },
          { label: ["S59", "S60"], day: "thu", slot: 3, place: "Lab 5" },
          { label: ["S41", "S42"], day: "thu", slot: 5, place: "Lab 7" },
        ],
      },
    },
    lectures: [
      { day: "sun", slots: [2], place: "Farag Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
      { day: "thu", slots: [1], place: "Farag Hall", doctor: "Dr. Manar El-Kady & Dr. Laila Safoury" },
    ],
    sections: [
      { label: ["S3", "S4"],   day: "sat", slot: 2, place: "Lab 8" },
      { label: ["S5", "S6"],   day: "sun", slot: 3, place: "Library Lab" },
      { label: ["S7", "S8"],   day: "sun", slot: 4, place: "Lab 7" },
      { label: ["S25", "S26"], day: "mon", slot: 1, place: "Lab 7" },
      { label: ["S9", "S10"],  day: "mon", slot: 4, place: "Lab 3" },
      { label: ["S11", "S12"], day: "mon", slot: 5, place: "Lab 6" },
      { label: ["S1", "S2"],   day: "mon", slot: 5, place: "Lab 7" },
      { label: ["S13", "S14"], day: "mon", slot: 6, place: "Lab 6" },
      { label: ["S15", "S16"], day: "tue", slot: 5, place: "Lab 6" },
      { label: ["S17", "S18"], day: "tue", slot: 5, place: "Lab 3" },
      { label: ["S19", "S20"], day: "tue", slot: 6, place: "Lab 6" },
      { label: ["S27", "S28"], day: "wed", slot: 5, place: "Lab 6" },
      { label: ["S29", "S30"], day: "wed", slot: 5, place: "Lab 7" },
      { label: ["S21", "S22"], day: "wed", slot: 6, place: "Library Lab" },
      { label: ["S23", "S24"], day: "thu", slot: 4, place: "Library Lab" },
      { label: ["S31", "S32"], day: "thu", slot: 5, place: "Library Lab" },
    ],
  },
  {
    code: "MA111",
    name: { ar: "رياضة-1", en: "Mathematics-1" },
    dept: "GEN", level: 1, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [ { day: "wed", slots: [1, 2], place: "Farag Hall", doctor: "Dr. Hala Fayez" } ],
        sections: [
          { label: ["S1", "S2", "S3", "S4"], day: "sun", slot: 3, place: "Hall 9" },
          { label: ["S9", "S10", "S11", "S12"], day: "mon", slot: 4, place: "Hall 10" },
          { label: ["S5", "S6", "S7", "S8"], day: "mon", slot: 5, place: "Hall 9" },
          { label: ["S13", "S14", "S15", "S16"], day: "thu", slot: 3, place: "Hall 10" },
        ],
      },
      B: {
        lectures: [ { day: "wed", slots: [1, 2], place: "Al-Shafei Hall", doctor: "Dr. Hala Fayez" } ],
        sections: [
          { label: ["S17", "S18", "S19", "S20"], day: "sun", slot: 4, place: "Hall 9" },
          { label: ["S29", "S30", "S31", "S32"], day: "wed", slot: 3, place: "Hall 10" },
          { label: ["S25", "S26", "S27", "S28"], day: "wed", slot: 5, place: "Hall 9" },
          { label: ["S21", "S22", "S23", "S24"], day: "thu", slot: 4, place: "Hall 10" },
        ],
      },
    },
    lectures: [ { day: "wed", slots: [1, 2], place: "Farag Hall", doctor: "Dr. Hala Fayez" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"], day: "sun", slot: 3, place: "Hall 9" },
      { label: ["S9", "S10", "S11", "S12"], day: "mon", slot: 4, place: "Hall 10" },
      { label: ["S5", "S6", "S7", "S8"], day: "mon", slot: 5, place: "Hall 9" },
      { label: ["S13", "S14", "S15", "S16"], day: "thu", slot: 3, place: "Hall 10" },
    ],
  },
  {
    code: "MA112",
    name: { ar: "تراكيب محددة", en: "Discrete Mathematics" },
    dept: "GEN", level: 1, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "mon", slots: [3], place: "Farag Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
          { day: "thu", slots: [2], place: "Farag Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
        ],
        sections: [
          { label: ["S25", "S26", "S27", "S28"], day: "mon", slot: 1, place: "Hall 9" },
          { label: ["S29", "S30", "S31", "S32"], day: "mon", slot: 1, place: "Hall 10" },
          { label: ["S9", "S10", "S11", "S12"], day: "tue", slot: 1, place: "Hall 10" },
          { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"], day: "tue", slot: 2, place: "Hall 7" },
          { label: ["S13", "S14", "S15", "S16"], day: "tue", slot: 5, place: "Hall 9" },
          { label: ["S17", "S18", "S19", "S20"], day: "wed", slot: 3, place: "Hall 9" },
          { label: ["S21", "S22", "S23", "S24"], day: "wed", slot: 5, place: "Hall 10" },
        ],
      },
      B: {
        lectures: [
          { day: "mon", slots: [3], place: "Al-Shafei Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
          { day: "thu", slots: [2], place: "Al-Shafei Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
        ],
        sections: [
          { label: ["S33", "S34", "S35", "S36"], day: "sun", slot: 5, place: "Hall 9" },
          { label: ["S37", "S38", "S39", "S40"], day: "sun", slot: 5, place: "Hall 10" },
          { label: ["S49", "S50", "S51", "S52"], day: "tue", slot: 1, place: "Hall 9" },
          { label: ["S41", "S42", "S43", "S44"], day: "tue", slot: 2, place: "Hall 9" },
          { label: ["S45", "S46", "S47", "S48"], day: "tue", slot: 4, place: "Hall 10" },
          { label: ["S53", "S54", "S55", "S56"], day: "tue", slot: 4, place: "Hall 9" },
          { label: ["S57", "S58", "S59", "S60"], day: "wed", slot: 4, place: "Hall 9" },
          { label: ["S61", "S62", "S63", "S64"], day: "wed", slot: 4, place: "Hall 10" },
        ],
      },
    },
    lectures: [
      { day: "mon", slots: [3], place: "Farag Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
      { day: "thu", slots: [2], place: "Farag Hall", doctor: "Dr. Shourouk Wael & Dr. Mai Abdel-Ghafar" },
    ],
    sections: [
      { label: ["S25", "S26", "S27", "S28"], day: "mon", slot: 1, place: "Hall 9" },
      { label: ["S29", "S30", "S31", "S32"], day: "mon", slot: 1, place: "Hall 10" },
      { label: ["S9", "S10", "S11", "S12"], day: "tue", slot: 1, place: "Hall 10" },
      { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"], day: "tue", slot: 2, place: "Hall 7" },
      { label: ["S13", "S14", "S15", "S16"], day: "tue", slot: 5, place: "Hall 9" },
      { label: ["S17", "S18", "S19", "S20"], day: "wed", slot: 3, place: "Hall 9" },
      { label: ["S21", "S22", "S23", "S24"], day: "wed", slot: 5, place: "Hall 10" },
    ],
  },
  {
    code: "IT111",
    name: { ar: "إلكترونيات", en: "Electronics" },
    dept: "GEN", level: 1, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "mon", slots: [2], place: "Farag Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
          { day: "thu", slots: [3], place: "Farag Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
        ],
        sections: [
          { label: ["S8", "S9", "S10", "S11"], day: "mon", slot: 4, place: "Hall 9" },
          { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "mon", slot: 5, place: "Hall 7" },
          { label: ["S12", "S13", "S14", "S15", "S16", "S17", "S18"], day: "tue", slot: 1, place: "Hall 7" },
          { label: ["S19", "S20", "S21", "S22", "S23"], day: "tue", slot: 4, place: "Hall 8" },
          { label: ["S24", "S25", "S26", "S27", "S28", "S29", "S30"], day: "wed", slot: 4, place: "Hall 7" },
        ],
      },
      B: {
        lectures: [
          { day: "mon", slots: [2], place: "Al-Shafei Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
          { day: "thu", slots: [3], place: "Al-Shafei Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
        ],
        sections: [
          { label: ["S39", "S40", "S41", "S42", "S43", "S44", "S45", "S46"], day: "sun", slot: 3, place: "Hall 7" },
          { label: ["S51", "S52", "S53", "S54"], day: "mon", slot: 5, place: "Hall 10" },
          { label: ["S35", "S36", "S37", "S38"], day: "tue", slot: 2, place: "Hall 10" },
          { label: ["S31", "S32", "S33", "S34"], day: "tue", slot: 5, place: "Hall 10" },
          { label: ["S55", "S56", "S57", "S58", "S59", "S60"], day: "wed", slot: 3, place: "Hall 7" },
          { label: ["S55", "S56", "S57", "S58"], day: "thu", slot: 3, place: "Hall 9" },
          { label: ["S47", "S48", "S49", "S50"], day: "thu", slot: 4, place: "Hall 9" },
        ],
      },
    },
    lectures: [
      { day: "mon", slots: [2], place: "Farag Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
      { day: "thu", slots: [3], place: "Farag Hall", doctor: "Dr. Elham Shawky & Dr. Ibrahim Zidan" },
    ],
    sections: [
      { label: ["S8", "S9", "S10", "S11"], day: "mon", slot: 4, place: "Hall 9" },
      { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "mon", slot: 5, place: "Hall 7" },
      { label: ["S12", "S13", "S14", "S15", "S16", "S17", "S18"], day: "tue", slot: 1, place: "Hall 7" },
      { label: ["S19", "S20", "S21", "S22", "S23"], day: "tue", slot: 4, place: "Hall 8" },
      { label: ["S24", "S25", "S26", "S27", "S28", "S29", "S30"], day: "wed", slot: 4, place: "Hall 7" },
    ],
  },
  {
    code: "MA000",
    name: { ar: "رياضيات تمهيدية (Math_0)", en: "Mathematics-0 (Remedial)" },
    dept: "GEN", level: 1, creditHours: 0, mandatoryFor: [],
    lectures: [ { day: "sun", slots: [6], place: "Farag Hall", doctor: "Dr. Mai Abdel-Ghafar" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"], day: "sat", slot: 3, place: "Hall 8" },
      { label: ["S5", "S6", "S7", "S8"], day: "sun", slot: 3, place: "Hall 10" },
      { label: ["S11", "S12", "S13", "S14"], day: "sun", slot: 4, place: "Hall 10" },
      { label: ["S9", "S10"], day: "wed", slot: 2, place: "Hall 10" },
      { label: ["S15", "S16", "S17", "S18", "S19", "S20"], day: "thu", slot: 3, place: "Hall 8" },
    ],
  },
  /* Level 1 Retakes */
  {
    code: "CS112",
    name: { ar: "برمجة هيكلية (إعادة)", en: "Structured Programming (Retake)" },
    dept: "GEN", level: 1, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "sun", slots: [1, 2], place: "Exam Room 404", doctor: "Dr. Soha Makady" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 1, place: "Lab 7" },
      { label: ["S3", "S4"], day: "sat", slot: 2, place: "Lab 5" },
      { label: ["S5", "S6"], day: "sat", slot: 3, place: "Lab 6" },
      { label: ["S7", "S8"], day: "sat", slot: 4, place: "Lab 3" },
    ],
  },
  {
    code: "ST121",
    name: { ar: "احصاء واحتمالات-1 (إعادة)", en: "Probability and Statistics-1 (Retake)" },
    dept: "GEN", level: 1, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "sun", slots: [4, 5], place: "Exam Room 404", doctor: "Dr. Mai Abdel-Ghafar" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"], day: "mon", slot: 4, place: "Exam Room 404" },
    ],
  },
  {
    code: "MA113",
    name: { ar: "رياضة-2 (إعادة)", en: "Mathematics-2 (Retake)" },
    dept: "GEN", level: 1, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "mon", slots: [1, 2], place: "Exam Room 404", doctor: "Dr. Shourouk Wael" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"], day: "mon", slot: 3, place: "Exam Room 404" },
    ],
  },

  /* ============================ LEVEL 2 ============================ */
  {
    code: "HU225",
    name: { ar: "ريادة الأعمال", en: "Entrepreneurship" },
    dept: "GEN", level: 2, creditHours: 0, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [ { day: "sat", slots: [2], place: "Farag Hall", doctor: "Dr. Sherif Zahran" } ],
        sections: [],
      },
      B: {
        lectures: [ { day: "sat", slots: [2], place: "Al-Shafei Hall", doctor: "Dr. Sherif Zahran" } ],
        sections: [],
      },
    },
    lectures: [ { day: "sat", slots: [2], place: "Farag Hall", doctor: "Dr. Sherif Zahran" } ],
    sections: [],
  },
  {
    code: "CS213",
    name: { ar: "برمجة شيئية", en: "Object Oriented Programming" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "sun", slots: [4], place: "Farag Hall", doctor: "Dr. Mohamed El-Ramly" },
          { day: "thu", slots: [4], place: "Farag Hall", doctor: "Dr. Mohamed El-Ramly" },
        ],
        sections: [
          { label: ["S1", "S2"],   day: "sat", slot: 1, place: "Lab 6" },
          { label: ["S5", "S6"],   day: "sat", slot: 3, place: "Lab 5" },
          { label: ["S3", "S4"],   day: "sat", slot: 5, place: "Lab 8" },
          { label: ["S11", "S12"], day: "sun", slot: 1, place: "Lab 7" },
          { label: ["S13", "S14"], day: "sun", slot: 2, place: "Library Lab" },
          { label: ["S15", "S16"], day: "mon", slot: 3, place: "Library Lab" },
          { label: ["S17", "S18"], day: "mon", slot: 5, place: "Lab 5" },
          { label: ["S19", "S20"], day: "wed", slot: 2, place: "Lab 5" },
          { label: ["S7", "S8"],   day: "thu", slot: 1, place: "Library Lab" },
          { label: ["S9", "S10"],  day: "thu", slot: 2, place: "Library Lab" },
        ],
      },
      B: {
        lectures: [
          { day: "sun", slots: [4], place: "Al-Shafei Hall", doctor: "Dr. Mohamed El-Ramly" },
          { day: "thu", slots: [4], place: "Al-Shafei Hall", doctor: "Dr. Mohamed El-Ramly" },
        ],
        sections: [
          { label: ["S41", "S42"], day: "sat", slot: 1, place: "Lab 8" },
          { label: ["S21", "S22"], day: "sat", slot: 3, place: "Lab 3" },
          { label: ["S23", "S24"], day: "sat", slot: 4, place: "Lab 5" },
          { label: ["S25", "S26"], day: "sun", slot: 1, place: "Lab 5" },
          { label: ["S29", "S30"], day: "sun", slot: 2, place: "Lab 6" },
          { label: ["S27", "S28"], day: "sun", slot: 6, place: "Lab 3" },
          { label: ["S31", "S32"], day: "mon", slot: 2, place: "Library Lab" },
          { label: ["S35", "S36"], day: "tue", slot: 5, place: "Lab 5" },
          { label: ["S37", "S38"], day: "tue", slot: 6, place: "Lab 5" },
          { label: ["S33", "S34"], day: "wed", slot: 5, place: "Lab 8" },
          { label: ["S39", "S40"], day: "wed", slot: 6, place: "Lab 8" },
          { label: ["S43", "S44"], day: "thu", slot: 5, place: "Lab 6" },
        ],
      },
    },
    lectures: [
      { day: "sun", slots: [4], place: "Farag Hall", doctor: "Dr. Mohamed El-Ramly" },
      { day: "thu", slots: [4], place: "Farag Hall", doctor: "Dr. Mohamed El-Ramly" },
    ],
    sections: [
      { label: ["S1", "S2"],   day: "sat", slot: 1, place: "Lab 6" },
      { label: ["S5", "S6"],   day: "sat", slot: 3, place: "Lab 5" },
      { label: ["S3", "S4"],   day: "sat", slot: 5, place: "Lab 8" },
      { label: ["S11", "S12"], day: "sun", slot: 1, place: "Lab 7" },
      { label: ["S13", "S14"], day: "sun", slot: 2, place: "Library Lab" },
      { label: ["S15", "S16"], day: "mon", slot: 3, place: "Library Lab" },
      { label: ["S17", "S18"], day: "mon", slot: 5, place: "Lab 5" },
      { label: ["S19", "S20"], day: "wed", slot: 2, place: "Lab 5" },
      { label: ["S7", "S8"],   day: "thu", slot: 1, place: "Library Lab" },
      { label: ["S9", "S10"],  day: "thu", slot: 2, place: "Library Lab" },
    ],
  },
  {
    code: "IT221",
    name: { ar: "تكنولوجيا شبكات الحاسب", en: "Computer Network Technology" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "tue", slots: [2], place: "Farag Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
          { day: "wed", slots: [3], place: "Al-Shafei Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
        ],
        sections: [
          { label: ["S1", "S2"],   day: "sat", slot: 1, place: "Library Lab" },
          { label: ["S5", "S6"],   day: "sat", slot: 4, place: "Lab 6" },
          { label: ["S3", "S4"],   day: "sat", slot: 5, place: "Library Lab" },
          { label: ["S7", "S8"],   day: "sun", slot: 1, place: "Lab 8" },
          { label: ["S9", "S10"],  day: "sun", slot: 2, place: "Lab 7" },
          { label: ["S11", "S12"], day: "mon", slot: 2, place: "Lab 6" },
          { label: ["S13", "S14"], day: "wed", slot: 2, place: "Lab 6" },
          { label: ["S15", "S16"], day: "thu", slot: 1, place: "Lab 5" },
          { label: ["S17", "S18"], day: "thu", slot: 2, place: "Lab 6" },
        ],
      },
      B: {
        lectures: [
          { day: "tue", slots: [2], place: "Al-Shafei Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
          { day: "wed", slots: [3], place: "Farag Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
        ],
        sections: [
          { label: ["S19", "S20"], day: "sat", slot: 3, place: "Library Lab" },
          { label: ["S21", "S22"], day: "sat", slot: 4, place: "Library Lab" },
          { label: ["S25", "S26"], day: "sun", slot: 2, place: "Lab 5" },
          { label: ["S23", "S24"], day: "sun", slot: 6, place: "Library Lab" },
          { label: ["S27", "S28"], day: "mon", slot: 4, place: "Lab 6" },
          { label: ["S31", "S32"], day: "mon", slot: 4, place: "Lab 8" },
          { label: ["S29", "S30"], day: "mon", slot: 5, place: "Lab 5" },
          { label: ["S33", "S34"], day: "wed", slot: 5, place: "Lab 3" },
          { label: ["S35", "S36"], day: "thu", slot: 1, place: "Lab 6" },
          { label: ["S37", "S38"], day: "thu", slot: 5, place: "Lab 8" },
          { label: ["S39", "S40"], day: "thu", slot: 6, place: "Lab 8" },
        ],
      },
    },
    lectures: [
      { day: "tue", slots: [2], place: "Farag Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
      { day: "wed", slots: [3], place: "Al-Shafei Hall", doctor: "Prof. Haitham Safwat & Prof. Mohamed Hamed & Dr. Heba El-Sherif" },
    ],
    sections: [
      { label: ["S1", "S2"],   day: "sat", slot: 1, place: "Library Lab" },
      { label: ["S5", "S6"],   day: "sat", slot: 4, place: "Lab 6" },
      { label: ["S3", "S4"],   day: "sat", slot: 5, place: "Library Lab" },
      { label: ["S7", "S8"],   day: "sun", slot: 1, place: "Lab 8" },
      { label: ["S9", "S10"],  day: "sun", slot: 2, place: "Lab 7" },
      { label: ["S11", "S12"], day: "mon", slot: 2, place: "Lab 6" },
      { label: ["S13", "S14"], day: "wed", slot: 2, place: "Lab 6" },
      { label: ["S15", "S16"], day: "thu", slot: 1, place: "Lab 5" },
      { label: ["S17", "S18"], day: "thu", slot: 2, place: "Lab 6" },
    ],
  },
  {
    code: "MA214",
    name: { ar: "رياضة-3", en: "Mathematics-3" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "sun", slots: [5], place: "Farag Hall", doctor: "Prof. Tarek Aboel-Enin" },
          { day: "tue", slots: [4], place: "Farag Hall", doctor: "Prof. Tarek Aboel-Enin" },
        ],
        sections: [
          { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "sun", slot: 1, place: "Hall 7" },
          { label: ["S8", "S9", "S10", "S11", "S12", "S13", "S14"], day: "mon", slot: 2, place: "Hall 7" },
          { label: ["S15", "S16", "S17", "S18", "S19", "S20", "S21"], day: "mon", slot: 4, place: "Hall 7" },
        ],
      },
      B: {
        lectures: [
          { day: "sun", slots: [5], place: "Al-Shafei Hall", doctor: "Prof. Tarek Aboel-Enin" },
          { day: "tue", slots: [4], place: "Al-Shafei Hall", doctor: "Prof. Tarek Aboel-Enin" },
        ],
        sections: [
          { label: ["S29", "S30", "S31", "S32", "S33", "S34", "S35"], day: "sun", slot: 2, place: "Hall 7" },
          { label: ["S22", "S23", "S24", "S25", "S26", "S27", "S28"], day: "mon", slot: 3, place: "Hall 7" },
          { label: ["S36", "S37", "S38", "S39", "S40", "S41", "S42"], day: "thu", slot: 2, place: "Hall 8" },
        ],
      },
    },
    lectures: [
      { day: "sun", slots: [5], place: "Farag Hall", doctor: "Prof. Tarek Aboel-Enin" },
      { day: "tue", slots: [4], place: "Farag Hall", doctor: "Prof. Tarek Aboel-Enin" },
    ],
    sections: [
      { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "sun", slot: 1, place: "Hall 7" },
      { label: ["S8", "S9", "S10", "S11", "S12", "S13", "S14"], day: "mon", slot: 2, place: "Hall 7" },
      { label: ["S15", "S16", "S17", "S18", "S19", "S20", "S21"], day: "mon", slot: 4, place: "Hall 7" },
    ],
  },
  {
    code: "ST222",
    name: { ar: "احصاء واحتمالات-2", en: "Probability and Statistics-2" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "sun", slots: [3], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" },
          { day: "tue", slots: [1], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" },
        ],
        sections: [
          { label: ["S1", "S2", "S3", "S4"], day: "sun", slot: 2, place: "Hall 9" },
          { label: ["S9", "S10", "S11", "S12"], day: "mon", slot: 2, place: "Hall 9" },
          { label: ["S13", "S14", "S15", "S16"], day: "mon", slot: 4, place: "Hall 8" },
          { label: ["S17", "S18", "S19", "S20"], day: "thu", slot: 1, place: "Hall 8" },
          { label: ["S5", "S6", "S7", "S8"], day: "thu", slot: 3, place: "Hall 8" },
        ],
      },
      B: {
        lectures: [
          { day: "sun", slots: [3], place: "Al-Shafei Hall", doctor: "Prof. Ehab El-Khodary" },
          { day: "tue", slots: [1], place: "Al-Shafei Hall", doctor: "Prof. Ehab El-Khodary" },
        ],
        sections: [
          { label: ["S21", "S22", "S23", "S24", "S25"], day: "sun", slot: 1, place: "Hall 8" },
          { label: ["S36", "S37", "S38", "S39"], day: "mon", slot: 3, place: "Hall 10" },
          { label: ["S30", "S31", "S32", "S33", "S34", "S35"], day: "mon", slot: 5, place: "Hall 8" },
          { label: ["S26", "S27", "S28", "S29"], day: "thu", slot: 2, place: "Hall 10" },
        ],
      },
    },
    lectures: [
      { day: "sun", slots: [3], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" },
      { day: "tue", slots: [1], place: "Farag Hall", doctor: "Prof. Ehab El-Khodary" },
    ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"], day: "sun", slot: 2, place: "Hall 9" },
      { label: ["S9", "S10", "S11", "S12"], day: "mon", slot: 2, place: "Hall 9" },
      { label: ["S13", "S14", "S15", "S16"], day: "mon", slot: 4, place: "Hall 8" },
      { label: ["S17", "S18", "S19", "S20"], day: "thu", slot: 1, place: "Hall 8" },
      { label: ["S5", "S6", "S7", "S8"], day: "thu", slot: 3, place: "Hall 8" },
    ],
  },
  {
    code: "DS211",
    name: { ar: "مقدمة فى بحوث العمليات ودعم القرار", en: "Introduction to Operations Research and Decision Support" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    hasGroups: true,
    groups: {
      A: {
        lectures: [
          { day: "mon", slots: [1], place: "Al-Shafei Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
          { day: "wed", slots: [4], place: "Al-Shafei Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
        ],
        sections: [
          { label: ["S8", "S9", "S10", "S11", "S12"], day: "wed", slot: 2, place: "Hall 8" },
          { label: ["S13", "S14", "S15", "S16", "S17", "S18", "S19"], day: "thu", slot: 2, place: "Hall 7" },
          { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "thu", slot: 3, place: "Hall 7" },
        ],
      },
      B: {
        lectures: [
          { day: "mon", slots: [1], place: "Farag Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
          { day: "wed", slots: [4], place: "Farag Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
        ],
        sections: [
          { label: ["S34", "S35", "S36", "S37", "S38", "S39", "S40"], day: "wed", slot: 1, place: "Hall 7" },
          { label: ["S27", "S28", "S29", "S30", "S31", "S32", "S33"], day: "wed", slot: 2, place: "Hall 7" },
          { label: ["S20", "S21", "S22", "S23", "S24", "S25", "S26"], day: "thu", slot: 1, place: "Hall 7" },
        ],
      },
    },
    lectures: [
      { day: "mon", slots: [1], place: "Al-Shafei Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
      { day: "wed", slots: [4], place: "Al-Shafei Hall", doctor: "Dr. Sally Kasem & Dr. Hayam Gamal" },
    ],
    sections: [
      { label: ["S8", "S9", "S10", "S11", "S12"], day: "wed", slot: 2, place: "Hall 8" },
      { label: ["S13", "S14", "S15", "S16", "S17", "S18", "S19"], day: "thu", slot: 2, place: "Hall 7" },
      { label: ["S1", "S2", "S3", "S4", "S5", "S6", "S7"], day: "thu", slot: 3, place: "Hall 7" },
    ],
  },
  {
    code: "IT212",
    name: { ar: "تصميم منطقي", en: "Logic Design" },
    dept: "GEN", level: 2, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [
      { day: "mon", slots: [4, 5], place: "Al-Shafei Hall", doctor: "Dr. Eman Ahmed & Dr. Dina Tarek" },
    ],
    sections: [
      { label: ["S21", "S22", "S23", "S24"], day: "tue", slot: 5, place: "Hall 8" },
      { label: ["S1", "S2", "S3", "S4"],     day: "thu", slot: 1, place: "Exam Room 411" },
      { label: ["S5", "S6", "S7", "S8"],     day: "thu", slot: 2, place: "Exam Room 411" },
      { label: ["S21", "S22", "S23", "S24"], day: "thu", slot: 2, place: "Exam Room 404" },
      { label: ["S17", "S18", "S19", "S20"], day: "thu", slot: 3, place: "Exam Room 411" },
      { label: ["S9", "S10", "S11", "S12"],  day: "thu", slot: 4, place: "Exam Room 411" },
      { label: ["S3", "S14", "S15", "S16"],  day: "thu", slot: 5, place: "Exam Room 411" },
    ],
  },
  /* Level 2 Retakes */
  {
    code: "CS214",
    name: { ar: "هياكل البيانات (إعادة)", en: "Data Structures (Retake)" },
    dept: "GEN", level: 2, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "sat", slots: [2, 3], place: "Exam Room 408", doctor: "Dr. Samar Hesham" } ],
    sections: [
      { label: ["S9", "S10"], day: "tue", slot: 4, place: "Lab 8" },
      { label: ["S11", "S12"], day: "tue", slot: 5, place: "Lab 8" },
      { label: ["S13", "S14"], day: "tue", slot: 6, place: "Lab 8" },
      { label: ["S1", "S2"], day: "thu", slot: 1, place: "Lab 3" },
      { label: ["S3", "S4"], day: "thu", slot: 2, place: "Lab 3" },
      { label: ["S5", "S6"], day: "thu", slot: 3, place: "Lab 6" },
      { label: ["S7", "S8"], day: "thu", slot: 4, place: "Lab 7" },
    ],
  },
  {
    code: "IS231",
    name: { ar: "تكنولوجيا الويب (إعادة)", en: "Web Technology (Retake)" },
    dept: "GEN", level: 2, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "sat", slots: [4, 5], place: "Exam Room 408", doctor: "Dr. Laila Abdel Rahman" } ],
    sections: [
      { label: ["S1", "S2"], day: "thu", slot: 1, place: "Lab 8" },
      { label: ["S3", "S4"], day: "thu", slot: 2, place: "Lab 8" },
    ],
  },
  {
    code: "CS251",
    name: { ar: "مقدمة في هندسة البرمجيات (إعادة)", en: "Introduction to Software Engineering (Retake)" },
    dept: "GEN", level: 2, isRetake: true, creditHours: 3, mandatoryFor: ["CS", "IT", "IS", "DS", "AI"],
    lectures: [ { day: "wed", slots: [1, 2], place: "Exam Room 409", doctor: "Dr. Lamia Abo Zaid" } ],
    sections: [
      { label: ["S7", "S8"], day: "mon", slot: 1, place: "Lab 8" },
      { label: ["S9", "S10"], day: "mon", slot: 2, place: "Lab 7" },
      { label: ["S3", "S4"], day: "thu", slot: 1, place: "Lab 7" },
      { label: ["S11", "S12"], day: "thu", slot: 2, place: "Lab 7" },
      { label: ["S1", "S2"], day: "thu", slot: 3, place: "Lab 5" },
      { label: ["S13", "S14"], day: "thu", slot: 6, place: "Lab 6" },
      { label: ["S5", "S6"], day: "thu", slot: 6, place: "Lab 7" },
    ],
  },

  /* ============================ LEVEL 3 ============================ */
  {
    code: "CS316", name: "Advanced Data Structures",
    dept: "CS", level: 3, creditHours: 3, mandatoryFor: ["CS"],
    lectures: [ { day: "mon", slots: [1, 2], place: "Hall 8", doctor: "Dr. Amin Alam" } ],
    sections: [
      { label: ["S1", "S2"], day: "mon", slot: 3, place: "Lab 8" },
      { label: ["S3", "S4"], day: "tue", slot: 2, place: "Lab 7" },
      { label: ["S5", "S6"], day: "wed", slot: 4, place: "Lab 6" },
      { label: ["S7", "S8"], day: "wed", slot: 3, place: "Lab 8" },
    ],
  },
  {
    code: "IT351", name: "Information Theory and Data Compression",
    dept: "IT", level: 3, creditHours: 3, mandatoryFor: ["CS", "IT"],
    lectures: [ { day: "sat", slots: [3, 4], place: "Farag Hall", doctor: "Dr. Asmaa Ahmed" } ],
    sections: [
      { label: ["S5", "S6"],  day: "sat", slot: 1, place: "Lab 3" },
      { label: ["S1", "S2"],  day: "sat", slot: 2, place: "Library Lab" },
      { label: ["S1", "S2"],  day: "sat", slot: 5, place: "Lab 5" },
      { label: ["S5", "S6"],  day: "sat", slot: 6, place: "Lab 5" },
      { label: ["S3", "S4"],  day: "tue", slot: 1, place: "Lab 8" },
      { label: ["S3", "S4"],  day: "tue", slot: 4, place: "Library Lab" },
      { label: ["S7", "S8"],  day: "wed", slot: 3, place: "Lab 6" },
      { label: ["S9", "S10"], day: "wed", slot: 4, place: "Lab 3" },
    ],
  },
  {
    code: "CS331", name: "Computer Organization and Architecture",
    dept: "CS", level: 3, creditHours: 3, mandatoryFor: ["CS", "AI"],
    lectures: [ { day: "sat", slots: [5, 6], place: "Farag Hall", doctor: "Dr. Ahmed Shawky" } ],
    sections: [
      { label: ["S3", "S4"], day: "mon", slot: 3, place: "Lab 7" },
      { label: ["S1", "S2"], day: "wed", slot: 1, place: "Lab 6" },
      { label: ["S5", "S6"], day: "wed", slot: 2, place: "Lab 7" },
      { label: ["S7", "S8"], day: "wed", slot: 3, place: "Lab 5" },
      { label: ["S1", "S2"], day: "sun", slot: 4, place: "Library Lab" },
      { label: ["S3", "S4"], day: "mon", slot: 1, place: "Lab 6" },
      { label: ["S5", "S6"], day: "thu", slot: 3, place: "Lab 3" },
      { label: ["S7", "S8"], day: "thu", slot: 4, place: "Lab 6" },
    ],
  },
  {
    code: "CS321", name: "Algorithms Analysis and Design",
    dept: "CS", level: 3, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "mon", slots: [4, 5], place: "Farag Hall", doctor: "Dr. Basher Youssef" } ],
    sections: [
      /* CS page */
      { label: ["S1", "S2"], day: "sat", slot: 1, place: "Lab 5" },
      { label: ["S3", "S4"], day: "mon", slot: 6, place: "Lab 5" },
      { label: ["S5", "S6"], day: "tue", slot: 1, place: "Lab 7" },
      { label: ["S7", "S8"], day: "tue", slot: 4, place: "Lab 7" },
      /* IT page */
      { label: ["S1", "S2"], day: "sun", slot: 3, place: "Lab 8" },
      { label: ["S3", "S4"], day: "sun", slot: 5, place: "Lab 6" },
      { label: ["S5", "S6"], day: "sun", slot: 6, place: "Lab 8" },
      /* IS page */
      { label: ["S1", "S2"], day: "sun", slot: 1, place: "Library Lab" },
      { label: ["S3", "S4"], day: "sat", slot: 5, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "sat", slot: 6, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "mon", slot: 6, place: "Library Lab" },
      /* DS page */
      { label: ["S1", "S2"], day: "sat", slot: 5, place: "Lab 6" },
      { label: ["S3", "S4"], day: "sat", slot: 6, place: "Lab 6" },
      { label: ["S5", "S6"], day: "tue", slot: 4, place: "Lab 3" },
      /* AI page */
      { label: ["S5", "S6"], day: "sun", slot: 4, place: "Lab 5" },
      { label: ["S3", "S4"], day: "mon", slot: 1, place: "Lab 5" },
      { label: ["S1", "S2"], day: "mon", slot: 2, place: "Lab 5" },
    ],
  },
  {
    code: "CS342", name: "Operating Systems",
    dept: "CS", level: 3, creditHours: 3, mandatoryFor: ["CS"],
    lectures: [ { day: "tue", slots: [5, 6], place: "Farag Hall", doctor: "Prof. Khaled Tawfik" } ],
    sections: [
      /* CS page */
      { label: ["S5", "S6"], day: "tue", slot: 1, place: "Lab 6" },
      { label: ["S3", "S4"], day: "tue", slot: 1, place: "Lab 5" },
      { label: ["S1", "S2"], day: "tue", slot: 2, place: "Lab 5" },
      { label: ["S7", "S8"], day: "tue", slot: 2, place: "Lab 3" },
      /* IT page */
      { label: ["S1", "S2"], day: "sat", slot: 6, place: "Lab 8" },
      { label: ["S3", "S4"], day: "tue", slot: 1, place: "Library Lab" },
      { label: ["S5", "S6"], day: "tue", slot: 2, place: "Library Lab" },
      /* IS page */
      { label: ["S7", "S8"], day: "tue", slot: 1, place: "Lab 3" },
      { label: ["S1", "S2"], day: "tue", slot: 2, place: "Lab 6" },
      { label: ["S5", "S6"], day: "wed", slot: 3, place: "Library Lab" },
      { label: ["S3", "S4"], day: "wed", slot: 4, place: "Lab 8" },
      /* DS page */
      { label: ["S1", "S2"], day: "wed", slot: 1, place: "Lab 8" },
      { label: ["S3", "S4"], day: "wed", slot: 2, place: "Lab 8" },
      /* AI page */
      { label: ["S3", "S4"], day: "mon", slot: 1, place: "Lab 5" },
      { label: ["S1", "S2"], day: "thu", slot: 3, place: "Lab 7" },
      { label: ["S5", "S6"], day: "thu", slot: 4, place: "Lab 8" },
    ],
  },
  {
    code: "CS352", name: "Advanced Software Engineering",
    dept: "CS", level: 3, creditHours: 3, mandatoryFor: ["CS", "IS"],
    lectures: [ { day: "wed", slots: [5, 6], place: "Farag Hall", doctor: "Dr. Desoky Abdel-Kawy" } ],
    sections: [
      /* CS page */
      { label: ["S1", "S2"], day: "sat", slot: 2, place: "Lab 7" },
      { label: ["S5", "S6"], day: "mon", slot: 6, place: "Lab 7" },
      { label: ["S3", "S4"], day: "wed", slot: 1, place: "Lab 5" },
      { label: ["S7", "S8"], day: "wed", slot: 4, place: "Library Lab" },
      /* IS page */
      { label: ["S3", "S4"], day: "sun", slot: 1, place: "Lab 3" },
      { label: ["S7", "S8"], day: "mon", slot: 6, place: "Lab 8" },
      { label: ["S1", "S2"], day: "tue", slot: 4, place: "Lab 6" },
      { label: ["S5", "S6"], day: "wed", slot: 1, place: "Lab 7" },  // labels missing in V3 PDF text — verify
    ],
  },
  {
    code: "IT331", name: "Data Communication",
    dept: "IT", level: 3, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "sat", slots: [1, 2], place: "Exam Room 409", doctor: "Dr. Eman Sannad" } ],
    sections: [
      { label: ["S1", "S2", "S3"], day: "sun", slot: 1, place: "Exam Room 411" },
      { label: ["S4", "S5", "S6"], day: "sun", slot: 2, place: "Exam Room 411" },
    ],
  },
  {
    code: "IT313", name: "Computer Architecture",
    dept: "IT", level: 3, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "thu", slots: [3, 4], place: "Exam Room 408", doctor: "Prof. Neveen Aboel-Hadid" } ],
    sections: [
      { label: ["S1", "S2"], day: "sun", slot: 3, place: "Lab 3" },
      { label: ["S5", "S6"], day: "sun", slot: 4, place: "Lab 6" },
      { label: ["S3", "S4"], day: "sun", slot: 5, place: "Lab 8" },
    ],
  },
  {
    code: "IT352", name: "Pattern Recognition",
    dept: "IT", level: 3, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "mon", slots: [2, 3], place: "Exam Room 410", doctor: "Prof. Reda Abdel-Wahab & Dr. Mona Soliman" } ],
    sections: [
      { label: ["S1", "S2"], day: "tue", slot: 4, place: "Lab 5" },
    ],
  },
  {
    code: "IS332", name: "Analysis and Design of Information Systems",
    dept: "IS", level: 3, creditHours: 3, mandatoryFor: ["IS"],
    lectures: [ { day: "sat", slots: [3, 4], place: "Exam Room 409", doctor: "Dr. Sherif Zahran" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "sat", slot: 2, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "wed", slot: 1, place: "Lab 3" },
      { label: ["S7", "S8"], day: "wed", slot: 2, place: "Lab 3" },
    ],
  },
  {
    code: "IS321", name: "File Management and Processing",
    dept: "IS", level: 3, creditHours: 3, mandatoryFor: ["IS"],
    lectures: [ { day: "sun", slots: [2, 3], place: "Hall 8", doctor: "Dr. Ayman El-Kilany & Dr. Wafaa Momen" } ],
    sections: [
      { label: ["S5", "S6"], day: "sat", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S1", "S2"], day: "sat", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "sun", slot: 5, place: "Lab 5" },
      { label: ["S3", "S4"], day: "mon", slot: 6, place: "Lab 3" },
    ],
  },
  {
    code: "IS312", name: "Database Management Systems",
    dept: "IS", level: 3, creditHours: 3, mandatoryFor: ["IS"],
    lectures: [ { day: "mon", slots: [2, 3], place: "Exam Room 409", doctor: "Dr. Noha Nagy & Dr. Ali Zidan" } ],
    sections: [
      { label: ["S3", "S4"], day: "sat", slot: 5, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "sat", slot: 6, place: "Ben-ElSarayat Lab 35" },
      { label: ["S7", "S8"], day: "sun", slot: 1, place: "Lab 6" },
      { label: ["S1", "S2"], day: "sun", slot: 5, place: "Lab 7" },
    ],
  },
  {
    code: "DS341", name: "Learning From Data",
    dept: "DS", level: 3, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [ { day: "sat", slots: [1, 2], place: "Exam Room 410", doctor: "Dr. Mohamed Saad" } ],
    sections: [
      { label: ["S3", "S4"], day: "sat", slot: 5, place: "Lab 3" },
      { label: ["S1", "S2"], day: "sat", slot: 6, place: "Lab 3" },
      { label: ["S3", "S4"], day: "sun", slot: 4, place: "Lab 3" },
      { label: ["S1", "S2"], day: "sun", slot: 5, place: "Lab 3" },
      { label: ["S5", "S6"], day: "sun", slot: 6, place: "Lab 6" },
    ],
  },
  {
    code: "DS331", name: "System Modeling and Simulation",
    dept: "DS", level: 3, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [ { day: "tue", slots: [1, 2], place: "Hall 8", doctor: "Dr. Ayman Sabry" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 5, place: "Lab 7" },
      { label: ["S3", "S4"], day: "sat", slot: 6, place: "Lab 7" },
      { label: ["S5", "S6"], day: "sun", slot: 2, place: "Lab 8" },
    ],
  },
  {
    code: "DS321", name: "Linear and Integer Programming",
    dept: "DS", level: 3, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [ { day: "sat", slots: [3, 4], place: "Exam Room 410", doctor: "Dr. Basma Mostafa" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4", "S5", "S6"], day: "sun", slot: 1, place: "Exam Room 409" },
    ],
  },
  {
    code: "DS312", name: "Decision Support and Future Studies Methodologies",
    dept: "DS", level: 3, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [
      { day: "mon", slots: [3, 3], place: "Hall 8", doctor: "Prof. Motaz Khorshid & Dr. Hayam Gamal & Dr. Basma Mostafa" },
      { day: "wed", slots: [3, 3], place: "Hall 8", doctor: "Prof. Motaz Khorshid & Dr. Hayam Gamal & Dr. Basma Mostafa" },
    ],
    sections: [
      { label: ["S5", "S6"], day: "sun", slot: 3, place: "Lab 6" },
      { label: ["S1", "S2"], day: "wed", slot: 1, place: "Library Lab" },
      { label: ["S3", "S4"], day: "wed", slot: 2, place: "Library Lab" },
    ],
  },
  {
    code: "AI311", name: "Introduction to Logic",
    dept: "AI", level: 3, creditHours: 3, mandatoryFor: ["AI"],
    lectures: [ { day: "sat", slots: [1, 2], place: "Exam Room 411", doctor: "Dr. Samar Taha" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 3, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "sat", slot: 4, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "mon", slot: 2, place: "Lab 3" },
      { label: ["S5", "S6"], day: "mon", slot: 3, place: "Lab 3" },
    ],
  },
  {
    code: "AI321", name: "Theoretical Foundations of Machine Learning",
    dept: "AI", level: 3, creditHours: 3, mandatoryFor: ["AI"],
    lectures: [ { day: "sun", slots: [2, 3], place: "Exam Room 410", doctor: "Prof. Reda Abdel-Wahab" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 3, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "sat", slot: 4, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "mon", slot: 1, place: "Library Lab" },
    ],
  },
  {
    code: "IT341", name: "Signals and Systems",
    dept: "IT", level: 3, creditHours: 3, mandatoryFor: ["IT", "AI"],
    lectures: [ { day: "thu", slots: [5, 6], place: "Farag Hall", doctor: "Dr. Mohamed Refaay" } ],
    sections: [
      { label: ["S1", "S2", "S3"], day: "tue", slot: 1, place: "Exam Room 404" },
      { label: ["S4", "S5", "S6"], day: "tue", slot: 2, place: "Exam Room 404" },
    ],
  },

  /* ============================ LEVEL 4 ============================ */
  {
    code: "CS462", name: "Machine Learning",
    dept: "CS", level: 4, creditHours: 3, mandatoryFor: ["CS", "IS"],
    lectures: [ { day: "sat", slots: [1, 2], place: "Hall 7", doctor: "Prof. Khaled Tawfik & Dr. Basma Mokhtar" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 3, place: "Lab 8" },
      { label: ["S3", "S4"], day: "sat", slot: 4, place: "Lab 8" },
      { label: ["S5", "S6"], day: "thu", slot: 5, place: "Ben-ElSarayat Lab 35" },
      { label: ["S7", "S8"], day: "thu", slot: 6, place: "Ben-ElSarayat Lab 35" },
      { label: ["S1", "S2"], day: "sun", slot: 5, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "sun", slot: 6, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "wed", slot: 5, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "wed", slot: 6, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "CS465", name: "Soft Computing",
    dept: "CS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "tue", slots: [4, 5], place: "Exam Room 411", doctor: "Dr. Sabah El-Sayed" } ],
    sections: [
      { label: ["S1", "S2"], day: "sat", slot: 3, place: "Lab 7" },
      { label: ["S3", "S4"], day: "sat", slot: 4, place: "Lab 7" },
      { label: ["S5", "S6"], day: "thu", slot: 5, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "thu", slot: 6, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "CS423", name: "Compilers",
    dept: "CS", level: 4, creditHours: 3, mandatoryFor: ["CS"],
    lectures: [ { day: "tue", slots: [1, 2], place: "Exam Room 411", doctor: "Dr. Amin Alam" } ],
    sections: [
      { label: ["S3", "S4"], day: "mon", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S1", "S2"], day: "mon", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "mon", slot: 3, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "CS495", name: "Selected Topics in Computer Science-1",
    dept: "CS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "thu", slots: [3, 4], place: "Exam Room 404", doctor: "Dr. Mohamed Abdel-Wahab" } ],
    sections: [
      { label: ["S1", "S2"], day: "mon", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "mon", slot: 2, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "mon", slot: 3, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "IT432", name: "Communication Technology",
    dept: "IT", level: 4, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "tue", slots: [4, 5], place: "Hall 7", doctor: "Prof. Haitham Safwat" } ],
    sections: [
      { label: ["S1", "S2"], day: "wed", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "wed", slot: 2, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "wed", slot: 3, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "IT443", name: "Image Processing",
    dept: "IT", level: 4, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "mon", slots: [2, 3], place: "Exam Room 411", doctor: "Prof. Hoda Onsy & Dr. Mona Soliman & Dr. Ghada Dahy" } ],
    sections: [
      { label: ["S1", "S2"], day: "mon", slot: 4, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "mon", slot: 5, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "mon", slot: 6, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "IT424", name: "Wireless and Mobile Networks",
    dept: "IT", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "thu", slots: [3, 4], place: "Exam Room 409", doctor: "Prof. Imane Saroit & Prof. Amira Kotb" } ],
    sections: [
      { label: ["S1", "S2"], day: "mon", slot: 4, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "mon", slot: 5, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "mon", slot: 6, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "IT416", name: "Robotics",
    dept: "IT", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "tue", slots: [1, 2], place: "Exam Room 410", doctor: "Prof. Reda Abdel-Wahab" } ],
    sections: [
      { label: ["S1", "S2"], day: "mon", slot: 1, place: "Lab 3" },
    ],
  },
  {
    code: "IT423", name: "Information and Computer Network Security",
    dept: "IT", level: 4, creditHours: 3, mandatoryFor: ["IT"],
    lectures: [ { day: "thu", slots: [1, 2], place: "Exam Room 409", doctor: "Prof. Sanaa Taha" } ],
    sections: [
      { label: ["S1", "S2"], day: "wed", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "wed", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "wed", slot: 3, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "IS437", name: "Information Systems Development Methodologies",
    dept: "IS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "sat", slots: [3, 4], place: "Exam Room 411", doctor: "Dr. Hatem El-Kady" } ],
    sections: [
      { label: ["S5", "S6"], day: "sun", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S7", "S8"], day: "sun", slot: 3, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "sun", slot: 4, place: "Ben-ElSarayat Lab 32" },
      { label: ["S1", "S2"], day: "sun", slot: 5, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: "IS434", name: "Service-Oriented Architecture",
    dept: "IS", level: 4, creditHours: 3, mandatoryFor: ["IS"],
    lectures: [ { day: "tue", slots: [1, 2], place: "Exam Room 409", doctor: "Dr. Ehab Ezzat & Dr. Samar Taha" } ],
    sections: [
      { label: ["S5", "S6"], day: "sun", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "sun", slot: 4, place: "Ben-ElSarayat Lab 35" },
      { label: ["S7", "S8"], day: "wed", slot: 5, place: "Ben-ElSarayat Lab 35" },
      { label: ["S1", "S2"], day: "wed", slot: 6, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "IS442", name: "Geographical Information Systems",
    dept: "IS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "tue", slots: [4, 5], place: "Exam Room 409", doctor: "Prof. Mohamed Nour El-Din" } ],
    sections: [
      { label: ["S1", "S2"], day: "sun", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "sun", slot: 2, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "sun", slot: 3, place: "Ben-ElSarayat Lab 35" },
      { label: ["S7", "S8"], day: "sun", slot: 6, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "IS417", name: "Selected Topics in Database",
    dept: "IS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "wed", slots: [3, 4], place: "Exam Room 411", doctor: "Dr. Wafaa Momen" } ],
    sections: [
      { label: ["S3", "S4"], day: "sat", slot: 5, place: "Lab 3" },
      { label: ["S1", "S2"], day: "sat", slot: 6, place: "Library Lab" },
    ],
  },
  {
    code: "DS456", name: "Project Management",
    dept: "DS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "sun", slots: [1, 2], place: "Exam Room 408", doctor: "Dr. Doaa Saleh" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4", "S5"],         day: "sun", slot: 5, place: "Exam Room 408" },
      { label: ["S6", "S7", "S8", "S9", "S10"],        day: "sun", slot: 6, place: "Exam Room 408" },
      { label: ["S11", "S12", "S13", "S14", "S15"],    day: "wed", slot: 4, place: "Exam Room 409" },
      { label: ["S16", "S17", "S18", "S19", "S20"],    day: "wed", slot: 5, place: "Exam Room 409" },
    ],
  },
  {
    code: "DS342", name: "Data Analytics",
    dept: "DS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "thu", slots: [1, 2], place: "Exam Room 410", doctor: "Dr. Sally Kasem & Dr. Marwa Mostafa" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4"],           day: "sun", slot: 3, place: "Exam Room 408" },
      { label: ["S5", "S6", "S7", "S8"],           day: "sun", slot: 4, place: "Exam Room 408" },
      { label: ["S9", "S10", "S11", "S12"],        day: "wed", slot: 4, place: "Exam Room 404" },
      { label: ["S13", "S14", "S15", "S16"],       day: "wed", slot: 5, place: "Exam Room 404" },
    ],
  },
  {
    code: "DS344", name: "Forecasting and Predictive Analytics",
    dept: "DS", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "thu", slots: [3, 4], place: "Exam Room 410", doctor: "Dr. Olivia Mourad" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4", "S5"], day: "sun", slot: 3, place: "Exam Room 409" },
    ],
  },
  {
    code: "DS424", name: "Multi-objective Programming",
    dept: "DS", level: 4, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [ { day: "tue", slots: [1, 2], place: "Exam Room 408", doctor: "Prof. Tarek Aboel-Enin" } ],
    sections: [
      { label: ["S1", "S2", "S3", "S4", "S5"], day: "tue", slot: 4, place: "Exam Room 408" },
    ],
  },
  {
    code: "DS425", name: "Network Modeling and Optimization",
    dept: "DS", level: 4, creditHours: 3, mandatoryFor: ["DS"],
    lectures: [ { day: "wed", slots: [2, 3], place: "Exam Room 404", doctor: "Dr. Ghada Soliman" } ],
    sections: [
      { label: ["S3", "S4"], day: "tue", slot: 5, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "tue", slot: 6, place: "Ben-ElSarayat Lab 32" },
      { label: ["S1", "S2"], day: "wed", slot: 5, place: "Library Lab" },
    ],
  },
  {
    code: null, name: "Generative Adversarial Networks",
    dept: "AI", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "sat", slots: [1, 2], place: "Exam Room 404", doctor: "Dr. Ghada Dahy" } ],
    sections: [
      { label: ["S3", "S4"], day: "tue", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "tue", slot: 4, place: "Ben-ElSarayat Lab 35" },
      { label: ["S1", "S2"], day: "thu", slot: 3, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "AI441", name: "Intelligent Autonomous Robotics",
    dept: "AI", level: 4, creditHours: 3, mandatoryFor: ["AI"],
    lectures: [ { day: "sat", slots: [3, 4], place: "Exam Room 404", doctor: "Dr. Mohamed Wahby" } ],
    sections: [
      { label: ["S1", "S2"], day: "tue", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "tue", slot: 4, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "thu", slot: 4, place: "Ben-ElSarayat Lab 35" },
    ],
  },
  {
    code: "AI423", name: "Unsupervised Learning",
    dept: "AI", level: 4, creditHours: 3, mandatoryFor: ["AI"],
    lectures: [ { day: "sat", slots: [5, 6], place: "Exam Room 404", doctor: "Dr. Mahmoud Eid" } ],
    sections: [
      { label: ["S1", "S2"], day: "thu", slot: 1, place: "Ben-ElSarayat Lab 35" },
      { label: ["S3", "S4"], day: "thu", slot: 2, place: "Ben-ElSarayat Lab 35" },
      { label: ["S5", "S6"], day: "thu", slot: 3, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: null, name: "Selected Topics in Artificial Intelligence-1",
    dept: "AI", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "mon", slots: [1, 2], place: "Exam Room 408", doctor: "Dr. Eman Ahmed" } ],
    sections: [
      { label: ["S1", "S2"], day: "thu", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "thu", slot: 2, place: "Ben-ElSarayat Lab 32" },
      { label: ["S5", "S6"], day: "thu", slot: 4, place: "Ben-ElSarayat Lab 32" },
    ],
  },
  {
    code: null, name: "Brain-Computer Interfacing",
    dept: "AI", level: 4, creditHours: 3, mandatoryFor: [],
    lectures: [ { day: "mon", slots: [3, 4], place: "Exam Room 408", doctor: "Prof. Eid Emary & Dr. Mahmoud Eid" } ],
    sections: [
      { label: ["S1", "S2"], day: "tue", slot: 1, place: "Ben-ElSarayat Lab 32" },
      { label: ["S3", "S4"], day: "tue", slot: 2, place: "Ben-ElSarayat Lab 35" },
    ],
  },
];
