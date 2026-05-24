// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const worksDropdown = document.querySelector('.nav-dropdown');
const worksDropdownToggle = document.querySelector('.nav-dropdown-toggle');

function closeWorksDropdown() {
    if (!worksDropdown || !worksDropdownToggle) return;
    worksDropdown.classList.remove('open');
    worksDropdownToggle.setAttribute('aria-expanded', 'false');
}

if (worksDropdown && worksDropdownToggle) {
    worksDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = worksDropdown.classList.toggle('open');
        worksDropdownToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (e) => {
        if (!worksDropdown.contains(e.target)) {
            closeWorksDropdown();
        }
    });
}

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        closeWorksDropdown();
    });
});

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
            const targetY = target.getBoundingClientRect().top + window.pageYOffset;

            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background and text color on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const heroSection = document.querySelector('.hero');
    const heroFooter = document.querySelector('.hero-footer');
    const aboutSection = document.querySelector('#about');
    const journalsSection = document.querySelector('#journals');
    const heroHeight = heroSection.offsetHeight;
    const navProbeY = window.scrollY + 120;
    
    if (window.scrollY > heroHeight - 100) {
        navbar.classList.add('is-light-section');
    } else {
        navbar.classList.remove('is-light-section');
    }

    if (journalsSection) {
        const journalsTop = journalsSection.offsetTop;
        const journalsBottom = journalsTop + journalsSection.offsetHeight;
        const inJournals = navProbeY >= journalsTop && navProbeY < journalsBottom;
        navbar.classList.toggle('is-journals-section', inJournals);
    }

    if (aboutSection) {
        const aboutTop = aboutSection.offsetTop;
        const aboutBottom = aboutTop + aboutSection.offsetHeight;
        const inAbout = navProbeY >= aboutTop && navProbeY < aboutBottom;
        navbar.classList.toggle('is-about-section', inAbout);
    }

    if (heroSection && heroFooter && navbar) {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        const navbarHeight = navbar.offsetHeight;
        const hideLandingStrip = heroBottom <= (navbarHeight + 20);
        heroFooter.classList.toggle('is-hidden', hideLandingStrip);
    }
});

// Set initial navbar state on load
window.dispatchEvent(new Event('scroll'));

// Animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

// Observe all sections except filmography (keeps its dark bg solid)
document.querySelectorAll('.section:not(.filmography)').forEach(section => {
    section.style.opacity = '0';
    section.style.transition = 'opacity 0.6s ease';
    observer.observe(section);
});

// 3D Carousel
const cards = Array.from(document.querySelectorAll('.carousel-card'));
const totalCards = cards.length;
let currentIndex = 0;
let autoRotateTimer = null;

const positions = [
    { x: '-50%', y: '-60%', tx: '0px',    scale: 1,    z: 5, opacity: 1    },  // center
    { x: '-50%', y: '-60%', tx: '360px',  scale: 0.82, z: 4, opacity: 0.85 },  // right 1
    { x: '-50%', y: '-60%', tx: '620px',  scale: 0.65, z: 3, opacity: 0.6  },  // right 2
    { x: '-50%', y: '-60%', tx: '-620px', scale: 0.65, z: 3, opacity: 0.6  },  // left 2
    { x: '-50%', y: '-60%', tx: '-360px', scale: 0.82, z: 4, opacity: 0.85 },  // left 1
];

let hoveredCard = null;
let modalOpen = false;

function applyPositions() {
    cards.forEach((card, i) => {
        const pos = (i - currentIndex + totalCards) % totalCards;
        const p = positions[pos];
        const liftY = (card === hoveredCard && pos === 0) ? -32 : 0;
        const shadowSize = (card === hoveredCard && pos === 0) ? '0 40px 90px rgba(0,0,0,0.45)' : '0 20px 60px rgba(0,0,0,0.25)';
        card.style.transform = `translate(${p.x}, ${p.y}) translateX(${p.tx}) translateY(${liftY}px) scale(${p.scale})`;
        card.style.zIndex = p.z;
        card.style.opacity = p.opacity;
        card.style.boxShadow = shadowSize;
        if (pos === 0) {
            card.classList.add('is-center');
        } else {
            card.classList.remove('is-center');
            if (card === hoveredCard) hoveredCard = null;
        }
    });
}

// Initial render
applyPositions();

// Auto-rotate
autoRotateTimer = setInterval(() => {
    cards.forEach(c => c.classList.remove('flipped'));
    currentIndex = (currentIndex + 1) % totalCards;
    applyPositions();
}, 2300);
cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
        if (card.classList.contains('is-center')) {
            hoveredCard = card;
            applyPositions();
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
        }
    });
    card.addEventListener('mouseleave', () => {
        hoveredCard = null;
        applyPositions();
        if (!autoRotateTimer && !modalOpen) {
            autoRotateTimer = setInterval(() => {
                cards.forEach(c => c.classList.remove('flipped'));
                currentIndex = (currentIndex + 1) % totalCards;
                applyPositions();
            }, 2300);
        }
    });
});

// Click: side card = go to center | center card = open modal
cards.forEach((card, i) => {
    card.addEventListener('click', () => {
        const pos = (i - currentIndex + totalCards) % totalCards;
        if (pos === 0) {
            // Open modal
            const title = card.querySelector('.card-back h3').textContent;
            const poem  = card.querySelector('.poem-text p').textContent;
            const img   = card.querySelector('.card-front img').src;
            document.getElementById('modalTitle').textContent    = title;
            document.getElementById('modalPoemText').textContent = poem;
            const coverImg = document.getElementById('modalCoverImg');
            coverImg.src = img;
            // Adjust object-position per image so text is not cropped
            const imgFilename = decodeURIComponent(img.split('/').pop());
            const positionMap = {
                'Uncertainty over Uncertainties.jpg': '65% 55%',
                'devulge now, or maybe later.jpg':    'center center',
                'Locum Pacificum.jpg':                '20% center',
                'Lumina in the Leaves.jpg':           'center center',
            };
            coverImg.style.objectPosition = positionMap[imgFilename] || 'center center';
            document.getElementById('poemModal').classList.add('active');
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
            modalOpen = true;
        } else {
            clearInterval(autoRotateTimer);
            autoRotateTimer = null;
            cards.forEach(c => c.classList.remove('flipped'));
            currentIndex = i;
            applyPositions();
        }
    });
});

function closeModal() {
    document.getElementById('poemModal').classList.remove('active');
    modalOpen = false;
    if (!autoRotateTimer) {
        autoRotateTimer = setInterval(() => {
            cards.forEach(c => c.classList.remove('flipped'));
            currentIndex = (currentIndex + 1) % totalCards;
            applyPositions();
        }, 2300);
    }
}

// Close modal
document.getElementById('poemModalClose').addEventListener('click', closeModal);
document.getElementById('poemModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('poemModal')) closeModal();
});

// Form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for your message! I will get back to you soon.');
        contactForm.reset();
    });
}
const specificReflectionText = `In exploring the evolution of literacy from the mid-20th century to the present, I have realized that being "literate" is no longer just about the basic ability to read and write. The transition from the 1950s operational definitions to the multifaceted "new literacies" of the post-1990s era highlights how technological advancements and changing social conditions have redefined our necessary life skills. I learned that literacy today is a dynamic lifestyle that encompasses diverse domains, including computer, media, and cultural literacies, all aimed at generating and communicating meaning within specific contexts. It is truly inspiring to see how these seven 21st-century literacies—ranging from multicultural and social to financial and creative—empower us to navigate a complex, knowledge-based society. As a future educator, this lesson reminds me that literacy is not a stagnant goal but a socially-driven pattern of activities that must evolve alongside our students' needs. Embracing this broad perspective is essential for fostering a classroom environment where knowledge is not just acquired, but purposefully applied to make a meaningful impact in the world.`;

const exploringNewLiteraciesText = `I have come to understand that being literate today requires a diverse toolkit: from Multicultural Literacy, which helps us navigate identity and diversity, to Financial Literacy, which empowers us to make informed economic decisions. Each of these—including social, media, digital, ecological, and creative literacies—serves as a pillar for navigating a knowledge-based society effectively. What struck me most was the research from the National Council of Teachers of English, which highlights how digital tools actually enhance the quality and length of student compositions. It is inspiring to see that students using e-portfolios or participating in online reading workshops demonstrate higher academic achievement and a greater capacity for reflection and metacognition. This reinforces my belief that technology is not just a distraction but a powerful bridge to deeper engagement and better revision of work. As a future educator, these insights remind me that my role is to create participatory environments where students can use these new tools to generate meaning and collaborate. Reflecting on this, I feel a renewed sense of responsibility to not only teach content but to model these literacies, ensuring my future students are prepared for the complex social and professional demands of the modern world.`;

const truthOn21stCenturyLiteraciesText = `In this section, I explored the vital concept of Functional Literacy as defined by UNESCO, which shifts the focus from basic reading and writing to the practical application of these skills for socioeconomic progress. I learned that functional literacy is not an isolated academic goal; it must be integrated into social and economic development plans to be truly effective. It is particularly impactful when linked to economic priorities and professional knowledge, as this allows individuals to participate more fully in civic and economic life. This suggests that literacy is a tool for empowerment, enabling people to increase labor productivity and contribute to their country's overall growth. Reflecting on these principles, I am inspired by the idea that education should directly improve a person's quality of life and professional mobility. It is not enough to simply "know" how to read; one must be able to use that knowledge to navigate the complexities of modern work and society. As a future educator, this reinforces the importance of making my lessons relevant to real-world challenges. By focusing on functional skills, I can help my students become active, productive members of their communities who can adapt to rapid economic changes. This lesson teaches me that literacy is a fundamental investment in human potential and a key driver for a more prosperous and inclusive future for everyone.`;

const functionalLiteracyText = `I learned that for literacy to be effective, it cannot exist in a vacuum; it must be an integral part of a country’s overall educational system and linked directly to economic priorities. The core takeaway for me is that the eradication of illiteracy should begin with highly motivated sectors where literacy is a direct tool for both personal and national benefit. It is not just about the mechanics of reading, but about imparting professional and technical knowledge that leads to greater participation in civic and economic life. This section is particularly impactful because it outlines how literacy serves as a catalyst for labor productivity, food production, and industrialization. It shifts the perspective of a teacher from being a mere instructor of letters to a facilitator of social and professional mobility. Reflecting on this, I realize that my future lessons must be designed to empower students to become new "manpower" capable of diversifying the economy. It inspires me to look beyond the classroom walls and consider how the skills I teach will manifest in my students' ability to contribute to their communities. As an educator, I am now more committed to ensuring that literacy is treated as a vital economic investment in human potential, rather than just a checked box in a curriculum.`;

const essentialRemoteTeachingToolsText = `I have reflected on the critical role of Remote Teaching Tools and how they serve as the backbone of an effective virtual classroom. I learned that conducting online lessons is not simply about moving a lecture to a screen; it requires the intentional selection of tools—ranging from Learning Management Systems (LMS) like Google Classroom to communication platforms like Zoom or Microsoft Teams. These technologies are essential for maintaining the "teaching presence," ensuring that as an instructor, I remain a visible guide despite the physical distance. It is fascinating to see how interactive features like breakout rooms, real-time polling, and collaborative digital whiteboards can actually spark more active engagement than a traditional lecture might.

What truly inspires me is the realization that these tools are equalizers. By utilizing multimedia resources and accessibility features like text-to-speech or recorded sessions, I can cater to diverse learning styles and paces. This lesson teaches me that being an effective online educator means being "hyper-organized" and choosing technology that serves the pedagogy, rather than the other way around. As a future teacher, I feel empowered to create a "digital home space" that is structured yet flexible, fostering a sense of community and rapport even in a remote setting. I am now more committed to mastering these digital competencies to ensure my future students, regardless of where they are, receive an impactful and inclusive education.`;

const highlightingQualitiesOf21stCenturyTeachersText = `In this next lesson, I have reflected on the transformative shift from traditional 20th-century teaching to the dynamic landscape of a 21st-century educator. I learned that while the previous era focused on "filling the vessel" through information transfer and passive learning, today’s mission is about "kindling the fire" by helping students discover how to learn for themselves. This realization is profound; it means moving away from a closed, textbook-driven system to one that is research-driven, outcome-based, and highly active. What struck me most is the mandate to "Shun Memorizing". In an age where Google can provide instant answers to 94% of typical research questions, our value as teachers lies not in delivering facts, but in teaching students how to evaluate and utilize that information. I am inspired by the "6 Ways to Become a 21st Century Educator" outlined in the PPT, particularly the call to Be Vulnerable with Students. Admitting that we don't have all the answers and learning alongside our students prevents disengagement and builds an authentic connection. I also learned the importance of developing a Personal Learning Network (PLN), which allows me to collaborate with educators worldwide to maximize my own professional growth. Furthermore, I have reflected on the essential attitudes we must model, such as Grit, Resilience, and Empathy. By helping students see failures as growth opportunities and ensuring every learner knows "You Matter," we move beyond academic products to nurturing the whole human. This lesson teaches me that being a multiliterate teacher means facilitating global communication, encouraging curiosity, and allowing students to truly own their learning process. As a future educator, I feel a deep sense of responsibility to be agile and adaptable, embracing technology as a positive tool for self-sufficiency while guiding my students to become critical, creative discoverers.`;

const penOfDigitalAgeAiText = `The transition into the digital age has sparked a profound debate regarding the sanctity of human expression in the face of increasingly capable Artificial Intelligence. However, viewing AI as a replacement for human creativity is a fundamental misunderstanding of both the technology and the nature of art. Instead, AI should be recognized as the "pen" of our era—a sophisticated virtual assistant that augments the creative process without ever possessing the spark of intentionality that defines it. Just as the invention of the camera did not render the painter obsolete, but rather liberated them from the necessity of literal representation, AI serves as a tool that handles the technical "drudgery" of production, allowing the human mind to focus on high-level conceptualization and emotional resonance.

The essence of creativity lies in the lived experience; it is a synthesis of heartbreak, joy, cultural nuance, and the unique perspective of a conscious being. AI, by contrast, operates through pattern recognition and statistical probability. It can mimic the syntax of a poet or the brushstrokes of a master, but it cannot understand the "why" behind the work. It lacks the capacity for genuine subversion or the ability to draw from a personal well of memory. When we use AI to generate an outline, refine a color palette, or brainstorm a melody, we are using an apprentice that can offer a thousand variations, but it remains the human creator’s role to act as the curator of meaning. The "creativity" of AI is a reflection of our collective data, whereas human creativity is a projection of individual identity.

Furthermore, this partnership democratizes innovation. By acting as a tireless assistant, AI lowers the barrier to entry for those who possess brilliant ideas but lack the technical training to execute them. It serves as a scaffold for the imagination, providing a starting point that helps overcome the paralysis of the blank page. In this synergy, the human remains the architect while the AI serves as the power tool. We are entering an era of "Centaur Creativity," where the most impactful works will be those born from the collaboration between human intuition and machine efficiency. Ultimately, a more advanced pen does not make the writer, and a more powerful algorithm does not make the artist. AI is a tool of immense scale, but it remains a silent partner, waiting for the human heart to give its output a reason to exist.`;

const three21stCenturySkillsCategoriesText = `I explored the essential framework of 21st Century Skill Categories, which are divided into three distinct pillars: Learning Skills, Literacy Skills, and Life Skills. I learned that these competencies are the foundation for navigating the complexities of the modern world. The Four C’s—Critical Thinking, Creativity, Collaboration, and Communication—are particularly impactful as they move beyond rote memorization to focus on how students process information and solve problems collectively. Critical thinking allows us to find solutions, while creativity teaches us to look at the world through different lenses. Collaboration and communication ensure that we can work effectively in a globalized society, turning individual ideas into shared successes.

The second category, Literacy Skills (IMT), shifted my perspective on how we consume information. In an era often flooded with misinformation, the ability to master Information, Media, and Technology literacies is a necessity. I learned that it is not enough to just access data; we must be able to discern facts from statistics and understand the methods behind how information is published. This ensures that as a future educator, I can guide my students to become responsible digital citizens who can identify trustworthy sources and understand the machines that make the Information Age possible.

Finally, the Life Skills (FLIPS)—Flexibility, Leadership, Initiative, Productivity, and Social Skills—highlight the intangible qualities needed for both personal and professional success. Flexibility and initiative are especially inspiring to me, as they remind me that being an effective teacher means deviating from plans when necessary and starting new strategies on my own. Leadership and social skills are about motivating others and networking for mutual benefit, while productivity ensures efficiency even in an age of constant digital distractions.

Reflecting on these categories, I realize that my role as a teacher is to integrate these "survival skills" into every lesson. It is not just about the subject matter, but about fostering a mindset that is adaptable and resilient. This lesson inspires me to create a classroom environment where students don't just "sit and get" information, but instead move, experiment, and initiate their own learning. As I prepare for my career, I feel a deep commitment to modeling these skills, ensuring that my students are not only academically prepared but also equipped with the life and literacy tools needed to thrive in their future careers and communities.`;

const integratingNewLiteraciesInCurriculumText = `A design that breaks down the barriers between isolated academic disciplines to create a more holistic and meaningful learning experience. I learned that an integrated curriculum does not just focus on rote memorization of facts within a single subject; instead, it emphasizes basic skills, content, and higher-level thinking across multiple areas. By connecting various entities of knowledge, skills, and values, this approach makes learning more relevant to the real world. It was fascinating to discover how this concept, which gained significant support in the 1960s, remains a cornerstone for teaching 21st-century literacies today.

I also learned about the three primary approaches to integration: Multidisciplinary, Interdisciplinary, and Transdisciplinary. In the multidisciplinary approach, teachers organize the curriculum around a central theme, linking different subjects like Science, Math, and English to a single topic. The interdisciplinary approach goes a step further by focusing on "interdisciplinary skills"—such as reading, writing, and thinking—across all content areas. Perhaps most inspiring is the transdisciplinary approach, where the curriculum is designed around student needs and real-life concerns. Through project-based learning and negotiating the curriculum, students solve social problems and answer open-ended questions, allowing them to apply their knowledge in a truly impactful way.

Reflecting on these methods, I realize that as a future educator, my goal is to move beyond "teaching a book" and start teaching for life. Integrating new literacies across the curriculum means showing students how their classroom lessons connect to their community, their future careers, and global issues. By using thematic integration and project-based learning, I can foster an environment where students are not just passive recipients of information but active problem solvers. This lesson inspires me to be a more collaborative and creative teacher, one who can design lessons that are both academically rigorous and deeply connected to the students' lived experiences. I feel more prepared to create a classroom that values curiosity and real-world application as much as academic achievement.`;

const socialLiteracyText = `This emphasizes that schools are not just academic centers but social institutions where reality is contemplated in profound, personal ways. I learned that social literacy involves the development of social skills, knowledge, and positive values that enable us to act positively and responsibly in complex social settings. For a teacher, being socially literate is imperative because we do not just teach content; we model acceptable behavior and manage relationships with students, parents, and stakeholders. This requires a high level of Emotional Intelligence, allowing us to perceive, understand, and manage emotions—both our own and those of others—to foster a harmonious learning environment.

I was particularly struck by the detailed breakdown of social skills and the strategies for improvement. From basic skills like active listening and following directions to more complex social cues like empathy and conflict resolution, I realized that these are "soft skills" that require constant practice. The lesson highlights that social literacy is about the "acquisition of the ability to center on others," moving away from ego centrism toward a shared understanding. Learning about the different types of social skills—such as peer-related, teacher-related, and communication skills—showed me that success in the classroom is deeply tied to how well we can interact and build rapport.

Furthermore, the discussion on People Skills provided a road map for professional and personal growth. I learned that having "good vibes," being an active listener, and showing genuine interest in others are key components of a successful educator. The lesson also introduced the importance of maintaining an optimistic attitude, practicing adaptability, and having a sincere desire to help others succeed. These traits are not just professional requirements; they are life-sustaining values that increase opportunities and improve the clarity of our thinking.

Reflecting on these principles, I feel inspired to cultivate a classroom culture where social literacy is at the forefront. I recognize that my effectiveness as a teacher depends on my ability to be an emotionally intelligent leader who can guide students through social challenges. By modeling belief in oneself and affirming that everyone has a role to play, I can create a supportive space where learners feel valued. This lesson teaches me that education is a social process, and by mastering social literacy, I am better equipped to prepare my students for a life of meaningful connection and responsible citizenship. I am committed to integrating these social values into my daily interactions, ensuring that my future classroom is a place of mutual respect and collective growth.`;

const hiddenCrisisInResearchWritingText = `To me, the "hidden crisis in research writing" represents a quiet but dangerous erosion of academic integrity where the focus shifts from the pursuit of truth to the mere completion of a task. It is "hidden" because it often lurks beneath the surface of seemingly well-structured methodologies and polished findings, manifesting as a systematic neglect of the very foundation that supports scholarly work: the bibliography. When we treat referencing as a minor formatting hurdle rather than a core ethical responsibility, we undermine the entire architectural strength of our research. Inadequate referencing contributes to this crisis by breaking the chain of evidence that allows others to verify, challenge, and build upon our ideas. It creates a "not-so-evident weakness" that can transform an otherwise excellent study into a piece of work that lacks credibility and professional rigor. By failing to meticulously document the origins of our information, we risk participating in intellectual laziness, which eventually devalues the degrees we earn and the knowledge we claim to produce. As a student, I realize that this crisis is a wake-up call to return to the basics of citation integrity, ensuring that every claim I make is anchored in a verifiable and respected scholarly conversation.

Furthermore, the rise of fake or AI-generated references poses a severe threat to the academic community and my own professional future because it introduces "hallucinations" into the collective body of knowledge. These fabricated sources are harmful because they deceive readers and lead subsequent researchers down dead-end paths, effectively polluting the stream of information that scholars rely on for centuries. For the academic community, this represents a betrayal of trust and mutual respect; it turns the collaborative effort of building knowledge into a minefield of misinformation. Personally, using such shortcuts would be devastating to my research career. Once a researcher is caught utilizing fake references, their reputation for honesty and precision—the most valuable currency in education—is permanently tarnished. It signals a lack of the "habits of mind" necessary for professional life, such as diligence, verify-before-you-cite, and deep reading. Relying on AI-generated citations is not just a passing error in judgment; it is a fundamental failure to join the scholarly community with the required transparency. To protect my integrity as a future educator, I must commit to verifying every source, understanding that my work is only as reliable as the verified research upon which it is built.`;

const mediaLiteracyText = `This defined as the ability to critically assess the accuracy and validity of information transmitted through various media forms. I learned that media literacy—often called Media Education—is a 21st-century approach that empowers us to realize that all media are representations of reality, not reality itself. It involves a sophisticated process of accessing, decoding, evaluating, analyzing, and creating both print and electronic media. This is especially relevant in our digital age, where reading texts and designing hypertexts are made possible through evolving technology.

I was particularly struck by the "Core Principles of Media Literacy Education," which emphasize that all media messages are "constructed" with specific purposes and target audiences. I learned that each medium has its own unique "language" or creative techniques to attract attention, and that different people experience the same message differently based on their backgrounds. Most importantly, I understood that most media messages are organized to gain profit or power, and they often carry embedded values and points of view. Understanding these constructions is vital for developing the skills of inquiry and self-expression necessary for active citizens in a democracy.

The lesson also provided a clear roadmap for integrating media literacy into the classroom. I learned that as a teacher, I must guide students to evaluate media by identifying biases, finding reliable digital databases, and comparing various sources. Discussing how media edits or alters photographs and examining the "truth" in advertisements are practical ways to build students' critical thinking. I am particularly inspired by the idea of having students create their own media, such as presentations or videos, to move from being passive consumers to active creators.

Reflecting on these concepts, I realize that my role as an educator is to help students navigate the "media-saturated" world with a discerning eye. It is not about avoiding media, but about engaging with it wisely. By teaching students to ask, "Who created this message?" and "What is being omitted?", I can foster a generation that is not easily misled by misinformation. This lesson inspires me to make media education a meaningful and integrated part of my future classroom practice, ensuring my students are equipped with the literacy skills needed to thrive in a complex information environment.`;

const implicationsToPreServiceTeacherPreparationText = `In this exploration of the Implications for Pre-Service Teacher Preparation, I have transitioned from looking at individual literacies to understanding how teacher education programs must be redesigned to support them. I learned that an effective 21st-century curriculum must be "designed for understanding," moving beyond surface-level instruction to produce educators who can authentically apply these skills across all subject areas. It is no longer enough to simply know the content; pre-service teachers must master instructional models that integrate research-proven strategies, modern technologies, and real-world contexts to make learning truly imperative and relevant.

One of the most significant takeaways for me is the emphasis on Instructional Models and Learning Environments. I learned that for 21st-century skills to take root, the physical and digital spaces where we learn must support collaboration, interactive learning, and student-centered inquiry. This involves creating "powerful partnerships" through strong collaboration between educational institutions and community stakeholders. These environments act as a "third teacher," guiding students toward innovation and self-directed discovery. It inspires me to think about how I will eventually set up my own classroom to encourage movement, experimentation, and global connectivity.

Furthermore, I learned about the critical role of Continuous Improvement and Balanced Assessment. AACTE emphasizes that any implementation effort must include measurable goals and regular progress tracking. This means that as a future teacher, I must be willing to commit to revisiting my processes over time, ensuring that my methods remain effective and responsive to student needs. Assessments should not just be about grades; they should be high-quality measurements that provide a complete picture of a student's ability to think critically and solve complex problems.

Reflecting on these implications, I realize that my journey as an education student is about building a foundation of professional agility. I am inspired by the call to be a "lifelong learner" who views failure as a growth opportunity and uses data to refine my craft. This lesson teaches me that pre-service preparation is the launchpad for a career dedicated to excellence and innovation. As I look toward my future teaching practice, I feel a renewed sense of purpose to embrace these standards, ensuring that I am fully equipped to lead my students through the challenges and opportunities of the 21st century with competence and heart.`;

const edcomIIY03ForWeb012626FinalText = `Moving toward the broader landscape of our national education system, my reflection on the EDCOM II Final Report: Turning Point has opened my eyes to the systemic challenges and the "decade of necessary reform" ahead for the Philippines. I learned that for education to truly be a transformative force, reforms must be carried out with consistency and permanence to prevent the recurrence of old deficiencies. The report emphasizes that we are at a critical juncture where the performance of the education sector requires a comprehensive assessment—from early childhood care to higher education—to ensure that the system actually responds to the needs of the modern time.

The most impactful realization from this document is that the quality of schooling is directly linked to our national future and the "liberation of the mind" from ignorance. I am inspired by the vision of a "huwarang eskuwela" (model school) that provides hope and serves as a key to discovering one's strengths. It teaches me that as a teacher, I am part of a much larger mission to pave the way for a free and developed Filipino identity. The call for "honest action" and a system that "responds to the period" reminds me that my classroom practices must align with national goals of inclusivity and excellence.

Reflecting on this report, I feel a deep sense of civic duty. It is not enough for me to be a good teacher in isolation; I must understand the policies and reforms that shape our profession. This lesson highlights the importance of accountability and the need for transformative solutions to long-standing issues like learning poverty and infrastructure gaps. As I prepare to enter the profession, I am motivated to be a teacher who not only delivers lessons but also contributes to the "necessary reforms" by being a model of competence and dedication. This final exploration has solidified my commitment to being a lifelong learner and an active participant in building a better educational future for every Filipino child.`;

function formatReflectionText(text) {
    return text
        .split(/\n\s*\n/)
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

const beyondTheSyllabusText = `In the article "Beyond the Syllabus," the social situation presented is a toxic workplace dynamic characterized by an imbalance of power and a lack of psychological safety. The narrative describes a professional environment where leadership is exercised through public humiliation and "authoritative" criticism rather than constructive guidance. Specifically, it depicts a "top-down" hierarchy where a superior, Dr. Minchin, uses her position to belittle subordinates, dismisses extra effort as the "bare minimum," and creates an atmosphere of anxiety. This dynamic illustrates how a workplace can shift from a space of professional growth to one of distress when respect is replaced by a pattern of public singling-out and the devaluation of employee morale.

The primary lesson regarding social interaction and respect is that professional competence does not excuse a lack of interpersonal empathy. The article teaches us that respect is a bidirectional necessity; when leaders choose to "criticize publicly rather than praise privately," they effectively destroy the motivation and initiative of those they lead. Readers can learn that true leadership involves recognizing the human effort behind a task, not just the output. It highlights that social interaction in a professional setting should be grounded in the principle of dignity—where corrections are handled with discretion and achievements are acknowledged with sincerity. This reminds me that as a future educator, my "people skills" and emotional intelligence will be just as important as my pedagogical knowledge in maintaining a healthy environment.

To rebuild respect after a humiliating experience, several proactive actions can be taken. First, there must be a commitment to "open and honest communication" where the affected individual can express the impact of the humiliation in a safe, mediated space. Rebuilding requires the offending party to offer a sincere, public acknowledgment of the error if the humiliation was public, thereby restoring the victim's social standing. Furthermore, establishing clear "boundaries and professional protocols" for feedback can prevent future occurrences. On a personal level, the article suggests that regaining agency—focusing on one's own "belief and passion"—is vital for recovery. By shifting the focus back to collaborative goals and mutual support, a community can slowly transition from a culture of fear to one of mutual accountability and genuine respect.`;

const beyondTheClassroomFinancialLiteracyText = `Points of Agreement

First, I strongly agree with the author’s point that "financial wisdom is just as important as academic achievement." We often focus so much on our pedagogical skills and subject mastery that we neglect the personal "infrastructure" that allows us to teach effectively. As seen in the story of Liam, a brilliant mind and a dedicated heart can still be overshadowed by the stress of financial instability. If a teacher is preoccupied with "Loandon" (the cycle of debt), their teaching presence and emotional availability for students will inevitably suffer.

Second, I agree that "wealth is the parent of luxury and idleness, and poverty of meanness and viciousness." While teachers are often called to a "vocation" of service, being underpaid or financially illiterate can lead to discontent and a loss of passion. Financial literacy acts as a shield, ensuring that our dedication to our students isn't compromised by the "viciousness" of debt-induced stress.

My Financial Plan and Habits

As a BEEd student approaching graduation, I have begun formulating a financial plan to avoid the pitfalls mentioned in the article. My primary goal is to establish an Emergency Fund immediately upon receiving my first paycheck. I want to ensure I have at least three to six months of expenses saved before I consider any "luxury" purchases. This is a direct lesson from Liam’s story—having a safety net prevents the need for high-interest "payday loans" when unexpected life events occur.

My current financial habits are centered on frugality and meticulous tracking. I maintain a simple ledger where I categorize my daily expenses. This habit helps me distinguish between "needs" (like instructional materials and transportation) and "wants" (like unnecessary gadgets). By practicing this now, while I am still a student, I am building the "grit" and "resilience" needed to manage a professional salary responsibly.

These habits will help me achieve my goals by fostering delayed gratification. Instead of following the trend of "rewarding" myself with debt after graduation, I plan to invest in my professional development and long-term stability. By being financially literate, I can ensure that my career at Mindoro State University or any other institution remains focused on "kindling the fire" of my students' minds, rather than being extinguished by the burden of financial mismanagement. This lesson has taught me that true professional success requires being as disciplined with my wallet as I am with my lesson plans.`;

const battleOfTheMopText = `The story "Not Yet: A Story About Wings and Roots" resonates deeply with the push-and-pull relationship I have with my own independence. In the story, the "wings" represent our urge to decide for ourselves, while the "roots" represent the guidance—sometimes perceived as interference—of those who raised us. I experience this tension most frequently in a very mundane but high-stakes arena: cleaning our home.

The Experience and The Feelings
Every time I set out to help clean the house, I do so with the intention of being a responsible, independent adult. I have my own system, my own pace, and my own "way" of doing things. However, my mother almost always interferes. She will follow behind me, correcting how I hold the broom, telling me I missed a spot that I hadn't even reached yet, or insisting that her method is the only "correct" way to scrub a floor.

At those moments, I feel a surge of hot frustration and even resentment. It feels as though my effort is being invalidated. I think to myself, "I am a third-year college student; I can certainly figure out how to clean a room!" To me, independence in that moment isn't just about the cleaning; it is about autonomy. It is the desire to prove that I am capable, reliable, and competent without needing a supervisor. When she interferes, it feels like she is clipping my wings before I even have a chance to spread them.

Realizations and Growth
Reflecting on this now, especially through the lens of the "Wings and Roots" story, my understanding has shifted. I’ve realized that my mother’s "interference" isn't necessarily a lack of trust in my abilities, but rather a manifestation of her "roots." For her, the house is a space she has nurtured for years; her "way" is her way of providing care and order.

I have learned that independence is not the absence of guidance, but the ability to navigate that guidance with maturity. I used to see her corrections as an attack on my identity. Now, I see them as a passing of the torch—even if the hand-off is a bit clumsy.

A Changed Perspective
My understanding of family support has evolved from seeing it as a "leash" to seeing it as a "safety net." As a future educator, I now realize that my students will also struggle with this. They will want to "fly" before they can balance.

True independence isn't just "doing it my way"; it is having the confidence to listen to the "roots" (my mother’s experience) without feeling like I am losing my "wings." I’ve learned that I can acknowledge her way while still refining my own. Our parents find it hard to say "you are ready" because, to them, the world is always a little bit dangerous for our wings. Now, instead of arguing, I try to communicate. I realize that the "Not Yet" in the story isn't a permanent "No"—it is a "Wait, let me make sure you’re strong enough first."`;

const electiveBeforeNowAfterBridgeLearningText = `Listening to the discussion today on the Before, Now, and After-Bridge Learning framework really shifted my perspective on what it means to be an effective educator. I used to think that teaching was mostly about delivering a lecture and hoping the students caught on, but this report helped me realize that learning is a continuous journey with distinct stages that require careful planning. The "Before" stage is such a crucial starting point because it forces us to look at our students’ prior knowledge and even their misconceptions. It reminds me that every child enters the classroom with their own experiences, and as a future teacher, I need to meet them where they are rather than where I expect them to be. Moving into the "Now" phase, I learned that this is where the real magic happens—it is the active process of engagement where the teacher facilitates the "Bridge." This bridge is not just a path but a set of strategies like scaffolding, hands-on activities, and relatable examples that connect the old information to the new. It made me realize that my role is to be a guide, helping students cross over from confusion to clarity. Then there is the "After" stage, which is more than just a test or a grade; it is about reflection and seeing how the student can apply what they have learned to the real world. It’s the moment where the learning becomes permanent and meaningful. This framework taught me that teaching isn't a one-way street but a structured process of growth. It highlights the importance of being intentional with every lesson, ensuring that I am not just covering the curriculum but actually building a solid foundation for my students. Understanding this concept gives me more confidence as I prepare for my own future classroom, as I now see how to design lessons that respect where a student starts and celebrate where they end up. It makes the entire process of education feel more human and connected, focusing on the growth of the learner rather than just the delivery of the content. I am now more aware that every lesson I plan must have a strong bridge, ensuring no student is left behind on the other side of understanding.`;

const electiveRealiaAndManipulativeObjectsText = `The discussion about Realia and Manipulative Objects today was a wonderful eye-opener because it reminded me that for elementary students, seeing and touching is often more powerful than just hearing a lecture. In our future classrooms, "Realia" refers to real-life objects that we bring in to make a lesson feel more authentic and grounded. Instead of just showing a picture of a specific plant or a traditional cultural item, bringing the actual object into the room allows students to observe its texture, weight, and even its smell. This truly bridges the gap between the classroom environment and the real world, making the lesson feel alive and relevant to their everyday lives. On the other hand, "Manipulative Objects" are tools like counting blocks, geometric shapes, or puzzles that students can physically move to solve problems or understand a concept. This is especially helpful in subjects like Mathematics or Science where abstract ideas can be very confusing for a young mind. By moving a block or a counter, a child isn't just memorizing a number on a page; they are physically building their understanding of how quantities and structures work. What I learned most from this report is that as a teacher, I shouldn't just rely on textbooks or simple drawings on the board. Young learners are naturally curious and energetic, and they learn best when they can use their hands to explore. When students handle objects, they become active participants in their own learning rather than just passive listeners. This multisensory approach caters to all types of learners, especially those who may struggle with traditional teaching methods. However, I also realized through the discussion that using these tools requires very careful planning. It isn’t enough to just give students objects to play with; the teacher must guide the interaction to ensure the activity leads to a specific learning goal. I now understand that my role is to curate the right materials that will spark curiosity and make difficult topics easier to grasp. This lesson has made me more excited to gather and create my own set of teaching aids for my future students. I want my classroom to be a place filled with things students can touch and explore because I believe that the simplest object can often be the most effective tool in helping a child finally understand a complex lesson.`;

const electivePurposefulTalkAndShadowingPracticeText = `Purposeful Talk and Shadowing Practice in today’s session offered a profound look into the social and observational layers of teaching. A concept that truly shifted my thinking is "Dialogic Inquiry," which moves the classroom away from a simple "question-and-answer" format into a space where talk is used to investigate and uncover deeper meanings. It taught me that my future role isn't just to talk at students, but to orchestrate "Productive Discursive Spaces" where every child feels empowered to contribute their unique perspective to a shared goal.

I was also deeply intrigued by the strategy of "Shadowing Practice," which serves as a form of "Educational Ethnography." By metaphorically stepping into a student's shoes and observing their entire academic day, I can identify the "Affective Filters"—like boredom, anxiety, or physical exhaustion—that often block learning but go unnoticed by teachers at the podium. This practice emphasizes that being an effective educator requires a high level of "Contextual Sensitivity," ensuring we are teaching the actual children in front of us rather than a theoretical version of them.

Another vital term that stood out was "Intellectual Scaffolding." Through purposeful talk, a teacher provides the verbal support students need to reach higher levels of thinking that they couldn't achieve alone. This reinforces the idea that the classroom is a collaborative workshop where language is the primary tool for construction. I now realize that to be a successful BEEd graduate, I must master the art of the "Reflective Pause" and the "Strategic Prompt," allowing students the time and space to process information deeply.

In summary, these topics have reshaped my identity as a future teacher from a "transmitter of facts" to a "Facilitator of Meaning-Making." I am now more committed than ever to creating a classroom environment where communication is intentional and where my observations lead to real, empathetic changes in how I teach. Integrating these practices into my future demonstrations will help me ensure that my lessons are not just heard, but are truly experienced and understood by every learner.`;

const electiveCooperativeLearningDifferentiatedInstructionText = `Today’s discussion on Cooperative Learning and Differentiated Instruction highlighted how a classroom can be transformed into a dynamic ecosystem where every student has a place. One of the most interesting terms I learned is "Positive Interdependence," which is the heart of cooperative learning. It means that in a group, students realize they "sink or swim together." This isn't just about working in groups; it’s about creating a structure where each member has a specific role, making everyone feel responsible for the team’s success. It taught me that my future classroom should not be a competition, but a community where students learn to support one another’s growth.

We also explored the concept of "Tiered Activities" within Differentiated Instruction. This idea really resonated with me because it acknowledges that "fairness" doesn't mean treating every student exactly the same; it means giving every student what they need to succeed. By using tiered lessons, I can teach the same core concept to the whole class while varying the complexity of the tasks based on each student's readiness and learning style. Whether a student is a visual learner, a logical thinker, or someone who needs extra support, differentiation ensures that the lesson is neither too easy nor too frustratingly difficult for them.

Another term that stood out was "Flexible Grouping." This is the practice of moving students in and out of different groups based on the specific task or their current progress, rather than keeping them in the same "ability" groups all year. This keeps the classroom environment fresh and prevents students from feeling stuck in a specific label. I realized that as a future educator, my goal is to be a facilitator of equity. I need to be observant and agile enough to adjust my teaching "on the fly" to meet the diverse needs of my learners.

Ultimately, these two strategies work hand-in-hand to create an inclusive environment. Cooperative learning builds the social and emotional skills students need, while differentiated instruction honors their individual academic paths. I now understand that a successful teacher is like an architect who designs multiple entry points into a single lesson. I am excited to apply these "human-centered" approaches in my future teaching demonstrations, ensuring that every child—regardless of their starting point—feels capable, valued, and challenged to reach their full potential.`;

const electiveRolePlayingReinforcementText = `Listening to my classmate’s report today about role-playing and reinforcement gave me a lot of wonderful ideas as a third-year BEEd student preparing for my future classroom. I learned that role-playing is not just a fun game to pass the time; it is a very powerful teaching tool, especially for young elementary learners. When we ask young students to act out a specific situation, we are helping them step into someone else’s shoes. This makes the lesson feel real, meaningful, and alive. It helps them understand difficult ideas much better because they are physically experiencing the lesson instead of just listening to me talk in front. It also builds their confidence in public speaking and teaches them deep empathy as they interact with their peers. On the other hand, the discussion about reinforcement reminded me of how important a teacher’s reaction is to a student’s behavior. I realized that reinforcement, especially positive reinforcement like praising a student, giving a simple smile, or offering small rewards, works like magic in an elementary classroom. It encourages them to keep doing good things, follow the rules, and participate more actively in discussions. When a child feels truly seen and appreciated by their teacher, they are naturally motivated to learn more. Together, these two strategies are a perfect match. I can use role-playing to make my lessons exciting and highly interactive, and I can use positive reinforcement to gently guide my students' behavior and keep their energy focused in the right direction. As a future professional teacher, my goal is to always create a classroom where children feel totally safe to express themselves. Today’s report clearly showed me that combining creative activities like role-playing with the kind, supportive push of positive reinforcement will help me build that happy learning environment.`;

const electiveLectureMethodThinkPairShareText = `This strategy gave me a clear perspective on how to balance traditional teaching with active learning in an elementary classroom. As a third-year BEEd student, I used to think that lecturing was an outdated way of teaching, but the discussion made me realize it still has a place. It is a very direct and organized way to give students core information, especially when introducing a completely new topic. However, I also learned that long, continuous lectures can easily cause young elementary learners to lose attention and get bored. That is why the introduction of the Think-Pair-Share strategy felt like the perfect solution. I love how this method breaks up the teacher's talking time and instantly puts the focus back on the kids. First, students get a quiet moment to think about a question on their own, which gives even the shyest children a chance to gather their thoughts without pressure. Then, they pair up with a seatmate to talk about it, which builds their communication skills and makes them feel safe sharing ideas in a small setting. Finally, they share their thoughts with the whole class, building their team spirit and confidence. Reflecting on this, I realize that the best teaching does not rely on just one style. In my future classroom, I want to combine both methods seamlessly. I can use a short, engaging lecture to explain a basic concept, and then immediately transition into a Think-Pair-Share activity to keep my students energized, collaborating, and thinking deeply. This report reminded me that being an effective teacher means knowing when to speak to give direction, and when to step back so that our young learners can learn from one another.`;

const electiveDebateAndStoryTellingText = `This made me realize how beautiful and diverse our teaching strategies can be for elementary learners. As a third-year BEEd student, I found the contrast between these two methods completely fascinating. Storytelling is an absolute treasure for young kids because it taps into their natural imagination. I learned that when a teacher tells a story with expressions and feelings, it makes the lesson unforgettable. It helps children build strong listening skills, expands their vocabulary, and teaches them valuable moral lessons in a gentle, creative way. On the other hand, debate might seem a bit advanced for the elementary grades, but the discussion showed me it is an amazing way to develop critical thinking early on. Even simple, friendly debates—like choosing between two favorite topics—teach students how to express their opinions clearly, listen to opposing views respectfully, and reason out their choices. It builds immense confidence and teaches them how to express their thoughts with courage. Reflecting on this report, I see that storytelling and debate work together perfectly to develop different parts of a child's mind. Storytelling opens up their hearts and creativity, while friendly debates sharpen their logic and communication skills. In my future classroom, I do not have to stick to just reading from a textbook. I can use storytelling to introduce a topic warmly and touch my students' emotions, and then use a simple debate to get them actively discussing and defending their ideas. Today's discussion deeply inspired me to become a teacher who knows how to blend imagination with critical thinking to create a lively, balanced, and truly engaging classroom for every child.`;

const electiveScaffoldingDirectInstructionAndGameBasedMovementStrategiesText = `Delivering my own report today on Scaffolding and Direct Instruction, alongside Game-Based and Movement Strategies, was an incredibly rewarding experience that deepened my understanding of how to be an effective elementary teacher. Sharing these concepts with my classmates made me reflect on how a well-balanced classroom requires both strong structure and active, joyful engagement.

When I discussed Direct Instruction and Scaffolding, I realized how essential it is to guide young learners step-by-step. Direct instruction allows me to explain new and difficult concepts clearly, ensuring no child feels lost at the beginning of a lesson. But teaching cannot stop at just lecturing; that is where scaffolding comes in. By providing temporary support—like visual aids, prompts, or breaking a large task into smaller, bite-sized pieces—I can help my students build confidence. As they slowly master the skill, I can gently fade that support away, allowing them to become independent, self-assured learners.

On the other hand, preparing the segment on Game-Based and Movement Strategies reminded me that children naturally learn through play. Elementary students have so much energy, and instead of forcing them to sit still for hours, incorporating movement and games keeps them completely focused and excited. Whether it is a math race or a language game, turning a lesson into a playful challenge removes the fear of making mistakes.

Reflecting on my report, I now see that these strategies are not separate choices; they are meant to work hand-in-hand. In my future classroom, I can use direct instruction and scaffolding to lay a solid foundation for a lesson, and then immediately transition into a high-energy game to let my students practice what they learned. This balance of structured guidance and active play is exactly how I want to shape a happy, dynamic learning environment for my future students.`;

const electiveGamificationAndClassGroupDiscussionText = `This showed me how powerful it is to blend healthy excitement with meaningful conversation in an elementary classroom. As a third-year BEEd student, this discussion gave me practical ideas on how to keep young learners fully focused and participating.

I learned that gamification is not just about playing games; it means taking fun game elements—like earning points, leveling up, getting badges, or friendly challenges—and adding them to everyday lessons. This strategy is a brilliant way to capture the short attention spans of elementary pupils. It turns tough or repetitive tasks into exciting goals, making children highly motivated to finish their work and do their best because learning suddenly feels like an adventure.

However, the report also reminded me that excitement needs to be balanced with deep thinking, which is where class and group discussions come in. When we give students a chance to sit together and talk, we are giving them a safe space to express their thoughts, listen to different perspectives, and learn from their peers. It teaches them cooperation, respect, and how to communicate clearly. Instead of just quietly absorbing information, a good discussion forces them to process and understand the lesson deeply.

Reflecting on this, I realize these two methods work beautifully as a team. In my future classroom, I can use gamification to spark enthusiasm and get my students energized about a topic, and then transition into a group discussion where they can calmly share and examine what they learned. Combining the high energy of gamification with the thoughtful connection of discussion will help me create a classroom that is both incredibly fun and deeply intellectual for my future students.`;

const electivePhenomenonBasedLearningAndTransdisciplinaryApproachText = `These strategies opened my eyes to a whole new way of teaching elementary students. As a third-year BEEd student, I found these ideas so refreshing because they break away from the old style of teaching subjects in strict, separate boxes.

I learned that Phenomenon-Based Learning starts with a real-world event or topic that kids can actually see and experience around them—like a local storm, how trash decomposes, or why plants grow toward the light. Instead of just reading a chapter in a textbook, students study this real-world "phenomenon" directly. This makes learning instantly interesting to young minds because it connects directly to their actual lives, turning them into little investigators who want to find answers.

The Transdisciplinary Approach fits perfectly with this because real-world problems do not belong to just one subject. When students study a phenomenon, they naturally use Science, Math, Reading, and Social Studies all at the same time to solve it. For example, if they are studying a local typhoon, they might read about weather patterns (Science), count rainfall data (Math), and write a poem about community safety (Language Arts). It teaches children how the world is completely connected, rather than forcing them to memorize isolated facts for a single test.

Reflecting on this report, I realize that this is exactly how we can make school meaningful for young learners. In my future classroom, I want to move away from just saying, "Open your book to page ten." Instead, I want to bring real-world mysteries into the classroom, using a transdisciplinary focus to show my students that everything they learn has a purpose. This discussion deeply inspired me to be a teacher who helps children understand and care about the world they live in.`;

const electiveVideoBasedAnchoredInstructionAndVideoInitiatedRolePlayText = `This truly showed me how technology and creativity can come together to make an amazing elementary classroom. As a third-year BEEd student, I learned that these strategies are perfect for catching the attention of today's visual-learning generation.

First, Video-Based Anchored Instruction taught me the importance of using a short, interesting video as an "anchor" or a base for the lesson. Instead of just lecturing, a teacher can show an exciting clip that contains a real-world problem. This visual anchor gives the whole class a shared experience to talk about, look into, and solve together. It makes abstract lessons instantly concrete and easy to understand for young learners.

Building on that, the Video-Initiated Role-Play strategy takes learning a step further through drama. In this method, students watch a video clip that stops at a dramatic or critical moment, and then they must act out what happens next. I realized this is a brilliant form of drama-based learning. It forces children to think critically, use their imagination, and practice deep empathy as they figure out how the characters should react and solve the problem in real life.

Reflecting on this final report, I see how beautifully these two strategies connect. In my future classroom, I can use a video clip to firmly anchor a tough concept, and then immediately transition into a role-play activity to let my students physically live out the solution. This combination not only keeps the classroom high-energy and fun, but it also helps young learners build vital communication, teamwork, and problem-solving skills that will stay with them forever.`;

const electiveCallAndResponseLearningStationsText = `Call and Response and Learning Stations in today’s discussion offered a vibrant look into how classroom structure and rhythm can maximize student participation. One of the most engaging concepts I encountered was "Choral Response," which serves as a powerful tool for "Collective Engagement." It taught me that when a teacher uses a rhythmic or verbal cue to gather attention, it does more than just keep the room quiet—it builds a sense of unity and momentum. Instead of a one-way lecture, the classroom becomes a collaborative space where students are physically and vocally involved in the lesson, reducing the "passive listening" that often leads to distraction.

We also delved into the strategy of "Learning Stations," which functions as a form of "Differentiated Circuit Training" for the brain. This approach transforms the classroom into a series of "Task-Oriented Zones," where small groups of students rotate through different activities, such as a "reading nook," a "manipulative center," or a "digital station." This setup is a perfect example of "Self-Directed Exploration," as it allows students to take ownership of their learning pace and style. It made me realize that as a future teacher, I don't always have to be at the center of the room; I can be a "guide on the side" while students navigate these purposeful environments.

Another key term that resonated with me was "Transitions Management." Moving from one station to another or shifting from a call-and-response moment back to independent work requires a clear "bridge" to maintain order. I learned that a successful teacher uses "Auditory Cues" and "Visual Timers" to make these movements seamless and efficient. This focus on flow ensures that no instructional time is wasted and that the energy of the students is channeled toward the learning objective.

Ultimately, these strategies have redefined my view of classroom management. I now see myself as a "Conductor of Learning," using call and response to set the tempo and learning stations to provide diverse pathways for discovery. I am excited to implement these dynamic methods in my future teaching demonstrations at MinSU, as they will help me create a high-energy, inclusive, and organized classroom where every child stays active and involved. It’s about moving away from static rows of desks and moving toward a lively, structured environment where learning is felt and experienced.`;

function attachReflectionButtonHandlers(reflectionsBody) {
    const outputCard = reflectionsBody.querySelector('.reflection-output-card');
    const outputTitle = reflectionsBody.querySelector('#reflectionOutputTitle');
    const outputText = reflectionsBody.querySelector('#reflectionOutputText');
    if (!outputCard || !outputTitle || !outputText) return;

    reflectionsBody.querySelectorAll('.reflection-topic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const btnLabel = btn.textContent.trim();

            if (btnLabel.startsWith('New Literacies')) {
                outputTitle.textContent = 'New Literacies, Functional Literacies and Multiliteracy';
                outputText.innerHTML = formatReflectionText(specificReflectionText);
            } else if (btnLabel === 'Exploring the New Literacies') {
                outputTitle.textContent = 'Exploring the New Literacies';
                outputText.innerHTML = formatReflectionText(exploringNewLiteraciesText);
            } else if (btnLabel === 'The Truth on 21st Century Literacies According to Research') {
                outputTitle.textContent = 'The Truth on 21st Century Literacies According to Research';
                outputText.innerHTML = formatReflectionText(truthOn21stCenturyLiteraciesText);
            } else if (btnLabel === 'Functional Literacy') {
                outputTitle.textContent = 'Functional Literacy';
                outputText.innerHTML = formatReflectionText(functionalLiteracyText);
            } else if (btnLabel === 'Essential Remote Teaching Tools for Conducting Effective Online Lessons') {
                outputTitle.textContent = 'Essential Remote Teaching Tools for Conducting Effective Online Lessons';
                outputText.innerHTML = formatReflectionText(essentialRemoteTeachingToolsText);
            } else if (btnLabel === 'Highlighting the Qualities of 21st Century Teachers') {
                outputTitle.textContent = 'Highlighting the Qualities of 21st Century Teachers';
                outputText.innerHTML = formatReflectionText(highlightingQualitiesOf21stCenturyTeachersText);
            } else if (btnLabel.startsWith('The Pen of Digital Age')) {
                outputTitle.textContent = 'The Pen of Digital Age: Artificial Intelligence (AI) as Virtual Assistant, NOT a Replacement for Human Creativity';
                outputText.innerHTML = formatReflectionText(penOfDigitalAgeAiText);
            } else if (btnLabel.includes('Three 21st Century Skill Categories') || btnLabel.includes('Three 21st Century Skills Categories')) {
                outputTitle.textContent = 'Three 21st Century Skills Categories';
                outputText.innerHTML = formatReflectionText(three21stCenturySkillsCategoriesText);
            } else if (btnLabel === 'Integrating New Literacies in the Curriculum') {
                outputTitle.textContent = 'Integrating New Literacies in the Curriculum';
                outputText.innerHTML = formatReflectionText(integratingNewLiteraciesInCurriculumText);
            } else if (btnLabel === 'Social Literacy') {
                outputTitle.textContent = 'Social Literacy';
                outputText.innerHTML = formatReflectionText(socialLiteracyText);
            } else if (btnLabel.startsWith('The Hidden Crisis in Research Writing')) {
                outputTitle.textContent = 'The Hidden Crisis in Research Writing: Why References Matter More Than You Think (A Wake-Up Call for Student Researchers)';
                outputText.innerHTML = formatReflectionText(hiddenCrisisInResearchWritingText);
            } else if (btnLabel === 'Media Literacy') {
                outputTitle.textContent = 'Media Literacy';
                outputText.innerHTML = formatReflectionText(mediaLiteracyText);
            } else if (btnLabel === 'Implications to Pre-Service Teacher Preparation') {
                outputTitle.textContent = 'Implications to Pre-Service Teacher Preparation';
                outputText.innerHTML = formatReflectionText(implicationsToPreServiceTeacherPreparationText);
            } else if (btnLabel === 'EDCOM II-Y03-for-web-012626_final') {
                outputTitle.textContent = 'EDCOM II-Y03-for-web-012626_final';
                outputText.innerHTML = formatReflectionText(edcomIIY03ForWeb012626FinalText);
            } else if (btnLabel.startsWith('Beyond the Syllabus')) {
                outputTitle.textContent = 'Beyond the Syllabus: How My Boss Taught Me About Humiliation and Respect';
                outputText.innerHTML = formatReflectionText(beyondTheSyllabusText);
            } else if (btnLabel.startsWith('Beyond the Classroom')) {
                outputTitle.textContent = 'Beyond the Classroom: Financial Literacy as a Survival Skill for Teachers';
                outputText.innerHTML = formatReflectionText(beyondTheClassroomFinancialLiteracyText);
            } else if (btnLabel.startsWith('The Battle of the Mop')) {
                outputTitle.textContent = 'The Battle of the Mop—Wings, Roots, and Housework';
                outputText.innerHTML = formatReflectionText(battleOfTheMopText);
            } else if (btnLabel === 'Before Now and After-Bridge Learning') {
                outputTitle.textContent = 'Before Now and After-Bridge Learning';
                outputText.innerHTML = formatReflectionText(electiveBeforeNowAfterBridgeLearningText);
            } else if (btnLabel === 'Realia and Manipulative Objects') {
                outputTitle.textContent = 'Realia and Manipulative Objects';
                outputText.innerHTML = formatReflectionText(electiveRealiaAndManipulativeObjectsText);
            } else if (btnLabel === 'Purposeful Talk and Shadowing Practice') {
                outputTitle.textContent = 'Purposeful Talk and Shadowing Practice';
                outputText.innerHTML = formatReflectionText(electivePurposefulTalkAndShadowingPracticeText);
            } else if (btnLabel === 'Cooperative Learning and Differentiated Instruction') {
                outputTitle.textContent = 'Cooperative Learning and Differentiated Instruction';
                outputText.innerHTML = formatReflectionText(electiveCooperativeLearningDifferentiatedInstructionText);
            } else if (btnLabel === 'Role Playing & Reinforcement') {
                outputTitle.textContent = 'Role Playing & Reinforcement';
                outputText.innerHTML = formatReflectionText(electiveRolePlayingReinforcementText);
            } else if (btnLabel === 'Lecture Method, Think Pair Share') {
                outputTitle.textContent = 'Lecture Method, Think Pair Share';
                outputText.innerHTML = formatReflectionText(electiveLectureMethodThinkPairShareText);
            } else if (btnLabel === 'Debate and Story Telling') {
                outputTitle.textContent = 'Debate and Story Telling';
                outputText.innerHTML = formatReflectionText(electiveDebateAndStoryTellingText);
            } else if (btnLabel === 'Scaffolding & Direct Instruction and Game-Based & Movement Strategies') {
                outputTitle.textContent = 'Scaffolding & Direct Instruction and Game-Based & Movement Strategies';
                outputText.innerHTML = formatReflectionText(electiveScaffoldingDirectInstructionAndGameBasedMovementStrategiesText);
            } else if (btnLabel === 'Gamification & Class/ Group Discussion') {
                outputTitle.textContent = 'Gamification & Class/ Group Discussion';
                outputText.innerHTML = formatReflectionText(electiveGamificationAndClassGroupDiscussionText);
            } else if (btnLabel === 'Phenomenon -Based Learning & Transdisciplinary Approach') {
                outputTitle.textContent = 'Phenomenon -Based Learning & Transdisciplinary Approach';
                outputText.innerHTML = formatReflectionText(electivePhenomenonBasedLearningAndTransdisciplinaryApproachText);
            } else if (btnLabel === 'Video-Based Anchored Instruction Strategy AND Video-Initiated Role-Play Strategy (Drama-Based Learning)') {
                outputTitle.textContent = 'Video-Based Anchored Instruction Strategy AND Video-Initiated Role-Play Strategy (Drama-Based Learning)';
                outputText.innerHTML = formatReflectionText(electiveVideoBasedAnchoredInstructionAndVideoInitiatedRolePlayText);
            } else if (btnLabel === 'Call and Response, And Learning Stations') {
                outputTitle.textContent = 'Call and Response, And Learning Stations';
                outputText.innerHTML = formatReflectionText(electiveCallAndResponseLearningStationsText);
            } else {
                outputTitle.textContent = btnLabel;
                outputText.innerHTML = formatReflectionText('Reflection content for this topic will be added soon.');
            }

            outputCard.classList.add('show');
        });
    });
}

// Journal Card Click Handler
document.querySelectorAll('.journal-card').forEach(card => {
    card.addEventListener('click', () => {
        const type = card.getAttribute('data-type');
        const modal = document.getElementById('reflectionsModal');
        const title = document.getElementById('reflectionsTitle');
        const body = document.getElementById('reflectionsBody');

        if (type === 'profd') {
            title.textContent = 'PROF ED 10 - Building and Enhancing New Literacies';
            body.innerHTML = `
                <div class="reflection-buttons-grid">
                    <div class="reflection-topics">
                        <button class="reflection-topic-btn" type="button">New Literacies, Functional Literacies and Multiliteracy</button>
                        <button class="reflection-topic-btn" type="button">Exploring the New Literacies</button>
                        <button class="reflection-topic-btn" type="button">The Truth on 21st Century Literacies According to Research</button>
                        <button class="reflection-topic-btn" type="button">Functional Literacy</button>
                        <button class="reflection-topic-btn" type="button">Essential Remote Teaching Tools for Conducting Effective Online Lessons</button>
                        <button class="reflection-topic-btn" type="button">Highlighting the Qualities of 21st Century Teachers</button>
                        <button class="reflection-topic-btn" type="button">The Pen of Digital Age: Artificial Intelligence (AI) as Virtual Assistant, NOT a Replacement for Human Creativity</button>
                    </div>
                    <div class="reflection-topics">
                        <button class="reflection-topic-btn" type="button">The Three 21st Century Skill Categories</button>
                        <button class="reflection-topic-btn" type="button">Integrating New Literacies in the Curriculum</button>
                        <button class="reflection-topic-btn" type="button">The Pen of Digital Age: Artificial Intelligence (AI) as Virtual Assistant, NOT a Replacement for Human Creativity</button>
                        <button class="reflection-topic-btn" type="button">Social Literacy</button>
                        <button class="reflection-topic-btn" type="button">The Hidden Crisis in Research Writing: Why References Matter More Than You Think (A Wake-Up Call for Student Researchers)</button>
                        <button class="reflection-topic-btn" type="button">Media Literacy</button>
                    </div>
                    <div class="reflection-topics">
                        <button class="reflection-topic-btn" type="button">Implications to Pre-Service Teacher Preparation</button>
                        <button class="reflection-topic-btn" type="button">EDCOM II-Y03-for-web-012626_final</button>
                        <button class="reflection-topic-btn" type="button">Beyond the Syllabus: How My Boss Taught Me About Humiliation and Respect</button>
                        <button class="reflection-topic-btn" type="button">Beyond the Classroom: Financial Literacy as a Survival Skill for Teachers</button>
                        <button class="reflection-topic-btn" type="button">The Battle of the Mop—Wings, Roots, and Housework</button>
                    </div>
                </div>
                <div class="reflection-output-card" id="reflectionOutputCard">
                    <h3 id="reflectionOutputTitle">Select a reflection button</h3>
                    <div id="reflectionOutputText" class="reflection-output-text"><p>Click a topic button to show the reflection here.</p></div>
                </div>
            `;
            attachReflectionButtonHandlers(body);
        } else if (type === 'elective') {
            title.textContent = 'ELECTIVE 1 - Teaching Multi-Grade Classes';
            body.innerHTML = `
                <div class="reflection-buttons-grid reflection-buttons-grid-elective">
                    <button class="reflection-topic-btn" type="button">Before Now and After-Bridge Learning</button>
                    <button class="reflection-topic-btn" type="button">Realia and Manipulative Objects</button>
                    <button class="reflection-topic-btn" type="button">Purposeful Talk and Shadowing Practice</button>
                    <button class="reflection-topic-btn" type="button">Cooperative Learning and Differentiated Instruction</button>
                    <button class="reflection-topic-btn" type="button">Role Playing & Reinforcement</button>
                    <button class="reflection-topic-btn" type="button">Lecture Method, Think Pair Share</button>
                    <button class="reflection-topic-btn" type="button">Debate and Story Telling</button>
                    <button class="reflection-topic-btn" type="button">Scaffolding & Direct Instruction and Game-Based & Movement Strategies</button>
                    <button class="reflection-topic-btn" type="button">Gamification & Class/ Group Discussion</button>
                    <button class="reflection-topic-btn" type="button">Phenomenon -Based Learning & Transdisciplinary Approach</button>
                    <button class="reflection-topic-btn" type="button">Video-Based Anchored Instruction Strategy AND Video-Initiated Role-Play Strategy (Drama-Based Learning)</button>
                    <button class="reflection-topic-btn" type="button">Call and Response, And Learning Stations</button>
                </div>
                <div class="reflection-output-card" id="reflectionOutputCard">
                    <h3 id="reflectionOutputTitle">Select a reflection button</h3>
                    <div id="reflectionOutputText" class="reflection-output-text"><p>Click a topic button to show the reflection here.</p></div>
                </div>
            `;
            attachReflectionButtonHandlers(body);
        }

        modal.classList.add('show');
    });
});

// Close Modal
const reflectionsModal = document.getElementById('reflectionsModal');
const reflectionsModalClose = document.getElementById('reflectionsModalClose');

reflectionsModalClose.addEventListener('click', () => {
    reflectionsModal.classList.remove('show');
});

reflectionsModal.addEventListener('click', (e) => {
    if (e.target === reflectionsModal) {
        reflectionsModal.classList.remove('show');
    }
});

// Studio Cert Carousel
const studioPages = document.querySelectorAll('.studio-photo');
const studioDots = document.querySelectorAll('.studio-dot');
let currentStudioPage = 1;

function showStudioPage(pageNum) {
    studioPages.forEach(page => page.style.display = 'none');
    studioDots.forEach(dot => dot.classList.remove('active'));
    
    if (pageNum === 1) {
        document.getElementById('studioPage1').style.display = 'block';
        document.querySelector('[data-page="1"]').classList.add('active');
    } else {
        document.getElementById('studioPage2').style.display = 'block';
        document.querySelector('[data-page="2"]').classList.add('active');
    }
    currentStudioPage = pageNum;
}

const studioPrevBtn = document.getElementById('studioPrev');
const studioNextBtn = document.getElementById('studioNext');

if (studioPrevBtn && studioNextBtn) {
    studioPrevBtn.addEventListener('click', () => {
        currentStudioPage = currentStudioPage === 1 ? 2 : 1;
        showStudioPage(currentStudioPage);
    });
    
    studioNextBtn.addEventListener('click', () => {
        currentStudioPage = currentStudioPage === 1 ? 2 : 1;
        showStudioPage(currentStudioPage);
    });
}

studioDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const pageNum = parseInt(dot.getAttribute('data-page'));
        showStudioPage(pageNum);
    });
});

if (studioPages.length) {
    showStudioPage(1);
}