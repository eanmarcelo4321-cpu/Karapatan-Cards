var CARD_POOL = [
  {
    "id": 1,
    "category": "Child Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A 12-year-old is made to work 10 hours a day at a construction site instead of attending school.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Children under 15 may not be employed except in light work with strict limits; this exceeds every protection for hazardous, full-time labor.",
    "legal": "RA 9231 (child labor law) and PD 603 (Child and Youth Welfare Code)."
  },
  {
    "id": 2,
    "category": "Child Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A 16-year-old works 3 hours after school at a family bakery, with a parent's consent, doing light, non-hazardous tasks.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Light work by a minor 15+ with parental consent, limited hours, and no hazard is allowed as long as school isn't affected.",
    "legal": "RA 9231, Labor Code provisions on employment of minors."
  },
  {
    "id": 3,
    "category": "Child Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A working student, 15, is told by their employer they cannot take time off to take final exams.",
    "choices": [
      {
        "text": "Quit immediately without saying anything to the employer.",
        "pts": 0
      },
      {
        "text": "Just skip the exams to keep the job, then complain about it later.",
        "pts": 1
      },
      {
        "text": "Remind the employer that education takes priority by law, and report to DOLE if the employer refuses.",
        "pts": 2
      }
    ],
    "answer": "Employers must not interfere with a working minor's schooling; DOLE can act against non-compliant employers.",
    "legal": "RA 9231 and DepEd-DOLE guidelines on working students."
  },
  {
    "id": 4,
    "category": "Child Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A 14-year-old scavenger is injured by broken glass while working at a dumpsite with no protective gear or supervision.",
    "choices": [
      {
        "text": "Ignore it since it's how the family earns income.",
        "pts": 0
      },
      {
        "text": "Just tell the child to be more careful next time.",
        "pts": 1
      },
      {
        "text": "Report the hazardous child labor to the barangay or DSWD so the child can be pulled from danger and assisted.",
        "pts": 2
      }
    ],
    "answer": "Hazardous work is absolutely prohibited for children regardless of family income needs; authorities must intervene.",
    "legal": "RA 9231 list of hazardous work prohibited for minors."
  },
  {
    "id": 5,
    "category": "Child Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a barangay official, you learn a child is being forced by a relative into hazardous scavenging work daily and is missing school.",
    "choices": [
      {
        "text": "Publicly shame the relative at a barangay assembly without following any protocol.",
        "pts": 0
      },
      {
        "text": "Give the family a verbal warning only and take no further action.",
        "pts": 1
      },
      {
        "text": "Document the situation, coordinate with DSWD and the school, and offer the family support while removing the child from hazard.",
        "pts": 2
      }
    ],
    "answer": "Child protection requires coordinated, documented intervention with support services, not shaming or empty warnings.",
    "legal": "PD 603, RA 9231, and the Barangay Council for the Protection of Children mandate."
  },
  {
    "id": 6,
    "category": "Online Safety",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A classmate's edited, insulting photo is shared in a group chat, and everyone is asked to forward it too.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Forwarding shared humiliating content makes a person complicit in cyberbullying, which is a punishable act under school and national policy.",
    "legal": "RA 10627 (Anti-Bullying Act) and the Safe Spaces Act (RA 11313)."
  },
  {
    "id": 7,
    "category": "Online Safety",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A student reports being repeatedly mocked online to their guidance counselor, who documents it and contacts the other student's parents.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "This is the correct, lawful process: schools are required to receive, document, and act on bullying reports.",
    "legal": "RA 10627 Anti-Bullying Act implementing rules."
  },
  {
    "id": 8,
    "category": "Online Safety",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "You receive threatening messages from an anonymous account after posting an opinion online.",
    "choices": [
      {
        "text": "Delete your post and say nothing to anyone.",
        "pts": 0
      },
      {
        "text": "Reply angrily to try to scare the account away.",
        "pts": 1
      },
      {
        "text": "Screenshot everything, block the account, and report it to the platform and, if serious, to the PNP Anti-Cybercrime Group.",
        "pts": 2
      }
    ],
    "answer": "Preserving evidence and reporting through proper channels protects you and helps authorities act on cyber harassment.",
    "legal": "RA 10175 (Cybercrime Prevention Act) and Safe Spaces Act online provisions."
  },
  {
    "id": 9,
    "category": "Online Safety",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A minor's private photos are posted online without consent by an ex-partner.",
    "choices": [
      {
        "text": "Do nothing since the photos are already out there.",
        "pts": 0
      },
      {
        "text": "Ask friends to mass-report the account without saving any evidence.",
        "pts": 1
      },
      {
        "text": "Preserve evidence, report to the platform for takedown, and file a complaint under the anti-voyeurism and cybercrime laws.",
        "pts": 2
      }
    ],
    "answer": "Non-consensual sharing of private images is a specific criminal offense, and victims have a right to takedown and legal action.",
    "legal": "RA 9995 (Anti-Photo and Video Voyeurism Act) and RA 10175."
  },
  {
    "id": 10,
    "category": "Online Safety",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a school IT officer, you discover a viral chat group is coordinating harassment of a student, with some members claiming they were 'just joking.'",
    "choices": [
      {
        "text": "Delete the chat evidence immediately to avoid controversy.",
        "pts": 0
      },
      {
        "text": "Quietly ask the group to stop without informing the school administration.",
        "pts": 1
      },
      {
        "text": "Escalate to the anti-bullying committee, preserve chat evidence, and ensure the targeted student gets support while the group is investigated.",
        "pts": 2
      }
    ],
    "answer": "Schools must formally investigate and support the victim; deleting evidence undermines accountability and protection.",
    "legal": "RA 10627 Anti-Bullying Act and DepEd Child Protection Policy."
  },
  {
    "id": 11,
    "category": "Labor Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "After a month of work, a sari-sari store owner tells a 16-year-old employee there's 'no budget' this week and pays nothing.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Workers are entitled to pay for all hours worked regardless of the employer's finances; withholding wages is illegal.",
    "legal": "Labor Code provisions on payment of wages; RA 9231 for working minors."
  },
  {
    "id": 12,
    "category": "Labor Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A construction worker is paid the correct daily minimum wage plus overtime pay for hours beyond eight, as required by the region's wage order.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Paying at least minimum wage plus proper overtime is exactly what the law requires.",
    "legal": "Labor Code Book III on wages and hours of work."
  },
  {
    "id": 13,
    "category": "Labor Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An employee is told their overtime pay will just be 'added next payday' for the third month in a row.",
    "choices": [
      {
        "text": "Resign immediately without documenting anything or filing a complaint.",
        "pts": 0
      },
      {
        "text": "Accept the excuse again and stay quiet to avoid conflict.",
        "pts": 1
      },
      {
        "text": "Keep a written log of hours worked and file a complaint with DOLE if the employer keeps delaying payment.",
        "pts": 2
      }
    ],
    "answer": "Repeated delay of wages can be reported to DOLE, and documentation strengthens any future complaint.",
    "legal": "Labor Code and DOLE wage order enforcement rules."
  },
  {
    "id": 14,
    "category": "Labor Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A domestic worker (kasambahay) is not given a day off in over two months despite asking.",
    "choices": [
      {
        "text": "Walk out immediately without discussing it or seeking help.",
        "pts": 0
      },
      {
        "text": "Just keep working without a rest day to avoid losing the job.",
        "pts": 1
      },
      {
        "text": "Remind the employer that a weekly rest day is a legal right, and seek help from DOLE or barangay if refused.",
        "pts": 2
      }
    ],
    "answer": "The Kasambahay Law guarantees at least one rest day per week, which cannot be waived without fair compensation.",
    "legal": "RA 10361 (Batas Kasambahay)."
  },
  {
    "id": 15,
    "category": "Labor Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a shop supervisor, your manager instructs you to report fewer hours than employees actually worked to cut overtime costs.",
    "choices": [
      {
        "text": "Say nothing and let another supervisor handle it instead.",
        "pts": 0
      },
      {
        "text": "Falsify the records this one time since it's just a small adjustment.",
        "pts": 1
      },
      {
        "text": "Refuse to falsify records, explain the legal risk to your manager, and report the instruction if it continues.",
        "pts": 2
      }
    ],
    "answer": "Falsifying labor records is illegal and exposes both the company and staff to liability; refusal and reporting are the lawful response.",
    "legal": "Labor Code and Labor Standards enforcement rules on wage records."
  },
  {
    "id": 16,
    "category": "Labor Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A factory requires workers to handle chemicals without gloves, masks, or ventilation despite repeated requests for protective gear.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Employers are legally required to provide personal protective equipment and a safe working environment.",
    "legal": "RA 11058 (Occupational Safety and Health Standards Act)."
  },
  {
    "id": 17,
    "category": "Labor Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A warehouse holds a mandatory safety orientation and provides gloves and hard hats before workers start handling heavy equipment.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Providing training and protective equipment before hazardous work is exactly what occupational safety law requires.",
    "legal": "RA 11058 and its implementing rules."
  },
  {
    "id": 18,
    "category": "Labor Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A worker is injured on the job, and the employer suggests just resting at home without reporting or covering the medical costs.",
    "choices": [
      {
        "text": "Quit right away without seeking compensation for the injury.",
        "pts": 0
      },
      {
        "text": "Just accept the suggestion and pay for treatment out of pocket.",
        "pts": 1
      },
      {
        "text": "Insist that the injury be officially reported and file for SSS/Employees' Compensation benefits for work-related injuries.",
        "pts": 2
      }
    ],
    "answer": "Work-related injuries are covered by Employees' Compensation, and employers must report incidents, not hide them.",
    "legal": "RA 11058 and SSS Employees' Compensation Program."
  },
  {
    "id": 19,
    "category": "Labor Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "Workers notice a scaffold at a construction site is visibly unstable, but the foreman insists work continue to meet a deadline.",
    "choices": [
      {
        "text": "Say nothing since the foreman is in charge.",
        "pts": 0
      },
      {
        "text": "Work quickly and carefully to finish before anything happens.",
        "pts": 1
      },
      {
        "text": "Refuse to work on the unsafe scaffold and report the hazard, since workers have the right to refuse unsafe work.",
        "pts": 2
      }
    ],
    "answer": "Workers have a legal right to stop work that poses imminent danger without being penalized.",
    "legal": "RA 11058, right to refuse unsafe work provisions."
  },
  {
    "id": 20,
    "category": "Labor Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a safety officer, you find repeated near-miss accidents on a site, but management wants to keep incidents unreported to avoid delays.",
    "choices": [
      {
        "text": "Go along with management's wish to keep incidents unreported.",
        "pts": 0
      },
      {
        "text": "Log the incidents privately but don't tell DOLE or push management further.",
        "pts": 1
      },
      {
        "text": "Formally log the incidents, push for corrective measures, and escalate to DOLE if management continues to suppress reporting.",
        "pts": 2
      }
    ],
    "answer": "Safety officers have a duty to report hazards; concealment risks lives and violates occupational safety law.",
    "legal": "RA 11058 and its reporting requirements for workplace accidents."
  },
  {
    "id": 21,
    "category": "Housing Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A landlord tells a family to leave their fully rent-paid unit within two days, with no written notice.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Tenants cannot be evicted without proper written notice and legal process, even for the landlord's own reasons.",
    "legal": "Rent Control Act (RA 9653) and general tenant protection rules."
  },
  {
    "id": 22,
    "category": "Housing Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A landlord gives 30 days' written notice and follows the proper court process before increasing rent within legal limits.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Following legal notice periods and rent caps is exactly what the law requires of landlords.",
    "legal": "RA 9653 (Rent Control Act)."
  },
  {
    "id": 23,
    "category": "Housing Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An informal settler family receives a demolition notice for next week with no relocation plan offered.",
    "choices": [
      {
        "text": "Resist the demolition by force without seeking legal help.",
        "pts": 0
      },
      {
        "text": "Leave immediately without asking about relocation assistance.",
        "pts": 1
      },
      {
        "text": "Seek help from the local housing office or NHA, since demolitions require adequate notice and, where applicable, relocation assistance.",
        "pts": 2
      }
    ],
    "answer": "Urban Development and Housing Act requires proper notice, consultation, and relocation for eligible informal settlers.",
    "legal": "RA 7279 (Urban Development and Housing Act)."
  },
  {
    "id": 24,
    "category": "Housing Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A tenant's security deposit is not returned months after moving out, despite leaving the unit in good condition.",
    "choices": [
      {
        "text": "Break into the unit to retrieve personal belongings as compensation.",
        "pts": 0
      },
      {
        "text": "Let it go since it's a small amount of money.",
        "pts": 1
      },
      {
        "text": "Send a written demand for the deposit and bring the matter to the barangay for mediation if ignored.",
        "pts": 2
      }
    ],
    "answer": "Tenants have a right to reclaim deposits absent damage, and barangay conciliation is the proper first step for such disputes.",
    "legal": "Civil Code provisions on lease and Katarungang Pambarangay Law."
  },
  {
    "id": 25,
    "category": "Housing Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a barangay housing officer, you're asked to approve a fast demolition of homes for a private project without a relocation plan.",
    "choices": [
      {
        "text": "Delay indefinitely without explaining the legal requirement to anyone.",
        "pts": 0
      },
      {
        "text": "Approve it quickly since the project has investors waiting.",
        "pts": 1
      },
      {
        "text": "Refuse to approve until affected families are properly consulted and a relocation plan is in place, as required by law.",
        "pts": 2
      }
    ],
    "answer": "Officials must ensure due process and relocation compliance before any eviction or demolition proceeds.",
    "legal": "RA 7279 and Supreme Court rules on demolition and eviction."
  },
  {
    "id": 26,
    "category": "Community Justice",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "Two neighbors go straight to filing a court case over a small fence dispute without ever going to the barangay.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Most disputes between residents of the same barangay must first go through barangay conciliation before court.",
    "legal": "Katarungang Pambarangay Law (PD 1508 / Local Government Code)."
  },
  {
    "id": 27,
    "category": "Community Justice",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "Two neighbors bring their fence dispute to the Lupong Tagapamayapa for mediation before considering any legal action.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "This is exactly the correct first step required for most local civil disputes.",
    "legal": "Katarungang Pambarangay Law."
  },
  {
    "id": 28,
    "category": "Community Justice",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A dispute over a shared water pump escalates, and one neighbor threatens to destroy it that night.",
    "choices": [
      {
        "text": "Confront the neighbor alone late at night.",
        "pts": 0
      },
      {
        "text": "Wait to see if the threat is serious before doing anything.",
        "pts": 1
      },
      {
        "text": "Report the threat to barangay officials immediately so they can intervene and prevent damage or violence.",
        "pts": 2
      }
    ],
    "answer": "Barangay officials are mandated to keep peace and can act quickly to prevent harm from escalating disputes.",
    "legal": "Local Government Code, barangay peacekeeping functions."
  },
  {
    "id": 29,
    "category": "Community Justice",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A Lupon mediation results in an agreement, but one party later refuses to comply with it.",
    "choices": [
      {
        "text": "Take matters into your own hands to force compliance.",
        "pts": 0
      },
      {
        "text": "Just accept the non-compliance and drop the matter.",
        "pts": 1
      },
      {
        "text": "Ask the barangay to have the agreement enforced, since a Lupon settlement has the force of a court judgment if unchallenged.",
        "pts": 2
      }
    ],
    "answer": "A duly executed and unrepudiated amicable settlement can be enforced like a court decision.",
    "legal": "PD 1508 and Local Government Code on enforcement of Lupon settlements."
  },
  {
    "id": 30,
    "category": "Community Justice",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a Lupon member, you notice one party is being pressured by the other's relatives to accept an unfair settlement.",
    "choices": [
      {
        "text": "Side with whichever party has more relatives present.",
        "pts": 0
      },
      {
        "text": "Continue the mediation as scheduled without addressing the pressure.",
        "pts": 1
      },
      {
        "text": "Pause the mediation, address the pressure, and ensure both parties freely and fairly agree before proceeding.",
        "pts": 2
      }
    ],
    "answer": "Mediators must ensure settlements are voluntary and fair, not coerced.",
    "legal": "Katarungang Pambarangay Law's requirement of voluntary agreement."
  },
  {
    "id": 31,
    "category": "Due Process",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "Police arrest a person without a warrant or informing them of the reason, and without reading their rights.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Except in specific lawful warrantless-arrest situations, arrests require a warrant, and arrested persons must be informed of their rights.",
    "legal": "1987 Constitution Bill of Rights and RA 7438 (Rights of Persons Arrested)."
  },
  {
    "id": 32,
    "category": "Due Process",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "Police show a valid warrant, identify themselves, and inform the person of their right to remain silent and to counsel during an arrest.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "This follows the constitutional and statutory requirements for a lawful arrest.",
    "legal": "RA 7438 and the Bill of Rights."
  },
  {
    "id": 33,
    "category": "Due Process",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A person is questioned by police without being told they may remain silent or have a lawyer present.",
    "choices": [
      {
        "text": "Refuse to speak at all, including giving basic identification when legally required.",
        "pts": 0
      },
      {
        "text": "Answer every question quickly to get it over with.",
        "pts": 1
      },
      {
        "text": "Politely assert the right to remain silent and request a lawyer before answering any questions.",
        "pts": 2
      }
    ],
    "answer": "The right to silence and counsel during custodial investigation is constitutionally protected and must be honored.",
    "legal": "Miranda rights under RA 7438 and the 1987 Constitution."
  },
  {
    "id": 34,
    "category": "Due Process",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "Someone is detained by barangay tanods overnight for a minor argument without being brought before proper authority.",
    "choices": [
      {
        "text": "Try to escape from custody without seeking legal help.",
        "pts": 0
      },
      {
        "text": "Accept the detention since tanods are community authorities.",
        "pts": 1
      },
      {
        "text": "Point out that detention beyond the allowed period without charges violates the right to liberty, and seek help from a lawyer or PAO.",
        "pts": 2
      }
    ],
    "answer": "Only authorized personnel may detain someone, and detention must follow required timelines for inquest or release.",
    "legal": "Revised Penal Code on arbitrary detention and RA 7438."
  },
  {
    "id": 35,
    "category": "Due Process",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a barangay captain, you're asked by police to let them question a suspect at your hall without informing the suspect of their rights.",
    "choices": [
      {
        "text": "Refuse to allow police into the barangay hall at all.",
        "pts": 0
      },
      {
        "text": "Allow the questioning to proceed quickly without raising the issue.",
        "pts": 1
      },
      {
        "text": "Insist that the suspect be informed of their rights and have access to counsel before any questioning proceeds.",
        "pts": 2
      }
    ],
    "answer": "Officials present during questioning share responsibility for ensuring constitutional rights are respected.",
    "legal": "RA 7438 and due process guarantees."
  },
  {
    "id": 36,
    "category": "Police Conduct",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "During a public protest, officers use force against demonstrators who are peacefully standing and chanting.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Force against a peaceful assembly violates the right to peaceably assemble and rules on proportional use of force.",
    "legal": "1987 Constitution, Batas Pambansa 880, and PNP use-of-force policy."
  },
  {
    "id": 37,
    "category": "Police Conduct",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "Officers ask a peaceful rally to relocate slightly to keep a road clear, after coordinating with organizers in advance.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Reasonable, coordinated regulation of time, place, and manner is allowed and is different from suppressing the assembly.",
    "legal": "Batas Pambansa 880 (Public Assembly Act)."
  },
  {
    "id": 38,
    "category": "Police Conduct",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A person is stopped and frisked without any specific suspicious circumstance, just because of how they look.",
    "choices": [
      {
        "text": "Physically resist the search on the spot.",
        "pts": 0
      },
      {
        "text": "Immediately consent to any search to avoid trouble.",
        "pts": 1
      },
      {
        "text": "Politely ask for the legal basis of the search and note officer details, since baseless searches can be challenged.",
        "pts": 2
      }
    ],
    "answer": "Searches generally require a warrant or a recognized exception based on specific facts, not appearance alone.",
    "legal": "Bill of Rights, protection against unreasonable searches and seizures."
  },
  {
    "id": 39,
    "category": "Police Conduct",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A detainee reports being slapped by an officer during questioning to force a confession.",
    "choices": [
      {
        "text": "Confess to whatever is asked just to stop the mistreatment.",
        "pts": 0
      },
      {
        "text": "Say nothing out of fear of retaliation.",
        "pts": 1
      },
      {
        "text": "Document any injuries, seek medical examination, and file a complaint with the PNP Internal Affairs Service or the Ombudsman.",
        "pts": 2
      }
    ],
    "answer": "Any coerced confession is inadmissible, and torture or coercion during custody is a serious offense that must be reported.",
    "legal": "RA 9745 (Anti-Torture Act)."
  },
  {
    "id": 40,
    "category": "Police Conduct",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a human rights desk officer, a detainee shows you bruises and says they were coerced into signing a statement.",
    "choices": [
      {
        "text": "Dismiss the complaint since the detainee already signed the statement.",
        "pts": 0
      },
      {
        "text": "Advise the detainee to just accept the statement to avoid more trouble.",
        "pts": 1
      },
      {
        "text": "Document the injuries, refer the detainee for medical and legal assistance, and file the incident for investigation.",
        "pts": 2
      }
    ],
    "answer": "Signed statements obtained through coercion are invalid, and officials must act on credible torture complaints.",
    "legal": "RA 9745 and the Commission on Human Rights mandate."
  },
  {
    "id": 41,
    "category": "Free Expression",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A student is suspended for posting a respectful opinion critical of a school policy on their personal social media.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Peaceful expression of opinion, even critical of authorities, is protected and cannot be punished merely for disagreement.",
    "legal": "1987 Constitution, freedom of expression."
  },
  {
    "id": 42,
    "category": "Free Expression",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A student is disciplined for posting content that contains direct threats of violence against a classmate.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Threats of violence are not protected speech and can be validly subject to discipline.",
    "legal": "Freedom of expression has limits where it endangers others; school codes of conduct may apply."
  },
  {
    "id": 43,
    "category": "Free Expression",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "Organizers apply for a rally permit, but the mayor's office ignores the application without any response.",
    "choices": [
      {
        "text": "Hold the rally without any notice or documentation of the application.",
        "pts": 0
      },
      {
        "text": "Cancel the rally entirely since there was no explicit approval.",
        "pts": 1
      },
      {
        "text": "Follow up formally and know that under the law, failure to act within the required period is treated as approval.",
        "pts": 2
      }
    ],
    "answer": "The Public Assembly Act sets a response deadline; silence beyond it is treated as permission.",
    "legal": "Batas Pambansa 880 (Public Assembly Act)."
  },
  {
    "id": 44,
    "category": "Free Expression",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A columnist is sued for libel after writing a fact-based critical opinion piece about a public official's performance.",
    "choices": [
      {
        "text": "Ignore the lawsuit completely.",
        "pts": 0
      },
      {
        "text": "Immediately retract the article and apologize without seeking legal advice.",
        "pts": 1
      },
      {
        "text": "Seek legal counsel to assert fair comment on matters of public interest as a defense.",
        "pts": 2
      }
    ],
    "answer": "Fair, fact-based commentary on public officials' performance is given latitude under freedom of the press principles.",
    "legal": "Constitutional press freedom and jurisprudence on fair comment."
  },
  {
    "id": 45,
    "category": "Free Expression",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a local official, you must decide whether to grant a rally permit for a group critical of your own administration.",
    "choices": [
      {
        "text": "Grant it but assign excessive restrictions to discourage attendance.",
        "pts": 0
      },
      {
        "text": "Deny the permit citing 'peace and order' without any specific factual basis.",
        "pts": 1
      },
      {
        "text": "Grant the permit if requirements are met, regardless of the group's viewpoint, since content-based denial is unconstitutional.",
        "pts": 2
      }
    ],
    "answer": "Permits cannot be denied based on the viewpoint of the speech; only content-neutral, narrowly tailored conditions are allowed.",
    "legal": "Batas Pambansa 880 and constitutional freedom of assembly."
  },
  {
    "id": 46,
    "category": "Press Freedom",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A journalist covering a public demonstration is detained and has their camera confiscated without a warrant.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Journalists have a right to cover public events, and equipment cannot be seized without proper legal basis.",
    "legal": "Constitutional press freedom and protection against unreasonable seizure."
  },
  {
    "id": 47,
    "category": "Press Freedom",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A journalist is allowed to freely photograph a public rally from a safe, designated media area.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Allowing press access to cover public events is consistent with press freedom protections.",
    "legal": "1987 Constitution, freedom of the press."
  },
  {
    "id": 48,
    "category": "Press Freedom",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A news outlet receives a cease-and-desist letter threatening a lawsuit over a critical but accurate investigative report.",
    "choices": [
      {
        "text": "Ignore the letter and make no preparations at all.",
        "pts": 0
      },
      {
        "text": "Take the story down immediately without checking the facts.",
        "pts": 1
      },
      {
        "text": "Verify the facts are solid, keep sources and documentation ready, and consult legal counsel rather than retracting immediately.",
        "pts": 2
      }
    ],
    "answer": "Truthful, well-documented reporting on matters of public interest is protected, and outlets should prepare a proper legal response.",
    "legal": "Constitutional press freedom and libel jurisprudence on truth as a defense."
  },
  {
    "id": 49,
    "category": "Press Freedom",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A community blogger is asked by local officials to reveal an anonymous source who exposed alleged corruption.",
    "choices": [
      {
        "text": "Delete the story to make the issue disappear.",
        "pts": 0
      },
      {
        "text": "Reveal the source immediately to avoid conflict with officials.",
        "pts": 1
      },
      {
        "text": "Politely decline, citing the ethical and, in relevant cases, legal protection of confidential sources.",
        "pts": 2
      }
    ],
    "answer": "Source confidentiality is a core press freedom principle that protects whistleblowers and the public's right to information.",
    "legal": "RA 53 (Sotto Law) protecting confidentiality of news sources."
  },
  {
    "id": 50,
    "category": "Press Freedom",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a campus paper adviser, the school administration pressures you to censor a student article critical of the administration.",
    "choices": [
      {
        "text": "Publish the article without reviewing it for factual accuracy at all.",
        "pts": 0
      },
      {
        "text": "Comply with the censorship request to avoid conflict with the administration.",
        "pts": 1
      },
      {
        "text": "Support the students' right to publish factual, responsibly written criticism, consistent with campus press freedom protections.",
        "pts": 2
      }
    ],
    "answer": "Campus journalists have specific legal protection against arbitrary censorship of responsible reporting.",
    "legal": "RA 7079 (Campus Journalism Act)."
  },
  {
    "id": 51,
    "category": "Women's Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A woman is repeatedly threatened and controlled financially by her husband, who monitors and restricts all her spending.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Economic abuse and psychological intimidation within intimate relationships are recognized forms of violence against women.",
    "legal": "RA 9262 (Anti-Violence Against Women and Their Children Act)."
  },
  {
    "id": 52,
    "category": "Women's Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A couple has a respectful disagreement about household budgeting and resolves it through calm discussion.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Ordinary disagreements resolved respectfully are not violence; VAWC concerns abuse, threats, and coercive control.",
    "legal": "RA 9262 concerns patterns of abuse, not normal disagreements."
  },
  {
    "id": 53,
    "category": "Women's Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A woman wants to leave an abusive relationship but is afraid because her partner threatened to take the children.",
    "choices": [
      {
        "text": "Leave immediately without seeking any legal protection.",
        "pts": 0
      },
      {
        "text": "Stay in the relationship to avoid the threat being carried out.",
        "pts": 1
      },
      {
        "text": "Seek a Barangay Protection Order or Temporary Protection Order and coordinate with DSWD or a women's desk for safety planning.",
        "pts": 2
      }
    ],
    "answer": "Protection orders under VAWC can address custody-related threats and provide immediate legal safety measures.",
    "legal": "RA 9262 protection order provisions."
  },
  {
    "id": 54,
    "category": "Women's Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A pregnant employee is demoted and later dismissed shortly after informing her employer of her pregnancy.",
    "choices": [
      {
        "text": "Resign quietly without filing any complaint.",
        "pts": 0
      },
      {
        "text": "Accept the demotion since the employer 'has the right to decide.'",
        "pts": 1
      },
      {
        "text": "File a complaint with DOLE, since dismissal or discrimination due to pregnancy is illegal.",
        "pts": 2
      }
    ],
    "answer": "The law explicitly prohibits discrimination against women due to pregnancy or marital status in employment.",
    "legal": "RA 9710 (Magna Carta of Women) and Labor Code anti-discrimination provisions."
  },
  {
    "id": 55,
    "category": "Women's Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a barangay VAWC desk officer, a woman reports abuse but says she's scared to file formally because her partner is a local official.",
    "choices": [
      {
        "text": "Tell her to handle it privately with the official instead.",
        "pts": 0
      },
      {
        "text": "Suggest she reconsider filing since the abuser holds a position of influence.",
        "pts": 1
      },
      {
        "text": "Assure confidentiality, explain protection order options, and connect her with DSWD or a women's crisis center regardless of the abuser's status.",
        "pts": 2
      }
    ],
    "answer": "No one is above VAWC protections, and officers must prioritize the survivor's safety and confidentiality.",
    "legal": "RA 9262 and the Magna Carta of Women."
  },
  {
    "id": 56,
    "category": "Safe Spaces",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A woman is repeatedly catcalled and followed by strangers while walking home, despite showing clear discomfort.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Catcalling, wolf-whistling, and persistent unwanted following in public spaces are punishable acts of gender-based street harassment.",
    "legal": "RA 11313 (Safe Spaces Act)."
  },
  {
    "id": 57,
    "category": "Safe Spaces",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A stranger politely asks for directions and thanks the person before walking away.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "A brief, respectful, non-threatening interaction is not harassment.",
    "legal": "RA 11313 targets unwanted, threatening, or persistent conduct, not ordinary polite interactions."
  },
  {
    "id": 58,
    "category": "Safe Spaces",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An employee receives repeated unwanted comments about their appearance from a coworker despite asking them to stop.",
    "choices": [
      {
        "text": "Confront the coworker with threats of physical harm.",
        "pts": 0
      },
      {
        "text": "Avoid the coworker quietly without reporting anything.",
        "pts": 1
      },
      {
        "text": "Report the conduct in writing to HR, since employers are required to have a mechanism for handling such complaints.",
        "pts": 2
      }
    ],
    "answer": "Employers are legally required to have anti-sexual-harassment mechanisms and act on valid complaints.",
    "legal": "RA 11313 and RA 7877 (Anti-Sexual Harassment Act)."
  },
  {
    "id": 59,
    "category": "Safe Spaces",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A commuter is groped by a stranger on a crowded jeepney.",
    "choices": [
      {
        "text": "Physically retaliate with excessive force beyond what's needed to get away safely.",
        "pts": 0
      },
      {
        "text": "Stay silent and just move away quietly.",
        "pts": 1
      },
      {
        "text": "Loudly call out the act to alert others, and report to the nearest authority or file a complaint, since evidence and witnesses help.",
        "pts": 2
      }
    ],
    "answer": "Public sexual harassment, including groping on public transport, is a specific offense that can and should be reported.",
    "legal": "RA 11313 (Safe Spaces Act), public spaces provisions."
  },
  {
    "id": 60,
    "category": "Safe Spaces",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As an HR officer, you receive a harassment complaint against a senior manager who is well-liked and has strong performance numbers.",
    "choices": [
      {
        "text": "Dismiss the complaint since the manager is a top performer.",
        "pts": 0
      },
      {
        "text": "Quietly ask the manager to be more careful without a formal investigation.",
        "pts": 1
      },
      {
        "text": "Follow the same formal investigation process regardless of the accused's position or performance.",
        "pts": 2
      }
    ],
    "answer": "Fair process requires equal application of harassment procedures, regardless of an accused's status or contribution.",
    "legal": "RA 11313 and RA 7877 due process requirements for harassment complaints."
  },
  {
    "id": 61,
    "category": "Disability Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A wheelchair user is denied entry to a public office because there is no ramp and staff refuse to assist another way.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Public establishments and offices are required to provide accessible facilities and reasonable accommodation for persons with disabilities.",
    "legal": "RA 7277 (Magna Carta for Disabled Persons) as amended by RA 9442 and the Accessibility Law (BP 344)."
  },
  {
    "id": 62,
    "category": "Disability Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A mall provides ramps, accessible restrooms, and priority lanes for persons with disabilities.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Providing accessible facilities is exactly what accessibility law requires of public establishments.",
    "legal": "BP 344 (Accessibility Law)."
  },
  {
    "id": 63,
    "category": "Disability Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A qualified applicant with a disability is rejected for a job solely because of their disability, despite being able to perform the tasks.",
    "choices": [
      {
        "text": "Give up on applying to any job again.",
        "pts": 0
      },
      {
        "text": "Accept the rejection since some employers 'prefer' non-disabled applicants.",
        "pts": 1
      },
      {
        "text": "Point out that disability-based rejection when the person is qualified is illegal discrimination, and file a complaint if needed.",
        "pts": 2
      }
    ],
    "answer": "Discrimination in employment based solely on disability, where the person is otherwise qualified, is prohibited by law.",
    "legal": "RA 7277 as amended by RA 10524, employment provisions for PWDs."
  },
  {
    "id": 64,
    "category": "Disability Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A PWD cardholder is refused the mandated discount at a pharmacy because the cashier says it's 'against store policy.'",
    "choices": [
      {
        "text": "Shout at the cashier and cause a scene.",
        "pts": 0
      },
      {
        "text": "Pay full price to avoid an argument.",
        "pts": 1
      },
      {
        "text": "Politely cite the PWD discount law and, if refused, report the establishment to the DTI or local government.",
        "pts": 2
      }
    ],
    "answer": "The PWD discount is a national mandate that store policy cannot override.",
    "legal": "RA 9442, PWD discounts and privileges."
  },
  {
    "id": 65,
    "category": "Disability Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a school administrator, a parent requests reasonable accommodations for their child with a learning disability, but some teachers resist changing routines.",
    "choices": [
      {
        "text": "Approve accommodations on paper but don't ensure teachers actually follow them.",
        "pts": 0
      },
      {
        "text": "Tell the parent the school cannot make any changes to routines.",
        "pts": 1
      },
      {
        "text": "Coordinate an individualized learning plan with teachers and specialists, since reasonable accommodation is a legal obligation, not optional.",
        "pts": 2
      }
    ],
    "answer": "Inclusive education laws require actual implementation of reasonable accommodations, not just formal approval.",
    "legal": "RA 11650 (Inclusive Education Act) and RA 7277."
  },
  {
    "id": 66,
    "category": "Indigenous Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A mining company begins operations on ancestral land without securing the Free, Prior, and Informed Consent of the indigenous community.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Any project on ancestral domain requires the community's Free, Prior, and Informed Consent before it can proceed.",
    "legal": "RA 8371 (Indigenous Peoples' Rights Act, IPRA)."
  },
  {
    "id": 67,
    "category": "Indigenous Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A company holds community consultations, secures documented consent, and pays required royalties before operating within an ancestral domain.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Securing FPIC and complying with royalty requirements is exactly what the law requires before operating in ancestral domains.",
    "legal": "RA 8371 (IPRA)."
  },
  {
    "id": 68,
    "category": "Indigenous Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An indigenous community's traditional council decision is ignored by a local government unit planning a road project through their land.",
    "choices": [
      {
        "text": "Block the road physically without pursuing any formal process.",
        "pts": 0
      },
      {
        "text": "Let the project proceed since it's for 'public benefit.'",
        "pts": 1
      },
      {
        "text": "Insist that FPIC processes be followed and involve the NCIP to mediate before construction proceeds.",
        "pts": 2
      }
    ],
    "answer": "Government projects on ancestral domains still require proper FPIC consultation through the NCIP.",
    "legal": "RA 8371 and NCIP administrative guidelines."
  },
  {
    "id": 69,
    "category": "Indigenous Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A school refuses to accommodate an indigenous student's traditional dress and practices during a cultural event.",
    "choices": [
      {
        "text": "Ignore the issue since it involves only one student.",
        "pts": 0
      },
      {
        "text": "Tell the student to just comply with the standard dress code.",
        "pts": 1
      },
      {
        "text": "Point out that cultural rights and expression of indigenous identity are protected and should be respected in school policy.",
        "pts": 2
      }
    ],
    "answer": "IPRA recognizes the right of indigenous peoples to practice and preserve their culture, including in public institutions.",
    "legal": "RA 8371, cultural integrity provisions."
  },
  {
    "id": 70,
    "category": "Indigenous Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As an NCIP field officer, you find a logging permit was issued for ancestral land without proper community consultation.",
    "choices": [
      {
        "text": "Ignore the issue since the permit was already issued by another agency.",
        "pts": 0
      },
      {
        "text": "Allow logging to continue while consultation is arranged later.",
        "pts": 1
      },
      {
        "text": "Flag the permit for review and require a proper FPIC process before any logging operations continue.",
        "pts": 2
      }
    ],
    "answer": "A permit issued without FPIC is invalid under IPRA, and operations must stop until due process is followed.",
    "legal": "RA 8371 FPIC requirements and NCIP oversight authority."
  },
  {
    "id": 71,
    "category": "Equality & Non-Discrimination",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A qualified applicant is rejected for a job after the interviewer learns of their sexual orientation, despite strong qualifications.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Rejecting a qualified applicant based on sexual orientation is discriminatory and violates equal protection and several local anti-discrimination ordinances.",
    "legal": "Local SOGIE ordinances (where enacted) and constitutional equal protection."
  },
  {
    "id": 72,
    "category": "Equality & Non-Discrimination",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A company hires the most qualified candidate for the role regardless of their gender identity or sexual orientation.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Hiring based on merit and qualifications, without regard to SOGIE, is the correct, lawful approach.",
    "legal": "Equal protection principles and local anti-discrimination ordinances."
  },
  {
    "id": 73,
    "category": "Equality & Non-Discrimination",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A transgender student is barred from using either restroom aligned with their gender identity or a private option at school.",
    "choices": [
      {
        "text": "Ignore the issue as not the school's concern.",
        "pts": 0
      },
      {
        "text": "Tell the student to just avoid using restrooms at school.",
        "pts": 1
      },
      {
        "text": "Raise the issue with school administration and advocate for a safe, dignified restroom option consistent with local policy or ordinance.",
        "pts": 2
      }
    ],
    "answer": "Schools should ensure access to safe facilities for all students; many localities have SOGIE-related policies addressing this.",
    "legal": "Local SOGIE ordinances and DepEd child protection policy."
  },
  {
    "id": 74,
    "category": "Equality & Non-Discrimination",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A same-sex couple is refused service at a restaurant that says it does not 'cater to their kind.'",
    "choices": [
      {
        "text": "Argue loudly and threaten the staff.",
        "pts": 0
      },
      {
        "text": "Leave quietly and avoid the establishment in the future.",
        "pts": 1
      },
      {
        "text": "Document the incident and file a complaint under a local anti-discrimination ordinance where one exists.",
        "pts": 2
      }
    ],
    "answer": "In localities with SOGIE ordinances, refusing service based on sexual orientation is an actionable violation.",
    "legal": "Local government SOGIE equality ordinances."
  },
  {
    "id": 75,
    "category": "Equality & Non-Discrimination",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As an HR manager in a city with a SOGIE ordinance, you must decide on a dress code policy after an employee requests to dress consistent with their gender identity.",
    "choices": [
      {
        "text": "Allow it informally without updating any written policy at all.",
        "pts": 0
      },
      {
        "text": "Keep the strict binary dress code unchanged and deny the request.",
        "pts": 1
      },
      {
        "text": "Update the policy to reasonably accommodate gender identity, consistent with the local ordinance and dignity of the employee.",
        "pts": 2
      }
    ],
    "answer": "Formal, consistent policy accommodation is the more durable and legally sound approach where local ordinances protect SOGIE.",
    "legal": "Local SOGIE equality ordinances and labor standards on non-discrimination."
  },
  {
    "id": 76,
    "category": "Health Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A public hospital refuses to give emergency treatment to an accident victim until a down payment is made.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Hospitals, public or private, cannot refuse emergency care or demand advance payment before stabilizing a patient.",
    "legal": "RA 8344 (Anti-Hospital Deposit Law) and the Universal Health Care Act."
  },
  {
    "id": 77,
    "category": "Health Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A public hospital stabilizes an emergency patient first and discusses payment arrangements only afterward.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Stabilizing first and discussing payment afterward is exactly what the law requires for emergency cases.",
    "legal": "RA 8344 and RA 11223 (Universal Health Care Act)."
  },
  {
    "id": 78,
    "category": "Health Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A PhilHealth member is told their claim was denied for a covered procedure with no clear explanation given.",
    "choices": [
      {
        "text": "Give up on the claim entirely.",
        "pts": 0
      },
      {
        "text": "Just pay out of pocket without questioning the denial.",
        "pts": 1
      },
      {
        "text": "Request a written explanation and appeal the denial through PhilHealth's grievance process.",
        "pts": 2
      }
    ],
    "answer": "Members have a right to a clear explanation and to appeal claim denials.",
    "legal": "RA 11223 (Universal Health Care Act) and PhilHealth grievance procedures."
  },
  {
    "id": 79,
    "category": "Health Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A barangay health worker refuses to give a patient their own medical records when requested for a second opinion.",
    "choices": [
      {
        "text": "Sneak into the records office to take the file without authorization.",
        "pts": 0
      },
      {
        "text": "Accept the refusal and forgo the second opinion.",
        "pts": 1
      },
      {
        "text": "Cite the patient's right to access their own health records and request them formally in writing.",
        "pts": 2
      }
    ],
    "answer": "Patients have a right to their own medical information to make informed healthcare decisions.",
    "legal": "Data Privacy Act provisions on access to personal health information and DOH regulations."
  },
  {
    "id": 80,
    "category": "Health Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a rural health unit head, budget constraints tempt you to prioritize paying patients over indigent patients needing the same urgent care.",
    "choices": [
      {
        "text": "Turn away indigent patients and refer them elsewhere without assistance.",
        "pts": 0
      },
      {
        "text": "Prioritize paying patients to keep the health unit financially afloat.",
        "pts": 1
      },
      {
        "text": "Provide care based on medical urgency, not ability to pay, and seek additional funding or referral support for indigent patients.",
        "pts": 2
      }
    ],
    "answer": "The Universal Health Care Act enshrines equitable access to care regardless of ability to pay.",
    "legal": "RA 11223 (Universal Health Care Act)."
  },
  {
    "id": 81,
    "category": "Consumer Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A store sells expired canned goods without any warning label or discount disclosure to customers.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Selling expired goods without proper disclosure endangers consumers and violates consumer protection law.",
    "legal": "RA 7394 (Consumer Act of the Philippines)."
  },
  {
    "id": 82,
    "category": "Consumer Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A store clearly labels discounted near-expiry items and pulls truly expired stock from shelves.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Clear labeling and removing expired stock is compliant consumer protection practice.",
    "legal": "RA 7394 (Consumer Act)."
  },
  {
    "id": 83,
    "category": "Consumer Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A customer buys a defective appliance, and the store refuses a refund or repair, citing 'no return policy.'",
    "choices": [
      {
        "text": "Damage store property in frustration.",
        "pts": 0
      },
      {
        "text": "Accept the loss and never shop there again.",
        "pts": 1
      },
      {
        "text": "Cite the implied warranty against hidden defects and file a complaint with the DTI if the store still refuses.",
        "pts": 2
      }
    ],
    "answer": "Consumers are protected against hidden defects, and DTI can mediate or penalize non-compliant sellers.",
    "legal": "RA 7394, warranty against hidden defects, and DTI consumer complaint process."
  },
  {
    "id": 84,
    "category": "Consumer Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An online seller advertises one price but charges a higher amount at checkout without clear disclosure.",
    "choices": [
      {
        "text": "Leave a single angry comment and take no further action.",
        "pts": 0
      },
      {
        "text": "Just pay the higher price to avoid hassle.",
        "pts": 1
      },
      {
        "text": "Report the deceptive pricing to the e-commerce platform and the DTI, since misleading advertising is prohibited.",
        "pts": 2
      }
    ],
    "answer": "Deceptive or misleading sales practices, including bait pricing, are prohibited and can be reported for enforcement.",
    "legal": "RA 7394 and the E-Commerce Act (RA 8792)."
  },
  {
    "id": 85,
    "category": "Consumer Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a DTI mediator, a small vendor claims a large supplier is forcing unfair, one-sided contract terms on them.",
    "choices": [
      {
        "text": "Automatically side with the larger, more established supplier.",
        "pts": 0
      },
      {
        "text": "Tell the vendor that contracts, once signed, cannot be questioned at all.",
        "pts": 1
      },
      {
        "text": "Review the contract terms for unconscionable provisions and facilitate a fair renegotiation between the parties.",
        "pts": 2
      }
    ],
    "answer": "Consumer and fair trade protections extend to unfair contract terms, and mediators must assess fairness, not just seniority.",
    "legal": "RA 7394 and Civil Code provisions on unconscionable contracts."
  },
  {
    "id": 86,
    "category": "Digital Privacy",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A company sells its customers' personal contact information to a marketing firm without asking for consent.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Selling personal data without consent or a lawful basis is a violation of data privacy law.",
    "legal": "RA 10173 (Data Privacy Act of 2012)."
  },
  {
    "id": 87,
    "category": "Digital Privacy",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "An app clearly asks for consent and explains how customer data will be used before collecting any personal information.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Clear consent and transparent disclosure is exactly what data privacy law requires.",
    "legal": "RA 10173 (Data Privacy Act)."
  },
  {
    "id": 88,
    "category": "Digital Privacy",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A person discovers a lending app has been texting their entire contact list to shame them over a missed payment.",
    "choices": [
      {
        "text": "Ignore the messages and hope they stop on their own.",
        "pts": 0
      },
      {
        "text": "Just pay immediately to make the messages stop.",
        "pts": 1
      },
      {
        "text": "File a complaint with the National Privacy Commission, since unauthorized use of contacts for shaming is a serious violation.",
        "pts": 2
      }
    ],
    "answer": "Using contact lists to harass or shame debtors is a well-documented violation actively pursued by the NPC.",
    "legal": "RA 10173 (Data Privacy Act) and NPC advisory opinions on online lending apps."
  },
  {
    "id": 89,
    "category": "Digital Privacy",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A school posts students' full names, grades, and photos publicly online without consent from parents or students.",
    "choices": [
      {
        "text": "Report the school to unrelated authorities instead of raising the privacy issue directly.",
        "pts": 0
      },
      {
        "text": "Assume it's fine since it's for a school achievement announcement.",
        "pts": 1
      },
      {
        "text": "Ask the school to take down the post and obtain proper consent before posting personal data of minors.",
        "pts": 2
      }
    ],
    "answer": "Publishing minors' personal data without consent, even for good intentions, violates data privacy safeguards for children.",
    "legal": "RA 10173 and its provisions on sensitive personal information of minors."
  },
  {
    "id": 90,
    "category": "Digital Privacy",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a company's data protection officer, you discover a breach exposing customer data but management wants to delay disclosure to avoid bad press.",
    "choices": [
      {
        "text": "Quietly patch the issue without informing anyone, including regulators.",
        "pts": 0
      },
      {
        "text": "Delay disclosure until the company decides it's a good time to announce it.",
        "pts": 1
      },
      {
        "text": "Insist on timely notification to the National Privacy Commission and affected individuals, as required by law.",
        "pts": 2
      }
    ],
    "answer": "The Data Privacy Act mandates prompt breach notification; delaying it for PR reasons is a legal violation.",
    "legal": "RA 10173, mandatory breach notification rules."
  },
  {
    "id": 91,
    "category": "Environmental Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A factory discharges untreated wastewater directly into a river used by nearby communities for washing and fishing.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Discharging untreated pollutants into public waterways violates environmental protection laws designed to safeguard public health.",
    "legal": "RA 9275 (Philippine Clean Water Act)."
  },
  {
    "id": 92,
    "category": "Environmental Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A factory installs a wastewater treatment facility and regularly submits water quality reports to the environment agency.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Treating wastewater and reporting compliance is exactly what environmental law requires of industrial operators.",
    "legal": "RA 9275 (Clean Water Act)."
  },
  {
    "id": 93,
    "category": "Environmental Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "Residents notice thick smoke regularly coming from a nearby facility with no visible pollution controls.",
    "choices": [
      {
        "text": "Confront the facility owners directly and demand they shut down immediately.",
        "pts": 0
      },
      {
        "text": "Just keep windows closed and say nothing.",
        "pts": 1
      },
      {
        "text": "Report the emissions to the local environment office or DENR for inspection and possible violation of air quality standards.",
        "pts": 2
      }
    ],
    "answer": "Community members can file complaints for DENR to investigate potential air quality violations.",
    "legal": "RA 8749 (Philippine Clean Air Act)."
  },
  {
    "id": 94,
    "category": "Environmental Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A community learns a proposed quarry project near their homes has no environmental impact assessment on record.",
    "choices": [
      {
        "text": "Sabotage construction equipment to stop the project.",
        "pts": 0
      },
      {
        "text": "Assume the project is fine since it hasn't started yet.",
        "pts": 1
      },
      {
        "text": "Request the Environmental Compliance Certificate and formally raise concerns during public consultation before the project proceeds.",
        "pts": 2
      }
    ],
    "answer": "Projects with significant environmental impact require an ECC obtained only after proper assessment and public consultation.",
    "legal": "PD 1586 (Environmental Impact Statement System)."
  },
  {
    "id": 95,
    "category": "Environmental Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a DENR field officer, you find a mining operation exceeding its permitted extraction area, affecting a nearby watershed.",
    "choices": [
      {
        "text": "Ignore the excess since the company employs many local workers.",
        "pts": 0
      },
      {
        "text": "Give an informal warning and let the company self-correct without documentation.",
        "pts": 1
      },
      {
        "text": "Issue a formal violation notice, order corrective action, and escalate for permit review if the excess extraction continues.",
        "pts": 2
      }
    ],
    "answer": "Environmental violations require formal, documented enforcement regardless of the operator's economic contribution.",
    "legal": "Philippine Mining Act (RA 7942) and DENR enforcement mandate."
  },
  {
    "id": 96,
    "category": "Migrant Worker Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A recruitment agency charges an overseas job applicant fees far exceeding the legal placement fee limit.",
    "choices": [
      {
        "text": "Yes, this is a rights violation.",
        "pts": 2
      },
      {
        "text": "No, this is acceptable.",
        "pts": 0
      }
    ],
    "answer": "Recruitment agencies are limited by law in how much they may charge in placement fees.",
    "legal": "RA 8042 as amended by RA 10022 (Migrant Workers Act)."
  },
  {
    "id": 97,
    "category": "Migrant Worker Rights",
    "difficulty": "easy",
    "type": "identification",
    "scenario": "A recruitment agency charges only the legally allowed placement fee and provides a signed, itemized receipt.",
    "choices": [
      {
        "text": "No, this is within the law.",
        "pts": 2
      },
      {
        "text": "Yes, this is a violation.",
        "pts": 0
      }
    ],
    "answer": "Charging within the legal limit and providing documentation is exactly what the law requires of agencies.",
    "legal": "RA 8042 as amended by RA 10022."
  },
  {
    "id": 98,
    "category": "Migrant Worker Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "An OFW's passport is confiscated by their foreign employer, who says it's 'for safekeeping.'",
    "choices": [
      {
        "text": "Try to secretly retrieve it without informing any authority.",
        "pts": 0
      },
      {
        "text": "Let the employer keep it since 'it's common practice.'",
        "pts": 1
      },
      {
        "text": "Report the passport confiscation to the Philippine embassy or POLO, since this is illegal and restricts the worker's freedom.",
        "pts": 2
      }
    ],
    "answer": "Confiscating a worker's passport is a recognized form of forced labor and must be reported to Philippine authorities abroad.",
    "legal": "RA 8042/10022 and international labor standards against forced labor."
  },
  {
    "id": 99,
    "category": "Migrant Worker Rights",
    "difficulty": "medium",
    "type": "mcq",
    "scenario": "A departing OFW discovers their contract details differ from what was verbally promised by the recruiter.",
    "choices": [
      {
        "text": "Cancel all plans without seeking clarification or assistance first.",
        "pts": 0
      },
      {
        "text": "Sign anyway and hope the verbal promises are honored.",
        "pts": 1
      },
      {
        "text": "Insist on a copy of the POEA-verified contract and clarify discrepancies before departure.",
        "pts": 2
      }
    ],
    "answer": "Only the officially verified contract is enforceable, so workers should ensure it matches what was promised before leaving.",
    "legal": "POEA rules on standard employment contracts for OFWs."
  },
  {
    "id": 100,
    "category": "Migrant Worker Rights",
    "difficulty": "hard",
    "type": "roleplay",
    "scenario": "As a POLO welfare officer abroad, an OFW reports unpaid wages and unsafe housing conditions from their employer.",
    "choices": [
      {
        "text": "Tell the worker to handle it directly with the employer without institutional support.",
        "pts": 0
      },
      {
        "text": "Advise the worker to endure it until the contract ends.",
        "pts": 1
      },
      {
        "text": "Document the complaint, coordinate with local authorities, and pursue restitution and safer housing for the worker.",
        "pts": 2
      }
    ],
    "answer": "Welfare officers are mandated to actively assist and protect OFWs facing labor abuses abroad.",
    "legal": "RA 8042/10022, OFW welfare protection mandate."
  }
];

if (typeof module !== "undefined") module.exports = { CARD_POOL };
