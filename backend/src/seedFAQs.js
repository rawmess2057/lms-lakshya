import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQ from './models/FAQ.js';

dotenv.config();

const faqs = [
  // === Civil Engineering ===
  {
    question: 'What is Civil Engineering?',
    answer: 'Civil engineering is a professional engineering discipline that deals with the design, construction, and maintenance of the physical and naturally built environment. This includes infrastructure such as roads, bridges, canals, dams, airports, sewage systems, pipelines, and buildings. It is one of the oldest engineering disciplines and encompasses several sub-disciplines including structural, geotechnical, transportation, environmental, and water resources engineering.',
    category: 'civil-engineering',
    isPublished: true,
    order: 1,
  },
  {
    question: 'What are the main branches of Civil Engineering?',
    answer: 'Civil engineering has several major branches: (1) Structural Engineering - design of buildings, bridges, towers; (2) Geotechnical Engineering - soil mechanics, foundations, earthworks; (3) Transportation Engineering - roads, railways, airports, traffic systems; (4) Environmental Engineering - water supply, wastewater treatment, pollution control; (5) Water Resources Engineering - dams, canals, hydrology, flood control; (6) Construction Engineering - project management, construction methods; and (7) Surveying - land measurement and mapping.',
    category: 'civil-engineering',
    isPublished: true,
    order: 2,
  },
  {
    question: 'What is the scope of Civil Engineering in Nepal?',
    answer: 'Nepal offers immense scope for civil engineers due to ongoing infrastructure development. Major areas include: hydroelectric power projects, road and highway construction (including post-earthquake reconstruction), bridge building, irrigation systems, urban development and housing, water supply and sanitation projects, airport construction, and tunnel engineering (especially for hydropower). Government agencies like the Department of Roads, Department of Irrigation, and Nepal Electricity Authority, as well as private construction firms and international NGOs, regularly hire civil engineers. The growing real estate sector in cities like Kathmandu, Pokhara, and Bharatpur also provides opportunities.',
    category: 'civil-engineering',
    isPublished: true,
    order: 3,
  },
  {
    question: 'What software tools should Civil Engineering students learn?',
    answer: 'Essential software for civil engineering students includes: AutoCAD (2D/3D drafting), STAAD Pro or ETABS (structural analysis and design), SAP2000 (structural analysis), MATLAB (mathematical modeling and analysis), Revit (BIM - Building Information Modeling), Civil 3D (road and site design), ArcGIS (geographic information systems for transportation and environmental projects), Primavera or MS Project (project management), and Plaxis (geotechnical analysis). Learning Microsoft Excel thoroughly is also crucial for structural calculations and data analysis.',
    category: 'civil-engineering',
    isPublished: true,
    order: 4,
  },
  {
    question: 'How many years does it take to become a Civil Engineer in Nepal?',
    answer: 'In Nepal, the path to becoming a civil engineer typically takes: 4 years for a Bachelor\'s degree in Civil Engineering (BE/B.Tech in Civil Engineering) from an IOE-affiliated or recognized university. After graduation, graduates must register with the Nepal Engineering Council (NEC) to practice as an engineer. Some students also pursue a 2-year Master\'s degree (ME/M.Tech) in specialized fields like Structural Engineering, Geotechnical Engineering, or Hydropower Engineering. The total time from starting a bachelor\'s to becoming a fully registered professional engineer is typically 4-6 years.',
    category: 'civil-engineering',
    isPublished: true,
    order: 5,
  },
  {
    question: 'What is Structural Engineering?',
    answer: 'Structural engineering is a sub-discipline of civil engineering that focuses on the design and analysis of structures that support or resist loads. Structural engineers ensure that buildings, bridges, towers, and other structures are safe, stable, and able to withstand environmental forces like earthquakes, wind, and snow. In Nepal, structural engineering is particularly important due to the country\'s high seismic activity. Structural engineers analyze load paths, select appropriate materials (steel, concrete, timber, masonry), and design structural elements such as beams, columns, slabs, and foundations to meet safety standards like the Nepal National Building Code.',
    category: 'civil-engineering',
    isPublished: true,
    order: 6,
  },
  {
    question: 'What is Geotechnical Engineering?',
    answer: 'Geotechnical engineering is the branch of civil engineering concerned with the behavior of earth materials (soil and rock). Geotechnical engineers investigate subsurface conditions, analyze soil properties, and design foundations, retaining walls, earth dams, tunnels, and slopes. In Nepal, geotechnical engineering is critical for hydropower projects (tunnels, penstocks, dam foundations), road construction in hilly terrain (slope stability, landslide mitigation), and building construction in earthquake-prone areas (soil liquefaction assessment, foundation design). Common tests include Standard Penetration Test (SPT), triaxial tests, and plate load tests.',
    category: 'civil-engineering',
    isPublished: true,
    order: 7,
  },
  {
    question: 'What is Transportation Engineering?',
    answer: 'Transportation engineering is the branch of civil engineering that applies technology and scientific principles to the planning, design, operation, and management of transportation systems. This includes highways, railways, airports, urban transit systems, and traffic management. Transportation engineers work on road geometric design, pavement design, traffic signal optimization, public transit planning, and transportation safety analysis. In Nepal, transportation engineers are involved in major projects like the Kathmandu-Terai Fast Track, Pushpalal Highway, Mid-Hill Highway, and urban road improvement projects in major cities.',
    category: 'civil-engineering',
    isPublished: true,
    order: 8,
  },
  {
    question: 'What is Environmental Engineering?',
    answer: 'Environmental engineering is a branch of civil engineering that focuses on protecting human health and the environment. Environmental engineers design systems for water treatment, wastewater treatment, air pollution control, solid waste management, and environmental remediation. In Nepal, environmental engineers work on drinking water supply projects (especially in rural areas), wastewater treatment plants for urban municipalities, solid waste management systems, industrial pollution control, and environmental impact assessments for infrastructure projects like hydropower plants and highways.',
    category: 'civil-engineering',
    isPublished: true,
    order: 9,
  },
  {
    question: 'What is the average salary of a Civil Engineer in Nepal?',
    answer: 'Salaries for civil engineers in Nepal vary by experience and sector: Fresh graduates typically earn NPR 25,000-40,000 per month. Engineers with 2-5 years of experience earn NPR 40,000-80,000 per month. Senior engineers (5-10 years) can earn NPR 80,000-150,000 per month. Project managers and experienced professionals in hydropower or large infrastructure projects can earn NPR 150,000-300,000+ per month. Government sector salaries follow the Nepal government pay scale but include additional allowances. International organizations and NGOs often pay higher salaries than local firms.',
    category: 'civil-engineering',
    isPublished: true,
    order: 10,
  },

  // === License Exams ===
  {
    question: 'What is the Nepal Engineering Council (NEC)?',
    answer: 'The Nepal Engineering Council (NEC) is the statutory regulatory body established under the Nepal Engineering Council Act, 2055 (1999). NEC is responsible for regulating the engineering profession in Nepal. Its key functions include: registering engineers and engineering students, accrediting engineering educational institutions and programs, conducting licensing examinations, setting professional standards and codes of ethics, and maintaining a register of professional engineers. Registration with NEC is mandatory for anyone wishing to practice engineering in Nepal.',
    category: 'license-exams',
    isPublished: true,
    order: 1,
  },
  {
    question: 'How to register with NEC as a Civil Engineer?',
    answer: 'To register with Nepal Engineering Council (NEC) as a civil engineer: (1) Obtain a Bachelor\'s degree in Civil Engineering from an NEC-recognized institution. (2) Submit an application to NEC with academic transcripts, degree certificate, citizenship certificate, passport-sized photos, and the required fee. (3) Foreign degree holders must first obtain equivalence from NEC. (4) If your institution is not accredited, you may need to pass the NEC licensing examination. (5) Once approved, you receive an NEC registration certificate and a registration number, which is valid for life with periodic renewal. The registration process typically takes 2-4 weeks.',
    category: 'license-exams',
    isPublished: true,
    order: 2,
  },
  {
    question: 'What is the NEC Licensing Examination?',
    answer: 'The NEC Licensing Examination is conducted by the Nepal Engineering Council for engineering graduates who have graduated from institutions not accredited by NEC or for foreign degree holders seeking equivalence. The exam typically covers: (1) Engineering Mathematics, (2) Engineering Principles and Practices, (3) Nepalese Context and Legal Provisions (including the Nepal Engineering Council Act, building codes, and environmental regulations), and (4) Subject-specific questions based on the candidate\'s engineering discipline (e.g., Civil Engineering subjects). The exam is conducted in written format and is usually held once or twice a year.',
    category: 'license-exams',
    isPublished: true,
    order: 3,
  },
  {
    question: 'How to prepare for the NEC Licensing Exam?',
    answer: 'To prepare for the NEC licensing exam: (1) Review core engineering subjects from your undergraduate curriculum, especially structural analysis, geotechnical engineering, hydraulics, transportation engineering, and environmental engineering. (2) Study the Nepal Engineering Council Act 2055 and its amendments. (3) Learn about the Nepal National Building Code and relevant Nepal Standards (NS). (4) Practice past exam questions (available from NEC\'s office or through coaching centers). (5) Consider joining preparatory classes offered by engineering coaching institutes in Kathmandu. (6) Focus on the Nepalese context, including local construction practices, materials, and regulations.',
    category: 'license-exams',
    isPublished: true,
    order: 4,
  },
  {
    question: 'Is NEC registration mandatory to practice in Nepal?',
    answer: 'Yes, NEC registration is mandatory to practice as an engineer in Nepal. According to the Nepal Engineering Council Act 2055, no person can practice engineering in Nepal without being registered with the Council. This applies to: working as an engineer in government agencies, designing infrastructure projects, signing and sealing engineering drawings and documents, serving as a consultant or contractor for engineering works, and teaching engineering in academic institutions. Practicing without NEC registration is illegal and can result in penalties. Companies and organizations also require NEC-registered engineers for project approvals and permits.',
    category: 'license-exams',
    isPublished: true,
    order: 5,
  },
  {
    question: 'What is the IOE Entrance Examination?',
    answer: 'The IOE (Institute of Engineering) Entrance Examination is conducted by the Institute of Engineering, Tribhuvan University, for admission to Bachelor\'s programs in Engineering at IOE constituent and affiliated colleges across Nepal. The exam is held once a year, typically in the month of Bhadra (August/September). It consists of multiple-choice questions covering: Mathematics (50 questions), Physics (50 questions), Chemistry (25 questions), and English (25 questions) - total 150 questions worth 200 marks. Candidates must have completed 10+2 or equivalent with Physics, Chemistry, and Mathematics as major subjects. A minimum of 45% in 10+2 (for general) and 35% (for reserved categories) is required.',
    category: 'license-exams',
    isPublished: true,
    order: 6,
  },
  {
    question: 'How to prepare for the IOE Entrance Exam?',
    answer: 'To prepare for the IOE entrance exam: (1) Thoroughly study the 10+2 syllabus for Physics, Chemistry, Mathematics, and English. (2) Practice MCQs extensively using past IOE entrance question papers. (3) Take mock tests regularly to improve speed and accuracy. (4) Focus on numerical problems in Physics and Chemistry. (5) Strengthen your Mathematics fundamentals, especially calculus, algebra, trigonometry, vectors, and geometry. (6) For English, focus on grammar, vocabulary, and comprehension. (7) Use IOE preparation books available at local bookstores or join entrance preparation coaching classes in Kathmandu, Pokhara, or other major cities.',
    category: 'license-exams',
    isPublished: true,
    order: 7,
  },
  {
    question: 'Can Nepali engineers work abroad with NEC registration?',
    answer: 'NEC registration alone is not sufficient to work abroad. Each country has its own engineering licensing requirements. For example: In the USA, Nepali engineers must pass the FE (Fundamentals of Engineering) and PE (Professional Engineering) exams and meet state-specific requirements. In Australia, engineers need assessment by Engineers Australia. In Canada, registration with provincial engineering bodies (e.g., PEO, APEGA) is required. In the UK, registration with the Engineering Council UK is needed. However, NEC registration helps in proving your engineering qualifications. Many Nepali engineers work in the Middle East, Australia, Canada, the USA, the UK, and Japan, where they typically need to pass local licensing exams or undergo credential assessment.',
    category: 'license-exams',
    isPublished: true,
    order: 8,
  },

  // === Tuition ===
  {
    question: 'What civil engineering courses do you offer?',
    answer: 'We offer comprehensive civil engineering courses covering: (1) Core Subjects - Structural Analysis, Strength of Materials, Geotechnical Engineering, Fluid Mechanics, Transportation Engineering, Environmental Engineering, and Surveying. (2) Software Training - AutoCAD, STAAD Pro, ETABS, Revit, Civil 3D, and MATLAB. (3) Exam Preparation - NEC licensing exam prep, IOE entrance exam prep, and FE/PE exam orientation. (4) Practical Training - Project work assistance, thesis guidance, and site visit programs. Our courses are designed for both bachelor\'s degree students and working professionals looking to upgrade their skills.',
    category: 'tuition',
    isPublished: true,
    order: 1,
  },
  {
    question: 'Who are the instructors for civil engineering?',
    answer: 'Our civil engineering instructors are experienced professionals and academics with strong credentials: (1) PhD holders and professors from IOE and other leading engineering colleges in Nepal. (2) Professional engineers registered with NEC and working in the industry with 10+ years of experience. (3) Specialists in structural design, hydropower engineering, transportation engineering, and geotechnical engineering. (4) Software trainers certified in AutoCAD, STAAD Pro, ETABS, and Revit. All our instructors have a minimum of a Master\'s degree in their specialization and proven teaching or training experience.',
    category: 'tuition',
    isPublished: true,
    order: 2,
  },
  {
    question: 'Is online tuition available for civil engineering?',
    answer: 'Yes, we offer both online and in-person tuition options. Online classes are conducted via live interactive sessions with features including: real-time screen sharing for software demonstrations, recorded sessions available for later review, digital whiteboard for problem-solving, downloadable study materials and notes, online MCQ practice tests, and WhatsApp/Telegram groups for doubt clearing. Online classes are perfect for students outside Kathmandu Valley or those with busy schedules. In-person classes are available at our location for students who prefer face-to-face interaction and hands-on learning.',
    category: 'tuition',
    isPublished: true,
    order: 3,
  },
  {
    question: 'What is the fee structure for civil engineering classes?',
    answer: 'Our fee structure varies by course type: (1) Individual subject tuition (per subject per semester) - NPR 5,000-10,000. (2) Complete semester package (all subjects) - NPR 20,000-35,000. (3) Software training courses (per software, 2-3 months) - NPR 8,000-15,000. (4) NEC exam preparation course - NPR 12,000-18,000. (5) IOE entrance preparation (full course) - NPR 15,000-25,000. (6) Thesis/project guidance - NPR 10,000-20,000. We offer installment payment options, early bird discounts, and group discounts (3+ students enrolling together). Contact us for a detailed fee breakdown.',
    category: 'tuition',
    isPublished: true,
    order: 4,
  },
  {
    question: 'Do you offer exam preparation for NEC?',
    answer: 'Yes, we offer a dedicated NEC (Nepal Engineering Council) Licensing Exam Preparation course. The course includes: (1) Comprehensive coverage of all exam topics - Engineering Mathematics, Engineering Principles, Nepalese Legal Provisions, and Civil Engineering specialization. (2) Study materials including notes, reference books, and past question collections. (3) Regular mock tests with answer key and feedback. (4) One-on-one doubt clearing sessions. (5) Tips and strategies for effective exam performance. The course duration is typically 2-3 months with classes held on weekends for the convenience of working professionals. Batch sizes are kept small for personalized attention.',
    category: 'tuition',
    isPublished: true,
    order: 5,
  },
  {
    question: 'Are there recorded lectures available?',
    answer: 'Yes, all our online classes are recorded and made available to enrolled students. Recorded lectures can be accessed through our online learning platform anytime, anywhere. This allows students to: (1) Review difficult concepts at their own pace. (2) Catch up on missed classes. (3) Re-watch complex problem-solving demonstrations. (4) Prepare for exams by revisiting key topics. Recordings remain accessible for the duration of the course plus 30 days after course completion. For software training courses, recordings are available indefinitely so students can refer back to them while working on real projects.',
    category: 'tuition',
    isPublished: true,
    order: 6,
  },
];

async function seedFAQs() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lakshya_academy';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');

    await FAQ.deleteMany({});
    console.log('Cleared existing FAQs');

    const created = await FAQ.insertMany(faqs);
    console.log(`Successfully seeded ${created.length} FAQs`);

    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
}

seedFAQs();
