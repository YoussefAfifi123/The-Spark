/**
 * Spark (سبارك) — Comprehensive Arabic & English Localization Engine
 * Provides instant, complete, bi-directional translation for every single point of text in the platform.
 */

(function() {
  'use strict';

  // Master translation dictionary
  const AR_DICT = {
    // Brand & Headers
    "Spark": "سَبارك",
    "Manara": "مَنارة",
    "Learn & Focus": "منصة التعلّم والتركيز",
    "Spark Platform": "منصة سَبارك",
    "Manara Platform": "منصة سَبارك",
    "Welcome to Spark": "مرحبًا بك في منصة سَبارك",
    "Welcome to Manara": "مرحبًا بك في منصة سَبارك",
    "Small steps, big momentum in learning and focus.": "خطوات صغيرة، انطلاقة عظيمة في التعلّم والتركيز والعلوم.",
    "What should we call you?": "ما اسمك الكريم؟",
    "What grade are you in?": "في أي صف دراسي أنت؟",
    "Pick an avatar color": "اختر لونك المفضل",
    "Get Started": "ابدأ رحلتك الآن",
    "Your name": "اسمك هنا...",
    "Please enter your name": "يرجى كتابة اسمك",

    // Sidebar & Navigation
    "Dashboard": "لوحة التحكم",
    "Focus Lab": "مختبر التركيز",
    "Task Planner": "منظّم المهام",
    "Schedule & Timetable": "الجدول والمواعيد",
    "Mind & Mood": "الراحة والمزاج",
    "Learn & Play": "تعلّم والعب",
    "Science Lab": "مختبر العلوم",
    "Science Lab (PhET)": "مختبر العلوم (PhET)",
    "Calculator": "الآلة الحاسبة",
    "Scientific Calculator": "الآلة الحاسبة العلمية",
    "Flashcards": "البطاقات التعليمية",
    "Store": "المتجر",
    "Spark Store": "متجر سَبارك",
    "Manara Store": "متجر سَبارك",
    "Resources": "مصادر التعلّم",
    "Free Learning Resources": "مصادر التعلّم المجانية",
    "Progress": "مستوى التقدم",
    "Your Progress": "مستوى تقدمك",
    "Settings": "الإعدادات",
    "Settings & Preferences": "الإعدادات والتخصيص",
    "Collapse": "طي القائمة",
    "Expand": "توسيع القائمة",
    "Collapse sidebar": "طي القائمة الجانبية",
    "Expand sidebar": "توسيع القائمة الجانبية",

    // Top Bar
    "Focus": "تركيز سريع",
    "Quick Focus": "تركيز سريع",
    "Quick Focus Session": "بدء جلسة تركيز سريعة",
    "day streak": "يوم متواصل",
    "Switch Language / تغيير اللغة": "تغيير اللغة (Language)",

    // Dashboard View
    "Welcome back": "مرحبًا بعودتك",
    "Here's what's on your plate today. Just pick one thing to start.": "إليك مهامك اليوم. اختر شيئًا واحدًا فقط وابدأ به.",
    "XP total": "إجمالي نقاط الخبرة",
    "Task Planner & Daily Goal": "منظّم المهام وهدف اليوم",
    "Open Planner": "فتح المنظّم",
    "Daily Focus Goal": "هدف التركيز اليومي",
    "No active tasks right now.": "لا توجد مهام نشطة حاليًا.",
    "Add a Task": "إضافة مهمة جديدة",
    "Today's Timetable & Classes": "جدول الحصص والمواعيد لليوم",
    "Full Timetable": "الجدول الكامل",
    "No classes or scheduled study tasks today.": "لا توجد حصص أو مهام مذاكرة مجدولة اليوم.",
    "Open Schedule": "فتح الجدول",
    "Mind & Emotional Health Check-In": "تسجيل الحالة النفسية والراحة الذهنية",
    "CBT Reframing": "إعادة الصياغة الإدراكية (CBT)",
    "Wellness Hub": "واحة الراحة والمزاج",
    "How are you feeling right now? Taking 30 seconds to check in helps reduce task anxiety.": "كيف تشعر الآن؟ أخذ 30 ثانية لتسجيل مشاعرك يقلل من قلق المذاكرة والمهام.",
    "🌟 Great": "🌟 ممتاز ومتحمس",
    "🌿 Calm": "🌿 هادئ ومستقر",
    "🎯 Focused": "🎯 في قمة التركيز",
    "🔋 Low Energy": "🔋 طاقة منخفضة",
    "😫 Overwhelmed": "😫 مشتت / ضغط كبير",
    "😰 Anxious": "😰 قلق ومتوتر",
    "Daily Quests": "مهام اليوم الإضافية",
    "Complete a focus session": "أكمل جلسة تركيز",
    "Even 10 minutes counts": "حتى 10 دقائق تصنع فارقًا",
    "Play a learning game": "العب لعبة تعليمية",
    "Practice makes progress": "الممارسة المستمرة تصنع التميز",
    "Explore a resource": "استكشف مصدرًا تعليميًا",
    "Find something new to learn from": "اكتشف معلومة جديدة لتتعلم منها",
    "Start": "ابدأ",
    "Play": "العب",
    "Explore": "استكشف",
    "Just 10 Minutes": "فقط 10 دقائق",
    "Math Adventure": "مغامرة الرياضيات",
    "Primary (Grades 1–6)": "المرحلة الابتدائية (الصفوف 1–6)",
    "Play Now": "العب الآن",
    "GeoGebra & Scientific": "رسم الدوال والحسابات العلمية",
    "Calculate": "احسب الآن",
    "Spaced repetition review": "مراجعة بالتكرار المتباعد",
    "Spend your XP": "استثمر نقاطك",
    "Shop": "تسوق",
    "Focus this week": "التركيز هذا الأسبوع",
    "XP this week": "نقاط الخبرة هذا الأسبوع",
    "Games played": "الألعاب المكتملة",
    "Mute All": "كتم الأصوات",
    "ADHD Focus": "تركيز ADHD",
    "Cozy Lo-Fi": "موسيقى هادئة Lo-Fi",
    "Nature": "طبيعة",
    "Cafe": "أجواء مقهى",
    "Focus Soundscape": "خلفيات الأصوات المحفزة للتركيز",
    "Presets:": "الأوضاع الجاهزة:",

    // Focus Lab
    "The hardest part is starting. We'll make it as easy as possible.": "أصعب خطوة هي البداية دائماً. سنجعلها أسهل وأبسط ما يمكن.",
    "Focus Presets & Interval Schedules": "قوالب التركيز وجداول الفترات",
    "Custom Preset": "قالب مخصص",
    "Pick an Active Task from your Planner:": "اختر مهمة نشطة من منظّم المهام:",
    "What do you need to do?": "ما الذي تريد إنجازه والتركيز عليه الآن؟",
    "e.g. Do math homework, Read chapter 3...": "مثال: حل واجب الرياضيات، قراءة الفصل الثالث...",
    "Do math homework": "حل واجب الرياضيات",
    "Read a chapter": "قراءة فصل دراسي",
    "Write an assignment": "كتابة واجب تعبير",
    "Study for a test": "المذاكرة للاختبار",
    "Practice spelling": "مراجعة الكلمات والمسائل",
    "Break it down first?": "هل تريد تقسيمها لخطوات صغيرة أولاً؟",
    "If this feels too big, we can split it into small steps before starting.": "إذا شعرت أن المهمة ثقيلة، يمكننا تقسيمها إلى خطوات دقيقة سهلة.",
    "Break Down Task": "تقسيم المهمة",
    "Skip breakdown": "تخطي التقسيم والبدء فورًا",
    "Session length": "مدة جلسة التركيز",
    "Current interval schedule:": "نظام الفترات الحالي:",
    "focus /": "تركيز /",
    "break.": "استراحة.",
    "Start Focus Session": "ابدأ جلسة التركيز",
    "Stay focused...": "واصل التركيز بثبات...",
    "Stay with it...": "واصل التركيز بثبات...",
    "Take a breather...": "استرح والتقط أنفاسك...",
    "Paused": "موقوف مؤقتاً",
    "Your steps": "خطواتك المحددة",
    "We'll break it into small steps": "سنقسم المهمة إلى خطوات صغيرة ومحددة",
    "(edit if you want)": "(يمكنك التعديل عليها بحرية)",
    "Type a task above to see the steps...": "اكتب المهمة في الأعلى لرؤية الخطوات المقترحة...",
    "That's it. No setup, no planning paralysis. Just start.": "هذا كل شيء! دون تعقيد أو حيرة في التخطيط. ابدأ فوراً.",
    "Recent sessions": "جلسات التركيز الأخيرة",
    "Rest & Recharge Break": "استراحة لتجديد النشاط والراحة",
    "Great work! Step away from your screen, stretch your back, take 3 deep breaths, or grab water.": "عمل رائع ومتقن! ابتعد عن الشاشة قليلاً، تمطط، خذ 3 أنفاس عميقة واشرب بعض الماء.",
    "Finish Session": "إنهاء الجلسة",
    "End Early — Still Counts": "إنهاء مبكر — يُحتسب لك",
    "Ending early is not failing. Starting was the win.": "الإنهاء المبكر ليس فشلاً أبداً. مجرد البدء كان هو الفوز الحقيقي.",
    "Thought Dump": "تفريغ الأفكار العابرة (Thought Dump)",
    "— brain going wild? Park it here and let it go.": "— عقلك مشتت؟ أفرغ الفكرة هنا وتخلص من تشويشها فوراً.",
    "Type the thought, hit Enter to release it...": "اكتب الفكرة المشوشة واضغط Enter لتحرير عقلك منها...",
    "I got distracted": "تشتت انتباهي",
    "Next step": "الخطوة التالية",
    "Pause": "إيقاف مؤقت",
    "Resume": "استئناف",
    "Studying with you right now": "يذاكر معك الآن خطوة بخطوة",
    "Take a 2-min breather": "خذ استراحة دقيقتين",
    "Deep breath": "تنفس بعمق",
    "Great work!": "عمل رائع ومتقن!",
    "Session Complete": "اكتملت الجلسة بنجاح",
    "Session Complete!": "اكتملت الجلسة بنجاح!",
    "Great Start!": "بداية رائعة وموفقة!",
    "You stayed focused the whole time. Amazing.": "حافظت على كامل تركيزك طوال الوقت. أداء مذهل ومبهر!",
    "You showed up and tried. That matters more than you think.": "لقد حضرت وحاولت بجد. هذا الإنجاز يعني الكثير وأكبر مما تتخيل.",
    "XP Earned": "نقاط الخبرة المكتسبة",
    "Back to Focus Lab": "العودة لمختبر التركيز",
    "Type what you need to do first": "اكتب ما تود إنجازه أولاً",
    "I'm done for now": "سأكتفي بهذا القدر الآن",
    "Let's keep going": "هيا لنواصل معاً",
    "Quick check-in": "متابعة سريعة ولطيفة",
    "The hardest part is already done — you started. Let's get through this together.": "أصعب مرحلة انتهت بالفعل — لقد بدأت. دعنا نكمل هذا معاً.",
    "You're doing great": "أنت تبلي بلاءً حسناً جداً",
    "Pausing and coming back is actually a skill. Let's finish what you started.": "التوقف المؤقت والعودة هو مهارة حقيقية. دعنا ننهي ما بدأته.",
    "Gentle nudge": "تذكير لطيف",
    "Your brain might be looking for something easier. That's okay. But you'll feel better if you finish this.": "قد يبحث عقلك عن شيء أسهل الآن. لا بأس، لكنك ستشعر براحة وسعادة أكبر عندما تنهي هذا.",
    "Small reminder": "تذكير بسيط",
    "You don't need to do everything — just the next tiny step. That's it.": "لست بحاجة لإنهاء كل شيء دفعة واحدة — فقط الخطوة الصغيرة التالية. هذا كل ما يهم.",
    "Here with you": "أنا معك هنا",
    "It's normal to pause. What matters is that you come back. Ready for one more step?": "من الطبيعي جداً أن تأخذ استراحة. المهم هو أن تعود. هل أنت مستعد لخطوة أخرى؟",
    "Distraction logged. Take a breath and dive back in.": "تم تسجيل التشتت. خذ نفساً عميقاً وعد للتركيز.",
    "Tab switch detected!": "تم رصد تبديل علامة التبويب!",
    "Logged. Now gently come back.": "تم تسجيل التشتت. والآن عُد لتركيزك بكل هدوء ولطف.",
    "Focus complete! Time for a short break.": "اكتملت جلسة التركيز! حان وقت استراحة قصيرة ممتعة.",
    "Break is over! Let's focus.": "انتهت الاستراحة! لنعد للتركيز بهمة ونشاط.",
    "Wait!": "انتظر لحظة!",
    "Strict mode is on. You must wait 5 seconds before giving up.": "وضع الانضباط الصارم مفعّل. عليك الانتظار 5 ثوانٍ قبل التراجع.",
    "New Focus Preset": "قالب تركيز جديد",
    "Preset Name": "اسم القالب",
    "Focus Duration": "مدة التركيز",
    "Break Duration": "مدة الاستراحة",
    "Preferred Soundscape": "صوت الخلفية المفضل",
    "Save Preset": "حفظ القالب",
    "Preset deleted": "تم حذف القالب",
    "Please enter a preset name": "يرجى كتابة اسم القالب",
    "Mute All": "كتم الجميع",
    "Volume": "مستوى الصوت",
    "Surprise Bonus!": "مكافأة غير متوقعة!",
    "Brown Noise & Rain": "ضوضاء بنية وصوت المطر",

    // Planner View
    "Task & Goal Planner": "منظّم المهام والأهداف الدراسية",
    "Break down your goals into bite-sized micro-steps. Built for ADHD clarity.": "قسّم أهدافك إلى خطوات دقيقة مبسطة مصممة لتشتيت أقل ووضوح تام.",
    "Timetable & Routines": "الجدول والروتين اليومي",
    "Auto-Sync to Week": "مزامنة تلقائية للأسبوع",
    "New Task": "مهمة جديدة",
    "Today's Focus Goal": "هدف التركيز لليوم",
    "Goal Reached!": "تم تحقيق الهدف بنجاح!",
    "remaining today": "متبقٍ اليوم",
    "All Pending": "جميع المهام قيد الانتظار",
    "Homework": "واجب مدرسي",
    "Reading": "قراءة واطلاع",
    "Exam Prep": "استعداد للامتحان",
    "Project": "مشروع مدرسي",
    "Personal": "شخصي",
    "Completed": "المكتملة",
    "No completed tasks yet": "لا توجد مهام مكتملة بعد",
    "No tasks in this category": "لا توجد مهام في هذا التصنيف",
    "Add a task and use auto-breakdown to split it into easy micro-steps.": "أضف مهمة واستخدم التقسيم التلقائي لتحويلها لخطوات سهلة وممتعة.",
    "Unscheduled": "غير مجدولة في الجدول",
    "Micro-Steps": "الخطوات الدقيقة",
    "Task Title": "عنوان المهمة",
    "e.g. Read Physics Chapter 2": "مثال: قراءة الفصل الثاني فيزياء",
    "Category": "التصنيف",
    "Estimated Minutes": "الوقت المقدر (بالدقائق)",
    "Due Date": "تاريخ التسليم",
    "Priority": "درجة الأهمية",
    "High": "عالية",
    "Medium": "متوسطة",
    "Low": "منخفضة",
    "Auto-break into micro-steps": "تقسيم تلقائي إلى خطوات دقيقة",
    "Save Task": "حفظ المهمة",
    "Cancel": "إلغاء",
    "Delete Task": "حذف المهمة",
    "Focus on Task": "تركيز على هذه المهمة",
    "Schedule / Move on Timetable": "جدولة أو نقل في الجدول",
    "Assign to Timetable": "تعيين في الجدول",
    "New Task & Micro-Steps": "مهمة جديدة وخطواتها الدقيقة",
    "Micro-step 1...": "الخطوة الدقيقة 1...",
    "Micro-step 2...": "الخطوة الدقيقة 2...",
    "Micro-step 3...": "الخطوة الدقيقة 3...",
    "Edit Daily Goal": "تعديل هدف التركيز اليومي",
    "Daily Focus Target (minutes)": "هدف التركيز اليومي (بالدقائق)",
    "Save Goal": "حفظ الهدف",

    // Schedule View
    "Weekly classes, study blocks, and daily routines.": "الحصص الأسبوعية، وفترات المذاكرة المركزة، والروتين اليومي.",
    "Weekly Timetable": "جدول الحصص الأسبوعي",
    "Agenda View": "قائمة المواعيد (أجندة)",
    "Daily Routines": "الروتين اليومي",
    "Add Class / Period": "إضافة حصة / مادة",
    "Add Study Block": "إضافة وقت مذاكرة",
    "Print Schedule": "طباعة الجدول",
    "Export Calendar": "تصدير التقويم",
    "Saturday": "السبت",
    "Sunday": "الأحد",
    "Monday": "الإثنين",
    "Tuesday": "الثلاثاء",
    "Wednesday": "الأربعاء",
    "Thursday": "الخميس",
    "Friday": "الجمعة",
    "Subject Name": "اسم المادة الدراسية",
    "Room / Teacher": "الفصل / المدرس",
    "Day": "اليوم",
    "Start Time": "وقت البدء",
    "End Time": "وقت الانتهاء",
    "Color": "اللون المميّز",
    "Save Class": "حفظ الحصة",
    "Morning Routine": "الروتين الصباحي",
    "After-School Routine": "روتين ما بعد المدرسة",
    "Bedtime Routine": "روتين ما قبل النوم",
    "Add Routine Item": "إضافة خطوة للروتين",
    "Reset Daily Checkmarks": "إعادة ضبط الاختيارات لليوم",
    "Step 1: Drink water\nStep 2: Clear desk\nStep 3: Turn on brown noise": "الخطوة 1: شرب كوب ماء\nالخطوة 2: ترتيب المكتب\nالخطوة 3: تشغيل الضوضاء البنية",
    "Add Class or Study Block": "إضافة حصة أو فترة مذاكرة",
    "e.g. Room 204 or Online Zoom link": "مثال: فصل 204 أو رابط زووم",
    "e.g. Mathematics, Chemistry, or Study Session": "مثال: رياضيات، كيمياء، أو جلسة استذكار",

    // Wellness & Mind & Mood View
    "Cognitive reframing, emotional regulation, and mindfulness tools.": "أدوات إعادة الصياغة الإدراكية، وتنظيم المشاعر، وتصفية الذهن.",
    "Emotional First Aid": "إسعافات عاطفية أولية",
    "Journal": "دفتر المشاعر واليوميات",
    "Body Scan": "فحص الجسد والاسترخاء",
    "Affirmations": "توكيدات إيجابية",
    "Analytics": "تحليلات وتتبع المزاج",
    "Check-in": "تسجيل الحالة النفسية",
    "Breathing Exercise": "تمارين التنفس",
    "5-4-3-2-1 Grounding": "تمرين التأريض 5-4-3-2-1",
    "Worry Dissolver": "مذيب القلق والهموم",
    "Cognitive Reframing (CBT)": "إعادة الصياغة الإدراكية (CBT)",
    "Field Guide": "دليل المفاهيم الإدراكية",
    "ADHD Coping Cards": "بطاقات التكيّف لـ ADHD",
    "Identify Automatic Negative Thought (ANT)": "حدد الفكرة السلبية التلقائية (ANT)",
    "Cognitive Distortion": "نوع التشوّه الإدراكي",
    "Examine Evidence": "فحص الأدلة والبراهين",
    "Balanced / Rational Reframe": "الصياغة العقلانية المتوازنة",
    "Action Step": "الخطوة العملية التالية",
    "Save Reframe": "حفظ إعادة الصياغة",
    "All-or-Nothing Thinking": "تفكير الأبيض أو الأسود (الكل أو لا شيء)",
    "Catastrophizing": "تضخيم الأمور وتوقع الكوارث",
    "Mind Reading": "قراءة أفكار الآخرين افتراضًا",
    "Emotional Reasoning": "التبرير العاطفي المبني على الشعور",
    "Overgeneralization": "التعميم المفرط",
    "Box Breathing": "التنفس الصندوقي (4-4-4-4)",
    "4-7-8 Relaxing Breath": "تنفس الاسترخاء العميق (4-7-8)",
    "Inhale": "شهيق",
    "Hold": "حبس النفس",
    "Exhale": "زفير",
    "Start Breathing": "بدء التمرين",
    "Stop": "إيقاف",
    "Type your worry here...": "اكتب ما يقلقك هنا...",
    "Watch it dissolve": "شاهد همك وهو يتلاشى",
    "Let it go": "تحرر منه الآن",
    "Compassionate Reframe:": "إعادة الصياغة برأفة ولطف:",
    "5 things you can see": "5 أشياء يمكنك رؤيتها حولك",
    "4 things you can feel": "4 أشياء يمكنك لمسها والإحساس بها",
    "3 things you can hear": "3 أصوات يمكنك سماعها الآن",
    "2 things you can smell": "شيئان يمكنك شمهما",
    "1 thing you can taste": "شيء واحد يمكنك تذوقه",
    "Three Good Things": "ثلاثة أشياء إيجابية حدثت اليوم",
    "What went well today? Training your brain to notice the good builds resilience.": "ما الذي سار بشكل جيد اليوم؟ تدريب عقلك على ملاحظة الإيجابيات يبني مرونة نفسية قوية.",
    "Save Today's 3 Good Things": "حفظ النقاط الإيجابية الثلاث لليوم",
    "Brain Dump / Thought Scratchpad": "تفريغ الأفكار العشوائية ومسودة الذهن",
    "Dump any random thoughts here to clear your mind...": "ألقِ بأي فكرة طارئة هنا لتفريغ ذهنك والعودة لتركيزك...",
    "Dump Thought": "تفريغ الفكرة",

    // Learn & Play View
    "Gamified practice and educational challenges.": "تحديات وألعاب تعليمية ممتعة تعزز مهاراتك المنهجية.",
    "Grade Math Challenges": "تحديات الرياضيات المنهجية",
    "Mental Math Sprint": "سباق الحساب الذهني السريع",
    "Word Match": "مطابقة الكلمات والمفاهيم",
    "Science Trivia": "تحدي أسئلة العلوم",
    "Memory Matrix": "مصفوفة قوة الذاكرة",
    "Question": "السؤال",
    "Score": "النقاط",
    "Streak": "السلسلة",
    "Time Left": "الوقت المتبقي",
    "Submit": "إرسال الإجابة",
    "Next Question": "السؤال التالي",
    "Game Over": "انتهت اللعبة",
    "Final Score": "النتيجة النهائية",
    "Play Again": "العب مرة أخرى",
    "Choose your grade and practice math through quick challenges.": "اختر صفك الدراسي وتدرب على الرياضيات عبر تحديات ممتعة.",

    // Science Lab (PhET)
    "PhET Interactive Science Simulations & Experiments.": "محاكاة وتجارب علمية تفاعلية مقدمة من PhET.",
    "Search simulations...": "ابحث في تجارب المختبر...",
    "All Categories": "جميع المجالات العلمية",
    "Physics": "الفيزياء",
    "Chemistry": "الكيمياء",
    "Earth Science": "علوم الأرض والفضاء",
    "Biology": "الأحياء",
    "Open Simulation": "فتح التجربة التفاعلية",
    "Full Screen": "ملء الشاشة",
    "Reset": "إعادة ضبط",
    "Experiment Guide": "دليل التجربة والخطوات",
    "Interactive Lab Whiteboard": "سبورة تدوين ملاحظات المعمل",
    "Key Takeaways": "أهم الاستنتاجات العلمية",
    "Record your data, observations, hypotheses, and conclusions here...": "سجل بياناتك وملاحظاتك وفرضياتك واستنتاجاتك هنا...",
    "Clear Whiteboard": "مسح السبورة",
    "Export Lab Notes": "تصدير ملاحظات المعمل",

    // Calculator View
    "Unified 2D/3D math lab, scratchpad, formula sheets, and converter.": "مختبر رياضي موحد للرسم ثنائي وثلاثي الأبعاد، والمسودة، والقوانين، والمحولات.",
    "Desmos 2D Graphing": "رسم المنحنيات والدوال (Desmos)",
    "3D Math Visualization": "الرياضيات والمجسمات ثلاثية الأبعاد (3D)",
    "Canvas Scratchpad": "المسودة ولوحة الرسم الحر",
    "Scientific & Programmer": "الآلة الحاسبة العلمية والبرمجية",
    "Formula Reference": "مرجع القوانين والصيغ الرياضية",
    "Unit Converter": "محول الوحدات والقياسات",
    "Plot functions (e.g. y = sin(x), y = x^2)": "ارسم الدوال (مثل ص = جا(س) أو y = sin(x))",
    "Insert Function": "إدراج دالة",
    "Reset View": "إعادة ضبط العرض",
    "Clear Canvas": "مسح المسودة",
    "Pen Color": "لون القلم",
    "Brush Size": "حجم الفرشاة",
    "Eraser": "ممحاة",
    "Export PNG": "تصدير كصورة PNG",
    "Undo": "تراجع",
    "Length": "الطول والمسافة",
    "Mass / Weight": "الكتلة والوزن",
    "Temperature": "درجة الحرارة",
    "Speed": "السرعة",
    "Area": "المساحة",
    "Volume": "الحجم والسعة",
    "Time": "الوقت",
    "From": "من وحدة",
    "To": "إلى وحدة",
    "Convert": "تحويل",
    "Algebra": "الجبر",
    "Geometry": "الهندسة",
    "Trigonometry": "حساب المثلثات",
    "Calculus": "التفاضل والتكامل",
    "Physics Constants": "الثوابت الفيزيائية",

    // Flashcards View
    "Spaced repetition flashcard decks for exam prep.": "مجموعات بطاقات المراجعة بالتكرار المتباعد للتحضير للاختبارات.",
    "Create New Deck": "إنشاء مجموعة بطاقات جديدة",
    "Deck Name": "اسم المجموعة",
    "Description": "الوصف",
    "Cards Mastered": "البطاقات المتقنة",
    "Cards Remaining": "البطاقات المتبقية",
    "Study Deck": "بدء المذاكرة",
    "Add Card": "إضافة بطاقة",
    "Front (Question)": "الوجه الأمامي (السؤال)",
    "Back (Answer)": "الوجه الخلفي (الإجابة)",
    "Flip Card": "اقلب البطاقة",
    "I Knew This": "أعرفها جيدًا (+1)",
    "Need to Review": "أحتاج مراجعتها",
    "Question or term...": "اكتب السؤال أو المصطلح هنا...",
    "Answer or definition...": "اكتب الإجابة أو التعريف هنا...",
    "What is this deck about?": "عن ماذا تتحدث هذه المجموعة؟",
    "e.g. Biology Chapter 3": "مثال: أحياء الفصل الثالث",

    // Store View
    "Spend your hard-earned XP on avatars, themes, badges, and sound packs.": "استثمر نقاط خبرتك (XP) في فتح شخصيات وسمات وأوسمة ومؤثرات جديدة.",
    "Avatars": "الصور الرمزية",
    "Themes": "السمات المظهرية",
    "Badges": "أوسمة الإنجاز",
    "Sound Packs": "حزم الأصوات",
    "Equip": "استخدام",
    "Equipped": "مُستخدم حاليًا",
    "Unlock for": "فتح مقابل",
    "Insufficient XP": "نقاط الخبرة غير كافية",
    "Successfully equipped!": "تم التفعيل والاستخدام بنجاح!",

    // Resources View
    "Curated for the Egyptian curriculum. All free or free-with-school-email.": "مختارة بعناية وفق المنهج المصري. جميعها مجانية أو متاحة بالحساب المدرسي الموحد.",
    "Grade": "المرحلة والصف",
    "Subject": "المادة الدراسية",
    "All Grades": "جميع الصفوف",
    "Primary": "المرحلة الابتدائية",
    "Preparatory": "المرحلة الإعدادية",
    "Secondary": "المرحلة الثانوية",
    "All Subjects": "جميع المواد",
    "Arabic": "اللغة العربية",
    "English": "اللغة الإنجليزية",
    "Science": "العلوم",
    "Math": "الرياضيات",
    "Social Studies": "الدراسات الاجتماعية",
    "History": "التاريخ",
    "Philosophy": "الفلسفة والمنطق",
    "No resources match this filter.": "لا توجد مصادر تطابق هذا التصفية حاليًا.",
    "Open Resource": "فتح المصدر التعليمي",
    "Official Textbook": "الكتاب المدرسي الرسمي",
    "Video Lessons": "دروس وفيديوهات تعليمية",
    "Interactive Practice": "تدريبات تفاعلية",
    "Exam Revisions": "مراجعات ليلة الامتحان",

    // Progress View
    "Every minute counts.": "كل دقيقة تركيز تصنع فارقًا حقيقيًا.",
    "Total focus": "إجمالي وقت التركيز",
    "Total XP": "إجمالي نقاط الخبرة",
    "Sessions": "جلسات التركيز",
    "Avg distractions": "متوسط التشتت",
    "Last 7 Days": "آخر 7 أيام",
    "Recent Focus Sessions": "أحدث جلسات التركيز",
    "No focus sessions yet.": "لا توجد جلسات تركيز مسجلة بعد.",
    "Recent Games": "أحدث الألعاب التعليمية",
    "No games played recently.": "لم يتم لعب أي ألعاب مؤخرًا.",
    "Focus (min)": "التركيز (بالدقائق)",

    // Settings View
    "Customize your Spark learning environment.": "تخصيص بيئة التعلّم ومنصة سبارك بالكامل.",
    "Customize your Manara learning environment.": "تخصيص بيئة التعلّم ومنصة سبارك بالكامل.",
    "Language & Interface Direction": "اللغة واتجاه الواجهة",
    "Toggle between full Arabic with Right-to-Left (RTL) alignment and English (LTR).": "التبديل بين الواجهة العربية بالكامل بمحاذاة من اليمين لليسار (RTL) والواجهة الإنجليزية (LTR).",
    "Profile": "الملف الشخصي",
    "Name": "الاسم",
    "Color": "اللون المميّز",
    "Save Profile": "حفظ الملف الشخصي",
    "Focus Timer Durations": "توقيتات جلسات التركيز",
    "Default focus duration": "مدة التركيز الافتراضية",
    "Default break duration": "مدة الاستراحة الافتراضية",
    "Schedule & Timetable Settings": "إعدادات الجدول والمواعيد",
    "Open Customizer": "فتح أداة التخصيص",
    "Week Starts On": "بداية الأسبوع",
    "Egypt & Middle East": "مصر والشرق الأوسط",
    "North America / Japan": "أمريكا الشمالية / اليابان",
    "International ISO / Europe": "النظام الدولي / أوروبا",
    "Day Starts At (Earliest Timetable Hour)": "بداية اليوم الدراسي (أبكر ساعة في الجدول)",
    "Day Ends At (Latest Timetable Hour)": "نهاية اليوم الدراسي (آخر ساعة في الجدول)",
    "Focus Mode": "وضع التركيز الحازم",
    "Strict Focus Mode": "وضع التركيز الصارم",
    "Adds a 5-second delay to stop timer and warns on tab close.": "يضيف مهلة 5 ثوانٍ لإيقاف المؤقت ويحذر عند محاولة إغلاق الصفحة.",
    "Thought Journal": "سجل الأفكار المدونة",
    "Ideas you parked during focus sessions. Safe here for later.": "أفكار دوّنتها أثناء جلسات التركيز لتفريغ عقلك. محفوظة هنا لمراجعتها لاحقًا.",
    "No thoughts yet. Use the Thought Dump during your next focus session.": "لا توجد أفكار بعد. استخدم تفريغ الأفكار أثناء جلستك القادمة.",
    "Clear Journal": "مسح سجل الأفكار",
    "ADHD-Friendly Features": "ميزات مصممة لتشتيت أقل (ADHD)",
    "Task Breaker": "مفكك المهام",
    "Big tasks become 6 tiny steps.": "تحويل المهام الكبيرة إلى 6 خطوات دقيقة يسيرة.",
    "\"Just Start\" Timer": "مؤقت \"فقط ابدأ\"",
    "Commit to 10 minutes. Minute zero is the real battle.": "التزم بـ 10 دقائق فقط. الدقيقة صفر هي المعركة الحقيقية.",
    "Pause Nudge": "تنبيه الاستراحة",
    "Gentle reminder if you pause too long.": "تذكير لطيف وداعم عند التوقف طويلاً.",
    "Body Doubling": "رفيق الدراسة الافتراضي",
    "A study buddy works alongside you.": "شخصية لطيفة تذاكر بجانبك على الشاشة.",
    "Thought Dump": "تفريغ الأفكار",
    "Park random ideas and release them. Saved for later.": "دوّن الأفكار الطارئة وأفرغ ذهنك لمواصلة المذاكرة.",
    "Cancels the noise inside your head.": "يحجب الضوضاء الذهنية والأصوات الخارجية.",
    "Surprise Bonuses": "مكافآت عشوائية مفاجئة",
    "Random XP keeps your brain engaged.": "نقاط خبرة غير متوقعة تحفز الدوبامين والشغف.",
    "Focus Shield": "درع التركيز",
    "Removes the \"just check one thing\" trap.": "يحميك من فخ \"سأتفقد شيئًا واحدًا سريعًا فقط\".",
    "Data": "إدارة البيانات",
    "Export Data": "تصدير نسخة احتياطية",
    "Clear All Data": "حذف جميع البيانات",
    "All data stored locally in your browser. Nothing sent to any server.": "جميع بياناتك مخزنة محليًا داخل متصفحك بأمان تام. لا يُرسل أي شيء لأي خادم خارجي.",
    "Clear All Data?": "هل أنت متأكد من حذف جميع البيانات؟",
    "This cannot be undone. Includes flashcard decks stored in IndexedDB.": "لا يمكن التراجع عن هذا الإجراء. يشمل ذلك جميع البطاقات وجداول الحصص والمهام.",
    "Delete Everything": "حذف كل شيء",

    // Sticky Notes & Dock
    "New Sticky Note": "ملاحظة لاصقة جديدة",
    "Scatter Notes": "بعثرة الملاحظات",
    "Cascade Stack": "ترتيب متتالي",
    "Hide All": "إخفاء الكل",
    "Show All": "إظهار الكل",
    "Type note here...": "اكتب ملاحظتك هنا...",
    "Delete Note": "حذف الملاحظة",
    "Sticky Notes (Click to Open Menu)": "الملاحظات اللاصقة (انقر لفتح القائمة)"
  };

  // Grade names mapping in Arabic for Egyptian curriculum
  const GRADE_NAMES_AR = {
    1: 'الصف الأول الابتدائي',
    2: 'الصف الثاني الابتدائي',
    3: 'الصف الثالث الابتدائي',
    4: 'الصف الرابع الابتدائي',
    5: 'الصف الخامس الابتدائي',
    6: 'الصف السادس الابتدائي',
    7: 'الصف الأول الإعدادي',
    8: 'الصف الثاني الإعدادي',
    9: 'الصف الثالث الإعدادي',
    10: 'الصف الأول الثانوي',
    11: 'الصف الثاني الثانوي',
    12: 'الصف الثالث الثانوي (الثانوية العامة)'
  };

  function getLang() {
    try {
      if (typeof Store !== 'undefined' && Store.get) {
        return Store.get('lang') || 'ar';
      }
      const raw = localStorage.getItem('spark_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.lang) return parsed.lang;
      }
    } catch(e) {}
    return document.documentElement.getAttribute('lang') || 'ar';
  }

  function translateString(str) {
    if (!str || typeof str !== 'string') return str;
    const trimmed = str.trim();
    if (!trimmed) return str;

    // Direct dictionary match
    if (AR_DICT[trimmed] !== undefined) {
      return str.replace(trimmed, AR_DICT[trimmed]);
    }

    // Numbered or dynamic pattern replacements
    // 1. Grade patterns
    let m = trimmed.match(/^Grade\s+(\d+)\s+Math$/i);
    if (m) return str.replace(trimmed, `رياضيات ${GRADE_NAMES_AR[m[1]] || 'الصف ' + m[1]}`);

    m = trimmed.match(/^Grade\s+(\d+)$/i);
    if (m) return str.replace(trimmed, GRADE_NAMES_AR[m[1]] || `الصف ${m[1]}`);

    // 2. XP patterns
    m = trimmed.match(/^\+(\d+)\s*XP(?:\s+(.*))?$/i);
    if (m) {
      const rest = m[2] ? ` ${translateString(m[2])}` : '';
      return str.replace(trimmed, `+${m[1]} نقطة خبرة${rest}`);
    }

    m = trimmed.match(/^(\d+)\s*XP\s+total$/i);
    if (m) return str.replace(trimmed, `${m[1]} نقطة خبرة إجمالية`);

    m = trimmed.match(/^(\d+)\s*XP$/i);
    if (m) return str.replace(trimmed, `${m[1]} نقطة خبرة`);

    // 3. Time & Duration patterns
    m = trimmed.match(/^(\d+)\s*m\s+focus\s*\/\s*(\d+)\s*m\s+break\.?$/i);
    if (m) return str.replace(trimmed, `${m[1]} دقيقة تركيز / ${m[2]} دقيقة استراحة.`);

    m = trimmed.match(/^(\d+)\s*(?:mins?|minutes?)\s+today$/i);
    if (m) return str.replace(trimmed, `${m[1]} دقيقة اليوم`);

    m = trimmed.match(/^(\d+)\s*of\s*(\d+)\s*(?:minutes?|mins?)?\s*completed\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `تم إنجاز ${m[1]} من أصل ${m[2]} دقيقة (${m[3]})`);

    m = trimmed.match(/^Goal:\s*(\d+)\s*m$/i);
    if (m) return str.replace(trimmed, `الهدف: ${m[1]} دقيقة`);

    m = trimmed.match(/^(\d+)\s*m\s+remaining\s+today$/i);
    if (m) return str.replace(trimmed, `متبقٍ ${m[1]} دقيقة اليوم`);

    m = trimmed.match(/^(\d+)\s*(?:min|mins|minute|minutes)$/i);
    if (m) return str.replace(trimmed, `${m[1]} دقيقة`);

    m = trimmed.match(/^~(\d+)\s*m$/i);
    if (m) return str.replace(trimmed, `~${m[1]} دقيقة`);

    m = trimmed.match(/^(\d+)\s*m$/i);
    if (m) return str.replace(trimmed, `${m[1]} دقيقة`);

    // 4. Streaks
    m = trimmed.match(/^(\d+)\s*(?:d|day|days)\s*streak$/i);
    if (m) return str.replace(trimmed, `${m[1]} يوم متواصل`);

    // 5. Distractions
    m = trimmed.match(/^(\d+)\s*distractions?$/i);
    if (m) return str.replace(trimmed, `${m[1]} تشتت`);

    // 6. Micro-steps
    m = trimmed.match(/^Micro-Steps\s*\((\d+)\/(\d+)\)$/i);
    if (m) return str.replace(trimmed, `الخطوات الدقيقة (${m[1]}/${m[2]})`);

    m = trimmed.match(/^(\d+)\/(\d+)\s*steps$/i);
    if (m) return str.replace(trimmed, `${m[1]}/${m[2]} خطوات`);

    // 7. Welcome back, Name
    m = trimmed.match(/^Welcome\s+back,?\s+(.+)$/i);
    if (m) return str.replace(trimmed, `مرحبًا بعودتك، ${m[1]}`);

    // 8. Showing X of Y
    m = trimmed.match(/^Showing\s+(\d+)\s+of\s+(\d+)$/i);
    if (m) return str.replace(trimmed, `عرض ${m[1]} من ${m[2]}`);

    // 9. Due dates
    m = trimmed.match(/^Due\s+today$/i);
    if (m) return str.replace(trimmed, 'مستحق اليوم');

    m = trimmed.match(/^Due\s+tomorrow$/i);
    if (m) return str.replace(trimmed, 'مستحق غدًا');

    m = trimmed.match(/^Due\s+in\s+(\d+)\s+days?$/i);
    if (m) return str.replace(trimmed, `مستحق خلال ${m[1]} أيام`);

    m = trimmed.match(/^Overdue\s+by\s+(\d+)\s+days?$/i);
    if (m) return str.replace(trimmed, `متأخر بـ ${m[1]} أيام`);

    // 10. Science & Filter count patterns
    m = trimmed.match(/^All\s+Labs\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `جميع التجارب (${m[1]})`);

    m = trimmed.match(/^Physics\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `الفيزياء (${m[1]})`);

    m = trimmed.match(/^Chemistry\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `الكيمياء (${m[1]})`);

    m = trimmed.match(/^Biology\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `الأحياء (${m[1]})`);

    m = trimmed.match(/^Earth\s*&\s*Space\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `علوم الأرض والفضاء (${m[1]})`);

    m = trimmed.match(/^Bookmarks\s*\(([^)]+)\)$/i);
    if (m) return str.replace(trimmed, `المفضلة (${m[1]})`);

    // 11. Focus Lab dynamic patterns
    m = trimmed.match(/^Just\s+Start\s*[—–-]\s*(\d+)\s+Minutes?$/i);
    if (m) return str.replace(trimmed, `ابدأ الآن فقط — ${m[1]} دقيقة`);

    m = trimmed.match(/^Next\s+Focus\s+Interval\s*\((\d+)m\)$/i);
    if (m) return str.replace(trimmed, `فترة التركيز التالية (${m[1]} د)`);

    m = trimmed.match(/^Current\s+interval\s+schedule:\s*(\d+)m\s+focus\s*\/\s*(\d+)m\s+break\.$/i);
    if (m) return str.replace(trimmed, `نظام الفترات الحالي: ${m[1]} دقيقة تركيز / ${m[2]} دقيقة استراحة.`);

    m = trimmed.match(/^Pomodoro\s+Classic\s*\((\d+)\/(\d+)m\)$/i);
    if (m) return str.replace(trimmed, `بومودورو كلاسيكي (${m[1]}/${m[2]} د)`);

    m = trimmed.match(/^Deep\s+Work\s*\((\d+)\/(\d+)m\)$/i);
    if (m) return str.replace(trimmed, `عمل عميق ومركز (${m[1]}/${m[2]} د)`);

    m = trimmed.match(/^ADHD\s+Sprint\s*\((\d+)\/(\d+)m\)$/i);
    if (m) return str.replace(trimmed, `سباق تركيز ADHD (${m[1]}/${m[2]} د)`);

    m = trimmed.match(/^Quick\s+Burst\s*\((\d+)\/(\d+)m\)$/i);
    if (m) return str.replace(trimmed, `انطلاقة خاطفة (${m[1]}/${m[2]} د)`);

    m = trimmed.match(/^(\d+)\s+active$/i);
    if (m) return str.replace(trimmed, `${m[1]} نشط`);

    m = trimmed.match(/^(\d+)\s+distractions?$/i);
    if (m) return str.replace(trimmed, `${m[1]} تشتتات`);

    m = trimmed.match(/^(\d+)\s+minute(s)?\s+in\s+·\s+(\d+)\s+distraction(s)?$/i);
    if (m) return str.replace(trimmed, `مضى ${m[1]} دقيقة · ${m[3]} تشتت`);

    return str;
  }

  let _isLocalizing = false;

  function localizeDOM(root = document.body) {
    if (!root || getLang() !== 'ar') return;
    if (_isLocalizing) return;
    _isLocalizing = true;

    try {
      // 1. Localize element attributes: placeholder, title, aria-label, button values, optgroups, options
      const elementsWithAttrs = root.querySelectorAll 
        ? root.querySelectorAll('[placeholder], [title], [aria-label], optgroup, option, input[type="button"], input[type="submit"]') 
        : [];
      
      elementsWithAttrs.forEach(el => {
        if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder');
          const t = translateString(ph);
          if (t !== ph) el.setAttribute('placeholder', t);
        }
        if (el.hasAttribute('title')) {
          const ttl = el.getAttribute('title');
          // skip internal tooltip IDs
          if (!ttl.startsWith('spark-') && !ttl.startsWith('#')) {
            const t = translateString(ttl);
            if (t !== ttl) el.setAttribute('title', t);
          }
        }
        if (el.hasAttribute('aria-label')) {
          const al = el.getAttribute('aria-label');
          const t = translateString(al);
          if (t !== al) el.setAttribute('aria-label', t);
        }
        if (el.tagName === 'OPTGROUP' && el.hasAttribute('label')) {
          const lbl = el.getAttribute('label');
          const t = translateString(lbl);
          if (t !== lbl) el.setAttribute('label', t);
        }
        if (el.tagName === 'OPTION' && el.text) {
          const t = translateString(el.text);
          if (t !== el.text) el.text = t;
        }
        if ((el.tagName === 'INPUT') && (el.type === 'button' || el.type === 'submit')) {
          const val = el.value;
          const t = translateString(val);
          if (t !== val) el.value = t;
        }
      });

      // Also check root itself if it has attributes
      if (root.getAttribute) {
        if (root.hasAttribute('placeholder')) root.setAttribute('placeholder', translateString(root.getAttribute('placeholder')));
        if (root.hasAttribute('title')) root.setAttribute('title', translateString(root.getAttribute('title')));
      }

      // 2. Localize text nodes with TreeWalker
      const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toUpperCase();
            if (['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('.katex, .katex-display, .desmos-wrap, canvas, .math3d-container')) {
              return NodeFilter.FILTER_REJECT;
            }
            const txt = node.nodeValue.trim();
            if (!txt || /^[\d\s.,:;+*\/\\()\-=%#@!]+$/.test(txt)) {
              return NodeFilter.FILTER_SKIP;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        },
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        const original = node.nodeValue;
        const translated = translateString(original);
        if (translated !== original) {
          node.nodeValue = translated;
        }
      }
    } catch(err) {
      console.warn('Localization error:', err);
    } finally {
      _isLocalizing = false;
    }
  }

  // Real-time DOM MutationObserver to auto-translate dynamically rendered components
  function setupLanguageObserver() {
    if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      if (getLang() !== 'ar' || _isLocalizing) return;
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length > 0) {
          for (const node of m.addedNodes) {
            if (node.nodeType === (window.Node ? Node.ELEMENT_NODE : 1)) {
              localizeDOM(node);
            } else if (node.nodeType === (window.Node ? Node.TEXT_NODE : 3)) {
              const original = node.nodeValue;
              if (original && original.trim()) {
                const translated = translateString(original);
                if (translated !== original) {
                  _isLocalizing = true;
                  node.nodeValue = translated;
                  _isLocalizing = false;
                }
              }
            }
          }
        }
      }
    });

    const targets = ['main', 'modal-root', 'toast-container', 'sticky-notes-layer'];
    targets.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el, { childList: true, subtree: true });
      }
    });
  }

  // Export globals
  window.AR_DICT = AR_DICT;
  window.GRADE_NAMES_AR = GRADE_NAMES_AR;
  window.translateString = translateString;
  window.localizeDOM = localizeDOM;
  window.setupLanguageObserver = setupLanguageObserver;

  // Initialize observer once DOM is ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupLanguageObserver();
        if (getLang() === 'ar' && document.body) localizeDOM(document.body);
      });
    } else {
      setupLanguageObserver();
      if (getLang() === 'ar' && document.body) localizeDOM(document.body);
    }
  }

})();
