/* ==========================================================================
   Gozmar Dynamics — CMS default content (single source of truth)
   Editable via the admin dashboard (admin.html). The front page is rendered
   from this model; only changed values are persisted as overrides.
   ========================================================================== */
window.GOZMAR_DEFAULTS = {

    /* ---------------- PRODUCTS ---------------- */
    products: {
        dms: {
            navLabel: "Gozmar DMS",
            tagline: "Corporate Document Management",
            title: "Gozmar DMS",
            summary: "An AI-powered document management system that organises, secures, and retrieves your corporate files with zero friction. Advanced machine learning automatically categorises documents, extracts key data, and enforces compliance — so your team can find anything in seconds.",
            ctaPrimary: "Discover DMS",
            detailTitle: "Corporate document management, reimagined.",
            detailIntro: "Gozmar DMS turns the chaos of corporate files into a calm, searchable, secure system of record. Built for teams that move fast, it learns how your organisation works and keeps every document a keystroke away.",
            detailHeading: "Built for the way modern teams work",
            detailParagraphs: [
                "Most document tools are dumping grounds. Gozmar DMS is the opposite: it understands your content. The moment a file lands, our ML pipeline reads it, extracts key fields, suggests a folder, and applies the right retention and access policy — no manual filing required.",
                "Whether you’re a 10-person studio or a 10,000-seat enterprise, DMS scales with you. Granular permissions, full-text search across 200+ file types, and immutable audit trails mean compliance stops being a fire drill."
            ],
            features: [
                "AI-driven auto-tagging and metadata extraction",
                "Enterprise-grade encryption and access controls",
                "Full-text search across all file types",
                "Version history and audit trails",
                "Smart retention & compliance policies",
                "SSO, Slack & SharePoint integrations"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Starter", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 5 users", "10 GB storage", "Core full-text search", "Email support"], cta: "Get started" },
                    { name: "Pro", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 50 users", "1 TB storage", "AI auto-tagging", "Audit trails & priority support"], cta: "Start free trial" },
                    { name: "Enterprise", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["Unlimited users", "SSO & SCIM", "Dedicated success manager", "Custom retention rules"], cta: "Contact sales" }
                ]
            }
        },
        myfamily: {
            navLabel: "My Family",
            tagline: "Family Building & Home Supervision",
            title: "My Family",
            summary: "My Family brings peace of mind to modern households. It combines home supervision, family scheduling, and smart alerts into one beautiful app. AI learns your family’s routines and sends intelligent notifications — from security alerts to reminders for school pickups.",
            ctaPrimary: "Meet My Family",
            detailTitle: "Your home, supervised and connected.",
            detailIntro: "My Family brings calm to busy households. It blends home supervision, shared scheduling, and intelligent alerts into one beautiful app — so everyone knows what's happening, and you always know the kids are safe.",
            detailHeading: "Peace of mind, built into every routine",
            detailParagraphs: [
                "Modern families run on a chaos of calendars, caretakers, and constant unknowns. My Family gives you one shared space where schedules, chores, and alerts live together. AI learns your family’s rhythms and quietly flags what's off — a late pickup, an unexpected door, a forgotten chore.",
                "Privacy is non-negotiable. Every conversation and camera feed is end-to-end encrypted, and you decide exactly who sees what."
            ],
            features: [
                "Real-time home monitoring with smart device integration",
                "Shared family calendar and chore management",
                "AI-powered anomaly detection (e.g., unusual entry times)",
                "Secure family communication channels",
                "Geofenced check-ins for kids & elders",
                "End-to-end encrypted sharing"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Starter", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["2 adults, 1 home", "Core monitoring", "Mobile app", "Email support"], cta: "Get started" },
                    { name: "Pro", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 6 members", "Multi-home support", "AI anomaly detection", "30-day history"], cta: "Start free trial" },
                    { name: "Estate", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["Unlimited homes", "Dedicated support", "Custom integrations", "On-site onboarding"], cta: "Contact sales" }
                ]
            }
        },
        freight: {
            navLabel: "Gozmar Freight",
            tagline: "Shipping & Freight Management",
            title: "Gozmar Freight",
            summary: "Gozmar Freight streamlines the entire logistics chain — from booking to delivery. Its AI engine optimises routes, predicts delays, and automates documentation, giving you full visibility and control over every shipment.",
            ctaPrimary: "Optimise Logistics",
            detailTitle: "Shipping and freight management, simplified.",
            detailIntro: "Gozmar Freight connects every link in your logistics chain — booking, tracking, customs, and delivery — inside one intelligent control tower. Our AI predicts delays before they happen and routes around them.",
            detailHeading: "One platform, from dock to door",
            detailParagraphs: [
                "Freight teams drown in spreadsheets and phone calls. Gozmar Freight replaces the noise with a live operations view: every shipment, carrier, and document in one place. The AI engine continuously optimises routes, flags exceptions, and drafts the paperwork so your team focuses on exceptions, not data entry.",
                "Built for shippers, carriers, and freight forwarders alike, it turns fragmented logistics into a single, auditable workflow."
            ],
            features: [
                "Real-time shipment tracking and predictive ETAs",
                "Automated customs and compliance paperwork",
                "Intelligent route optimisation",
                "Collaboration hub for shippers, carriers, and clients",
                "Predictive delay & disruption alerts",
                "Carbon & cost analytics"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Starter", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 50 shipments/mo", "Core tracking", "1 carrier integration", "Email support"], cta: "Get started" },
                    { name: "Pro", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Unlimited shipments", "AI route optimisation", "Customs automation", "Priority support"], cta: "Start free trial" },
                    { name: "Enterprise", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["Multi-region ops", "Dedicated success manager", "Custom SLAs", "API & EDI access"], cta: "Contact sales" }
                ]
            }
        },
        mylife: {
            navLabel: "Mylife",
            tagline: "Personal Organiser & Productivity",
            title: "Mylife",
            summary: "Mylife is the ultimate AI-powered personal assistant. It learns your habits, prioritises your tasks, and plans your day so you can achieve more with less stress. From meeting notes to personal goals, Mylife keeps everything in one private, secure space.",
            ctaPrimary: "Plan with Mylife",
            detailTitle: "Your personal organiser, productivity, and private planner.",
            detailIntro: "Mylife is the AI assistant that knows you. It learns your energy, your priorities, and your goals — then quietly builds the day that gets the right things done.",
            detailHeading: "A private space for your whole life",
            detailParagraphs: [
                "Most productivity apps just list tasks. Mylife understands context. It notices when you’re sharp and schedules deep work then, captures thoughts by voice on the move, and protects time for what matters. Your journal, goals, and calendar live in one encrypted space only you can open.",
                "No ads, no mining, no selling — just a planner that respects your privacy by design."
            ],
            features: [
                "AI-suggested daily schedules based on your energy levels",
                "Voice-activated task capture",
                "Private journal and goal tracking",
                "Cross-device sync with end-to-end encryption",
                "Habit streaks & gentle nudges",
                "Focus sessions & reminders"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Free", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["1 device", "Core planning", "Voice capture", "Community support"], cta: "Get started" },
                    { name: "Plus", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Unlimited devices", "AI scheduling", "E2E sync", "Priority support"], cta: "Start free trial" },
                    { name: "Coaching", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["1:1 onboarding", "Custom workflows", "Team spaces", "Dedicated coach"], cta: "Contact us" }
                ]
            }
        },
        task: {
            navLabel: "Gozmar Task",
            tagline: "Team Task Management",
            title: "Gozmar Task",
            summary: "Gozmar Task helps teams of any size collaborate effortlessly. Its AI automatically prioritises work, detects bottlenecks, and suggests smarter workflows — so projects move faster and everyone stays aligned.",
            ctaPrimary: "Boost Team Productivity",
            detailTitle: "Team task management, accelerated by AI.",
            detailIntro: "Gozmar Task helps teams of any size move faster. AI prioritises the work, spots bottlenecks, and recommends the next best action — so projects ship instead of stall.",
            detailHeading: "Less coordination, more execution",
            detailParagraphs: [
                "Status meetings exist because information is scattered. Gozmar Task ends that: every task, owner, and dependency lives in one workspace with Kanban, list, and calendar views. The AI continuously rebalances workload, predicts slip risk, and tells you exactly where to focus.",
                "Onboard in a day, not a quarter. Your team gets clarity without the ceremony."
            ],
            features: [
                "AI-powered workload balancing",
                "Natural language task creation",
                "Kanban, list, and calendar views",
                "Real-time progress analytics",
                "Bottleneck & slip-risk alerts",
                "Automations & templates"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Starter", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 10 users", "Kanban & list views", "Core automations", "Email support"], cta: "Get started" },
                    { name: "Team", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 50 users", "AI workload balancing", "Calendar & timeline", "Priority support"], cta: "Start free trial" },
                    { name: "Business", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["Unlimited users", "SSO & SCIM", "Advanced analytics", "Dedicated manager"], cta: "Contact sales" }
                ]
            }
        },
        auction: {
            navLabel: "Grey Auction",
            tagline: "AI-Powered Auction & Collaboration",
            title: "Grey Auction",
            summary: "Grey Auction revolutionises online bidding with intelligent automation. It enables real-time auctions, transparent collaboration, and secure transactions — all backed by AI that predicts fair market values and prevents fraud.",
            ctaPrimary: "Start Bidding",
            detailTitle: "AI-powered auction and collaboration platform.",
            detailIntro: "Grey Auction makes high-stakes bidding fast, fair, and fraud-free. Real-time auctions, transparent collaboration, and AI that prices, predicts, and protects — for buyers, sellers, and agents alike.",
            detailHeading: "Trust at the speed of live bidding",
            detailParagraphs: [
                "Auctions move in milliseconds, and so does risk. Grey Auction streams live bids with sub-second latency while AI scores fair market value and flags suspicious behaviour in real time. Multi-party rooms let buyers, sellers, and agents collaborate with full auditability and secure escrow.",
                "From estate sales to industrial lots, Grey Auction brings order and confidence to complex transactions."
            ],
            features: [
                "Live bidding with sub-second latency",
                "AI-driven price recommendations and fraud detection",
                "Multi-party collaboration tools (buyers, sellers, agents)",
                "Secure escrow and payment integration",
                "Fair-value scoring",
                "Full audit trail & reporting"
            ],
            media: { hero: "", gallery: ["", "", ""] },
            pricing: {
                tiers: [
                    { name: "Starter", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Up to 25 lots/mo", "Live bidding", "Standard fraud scoring", "Email support"], cta: "Get started" },
                    { name: "Pro", monthly: "$—", annual: "$—", volumeDiscount: "0", minSeats: "1", features: ["Unlimited lots", "AI fair-value scoring", "Secure escrow", "Priority support"], cta: "Start free trial" },
                    { name: "Enterprise", monthly: "Custom", annual: "Custom", volumeDiscount: "0", minSeats: "1", features: ["White-label rooms", "Custom integrations", "Dedicated manager", "SLA & compliance"], cta: "Contact sales" }
                ]
            }
        }
    },

    /* ---------------- SITE-WIDE ITEMS ---------------- */
    site: {
        hero: {
            title: "The future of work and life, ",
            titleAccent: "powered by AI.",
            subtitle: "Gozmar Dynamics builds intelligent software that automates the mundane, amplifies productivity, and connects people — so you can focus on what matters.",
            ctaPrimary: "Explore Our Products",
            ctaSecondary: "Learn More"
        },
        about: {
            heading: "We believe technology should feel effortless.",
            text: "Gozmar Dynamics Limited is a global IT company dedicated to crafting AI-driven solutions that solve real problems. From corporate document management to personal productivity, our products are designed with a singular focus: to make complex tasks simple and intuitive. Headquartered with a global outlook, we serve businesses and families across industries — delivering performance, security, and seamless user experiences.",
            image: ""
        },
        stats: {
            items: [
                { number: "6", label: "AI products" },
                { number: "99.9%", label: "Uptime" },
                { number: "50+", label: "Countries served" },
                { number: "24/7", label: "Support" }
            ]
        },
        values: {
            items: [
                { icon: "fa-brain", title: "AI-First", text: "Every product is built around artificial intelligence that learns and adapts to your unique needs." },
                { icon: "fa-shield-alt", title: "Security by Design", text: "Enterprise-grade encryption and privacy controls on all platforms, ensuring your data stays yours." },
                { icon: "fa-globe", title: "Global Reach, Local Touch", text: "Designed for the world, with deep understanding of diverse markets and cultural contexts." },
                { icon: "fa-magic", title: "Effortless UX", text: "Beautiful, intuitive interfaces that require no training — just open and use." }
            ]
        },
        testimonials: {
            items: [
                { quote: "Gozmar DMS cut our document retrieval time by 80%. It feels like magic.", author: "— Sarah O., Operations Director" },
                { quote: "My Family gives me complete peace of mind when I’m away. The AI alerts are spot on.", author: "— Daniel K., Parent" },
                { quote: "Gozmar Freight transformed our logistics. We now predict delays before they happen.", author: "— Amara T., Supply Chain Manager" }
            ]
        },
        faq: {
            items: [
                { q: "Are Gozmar products available for individual use?", a: "Yes! Mylife, My Family, and Grey Auction are designed for individual use. Gozmar DMS and Gozmar Task are optimized for teams and enterprises." },
                { q: "Do you offer a free trial?", a: "We offer 14-day free trials for all products. No credit card required to start." },
                { q: "How is my data protected?", a: "All products use end-to-end encryption. Data is encrypted at rest and in transit. We never sell your personal data." },
                { q: "What devices do your products support?", a: "Web access on any modern browser, plus dedicated iOS and Android apps for mobile use." }
            ]
        },
        contact: {
            email: "info@gozmardynamics.com",
            phone: "+1 (800) 555-0123",
            address: "Serving clients worldwide"
        },
        footer: {
            brand: "Gozmar Dynamics",
            tagline: "AI-powered IT solutions for a smarter world."
        }
    }
};
