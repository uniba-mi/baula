export interface MockJob  {
    title: string,
    description: string,
    keywords: string[],
    requirements: string[],
}

export const mockJobs: MockJob[] = [
    {
        title: "Webentwickler:in",
        description: "Wir suchen einen Webentwickler bzw. eine Webentwicklerin zur Verstärkung unseres Teams. Du wirst moderne Web-Anwendungen mit aktuellen Technologien wie Angular, React, Vue.js, Node.js und Spring Boot entwickeln.",
        requirements: [
            "Erfahrung in einer oder mehreren der genannten Web-Technologien",
            "Kenntnisse in agilen Entwicklungsmethoden",
            "Erfahrung mit CI/CD und Container-Technologien (Docker, Kubernetes) von Vorteil",
            "Solide Kenntnisse in Datenbanken (SQL, NoSQL)",
            "Verständnis für API-Design und REST/SOAP-Schnittstellen",
            "Erfahrung mit Versionskontrollsystemen wie Git",
            "Problemlösungsfähigkeiten und analytisches Denken"
        ],
        keywords: [
            "Webentwicklung",
            "Frontend",
            "Backend",
            "Full-Stack",
            "Angular",
            "React",
            "Vue.js",
            "Node.js",
            "CI/CD",
            "Agile Methoden",
            "API-Design"
        ],
        
    },
    {
        title: "Softwareentwickler:in",
        description: "Wir suchen eine Softwareentwicklerin bzw. einen Softwareentwickler zur Entwicklung nativer Anwendungen für Windows, Linux und macOS in C++, C# oder Java.",
        requirements: [
            "Erfahrung mit C++, C# oder Java für native Anwendungsentwicklung",
            "Kenntnisse in GUI-Frameworks (Qt, WPF, JavaFX)",
            "Erfahrung mit Multithreading und Performance-Optimierung",
            "Kenntnisse in Datenbankintegration (SQL, SQLite, PostgreSQL)",
            "Erfahrung mit Versionskontrollsystemen wie Git",
            "Verständnis für Betriebssystemarchitekturen"
        ],
        keywords: [
            "Softwareentwicklung",
            "Native Software",
            "C++",
            "C#",
            "Java",
            "GUI-Entwicklung",
            "Multithreading",
            "Performance-Optimierung",
            "Betriebssysteme",
            "SQL",
            "PostgreSQL"
        ],
        
    }, 
    {
        title: "UI/UX Designer:in",
        description: "Als UI/UX Designer:in entwickelst du intuitive Benutzeroberflächen für Web- und Mobile-Anwendungen.",
        requirements: [
            "Erfahrung in UI/UX-Design-Tools (Figma, Adobe XD, Sketch)",
            "Kenntnisse in Design Thinking und User Research",
            "Erfahrung mit responsivem Design und Accessibility-Standards",
            "Zusammenarbeit mit Entwicklern zur Umsetzung von Designs",
            "Verständnis für Frontend-Technologien (HTML, CSS, JavaScript)"
        ],
        keywords: [
            "UI/UX",
            "Benutzerfreundlichkeit",
            "Webdesign",
            "Mobile Design",
            "Figma",
            "Adobe XD",
            "Sketch",
            "Responsive Design",
            "Accessibility",
            "Design Thinking"
        ],
        
    },
    {
        title: "UI-Entwickler:in",
        description: "Wir suchen eine UI-Entwickler bzw. eine UI-Entwicklerin, die an der Umsetzung moderner Benutzeroberflächen für Web- und Mobile-Anwendungen arbeitet.",
        requirements: [
            "Erfahrung mit HTML, CSS, JavaScript und modernen Frameworks (React, Angular, Vue.js)",
            "Kenntnisse in CSS-Präprozessoren (SASS, LESS)",
            "Erfahrung mit Animationen und Interaktionsdesign",
            "Verständnis für Performance-Optimierung im Frontend",
            "Zusammenarbeit mit UI/UX-Designern zur Design-Umsetzung"
        ],
        keywords: [
            "UI-Entwicklung",
            "Frontend",
            "HTML",
            "CSS",
            "JavaScript",
            "React",
            "Angular",
            "Vue.js",
            "Animationen",
            "Performance-Optimierung",
            "Interaktionsdesign"
        ],
        
    },
    {
        title: "Softwarearchitekt:in",
        description: "Als Softwarearchitekt:in übernimmst du Verantwortung für die technische Architektur unserer Softwarelösungen und stellst deren Skalierbarkeit und Wartbarkeit sicher.",
        requirements: [
            "Mehrjährige Erfahrung in der Softwareentwicklung & Architektur",
            "Fundierte Kenntnisse in Cloud-Technologien (AWS, Azure, Google Cloud)",
            "Erfahrung mit Microservices-Architekturen und verteilten Systemen",
            "Kenntnisse in Design Patterns und Clean Code Prinzipien",
            "Erfahrung mit Performance-Optimierung und Lasttests",
            "Verständnis für Security-Best-Practices in der Softwareentwicklung"
        ],
        keywords: [
            "Softwarearchitektur",
            "Skalierbarkeit",
            "Microservices",
            "Cloud-Computing",
            "Security",
            "Design Patterns",
            "Clean Code",
            "Systemdesign",
            "IT-Strategie",
            "Performance-Optimierung"
        ],
        
    },
    {
        title: "DevOps Engineer",
        description: "Als DevOps Engineer verantwortest du die Automatisierung und den Betrieb unserer Cloud-Infrastruktur mit modernen CI/CD-Pipelines.",
        requirements: [
            "Erfahrung mit Docker, Kubernetes und CI/CD-Pipelines",
            "Kenntnisse in Infrastructure as Code (Terraform, Ansible)",
            "Erfahrung mit Cloud-Plattformen (AWS, Azure, GCP)",
            "Kenntnisse in Monitoring- und Logging-Tools (Prometheus, ELK, Grafana)",
            "Erfahrung mit Netzwerktechnologien und Security-Aspekten",
            "Programmierkenntnisse in Bash, Python oder Go"
        ],
        keywords: [
            "DevOps",
            "CI/CD",
            "Automatisierung",
            "Kubernetes",
            "Docker",
            "Cloud-Infrastruktur",
            "Infrastructure as Code",
            "Monitoring",
            "Logging",
            "IT-Sicherheit"
        ],
        
    },
    {
        title: "Embedded Systems Entwickler:in",
        description: "Wir suchen einen Embedded Systems Entwickler:in für innovative IoT-Lösungen und Echtzeitsysteme.",
        requirements: [
            "Erfahrung mit C/C++ und Embedded Linux",
            "Kenntnisse in Mikrocontroller-Programmierung",
            "Verständnis von Kommunikationsprotokollen (UART, SPI, I2C)",
            "Erfahrung mit Echtzeitbetriebssystemen (RTOS)",
            "Kenntnisse in Hardware-Debugging und Schaltungsanalyse",
            "Verständnis für Energiemanagement in Embedded-Systemen"
        ],
        keywords: [
            "Embedded Systems",
            "IoT",
            "Mikrocontroller",
            "Echtzeitbetriebssysteme",
            "C/C++",
            "Hardware-Debugging",
            "Energiemanagement",
            "UART",
            "SPI",
            "I2C"
        ],
        
    },
    {
        title: "IT-Consultant",
        description: "Als IT-Consultant berätst du Kunden zu Cloud-Architekturen, Softwarelösungen und digitalen Transformationen.",
        requirements: [
            "Erfahrung mit Cloud-Technologien (AWS, Azure, Google Cloud)",
            "Kenntnisse in agilen Methoden und IT-Architektur",
            "Kommunikationsstärke und Beratungskompetenz",
            "Fähigkeit zur schnellen Einarbeitung in neue Technologien",
            "Erfahrung in IT-Sicherheits- und Datenschutzthemen",
            "Kenntnisse in Business Process Management (BPM)"
        ],
        keywords: [
            "IT-Consulting",
            "Cloud-Computing",
            "IT-Architektur",
            "Digitalisierung",
            "Agile Methoden",
            "IT-Sicherheit",
            "Business Process Management",
            "Beratung",
            "Projektmanagement",
            "Softwarelösungen"
        ],
        
    },
    {
        title: "Projektmanager:in für IT-Projekte",
        description: "Als IT-Projektmanager:in übernimmst du die Leitung agiler Softwareentwicklungsprojekte und koordinierst interdisziplinäre Teams.",
        requirements: [
            "Erfahrung in der Leitung von IT-Projekten",
            "Kenntnisse in agilen Methoden (Scrum, Kanban)",
            "Kommunikationsstärke und strukturierte Arbeitsweise",
            "Erfahrung mit Projektmanagement-Tools (JIRA, Trello, MS Project)",
            "Fähigkeit, technische Anforderungen zu analysieren und umzusetzen",
            "Erfahrung mit Budgetplanung und Stakeholder-Management"
        ],
        keywords: [
            "Projektmanagement",
            "IT-Projekte",
            "Agile Methoden",
            "Scrum",
            "Kanban",
            "Teamkoordination",
            "Budgetplanung",
            "Stakeholder-Management",
            "Softwareentwicklung",
            "Prozessoptimierung"
        ],
        
    },
    {
        title: "Business Analyst",
        description: "Als Business Analyst analysierst du Geschäftsprozesse und entwickelst IT-Lösungen für unsere Kunden.",
        requirements: [
            "Erfahrung in Geschäftsprozessanalyse und Anforderungsmanagement",
            "Kenntnisse in SQL, BI-Tools und Modellierungstechniken",
            "Fähigkeit, technische und geschäftliche Anforderungen zu verbinden",
            "Erfahrung mit BPMN, UML und Prozessmodellierung",
            "Analytische Denkweise und Problemlösungskompetenz",
            "Kommunikationsstärke und Präsentationsfähigkeiten"
        ],
        keywords: [
            "Business Analysis",
            "Geschäftsprozesse",
            "SQL",
            "BI-Tools",
            "Anforderungsmanagement",
            "Prozessmodellierung",
            "BPMN",
            "UML",
            "Datenanalyse",
            "IT-Consulting"
        ],
        
    },
    {
        title: "Data Scientist",
        description: "Als Data Scientist entwickelst du KI-Modelle zur Optimierung von Geschäftsprozessen.",
        requirements: [
            "Erfahrung mit Python, R, TensorFlow oder PyTorch",
            "Kenntnisse in Statistik und Machine Learning",
            "Erfahrung mit Big Data-Technologien (Hadoop, Spark)",
            "Verständnis für neuronale Netzwerke und Deep Learning",
            "Kenntnisse in Datenvisualisierung und Explorationsanalyse",
            "Erfahrung mit Cloud-Plattformen (AWS, Azure, GCP) von Vorteil"
        ],
        keywords: [
            "Data Science",
            "Machine Learning",
            "Big Data",
            "Statistik",
            "TensorFlow",
            "PyTorch",
            "Hadoop",
            "Spark",
            "Neuronale Netze",
            "Datenvisualisierung"
        ],
        
    },
    {
        title: "Data Engineer",
        description: "Du entwickelst skalierbare Datenpipelines und Big Data-Infrastrukturen für unsere Kunden.",
        requirements: [
            "Erfahrung mit SQL, NoSQL, Apache Spark und Kafka",
            "Kenntnisse in Cloud-Datenlösungen (AWS, Azure, Google Cloud)",
            "Erfahrung in der Optimierung von ETL-Prozessen",
            "Programmierkenntnisse in Python, Java oder Scala",
            "Erfahrung mit Data Warehousing und Data Lakes",
            "Verständnis für Datenschutz und Datensicherheit"
        ],
        keywords: [
            "Data Engineering",
            "Big Data",
            "SQL",
            "NoSQL",
            "Apache Spark",
            "Kafka",
            "Cloud-Datenlösungen",
            "ETL",
            "Data Warehousing",
            "Datensicherheit"
        ],
        
    },
    {
        title: "KI-Entwickler:in",
        description: "Wir suchen einen KI-Entwickler:in mit Erfahrung in Deep Learning und Computer Vision.",
        requirements: [
            "Erfahrung mit TensorFlow, PyTorch und OpenCV",
            "Kenntnisse in NLP und Bildverarbeitung",
            "Erfahrung mit Modelloptimierung und Deployment",
            "Kenntnisse in Reinforcement Learning von Vorteil",
            "Erfahrung mit GPU-Computing (CUDA, TensorRT)",
            "Verständnis für ethische Aspekte der KI-Entwicklung"
        ],
        keywords: [
            "Künstliche Intelligenz",
            "Deep Learning",
            "Computer Vision",
            "NLP",
            "TensorFlow",
            "PyTorch",
            "OpenCV",
            "Modelloptimierung",
            "GPU-Computing",
            "Reinforcement Learning"
        ],
        
    },
    {
        title: "IT-Security-Spezialist:in",
        description: "Als IT-Security-Spezialist:in analysierst und optimierst du die IT-Sicherheit unserer Kunden.",
        requirements: [
            "Erfahrung in Penetration Testing und IT-Sicherheitskonzepten",
            "Kenntnisse in Netzwerksicherheit und Verschlüsselungstechnologien",
            "Zertifizierungen wie CEH oder CISSP sind von Vorteil",
            "Erfahrung mit Sicherheitsüberprüfungen und Bedrohungsanalysen",
            "Kenntnisse in SIEM- und IDS/IPS-Systemen",
            "Verständnis für Compliance-Richtlinien (ISO 27001, GDPR)"
        ],
        keywords: [
            "IT-Security",
            "Penetration Testing",
            "Netzwerksicherheit",
            "Verschlüsselung",
            "CEH",
            "CISSP",
            "Bedrohungsanalyse",
            "Compliance",
            "SIEM",
            "IDS/IPS"
        ],
        
    }
]