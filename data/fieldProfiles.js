/* ═══════════════════════════════════════════════════════════════
 * Altiora — fieldProfiles.js
 *
 * Deep field profiles for Stage 1 discovery. One rich profile per
 * course-data category. Written for a smart 15-year-old: concrete,
 * warm, honest — including the unflattering parts. Career honesty is
 * QUALITATIVE by design: no salary figures, employment rates, or
 * percentages are authored here. Paragraphs are separated by \n\n
 * and split at render time.
 *
 * oftenComparedWith[].fieldId uses category ids and resolves through
 * the existing resolveFieldId → openFieldOverview path.
 * ═══════════════════════════════════════════════════════════════ */

const fieldProfiles = {

  engineering: {
    id: 'engineering',
    name: 'Engineering',
    reflect: 'the degree is far more maths than building things — the making comes later.',
    whatItIs: 'Engineering is the discipline of making things work in the real world — where materials bend, budgets run out, and safety matters. An engineer takes something that exists as an idea (a bridge, a jet engine, a water system, a phone antenna) and works out how to build it so that it actually functions, doesn’t fail, and can be made at a price someone will pay.\n\nWhat separates engineering from pure science is the word "constraint". A physicist asks what is true; an engineer asks what will work, by Friday, within budget, without hurting anyone. That sounds less romantic, but it’s the reason everything around you exists — every building, vehicle, network and machine was engineered by someone who had to make real decisions with incomplete information.\n\nThe degree trains you to make those decisions properly: how to model a system mathematically, how to know how strong is strong enough, how to find the failure point before the failure finds you.',
    branches: [
      { name: 'Mechanical', blurb: 'Machines, engines, robotics, anything that moves. The broadest branch — mechanical engineers turn up in cars, aerospace, energy, medical devices and manufacturing.' },
      { name: 'Civil & structural', blurb: 'Bridges, buildings, tunnels, water and transport systems. The most visible branch, with strong public-works and infrastructure career routes.' },
      { name: 'Electrical & electronic', blurb: 'Power systems, chips, communications, control systems. Increasingly overlaps with computing — most modern devices are electronics plus software.' },
      { name: 'Chemical', blurb: 'Industrial processes at scale: energy, pharmaceuticals, food, materials. Less test tubes, more designing the plant that makes a tonne of something per hour, safely.' },
      { name: 'Aerospace', blurb: 'Aircraft and spacecraft. Prestigious and popular, but note that much of the actual work is mechanical/electrical engineering applied to very demanding constraints.' },
      { name: 'Biomedical', blurb: 'Engineering applied to medicine — prosthetics, implants, imaging, medical devices. Usually gated on maths and physics, not biology.' },
    ],
    dayInTheLife: '**A working engineer’s week is a mix of modelling and meetings.** You might spend the morning in simulation software or a spreadsheet, checking whether a design carries its loads with margin to spare, then the afternoon in a design review defending your choices to colleagues whose job is to find the holes.\n\n**Then there is the rest of it**: site or lab visits, test results that don’t match the model (finding out why is half the job), and a steady stream of documentation — because in engineering, if it isn’t written down and checked, it didn’t happen.\n\nAs a student, the texture is different: problem sheets, labs, and group design projects. Expect a lot of desk time with maths before anyone lets you near anything expensive.',
    degreeVsSchool: '**The honest gap.** An engineering degree, especially the first two years, is mostly applied mathematics and physics — calculus, mechanics, differential equations, done at pace. Students who chose it because they loved building things at school sometimes hit this wall hard.\n\n**The building does come back.** Design projects grow each year, and final-year projects can be genuinely yours — but you earn it through the maths. If problem sheets full of forces and integrals sound miserable rather than satisfying, look carefully before committing.',
    whoThrives: '**Engineering suits pragmatists.** People who get satisfaction from things that work, who can accept "good enough within constraints" instead of chasing perfect, and who don’t mind grinding through unglamorous detail because the detail is where failures hide. You need staying power in maths more than brilliance at it.\n\n**It goes badly** if you need quick creative payoff, hate group projects (there are many), or wanted the physics ideas without the industrial application.',
    misconceptions: [
      { myth: 'Engineering students spend their time building things.', reality: 'The first years are dominated by maths and physics problem sheets. Hands-on design grows over the degree, but the foundation is analytical.' },
      { myth: 'You need to be a maths genius.', reality: 'You need maths stamina — willingness to practise until methods are second nature. Steady beats brilliant.' },
      { myth: '"Engineer" is one job.', reality: 'A structural engineer checking a bridge, a chip designer, and a chemical plant engineer share a mindset but almost nothing about their daily work. The branch you pick matters.' },
    ],
    careers: {
      paths: ['Mechanical / civil / electrical engineering practice', 'Energy and renewables', 'Aerospace and automotive', 'Software and technology (a very common jump)', 'Consulting', 'Finance and quantitative roles', 'Product management', 'Project management and infrastructure delivery'],
      honestNote: '**Engineering is one of the most employable degrees** because it certifies you can handle hard quantitative work — which is exactly why a large share of engineering graduates end up in software, finance or consulting rather than traditional engineering, where pay in some branches (especially civil, early on) is famously modest relative to the effort of the degree.\n\n**If you stay in the discipline, accreditation matters.** Check that courses are accredited towards chartership.',
    },
    oftenComparedWith: [
      { fieldId: 'cs', howToThinkAboutIt: 'Both are maths-heavy building disciplines. The split is physical versus abstract: engineering deals with materials, forces and things that can break in the real world; computer science deals with information, logic and systems made of pure structure. If you’d rather debug a program than a gearbox, lean CS; if you want your work to exist physically, lean engineering. Electrical engineering sits genuinely in the middle.' },
      { fieldId: 'sciences', howToThinkAboutIt: 'Physics asks why things are true; engineering asks how to use them. A physics degree goes deeper into the ideas (and further into abstraction); engineering trades some depth for design, application and a more direct industry route. Students who love the concepts but resent applied detail are usually happier in physics — and can still move into engineering jobs afterwards.' },
      { fieldId: 'architecture', howToThinkAboutIt: 'Both shape the built world, from opposite ends. Architecture leads with design intent and human experience, and treats structure as a partner discipline; engineering leads with "will it stand up, and what will it cost", and treats form as a constraint. Studio-and-critique versus problem-sheets-and-labs is the real cultural divide — visit both before choosing.' },
    ],
  },

  cs: {
    id: 'cs',
    name: 'Computer Science',
    reflect: 'the degree is theory and systems, not just coding — coding is the lab work, not the subject.',
    whatItIs: 'Computer science is the study of information: how it can be represented, transformed, and reasoned about. Programming is its lab technique — the way you make ideas run — but the subject itself is bigger: what can be computed at all, how to organise millions of lines of code so humans can still change them safely, how machines learn patterns from data, how to keep systems secure against people actively trying to break them.\n\nIt is a young field with an unusual property: the things you build are made of pure thought, and yet they run the modern world. Banks, hospitals, transport, communication — all of it now sits on software, which means computer scientists inherit both enormous leverage and real responsibility.\n\nThe degree teaches you to think in abstractions and then make those abstractions concrete and fast. It rewards precision: a program does exactly what you told it to, which is frequently not what you meant.',
    branches: [
      { name: 'Software engineering', blurb: 'Building and maintaining large systems with other people. The craft of most industry jobs: design, testing, code review, and keeping complexity under control.' },
      { name: 'Artificial intelligence & machine learning', blurb: 'Systems that learn from data. The fashionable branch — and the most mathematical: serious ML is linear algebra, probability and optimisation, not just calling libraries.' },
      { name: 'Systems', blurb: 'Operating systems, networks, databases, compilers — the deep infrastructure everything else runs on. Unfashionable, hard, and consistently valued.' },
      { name: 'Security', blurb: 'Attacking and defending systems. Part deep technical knowledge, part adversarial mindset: you have to think like the person trying to break in.' },
      { name: 'Theory', blurb: 'The mathematics of computation itself — algorithms, complexity, what is provably impossible. Closest to pure maths.' },
      { name: 'Human-computer interaction', blurb: 'How people actually use software, and how to design it so they can. The branch for people who care about the human side.' },
    ],
    dayInTheLife: '**A working software engineer reads far more code than they write.** A normal day: pick up a task, spend most of the effort understanding the existing system and why the bug happens, change perhaps thirty lines, write tests, then have colleagues review the change and argue about it — that argument is quality control, not hostility.\n\n**Around that** sit meetings about what to build next, and the occasional genuinely absorbing deep-focus stretch that is the reason many people love the job.\n\nAs a student: lectures that feel like maths, programming assignments that consume weekends (the last bug always takes the longest), and the strange joy of a thing finally working at 1 a.m.',
    degreeVsSchool: '**School computing is mostly "make a thing that works".** A CS degree begins with why it works: discrete mathematics, proofs, data structures and algorithm analysis, computer architecture. Plenty of students arrive loving coding and are ambushed by how mathematical the first year is.\n\n**The reverse surprise also happens.** People who never coded before university often flourish, because the degree teaches from first principles. Prior coding experience helps less, and mathematical comfort helps more, than most applicants expect.',
    whoThrives: '**CS suits people with puzzle stamina** — those who can be stuck for two hours, stay curious rather than frustrated, and feel the fix was worth it. Precision matters: careless-but-fast is a painful fit. You don’t need to have coded since age ten; you need to enjoy debugging, which is the actual daily texture of the field.\n\n**It goes badly** if you want the prestige of "tech" but dislike sitting with hard abstract problems, or if vague, open-ended fiddly detail drains you.',
    misconceptions: [
      { myth: 'Computer science = learning to code.', reality: 'Coding is the tool. The degree is mathematics, algorithms and systems design — closer to applied maths than to a coding bootcamp.' },
      { myth: 'You must have been programming since childhood.', reality: 'Universities teach from scratch. Mathematical readiness predicts success better than years of hobby coding.' },
      { myth: 'AI means the field is about chatbots now.', reality: 'AI is one branch, and its serious work is heavy mathematics plus engineering. The unglamorous systems knowledge underneath is as employable as ever.' },
    ],
    careers: {
      paths: ['Software engineering', 'Machine learning / data science', 'Security engineering', 'Infrastructure and systems', 'Quantitative finance', 'Product management', 'Founding or joining startups', 'Research'],
      honestNote: 'Historically among the strongest degrees for employment, and still so — but the entry level has become genuinely competitive in recent years, and hiring runs in cycles. What separates candidates is evidence of building: internships and personal projects matter alongside the degree. The skills transfer unusually well across industries, which is quiet insurance most fields don’t offer.',
    },
    oftenComparedWith: [
      { fieldId: 'engineering', howToThinkAboutIt: 'Both build; the material differs. Engineering’s constraints are physical — gravity, heat, cost of steel; CS’s constraints are logical — complexity, correctness, scale. Engineering degrees are broader and more regimented; CS gives you more time in one deep abstract discipline. Ask yourself which failure you’d rather chase: a crack in a casing, or a bug in a distributed system.' },
      { fieldId: 'mathematics', howToThinkAboutIt: 'Theory-leaning CS and maths overlap heavily, and joint degrees exist for exactly this dilemma. Maths goes deeper into proof and structure for its own sake; CS keeps one foot in building things people use. If you love proofs but get restless without an artefact at the end, CS-leaning; if the artefact is optional and the idea is the point, maths-leaning.' },
    ],
  },

  mathematics: {
    id: 'mathematics',
    name: 'Mathematics',
    reflect: 'a maths degree is proof and abstraction, not harder calculations — most students meet a wall in first year and climb it.',
    whatItIs: 'Mathematics at university is not a harder version of school maths — it is a different subject wearing the same name. School maths teaches methods: differentiate this, solve that. A maths degree teaches proof: how to establish, with complete certainty, that something is true, and to build towers of ideas on top of things proven before. It is the closest an education gets to pure structured thinking.\n\nThat shift — from "compute the answer" to "prove it must be so" — is the famous first-year wall. Numbers largely disappear, replaced by symbols, definitions and arguments. Students who cross the wall describe the far side as the most beautiful subject there is: vast connected structures where a result about prime numbers turns out to secure the internet.\n\nIt is also, quietly, one of the most practically powerful degrees, because every quantitative field downstream — finance, data science, machine learning, physics — runs on the machinery mathematicians build and understand best.',
    branches: [
      { name: 'Pure mathematics', blurb: 'Structure for its own sake: analysis, algebra, number theory, topology. The proof-heavy heartland of the subject.' },
      { name: 'Applied mathematics', blurb: 'Mathematical modelling of the real world — fluids, waves, mechanics, mathematical biology. Closest cousin to physics.' },
      { name: 'Statistics & probability', blurb: 'Reasoning rigorously under uncertainty. The branch behind data science, medicine trials, insurance and machine learning.' },
      { name: 'Computation & discrete maths', blurb: 'Algorithms, combinatorics, optimisation. The bridge to computer science and the mathematics of decision-making.' },
      { name: 'Mathematical finance', blurb: 'Pricing, risk and markets treated mathematically. A common specialisation in later years for the finance-bound.' },
    ],
    dayInTheLife: 'A maths student’s week revolves around problem sheets: a handful of questions that can take hours each, most of that time spent stuck. Being stuck is not failure — it is the actual activity, the mathematical equivalent of training with weights. Lectures move fast and build relentlessly; miss two weeks and the tower wobbles. Then there are supervisions or tutorials where your attempts get pulled apart and rebuilt properly.\n\nWorking mathematicians — in research, finance or data — keep the same rhythm at higher stakes: long stretches of focused thinking, punctuated by writing up arguments precisely enough that others can check every step.',
    degreeVsSchool: '**The gap is the largest of any subject.** Being top of your school class in maths is the entry ticket, not a prediction of comfort: university maths replaces calculation with abstraction and proof, and nearly everyone — including future stars — feels lost for a stretch of first year.\n\n**Further Mathematics softens the landing** where it’s available. The students who struggle most are often those who were never stuck at school and haven’t yet learned what to do when they are.',
    whoThrives: '**Maths suits people who enjoy being stuck** — who treat a resistant problem as a puzzle to live with rather than an insult. It rewards patience, precision, and a taste for understanding things completely instead of approximately. It is more social than its reputation (problem sheets are half-collaborative everywhere), but the core work is deep solitary focus.\n\n**It goes badly** if you need visible real-world output, if "prove it" feels like pointless ceremony, or if your enjoyment of school maths was mostly the enjoyment of being quick.',
    misconceptions: [
      { myth: 'Mathematicians are people who calculate quickly.', reality: 'Speed arithmetic is nearly irrelevant. The degree is about proof, structure and abstraction — many fine mathematicians are slow and deep.' },
      { myth: 'A maths degree leads mainly to teaching.', reality: 'Maths graduates are heavily recruited into finance, data science, technology and research — it is one of the most career-flexible degrees.' },
      { myth: 'University maths is school maths, but harder.', reality: 'It is a different subject: proofs and definitions rather than methods and answers. Expect the first-year wall, and expect to climb it.' },
    ],
    careers: {
      paths: ['Quantitative finance and trading', 'Data science and machine learning', 'Actuarial work', 'Software engineering', 'Research and academia', 'Cryptography and security', 'Operational research', 'Teaching'],
      honestNote: 'Employers treat a maths degree as a rigour certificate, which keeps doors open across the whole quantitative economy — consistently among the stronger-earning degree paths without any single fixed destination. The honest trade-off: the degree itself gives you few job-specific skills, so the transition into work usually involves learning a domain (programming, finance, statistics tooling) on top. Most graduates do that easily.',
    },
    oftenComparedWith: [
      { fieldId: 'cs', howToThinkAboutIt: 'Large overlap, different centre of gravity. CS wants ideas to run; maths wants ideas to be true. If you’d happily prove a theorem no computer will ever execute, lean maths. If a proof feels incomplete until it ships as software, lean CS — or take one of the many joint degrees built for exactly this fence.' },
      { fieldId: 'sciences', howToThinkAboutIt: 'Physics is mathematics pointed at the universe. The physicist tolerates approximation to describe reality; the mathematician gives up reality to keep certainty. If thought experiments about black holes excite you more than the structure of the equations behind them, physics-leaning; if the equations themselves are the attraction, maths-leaning.' },
      { fieldId: 'economics', howToThinkAboutIt: 'Modern economics is far more mathematical than school suggests, and maths graduates walk into the same finance and policy jobs. Choose economics if you want the maths aimed at human systems and are happy writing essays too; choose maths if you want the full technical toolkit and would rather add the economics later.' },
    ],
  },

  sciences: {
    id: 'sciences',
    name: 'Natural Sciences',
    reflect: 'real science is mostly experiments not working yet — patience with failure is the core skill.',
    whatItIs: 'Natural science is the organised attempt to find out how the universe actually works — from quarks to cells to climates — using the one method that reliably separates truth from wishful thinking: propose an idea, test it against reality, keep only what survives. Physics, chemistry and biology are the classic pillars, but the modern frontier is largely between them: biochemistry, materials science, neuroscience, climate science.\n\nWhat a science degree really trains is a habit of mind: quantitative scepticism. You learn to ask "how do we know that?", to design a test that could prove yourself wrong, and to read claims — scientific or otherwise — with an eye for what the evidence can and cannot support. That habit is valuable far beyond laboratories.\n\nBe aware the three pillars feel like different subjects at university: physics becomes deeply mathematical, chemistry lives substantially in the lab, and biology becomes molecular, mechanistic and statistical.',
    branches: [
      { name: 'Physics', blurb: 'From particles to cosmology. At university it is effectively applied mathematics — the most abstract and equation-dense of the sciences.' },
      { name: 'Chemistry', blurb: 'The science of molecules and transformation. The most laboratory-centred pillar: expect serious weekly lab hours and the craft skills that go with them.' },
      { name: 'Biology & biomedical sciences', blurb: 'Life from molecules to ecosystems. Modern biology is mechanistic and data-heavy — statistics and genetics, not just naming organisms.' },
      { name: 'Biochemistry & molecular biology', blurb: 'Where chemistry meets life: proteins, DNA, drug design. The engine room of medicine and biotech research.' },
      { name: 'Earth & environmental science', blurb: 'Climate, oceans, geology. Field-work-flavoured and increasingly central to the biggest problem of the century.' },
      { name: 'Materials science', blurb: 'Designing matter itself — semiconductors, polymers, batteries. An underrated bridge between physics, chemistry and engineering.' },
    ],
    dayInTheLife: 'The honest texture of research science: most experiments don’t work, and the job is finding out why. A research scientist’s week is experiment design, bench or computer time, analysing data that refuses to be clean, reading papers, and writing — because a result that isn’t communicated might as well not exist. The eureka moments are real but rare; the sustaining pleasure is smaller and daily, the puzzle slowly yielding.\n\nAs a student: lectures and problem sets (very mathematical in physics), afternoons in teaching labs where the experiment is designed to work and sometimes still doesn’t, and lab reports that teach you to write like a scientist.',
    degreeVsSchool: '**School science is a tour of settled answers**; a science degree walks you to the edge where answers run out.\n\n**Each subject surprises differently.** Physics applicants are most often caught out: the degree is mathematics nearly all the way down, and enjoying the ideas of physics is not the same as enjoying the calculus that expresses them. Chemistry surprises with sheer lab hours; biology surprises with statistics and molecular detail replacing the whole-organism story told at school.',
    whoThrives: '**Science suits the patiently curious** — people who can hold a question for months, tolerate ambiguity and failed runs, and find genuine satisfaction in small increments of certainty. Precision and honesty matter: fudging data is the field’s cardinal sin.\n\n**It goes badly** if you need frequent visible wins, if repetitive careful procedure feels like drudgery rather than craft, or (in physics specifically) if heavy mathematics is a price rather than a pleasure.',
    misconceptions: [
      { myth: 'Science is a parade of eureka moments.', reality: 'It is mostly careful, repetitive work and experiments that fail informatively. The breakthroughs are built out of months of unglamorous rigour.' },
      { myth: 'A science degree means a lab-coat career.', reality: 'Most science graduates work outside research labs — in data, industry, finance, policy and teaching. The degree is a thinking credential as much as a vocational one.' },
      { myth: 'University physics is about cool ideas like black holes.', reality: 'It is about the mathematics that makes those ideas precise. The ideas are the reward; the maths is the work.' },
    ],
    careers: {
      paths: ['Research (via PhD)', 'Pharmaceutical and biotech industry', 'Data science and analytics', 'Energy and climate sectors', 'Finance (especially from physics)', 'Science policy and communication', 'Medicine-adjacent routes (graduate entry)', 'Teaching'],
      honestNote: 'A candid map: the academic research path runs through a PhD and postdoctoral positions, is genuinely competitive at every step, and only a minority of those who start it end up as permanent academics — going in with open eyes matters. The compensating truth is that scientific training converts well: physics graduates are prized in finance and data, chemists and biologists staff a large industrial sector, and the analytical habit travels anywhere.',
    },
    oftenComparedWith: [
      { fieldId: 'engineering', howToThinkAboutIt: 'Science discovers; engineering deploys. If your itch is "but why is it true?", science will satisfy you and engineering may frustrate you; if your itch is "fine, now let’s build it", reverse that. Physics-to-engineering is a well-trodden crossing in both directions, so this choice is less final than it feels.' },
      { fieldId: 'medicine', howToThinkAboutIt: 'Loving biology is necessary for medicine but not sufficient — medicine is a people profession built on science, while biological science is the investigation itself. If the disease mechanism interests you more than the patient who has it, biomedical science may fit better than medicine, with research routes into the same fight.' },
      { fieldId: 'mathematics', howToThinkAboutIt: 'For the physics-inclined this is the real decision: maths gives certainty about abstractions, physics gives approximate truth about reality. Sit with one honest question — when a model disagrees with an experiment, which side are you instinctively on?' },
    ],
  },

  medicine: {
    id: 'medicine',
    name: 'Medicine',
    reflect: 'it’s a long, structured path where the daily work is people and paperwork as much as science.',
    whatItIs: 'Medicine is applied science in service of one person at a time. The scientific core is real — you will learn how the body works and fails in extraordinary detail — but the profession itself is the craft of using that knowledge on actual humans: listening to a history, noticing what doesn’t fit, deciding under uncertainty, and carrying responsibility for the outcome.\n\nIt is less a degree than an entry into a long, highly structured training path: medical school, then supervised foundation years, then progressive specialty training over many further years. The system tells you where to be and what to learn for a decade or more; in exchange it delivers a profession of unusual meaning, security and trust.\n\nThe part rarely said out loud: medicine is a job about people who are frightened, in pain, or dying — and about their families. The science gets you in the door; the human load is the actual job.',
    branches: [
      { name: 'Hospital specialties', blurb: 'Surgery, internal medicine, emergency, anaesthetics, paediatrics and dozens more — chosen and competed for during training years, not at application.' },
      { name: 'General practice', blurb: 'The front line of everything: undifferentiated symptoms, long-term relationships with patients, breadth over depth. A shorter training route than most hospital paths.' },
      { name: 'Psychiatry', blurb: 'Medicine of the mind. For those drawn to the most complex organ and to patients other specialties struggle to help.' },
      { name: 'Public health', blurb: 'Treating populations instead of patients: epidemics, screening, prevention, policy. Medicine at statistical scale.' },
      { name: 'Academic medicine', blurb: 'Combining clinical work with research — the route by which treatments actually improve.' },
    ],
    dayInTheLife: '**A junior doctor’s day** starts with the ward round: seeing each patient, adjusting plans. Then come hours of executing those plans — bloods, referrals, discharge letters, chasing results, documenting everything.\n\n**Interspersed are the two extremes**: conversations that matter enormously (explaining a diagnosis, talking with a family) and stretches of administrative slog. Nights and weekends are part of the deal for years.\n\n**The dramatic saves of television are rare punctuation.** The substance is systematic care, teamwork and paperwork done properly, because in medicine "properly" is what safety is made of.\n\nAs a student: anatomy and physiology by the bucketload early on, then clinical years rotating through the hospital learning at the bedside.',
    degreeVsSchool: '**School biology rewards understanding elegant systems.** Medical school adds two things school never asked of you.\n\n**First, memory volume** — the sheer quantity to be retained is the real difficulty; few concepts are hard, but there are thousands of them. **Second, the clinical skill** of talking to strangers about intimate things while thinking diagnostically. Being the best biologist in your school says little about how you’ll take a history from a frightened patient at 3 a.m.',
    whoThrives: '**Medicine suits people with stamina in both senses** — for long training and long shifts, and for other people’s distress without absorbing it destructively. It rewards conscientiousness, teamwork and comfort with hierarchy and protocol, especially early on. Delayed gratification is structural: autonomy and specialisation come years in.\n\n**It goes badly** if you mainly loved the science (research may fit better), if you resent being told where to work and what to learn, or if you need your evenings to be reliably your own.',
    misconceptions: [
      { myth: 'Medicine is science at the highest level.', reality: 'It is a people profession that uses science. Communication, stamina and judgement under uncertainty are the daily skills; the deepest science happens in research.' },
      { myth: 'Getting in is the hard part.', reality: 'Admission is fiercely competitive, but the training path afterwards is long, examined and competitive at several further gates, particularly for popular specialties.' },
      { myth: 'Doctors are rich early.', reality: 'The training years are famously demanding relative to their pay; the profession’s financial security arrives with seniority. Anyone in it for quick money has miscalculated.' },
    ],
    careers: {
      paths: ['Hospital specialty practice', 'General practice', 'Psychiatry', 'Surgery (via long competitive training)', 'Public health and policy', 'Medical research and academia', 'Global health', 'Medical technology and industry'],
      honestNote: 'The most structured career path of any degree: employment is about as secure as work gets, and the profession travels internationally, but the route is long, the early years are hard, and popular specialties have real competitive bottlenecks. Doctors do leave clinical work — into research, industry, policy — and the degree supports that; but nobody should start medicine without wanting the clinical decade that comes first.',
    },
    oftenComparedWith: [
      { fieldId: 'sciences', howToThinkAboutIt: 'The cleanest test: is your fascination with the disease or with the patient who has it? Biomedical science pursues mechanisms and cures at the bench; medicine applies them at the bedside, at the cost of far more structure and far less freedom. Many who choose science still end up saving lives — one discovery at a time rather than one patient at a time.' },
      { fieldId: 'psychology', howToThinkAboutIt: 'If minds are what draw you, both roads lead there. Psychiatry (via medicine) treats mental illness with the full medical toolkit including medication; psychology approaches mind and behaviour as a science, with clinical psychology as a separate therapeutic profession. Medicine is the longer, more prescribed road with broader medical authority; psychology keeps you closer to the research and the talking side.' },
    ],
  },

  economics: {
    id: 'economics',
    name: 'Economics & Finance',
    reflect: 'a serious economics degree is maths and statistics at its core — the essays sit on top of models.',
    whatItIs: 'Economics is the study of how people, firms and governments make choices when they can’t have everything — and how millions of those choices add up to prices, wages, booms, crashes and inequality. It sits unusually between the sciences and the humanities: it builds mathematical models like physics, tests them on messy human data like medicine, and argues about what should be done like philosophy.\n\nThe questions are among the biggest available: why are some countries rich and others poor? What actually happens when a government prints money, taxes carbon, or caps rents? Why do markets sometimes work brilliantly and sometimes fail catastrophically? Economics gives you a disciplined machinery for thinking about these instead of just having opinions.\n\nFinance, its applied sibling, narrows the lens to how money, risk and investment move through time — the plumbing of the whole economy.',
    branches: [
      { name: 'Microeconomics', blurb: 'Individual choices and markets: how firms price, why auctions work, when competition fails. The sharpest analytical toolkit in the degree.' },
      { name: 'Macroeconomics', blurb: 'The economy as a whole — growth, inflation, unemployment, central banks. The territory of the biggest and most contested questions.' },
      { name: 'Econometrics', blurb: 'The statistical engine: how to extract cause and effect from real-world data. The most employable technical skill economics teaches.' },
      { name: 'Behavioural economics', blurb: 'What happens when you stop assuming people are perfectly rational. Where economics meets psychology.' },
      { name: 'Finance', blurb: 'Asset pricing, risk, corporate finance. The direct route to banking, trading and investment careers.' },
      { name: 'Development & policy', blurb: 'Economics aimed at poverty, health, education and government decisions — the branch for the mission-driven.' },
    ],
    dayInTheLife: 'A working economist — at a bank, a ministry, a consultancy — spends the day between data and argument: cleaning datasets, running statistical models, then turning the output into a chart and two paragraphs a decision-maker will actually read. The writing matters as much as the maths; an analysis that can’t persuade doesn’t count.\n\nAs a student: problem sets that look like applied maths, statistics and coding work in econometrics, and essays that force you to connect models to the news. The mix of quantitative and verbal is the degree’s signature — and its workload.',
    degreeVsSchool: '**School economics is largely diagrams and discussion.** A serious university economics degree is mathematical from the first term — calculus and statistics are the working language, and the strongest courses require and use A-level-Maths-and-beyond heavily.\n\n**It is genuinely both subjects at once.** Students who loved debating economic ideas but dislike mathematics often have a hard landing; students from pure-maths backgrounds are frequently surprised to find they’re expected to write well too.',
    whoThrives: '**Economics suits people who like both sides of their brain working** — comfortable with algebra and data, but equally interested in the human question underneath. It rewards scepticism: the instinct to ask "compared to what?" and "what does the data actually show?".\n\n**It goes badly** if you wanted current-affairs debate without mathematics, or pure mathematics without essays, or if you need your models to be exactly true rather than usefully wrong.',
    misconceptions: [
      { myth: 'Economics is about money and business.', reality: 'It is about choice and incentives everywhere — crime, marriage, climate, elections. Money is one instrument in a much bigger orchestra.' },
      { myth: 'Economists predict the stock market.', reality: 'Mostly they don’t and mostly they can’t — much of the field explains why reliable prediction is impossible. The real work is explaining mechanisms and evaluating policies.' },
      { myth: 'It’s an essay subject.', reality: 'At strong universities it is maths and statistics at the core, with essays layered on top. Check any course’s maths requirements — they’re telling you the truth about the content.' },
    ],
    careers: {
      paths: ['Investment banking and trading', 'Consulting', 'Central banks and government economic service', 'Data science and analytics', 'Policy and think tanks', 'International organisations', 'Accounting and corporate finance', 'Academia'],
      honestNote: 'Consistently among the higher-earning and most-recruited degree paths — but honestly, a large share of economics graduates become finance and consulting professionals rather than practising economists; the degree functions as the City and Wall Street’s favourite filter. If you specifically want to do economics — research, policy, the questions themselves — that route usually runs through postgraduate study.',
    },
    oftenComparedWith: [
      { fieldId: 'business', howToThinkAboutIt: 'Economics is the theory of the whole game; business is the practice of playing it. Economics is more mathematical, more academic and keeps more analytical doors open; business is more applied, more varied and closer to how organisations actually run. For the strongest finance and consulting routes, economics (or maths) is generally the harder currency.' },
      { fieldId: 'mathematics', howToThinkAboutIt: 'If you can do the maths degree, most of economics’ quantitative careers stay open to you — the reverse is less true. Choose economics if the human systems are the point and you want them all degree long; choose maths if you want maximum technical depth and are happy meeting the economics later.' },
      { fieldId: 'psychology', howToThinkAboutIt: 'Both study human behaviour; the methods differ. Economics models people from the outside with incentives and data at scale; psychology studies the mind directly, one experiment at a time. Behavioural economics is the bridge — read about it before deciding which side of the bridge feels like home.' },
    ],
  },

  law: {
    id: 'law',
    name: 'Law',
    reflect: 'a law degree is reading and argument in volume — courtrooms are a tiny minority of legal life.',
    whatItIs: 'Law is the operating system of a society: the rules that decide what a contract means, who owns what, what the state may do to you, and what happens when any of it is disputed. Studying law means learning to read that system precisely, argue within it persuasively, and notice how it shapes everything — every app’s terms of service, every flat rental, every arrest, every merger.\n\nAs an intellectual training, law is really the discipline of structured argument: taking a mess of facts, finding the rules that bear on them, and constructing the strongest honest case for a conclusion — while understanding the other side’s best case, because you must beat it. That skill explains why law graduates scatter successfully across business, politics, journalism and policy.\n\nIt is also a reading subject, in volume: cases, statutes, commentary. The people who thrive genuinely like the reading.',
    branches: [
      { name: 'Commercial & corporate law', blurb: 'Contracts, deals, companies. The best-paid and most competitive branch, centred on large firms and long documents.' },
      { name: 'Criminal law', blurb: 'The state versus the individual. Dramatic in principle; in practice a demanding, publicly vital and comparatively underpaid corner.' },
      { name: 'Human rights & public law', blurb: 'What governments may and may not do. Mission-driven, intellectually rich, and fiercely competitive for few positions.' },
      { name: 'Family law', blurb: 'Divorce, children, protection. Law at its most human and emotionally heavy.' },
      { name: 'Intellectual property & technology', blurb: 'Who owns ideas, software, brands and data. A growing frontier where law chases technology.' },
      { name: 'International law', blurb: 'Treaties, trade, war and states. Grand in scope; a small professional field in practice.' },
    ],
    dayInTheLife: 'A junior solicitor’s day is documents: reading them, drafting them, marking up someone else’s, and writing careful emails about the differences. Precision is the profession — a misplaced clause is a lawsuit. There are client calls, negotiations, and deadlines that occasionally eat evenings; courtroom advocacy belongs to barristers, and even for them, preparation outweighs performance many times over.\n\nAs a student: a reading list that genuinely means it, seminars where you’re expected to argue positions you may not hold, and problem questions — invented messes you must untangle with authorities cited.',
    degreeVsSchool: '**No school subject maps onto law**, which levels the field. The nearest preparation is essay subjects — history especially — because the degree is precise reading and argued writing in quantity.\n\n**The surprise for many is how technical it is**: less "is this just?" and more "what exactly did the court hold, and does it bind here?". The justice questions are present, but they live inside a machinery of precedent and interpretation you must first master.',
    whoThrives: '**Law suits careful readers and natural arguers** — people who enjoy finding the load-bearing sentence in forty pages, who can hold two opposing arguments honestly, and who find precision satisfying rather than pedantic. Detail-tolerance is non-negotiable.\n\n**It goes badly** if you wanted performance rather than preparation, if ambiguity frustrates you (law is argued precisely because answers aren’t settled), or if you can’t bear reading as the main event.',
    misconceptions: [
      { myth: 'Law is courtroom drama.', reality: 'The overwhelming majority of legal work is documents, advice and negotiation. Most lawyers rarely see a courtroom; even barristers prepare far more than they perform.' },
      { myth: 'You memorise laws.', reality: 'You learn to find, read and apply law — the skill is interpretation and argument, not recall. The law changes; the method is the degree.' },
      { myth: 'You need a law degree to become a lawyer.', reality: 'In the UK and several other systems, graduates of any subject can convert. A law degree is one route, not the gate — which is worth knowing before you choose it at seventeen.' },
    ],
    careers: {
      paths: ['Solicitor (commercial, private client, public sector)', 'Barrister', 'In-house counsel', 'Government legal service and policy', 'Compliance and regulation', 'Journalism and politics', 'Business and consulting'],
      honestNote: 'The honest map: the profession’s prestigious entry points — training contracts at large firms, pupillage at the Bar — are seriously competitive, and pay across law is far more unequal than its reputation suggests: corporate law pays extremely well, while criminal and family practice are demanding and comparatively modest. A law degree that doesn’t lead to practice is still respected across business and government, so the downside is soft.',
    },
    oftenComparedWith: [
      { fieldId: 'economics', howToThinkAboutIt: 'Both are rigorous routes into serious careers, with different instruments: economics argues with models and data, law argues with texts and precedent. If your instinct on reading a policy dispute is to ask what the numbers show, lean economics; if it’s to ask who has the right and what the rule actually says, lean law.' },
      { fieldId: 'business', howToThinkAboutIt: 'Commercial law and business live in the same world from different seats: the businessperson decides the deal, the lawyer makes the deal safe and enforceable. Law is the deeper intellectual training and the harder degree; business gets you to decision-making seats sooner. Plenty of law graduates cross into business precisely because the training is respected there.' },
    ],
  },

  business: {
    id: 'business',
    name: 'Business',
    reflect: 'the degree is a broad toolkit — what you get out depends heavily on internships and initiative alongside it.',
    whatItIs: 'Business studies how organisations create value: how a company decides what to make, prices it, markets it, finances it, hires for it, and organises hundreds of people so the whole thing doesn’t collapse. It is the generalist’s degree — a structured tour of every function an organisation runs on, from accounting to strategy to human behaviour at work.\n\nThe intellectual content is real but applied: frameworks for decisions, cases about real companies’ triumphs and disasters, numbers that must be read fluently even if you never become the accountant. The best business education teaches judgement — how to look at a struggling company and diagnose which of its hundred problems actually matters.\n\nIts breadth is both the pitch and the caveat: you graduate conversant in everything and deeply specialised in nothing, which suits future generalists and frustrates future specialists.',
    branches: [
      { name: 'Management & strategy', blurb: 'How organisations decide and direct. The core of consulting careers and, eventually, leadership roles.' },
      { name: 'Marketing', blurb: 'Understanding customers and building demand — increasingly a data discipline as much as a creative one.' },
      { name: 'Finance & accounting', blurb: 'The numbers that organisations live or die by. The most technical and most reliably employable branch.' },
      { name: 'Entrepreneurship', blurb: 'Starting things. Useful frameworks and networks — though founders come from every degree, and the doing teaches more than the studying.' },
      { name: 'Operations & supply chain', blurb: 'How things actually get made and delivered. Unfashionable and quietly critical — the branch the pandemic made famous.' },
      { name: 'Business analytics', blurb: 'Decisions from data. The fastest-growing branch and the one that most rewards adding real statistical skills.' },
    ],
    dayInTheLife: '**There is no single business job, so no single day** — but the early-career pattern across functions is recognisable: analysis in spreadsheets and slides, meetings to align people who see the problem differently, and communication, endlessly, because in organisations an idea that isn’t sold doesn’t happen.\n\n**The function changes the texture.** A junior consultant builds models and interviews clients; a junior marketer runs campaigns and reads their numbers; a junior analyst reconciles data and presents it upward.\n\nAs a student: case studies, group projects (many — the degree is deliberately collaborative), presentations, and coursework spanning accounting to organisational psychology.',
    degreeVsSchool: '**Business at school barely predicts the degree**, which is broader and more numerical than most applicants expect — accounting, statistics and finance are core, not optional.\n\n**The bigger honest gap is between the degree and the outcome.** Unlike medicine or engineering, a business degree certifies no specific skill, so employers weigh what you did alongside it — internships, projects, societies — unusually heavily. The students who treat the degree as a base camp rather than the climb do far better than those who expect it to place them somewhere by itself.',
    whoThrives: '**Business suits energetic generalists** — people who like moving between problems, working through and with other people, and getting to practical outcomes rather than theoretical depth. Communication is the core competence: comfort presenting, persuading and working in imperfect teams.\n\n**It goes badly** if you crave one deep discipline, find group work an ordeal, or expected the degree to be the easy option (the workload is real; it’s the depth, not the volume, that differs).',
    misconceptions: [
      { myth: 'Business is the easy degree.', reality: 'It is the broad degree. Accounting, statistics and finance modules have real teeth; the difference from harder-reputation degrees is specialisation, not effort.' },
      { myth: 'A business degree teaches you to run a business.', reality: 'It teaches the functions businesses run on. Judgement comes from doing — which is why internships and ventures alongside the degree matter so much.' },
      { myth: 'You need a business degree for a business career.', reality: 'Employers hire economists, engineers and historians into the same roles. The degree is one route in — useful, but not a moat.' },
    ],
    careers: {
      paths: ['Management consulting', 'Marketing and brand management', 'Finance and accounting (with professional qualifications)', 'Operations and supply chain', 'Human resources', 'Sales and business development', 'Startups and family business', 'General management'],
      honestNote: 'Business graduates are hired everywhere, which is the strength and the catch: the degree opens many doors slightly rather than one door decisively. Differentiation comes from what you add — internships, a technical skill like analytics or accounting qualifications, evidence of initiative. Those who add it do well; those who rely on the degree title alone find the market crowded, because it is one of the most-taken degrees anywhere.',
    },
    oftenComparedWith: [
      { fieldId: 'economics', howToThinkAboutIt: 'Economics is more mathematical, more theoretical, and treated by elite finance and consulting recruiters as the stronger signal; business is more applied and covers ground economics never touches — marketing, organisations, operations. If you’re confident with maths and want maximum optionality, economics; if you want the practical breadth of how companies actually run, business.' },
      { fieldId: 'psychology', howToThinkAboutIt: 'A surprising amount of business is applied psychology — consumers, teams, incentives, leadership. Psychology gives you the science with rigour and statistics; business gives you the application with less depth. If understanding people is the fascination, psychology may satisfy it better, and businesses hire psychology graduates into marketing and HR readily.' },
    ],
  },

  psychology: {
    id: 'psychology',
    name: 'Psychology & Social Sciences',
    reflect: 'the degree is a research science full of statistics — it is not therapy training, which comes later and is very competitive.',
    whatItIs: 'Psychology is the scientific study of mind and behaviour: how people perceive, remember, decide, develop, differ and break down — established not by intuition but by experiment. The wider social sciences (sociology, anthropology, political science) zoom out from the individual to groups, cultures and institutions, asking how societies shape people and vice versa.\n\nThe word "scientific" is doing real work in that definition. A psychology degree is built on research methods and statistics: designing studies that can actually answer a question, and analysing data honestly — including the field’s own hard reckoning with findings that failed to replicate. You will spend far more time with statistical software than with anything resembling a therapy couch.\n\nWhat you gain is a rigorous lens on the most interesting subject available — people — and a training in evidence that transfers anywhere humans and data meet.',
    branches: [
      { name: 'Clinical & counselling', blurb: 'The therapeutic branch — assessment and treatment of mental illness. Note: practising clinically requires competitive postgraduate training beyond the degree.' },
      { name: 'Cognitive psychology & neuroscience', blurb: 'How thinking works and what the brain is doing meanwhile: memory, attention, language, imaging. The most laboratory-scientific branch.' },
      { name: 'Developmental', blurb: 'How minds are built from infancy to old age — and what happens when development goes differently.' },
      { name: 'Social psychology', blurb: 'How people behave in groups: conformity, prejudice, persuasion. The branch with the most famous (and most re-examined) experiments.' },
      { name: 'Organisational', blurb: 'Psychology at work: selection, motivation, leadership. The most direct business route.' },
      { name: 'Sociology & social policy', blurb: 'From minds to societies: inequality, institutions, culture — the structural forces psychology alone can’t see.' },
    ],
    dayInTheLife: 'A research psychologist’s week: designing studies, recruiting participants, collecting data that arrives slower and messier than planned, statistics, and writing — the publishing rhythm of any science. A clinical psychologist’s week (after postgraduate training): assessments, therapy sessions, case notes, supervision and multidisciplinary meetings — emotionally substantial work with structure around it.\n\nAs a student: lectures across the whole span from neurons to societies, a statistics-and-methods spine running through every year, and a final-year research project where you finally run your own study — for many, the moment the degree clicks.',
    degreeVsSchool: '**The gap has one word on it: statistics.** Applicants imagine reading about minds; the degree insists you measure them, and the methods-and-stats modules are compulsory, substantial and the most common unpleasant surprise.\n\n**The second gap: a psychology degree does not make you a therapist.** Clinical routes are separate, postgraduate and among the most competitive trainings anywhere. Knowing both facts in advance is the difference between choosing the subject and choosing its stereotype.',
    whoThrives: '**Psychology suits the people-curious with a tolerance for rigour** — those who can hold both "this human story is fascinating" and "but what does the evidence actually show?" without dropping either. Comfort with numbers is genuinely required. For the clinical path, emotional resilience and patience with a long competitive route are part of the deal.\n\n**It goes badly** if statistics feels like a betrayal of why you came, or if you expected settled answers about human nature rather than carefully-qualified evidence.',
    misconceptions: [
      { myth: 'Psychology teaches you to read people.', reality: 'It teaches you to test claims about people. Much of the degree is discovering that folk intuitions — including yours — often fail when measured.' },
      { myth: 'A psychology degree makes you a therapist.', reality: 'Clinical practice requires separate postgraduate training that is heavily oversubscribed. The undergraduate degree is a science degree.' },
      { myth: 'It’s a soft option.', reality: 'The statistics and research-methods core is demanding, and the discipline’s replication reckoning has made the training more rigorous, not less.' },
    ],
    careers: {
      paths: ['Clinical and counselling routes (via postgraduate training)', 'User experience (UX) research', 'Human resources and organisational consulting', 'Marketing and consumer insight', 'Research and academia', 'Education and child development services', 'Public policy and health services', 'Data analysis'],
      honestNote: 'Be clear-eyed about the clinical path: it is a genuinely competitive multi-year route after the degree, usually involving assistant-psychologist experience first, and many who intend it at eighteen end up elsewhere — often happily. The degree’s quiet strength is breadth: the evidence-plus-people skillset lands well in UX, HR, marketing and policy. It is one of the most popular degrees, so differentiation (methods skills especially) pays.',
    },
    oftenComparedWith: [
      { fieldId: 'medicine', howToThinkAboutIt: 'Both can lead to treating minds. Psychiatry (through medicine) brings the full medical toolkit and prescribing authority at the cost of the whole medical training first; clinical psychology goes deeper into therapy and research with a shorter but fiercely competitive route. If bodies interest you as much as minds, medicine; if minds specifically, psychology — knowing the clinical gate is narrow either way.' },
      { fieldId: 'sciences', howToThinkAboutIt: 'Neuroscience is where they meet: biology asks what the brain is; psychology asks what the mind does. If you want cells, molecules and mechanisms, the biology route runs deeper; if you want behaviour, memory and experience with the brain as context, psychology. Joint and neuroscience degrees exist precisely for this fence.' },
      { fieldId: 'business', howToThinkAboutIt: 'If your interest in people is practical — teams, customers, motivation — business applies psychology daily without the research depth. Choose psychology for the science and the wider option set (including clinical); choose business if you’d rather use the findings than produce them.' },
    ],
  },

  architecture: {
    id: 'architecture',
    name: 'Architecture',
    reflect: 'it’s a long studio-hours path where your work is publicly critiqued — resilience matters as much as talent.',
    whatItIs: 'Architecture is the design of the built world — the discipline that decides what it feels like to be a human in a building, a street, a city. It sits deliberately between art and engineering: an architect must imagine a space that moves people and simultaneously resolve how it stands up, keeps rain out, meets fire regulations, and gets built for the money available.\n\nThe education is unlike any other degree on this list. It happens in the studio: you are set a brief, you design a response over weeks — drawings, models, iterations — and then you pin your work on a wall and defend it while tutors and peers critique it in public. This cycle, repeated for years, is the actual curriculum. It teaches design thinking, visual argument, and a thick skin.\n\nThe path is famously long: in the UK and similar systems, full qualification as an architect takes around seven years of alternating study and supervised practice.',
    branches: [
      { name: 'Architectural practice', blurb: 'Designing buildings in firms large and small — from concept sketches to construction drawings and site problems.' },
      { name: 'Urban design & planning', blurb: 'Zooming out from buildings to neighbourhoods and cities: masterplans, public space, and the politics of place.' },
      { name: 'Landscape architecture', blurb: 'Designing the spaces between buildings — parks, waterfronts, ecosystems. A growing field as cities take climate seriously.' },
      { name: 'Conservation & heritage', blurb: 'Working with existing and historic buildings — arguably the most sustainable architecture there is.' },
      { name: 'Computational design & visualisation', blurb: 'The digital frontier: parametric design, simulation, and the imagery that sells unbuilt buildings. A natural home for architecture-meets-code minds.' },
      { name: 'Interior & exhibition design', blurb: 'Space at the human scale — where architecture meets brand, story and experience.' },
    ],
    dayInTheLife: 'In practice, an architect’s week mixes design time (less than outsiders imagine) with everything that makes design real: coordinating with structural engineers, checking regulations, redlining drawings, client meetings where the budget shrinks, and site visits where the built thing differs from the drawn thing and must be resolved today. Junior years involve a lot of drawing production and detail work before the design authority arrives.\n\nAs a student, the studio dominates: long hours — sometimes very long around deadlines — making models and drawings, in a cohort that becomes unusually close because everyone is in it together at 2 a.m.',
    degreeVsSchool: '**No school subject is architecture**, and schools rarely warn about the two real entry requirements: a portfolio that shows how you see (drawing skill matters less than observation and ideas), and stamina for critique — having work you laboured over publicly pulled apart, weekly, and coming back stronger.\n\n**The demanding parts are time, iteration and emotional durability**, not the maths and physics requirements, which are usually modest. Students who need clear right answers find the open-endedness hard; that open-endedness is the subject.',
    whoThrives: '**Architecture suits visual thinkers with persistence** — people who notice buildings and spaces compulsively, who can iterate on feedback without taking it as a verdict on themselves, and who accept that creative work lives inside constraints (budgets, clients, regulations) rather than despite them.\n\n**It goes badly** if you want pure artistic freedom (that’s art school), quick qualification, or evenings that reliably belong to you during studio years.',
    misconceptions: [
      { myth: 'Architecture is drawing beautiful buildings.', reality: 'It is negotiating beauty with structure, regulation, budget and client — the drawing is the start of the argument, not the job.' },
      { myth: 'It’s a quick creative degree.', reality: 'Full qualification takes around seven years of study and practice. It is one of the longest professional trainings outside medicine.' },
      { myth: 'You must be brilliant at maths and drawing.', reality: 'You need competence in both and excellence in neither. Observation, ideas and iteration matter more than draughtsmanship — portfolios show thinking, not just technique.' },
    ],
    careers: {
      paths: ['Architectural practice (via full qualification)', 'Urban design and planning', 'Landscape architecture', 'Architectural visualisation and computational design', 'Set, exhibition and experience design', 'Property and development', 'Heritage and conservation'],
      honestNote: 'The honest ledger: the training is long and studio-intense, and early-career pay in practice is modest relative to that investment — architecture is chosen for love of the work more than the economics. The compensations are real: a licensed profession, work you can physically stand inside, and a design education that transfers surprisingly well into adjacent creative and digital fields for those who branch out.',
    },
    oftenComparedWith: [
      { fieldId: 'engineering', howToThinkAboutIt: 'Ask which question you’d rather own: "what should this place be like?" (architecture) or "how do we make it stand and work?" (engineering). Architects and structural engineers collaborate on every real building; the degrees select for studio-and-critique versus maths-and-problem-sheets temperaments. If you want both in one head, architectural engineering programmes exist.' },
      { fieldId: 'cs', howToThinkAboutIt: 'An emerging and genuine crossover: computational design, parametric modelling and visualisation are transforming how buildings are conceived. If you love both space and code, architecture with computational leanings — or CS with a design portfolio on the side — both reach that frontier from different ends.' },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
 * SUPERCURRICULAR ROADMAPS — "Building your [Field] story"
 *
 * The static version of tactical counselor advice: what a student can
 * actually DO to build depth in a field. Three categories per field.
 *
 * HONESTY RULES (enforced by test assertion):
 *   · Every competition is REAL and was verified against its official
 *     site before being listed here; anything unverifiable is omitted.
 *   · Reading lists are real, named, checkable titles only.
 *   · Project prompts are authored editorial framed as building YOUR
 *     story/evidence. Nothing here claims a university requires,
 *     prefers, rewards or is impressed by any of it — universities
 *     publish no verifiable weightings, so such a claim would be
 *     fabricated. It's about having a story to tell, which is true.
 * ═══════════════════════════════════════════════════════════════ */

const fieldRoadmaps = {

  engineering: {
    reading: [
      { title: 'Structures: Or Why Things Don’t Fall Down', by: 'J. E. Gordon', note: 'The classic on why bridges, bones and beams hold — readable with school physics.' },
      { title: 'To Engineer Is Human', by: 'Henry Petroski', note: 'On failure as the engine of design. Short, and it reframes what engineers actually do.' },
      { title: '99% Invisible', by: 'podcast', note: 'Episodes on the designed world — infrastructure, materials, and the decisions behind them.' },
    ],
    competitions: [
      { name: 'The Big Bang Competition', line: 'National STEM project competition — enter a science, engineering or technology project you have built or investigated. Free, ages 11–18.', url: 'https://www.thebigbang.org.uk/the-big-bang-competition/' },
      { name: 'British Physics Olympiad', line: 'A ladder of physics problem papers sat in school, from the accessible Junior/Senior Challenges up to the Olympiad rounds.', url: 'https://www.bpho.org.uk/' },
      { name: 'UKMT Senior Mathematical Challenge', line: 'A 90-minute problem paper — good practice for the mathematical thinking engineering leans on.', url: 'https://ukmt.org.uk/senior-challenges/senior-mathematical-challenge' },
    ],
    projects: [
      'Take something in your house that annoys you and redesign it on paper — sketch it, name the constraint you are fighting (cost, strength, space), and say what you would trade away.',
      'Build the simplest version of something that moves — a catapult, a bridge from spaghetti, a small motor circuit — then test it to destruction and write down where and why it failed.',
      'Pick a piece of local infrastructure you walk past weekly and work out how it carries its load. A page of diagrams beats a term of vague enthusiasm.',
    ],
  },

  cs: {
    reading: [
      { title: 'Code: The Hidden Language of Computer Hardware and Software', by: 'Charles Petzold', note: 'Builds a computer from a light switch upwards. The best answer to “but how does it actually work?”' },
      { title: 'Algorithms to Live By', by: 'Brian Christian & Tom Griffiths', note: 'Computer-science ideas applied to ordinary decisions — a painless route into what the theory is for.' },
      { title: 'CS50: Introduction to Computer Science', by: 'Harvard, free online', note: 'The widely used free introductory course. Doing a few problem sets teaches more than reading about coding.' },
    ],
    competitions: [
      { name: 'UK Bebras Computational Thinking Challenge', line: 'Short logic and computational-thinking puzzles, no coding needed. Sat in school each November, ages 6–19.', url: 'https://www.bebras.uk/' },
      { name: 'British Informatics Olympiad', line: 'The national programming competition: a three-hour paper set in school, any language, with a Cambridge final for top scorers.', url: 'https://www.olympiad.org.uk/' },
      { name: 'CyberFirst Girls Competition', line: 'NCSC (GCHQ) cyber-security challenges — cryptography, logic and code-breaking, in teams.', url: 'https://www.ncsc.gov.uk/cyberfirst/girls-competition' },
    ],
    projects: [
      'Build something that solves a real annoyance in your week — a script that renames your files, a page that tracks your revision, a bot that reminds you of deadlines. Small and used beats big and abandoned.',
      'Take a program you have written and make it twice as fast, or half as long. Write a paragraph on what you changed and why — that paragraph is the interesting part.',
      'Recreate something you use without looking at its source: a calculator, a to-do list, a simple game. Getting stuck and unsticking yourself is the whole point.',
    ],
  },

  mathematics: {
    reading: [
      { title: 'Humble Pi', by: 'Matt Parker', note: 'What happens when maths goes wrong in the real world. Funny, and quietly serious about rigour.' },
      { title: 'A Mathematician’s Apology', by: 'G. H. Hardy', note: 'Short, personal, and the clearest statement of why pure mathematicians do it at all.' },
      { title: '3Blue1Brown', by: 'YouTube, free', note: 'The Essence of Calculus and Essence of Linear Algebra series — visual intuition for what you will meet in first year.' },
    ],
    competitions: [
      { name: 'UKMT Senior Mathematical Challenge', line: '90 minutes of multiple-choice problems for Year 13 and below; strong scores lead on to the Olympiad rounds.', url: 'https://ukmt.org.uk/senior-challenges/senior-mathematical-challenge' },
      { name: 'British Mathematical Olympiad Round 1', line: 'Six problems in 3.5 hours needing full written proofs — the real step up from challenge-style questions.', url: 'https://ukmt.org.uk/senior-challenges/british-maths-olympiad-round-1' },
      { name: 'Senior Team Maths Challenge', line: 'Teams of four from Year 12–13 at regional finals — the same problem-solving, done out loud with other people.', url: 'https://ukmt.org.uk/team-challenges/senior-team-mathematical-challenge' },
    ],
    projects: [
      'Prove something small properly and write it up in one page — that the square root of 2 is irrational, or that there are infinitely many primes. Writing a proof cleanly is the skill the degree is built on.',
      'Take a result you were taught as a rule and find out where it comes from. Why does that formula work? Chase it until you could explain it to your class.',
      'Pick a question with no tidy answer — how many people share your birthday in school, how long a queue gets at lunch — model it, then check your model against what actually happens.',
    ],
  },

  sciences: {
    reading: [
      { title: 'Seven Brief Lessons on Physics', by: 'Carlo Rovelli', note: 'Ninety pages that cover the big ideas of modern physics without maths. A good test of whether the ideas grip you.' },
      { title: 'The Disappearing Spoon', by: 'Sam Kean', note: 'The periodic table told through stories — chemistry as history, accident and obsession.' },
      { title: 'The Infinite Monkey Cage', by: 'BBC Radio 4 podcast', note: 'Working scientists arguing about their own subjects, which is closer to real science than any textbook.' },
    ],
    competitions: [
      { name: 'British Physics Olympiad', line: 'Fifteen annual physics competitions, from accessible challenge papers to the Olympiad rounds. Sat in school.', url: 'https://www.bpho.org.uk/' },
      { name: 'UK Chemistry Olympiad', line: 'The Royal Society of Chemistry’s national competition for 16–19 year olds, sat in school in January.', url: 'https://edu.rsc.org/enrichment/uk-chemistry-olympiad' },
      { name: 'British Biology Olympiad', line: 'For students aged 16–18, run by the UK Biology Competitions charity; leads towards the international olympiad.', url: 'https://ukbiologycompetitions.org/british-biology-olympiad/' },
    ],
    projects: [
      'Run one proper experiment at home with a control — germination under different conditions, rusting, the maths of a bouncing ball — and write it up with your uncertainties honestly stated.',
      'Read one real paper on something you care about (many are free) and write half a page on what they did and what you did not follow. Naming your confusion is genuine scientific work.',
      'Keep a two-month notebook on a natural process you can observe — a tide, a mould, the night sky — and look for the pattern. Sustained observation is rarer than enthusiasm.',
    ],
  },

  medicine: {
    reading: [
      { title: 'Do No Harm', by: 'Henry Marsh', note: 'A neurosurgeon on his own mistakes. The most honest book about medicine as a job rather than a calling.' },
      { title: 'This Is Going to Hurt', by: 'Adam Kay', note: 'Junior doctor diaries — funny, then not. Read it for the working conditions, not the anecdotes.' },
      { title: 'Bad Science', by: 'Ben Goldacre', note: 'How to read evidence and spot the bad kind. Directly useful for interviews and for the rest of your life.' },
    ],
    competitions: [
      { name: 'British Biology Olympiad', line: 'For students aged 16–18 — the main national biology competition, sat in school.', url: 'https://ukbiologycompetitions.org/british-biology-olympiad/' },
      { name: 'Biology Challenge', line: 'Two short multiple-choice papers for Years 9–10, rewarding curiosity beyond the syllabus. A good early start.', url: 'https://ukbiologycompetitions.org/biology-challenge/' },
      { name: 'UK Chemistry Olympiad', line: 'The Royal Society of Chemistry’s competition for 16–19 year olds — chemistry is the subject most medicine courses insist on.', url: 'https://edu.rsc.org/enrichment/uk-chemistry-olympiad' },
    ],
    projects: [
      'Get any regular contact with people who need care — a care home, a charity shop, a coaching role — and keep a short private log of what you noticed about the people, not about yourself.',
      'Follow one health story in the news for a month and track how the evidence behind it changes. Medicine is applied uncertainty; this is what that feels like.',
      'Write a page on an ethical case that genuinely splits you — consent, rationing, a refused treatment — arguing both sides before you land anywhere.',
    ],
  },

  economics: {
    reading: [
      { title: 'The Undercover Economist', by: 'Tim Harford', note: 'Everyday prices, explained. Still the best on-ramp to thinking like an economist.' },
      { title: 'Poor Economics', by: 'Abhijit Banerjee & Esther Duflo', note: 'Nobel-winning work on what actually helps — evidence over ideology, written for general readers.' },
      { title: 'More or Less: Behind the Statistics', by: 'BBC Radio 4 podcast', note: 'Ten-minute demolitions of numbers in the news. Trains the instinct the degree will formalise.' },
    ],
    competitions: [
      { name: 'Marshall Society Essay Competition', line: 'Cambridge’s economics society essay prize, open worldwide to pre-university students. Free to enter.', url: 'https://www.marshallsociety.com/essay-competition' },
      { name: 'RES Young Economist of the Year', line: 'Royal Economic Society competition for Years 10–13 analysing a contemporary economic problem, with a presented final.', url: 'https://res.org.uk/committees/pd-education-committee/young-economist-of-the-year/' },
      { name: 'John Locke Institute Global Essay Prize', line: 'Argumentative essay under 2,000 words; Economics is one of its subject categories. Open to under-19s worldwide.', url: 'https://www.johnlockeinstitute.com/essay-competition' },
    ],
    projects: [
      'Pick one price you pay often — a bus fare, a coffee, a game — and work out honestly why it is that number. Write the page you wish someone had written for you.',
      'Find a public dataset (ONS, World Bank) on something you care about, make one chart, and write two paragraphs on what it does and does not show.',
      'Take a policy being argued about right now, write the strongest case for it, then the strongest case against, and only then say what you think.',
    ],
  },

  law: {
    reading: [
      { title: 'The Secret Barrister', by: 'Anonymous', note: 'What the criminal courts are actually like day to day. Corrective to every courtroom drama.' },
      { title: 'Letters to a Law Student', by: 'Nicholas McBride', note: 'Written precisely for someone deciding whether to apply, and how to read law once they do.' },
      { title: 'Law in Action', by: 'BBC Radio 4 podcast', note: 'Current legal issues explained by people who practise. Good for interview conversation.' },
    ],
    competitions: [
      { name: 'Bar Mock Trial Competition', line: 'Run by the charity Young Citizens for ages 15–18: teams argue a real-format criminal trial in a real courtroom, judged by practising barristers and judges.', url: 'https://www.youngcitizens.org/programmes/the-bar-mock-trial-competition/' },
      { name: 'John Locke Institute Global Essay Prize', line: 'Argumentative essay under 2,000 words; Law is one of its subject categories. Open to under-19s worldwide.', url: 'https://www.johnlockeinstitute.com/essay-competition' },
    ],
    projects: [
      'Write a one-page case note on a ruling in the news: what the facts were, what was decided, and what the decision turns on. Do it monthly and you will read judgments faster than most first-years.',
      'Follow one bill through Parliament and note where it changed and who pushed. Law as it is actually made, rather than as it appears finished.',
      'Argue a position you disagree with, in writing, well enough that someone who holds it would nod. That is most of what legal reasoning asks.',
    ],
  },

  business: {
    reading: [
      { title: 'Bad Blood', by: 'John Carreyrou', note: 'The Theranos collapse. A better business education than most success stories.' },
      { title: 'Shoe Dog', by: 'Phil Knight', note: 'The founding of Nike, told with the cash-flow panic left in.' },
      { title: 'The Bottom Line', by: 'BBC Radio 4 podcast', note: 'Working executives discussing real operational problems, without the motivational packaging.' },
    ],
    competitions: [
      { name: 'Young Enterprise Company Programme', line: 'Set up and run a real student company over a year, with regional and national finals. Run by the charity Young Enterprise since 1962.', url: 'https://www.young-enterprise.org.uk/what-we-do/programmes/company-programme' },
      { name: 'John Locke Institute Global Essay Prize', line: 'Argumentative essay under 2,000 words; Economics and Public Policy are among its categories. Open to under-19s worldwide.', url: 'https://www.johnlockeinstitute.com/essay-competition' },
    ],
    projects: [
      'Sell something real to strangers, even at tiny scale, and keep the actual numbers — costs, price, what did not sell. One honest spreadsheet is worth ten business-plan templates.',
      'Take a small local business you use and write a page on how it makes money: where the margin is, what its biggest risk is, what you would change first.',
      'Pick a company that failed and work out the decision that killed it. Being specific about the moment is harder, and more interesting, than the story.',
    ],
  },

  psychology: {
    reading: [
      { title: 'Thinking, Fast and Slow', by: 'Daniel Kahneman', note: 'The foundational book on how judgement actually works. Dense in places — read it slowly.' },
      { title: 'The Man Who Mistook His Wife for a Hat', by: 'Oliver Sacks', note: 'Case studies where the brain goes strange, told with unusual humanity.' },
      { title: 'All in the Mind', by: 'BBC Radio 4 podcast', note: 'Current psychology and neuroscience research, explained by the researchers.' },
    ],
    competitions: [
      { name: 'National Psychology Competition', line: 'Run by Royal Holloway, University of London for Year 12 students, against schools across the UK.', url: 'https://www.royalholloway.ac.uk/studying-here/schools-and-colleges/activities-by-subject/psychology/psychology-resources/national-psychology-competition/' },
      { name: 'John Locke Institute Global Essay Prize', line: 'Argumentative essay under 2,000 words; Psychology is one of its subject categories. Open to under-19s worldwide.', url: 'https://www.johnlockeinstitute.com/essay-competition' },
    ],
    projects: [
      'Replicate a classic finding on your friends — an anchoring effect, a memory-span test — then write down every reason your version might be wrong. The critique is the psychology.',
      'Read the original paper behind a psychology claim you have heard repeated, and check whether the claim survives the method section.',
      'Keep a two-week log of your own predictions about your mood, sleep or focus, then compare with what happened. Self-report is unreliable — finding out how unreliable is the lesson.',
    ],
  },

  architecture: {
    reading: [
      { title: 'How Buildings Learn', by: 'Stewart Brand', note: 'What happens to buildings after they are finished — the part architecture books usually skip.' },
      { title: 'The Architecture of Happiness', by: 'Alain de Botton', note: 'Why buildings make us feel things. Accessible, and argumentative enough to disagree with.' },
      { title: '99% Invisible', by: 'podcast', note: 'The design decisions behind ordinary places. Trains you to notice, which is the whole job.' },
    ],
    competitions: [
      { name: 'RIBA National Schools Programme', line: 'The Royal Institute of British Architects runs schools competitions, Architecture Ambassadors workshops and work experience for 16–18s.', url: 'https://www.riba.org/learn/public-and-school-learning/schools/' },
      { name: 'The Big Bang Competition', line: 'National project competition with a technology and engineering category — a route in for a structural or environmental design project. Free, ages 11–18.', url: 'https://www.thebigbang.org.uk/the-big-bang-competition/' },
    ],
    projects: [
      'Start a sketchbook and draw one building a week from life, badly at first. A portfolio is asked for at application, and it cannot be made in a fortnight.',
      'Measure a room you know well and redraw it to scale in plan and section. Learning to think in plan is the skill that separates interest from preparation.',
      'Document a public space near you across a day — who uses it, when, and what defeats them. Then redesign one thing about it and say what you traded away.',
    ],
  },
};

// Attach additively — the profiles above are untouched.
Object.entries(fieldRoadmaps).forEach(([key, roadmap]) => {
  if (fieldProfiles[key]) fieldProfiles[key].roadmap = roadmap;
});

// Node test-harness compatibility (browser loads this as a plain script).
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fieldProfiles, fieldRoadmaps };
}
