export type Language = 'en' | 'fr';

export interface WeekEvent {
  id: string;
  flag: string;
  country: string;
  city: string;
  title: string;
  date: string; // human-readable
  isoDate: string; // machine-readable, for the countdown
  time: string;
  venue: string;
  address: string;
  dressCode: string;
  mapUrl: string;
  cultural: string;
  accent: 'kente' | 'indigo';
}

export interface TravelItem {
  title: string;
  body: string;
}

export interface Dictionary {
  nav: {
    story: string;
    week: string;
    gallery: string;
    travel: string;
    rsvp: string;
    langLabel: string;
  };
  hero: {
    kicker: string;
    and: string;
    tagline: string;
    dates: string;
    cta: string;
    scroll: string;
    bride: string;
    groom: string;
  };
  story: {
    kicker: string;
    title: string;
    paragraphs: string[];
  };
  week: {
    kicker: string;
    title: string;
    intro: string;
    labels: {
      when: string;
      where: string;
      dress: string;
      map: string;
      culture: string;
    };
    events: WeekEvent[];
  };
  gallery: {
    kicker: string;
    title: string;
    intro: string;
    empty: string;
  };
  travel: {
    kicker: string;
    title: string;
    intro: string;
    items: TravelItem[];
  };
  rsvp: {
    kicker: string;
    title: string;
    intro: string;
    fields: {
      name: string;
      email: string;
      attendingGhana: string;
      attendingSenegal: string;
      partySize: string;
      dietary: string;
      dietaryPlaceholder: string;
      message: string;
      messagePlaceholder: string;
    };
    submit: string;
    submitting: string;
    successTitle: string;
    successBody: string;
    another: string;
    errorGeneric: string;
    errorEmail: string;
    errorName: string;
    errorAttend: string;
    confirmationNote: string;
  };
  countdown: {
    kicker: string;
    title: string;
    to: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    passed: string;
  };
  footer: {
    madeWith: string;
    hashtag: string;
  };
  admin: {
    title: string;
    passwordLabel: string;
    login: string;
    wrongPassword: string;
    logout: string;
    total: string;
    ghana: string;
    senegal: string;
    guests: string;
    exportCsv: string;
    noRsvps: string;
    colName: string;
    colEmail: string;
    colGhana: string;
    colSenegal: string;
    colParty: string;
    colDietary: string;
    colMessage: string;
    colDate: string;
    yes: string;
    no: string;
  };
}

const ghanaEventEn: WeekEvent = {
  id: 'ghana',
  flag: '🇬🇭',
  country: 'Ghana',
  city: 'Accra',
  title: 'The Traditional Ceremony',
  date: 'Saturday, 19 December 2026',
  isoDate: '2026-12-19T10:00:00+00:00',
  time: '10:00 — knocking & rites, followed by a reception',
  venue: 'Labadi Beach Gardens',
  address: 'La Beach Road, Accra, Ghana',
  dressCode: 'Kente & bright wax prints — colour is a blessing',
  mapUrl: 'https://maps.google.com/?q=Labadi+Beach+Accra+Ghana',
  cultural:
    'The day opens with the knocking ceremony (Kↄkↄↄkↄ), where the groom’s family formally asks for the bride’s hand with gifts, schnapps and proverbs. Expect drumming, the pouring of libation to honour the ancestors, and a lot of joyful dancing.',
  accent: 'kente',
};

const senegalEventEn: WeekEvent = {
  id: 'senegal',
  flag: '🇸🇳',
  country: 'Senegal',
  city: 'Dakar',
  title: 'The Céremonie & Célébration',
  date: 'Wednesday, 23 December 2026',
  isoDate: '2026-12-23T16:00:00+00:00',
  time: '16:00 — ceremony, then dinner under the stars',
  venue: 'Terrou-Bi, Corniche Ouest',
  address: 'Boulevard Martin Luther King, Dakar, Senegal',
  dressCode: 'Elegant boubous, grand-boubou & indigo — teranga finery',
  mapUrl: 'https://maps.google.com/?q=Terrou-Bi+Dakar+Senegal',
  cultural:
    'In the spirit of teranga (Senegalese hospitality), the celebration blends the takk (the marriage blessing) with sabar drumming and mbalax rhythms. Guests are welcomed like family — come ready to eat well, dance late, and be draped in indigo.',
  accent: 'indigo',
};

const ghanaEventFr: WeekEvent = {
  ...ghanaEventEn,
  title: 'La Cérémonie Traditionnelle',
  date: 'Samedi 19 décembre 2026',
  time: '10h00 — rites du « knocking », suivis d’une réception',
  venue: 'Labadi Beach Gardens',
  address: 'La Beach Road, Accra, Ghana',
  dressCode: 'Kente & wax éclatants — la couleur est une bénédiction',
  cultural:
    'La journée s’ouvre par la cérémonie du « knocking » (Kↄkↄↄkↄ) : la famille du marié demande officiellement la main de la mariée avec des présents, du schnaps et des proverbes. Au programme : tambours, libations en l’honneur des ancêtres et beaucoup de danse.',
};

const senegalEventFr: WeekEvent = {
  ...senegalEventEn,
  title: 'La Cérémonie & la Célébration',
  date: 'Mercredi 23 décembre 2026',
  time: '16h00 — cérémonie, puis dîner sous les étoiles',
  dressCode: 'Boubous élégants, grand-boubou & indigo — la parure de la teranga',
  cultural:
    'Dans l’esprit de la teranga (l’hospitalité sénégalaise), la fête mêle le takk (la bénédiction du mariage) aux tambours sabar et aux rythmes mbalax. On accueille les invités comme la famille : venez prêts à bien manger, danser tard et vous draper d’indigo.',
};

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      story: 'Our Story',
      week: 'The Week',
      gallery: 'Gallery',
      travel: 'Travel & Stay',
      rsvp: 'RSVP',
      langLabel: 'Language',
    },
    hero: {
      kicker: 'We’re getting married',
      and: '&',
      tagline: 'Two countries, one week, a lifetime of celebration.',
      dates: '19 – 23 December 2026 · Accra & Dakar',
      cta: 'RSVP',
      scroll: 'Scroll',
      bride: 'Faith',
      groom: 'Georges',
    },
    story: {
      kicker: 'Our Story',
      title: 'From co-founders to forever',
      paragraphs: [
        'We met over a whiteboard, not a candlelit dinner. What started as two people building a company together slowly became the best partnership of our lives — in every sense.',
        'Between deadlines and demo days, we discovered we were building something far more important than a business: a home for each other. Ghana met Senegal, Faith met Georges, and it simply made sense.',
        'Now we’re trading pitch decks for wedding vows, and we want to celebrate the way we do everything — together, across both of the cultures that made us.',
      ],
    },
    week: {
      kicker: 'The Week',
      title: 'One week, two celebrations',
      intro:
        'We couldn’t choose between our homes, so we’re not choosing. Join us in Ghana and Senegal in the same joyful week.',
      labels: {
        when: 'When',
        where: 'Where',
        dress: 'Dress code',
        map: 'Open map',
        culture: 'What to expect',
      },
      events: [ghanaEventEn, senegalEventEn],
    },
    gallery: {
      kicker: 'Moments',
      title: 'Photo Gallery',
      intro: 'A few of our favourite frames — more to come after the celebrations.',
      empty:
        'Photos are on their way. Check back soon for pictures from our journey together.',
    },
    travel: {
      kicker: 'Travel & Stay',
      title: 'Getting there & staying a while',
      intro:
        'Two countries in one week is an adventure. Here’s everything you need to travel between Accra and Dakar with ease.',
      items: [
        {
          title: 'Flying into Ghana',
          body: 'Fly into Kotoka International Airport (ACC) in Accra. It is well connected to Europe, the Middle East and the rest of Africa. Most nationalities need a visa or e-visa — arrange yours early.',
        },
        {
          title: 'Flying into Senegal',
          body: 'Blaise Diagne International Airport (DSS) serves Dakar, about 45 minutes from the city centre. Senegal offers visa-free entry for many nationalities — check your requirements before you fly.',
        },
        {
          title: 'Between the two countries',
          body: 'Direct flights connect Accra (ACC) and Dakar (DSS) in around 3–4 hours on carriers such as ASKY, Air Peace and Royal Air Maroc (via Casablanca). We recommend booking the Accra → Dakar leg for 21–22 December.',
        },
        {
          title: 'Where to stay in Accra',
          body: 'We’ve reserved a block near Labadi Beach. Labadi Beach Hotel and Kempinski Gold Coast City are lovely, with easy access to the ceremony and the coast.',
        },
        {
          title: 'Where to stay in Dakar',
          body: 'Terrou-Bi hosts our Senegalese celebration and has rooms on-site. Radisson Blu and Pullman Dakar Teranga are excellent alternatives along the Corniche.',
        },
        {
          title: 'Good to know',
          body: 'Ghana uses the cedi (GHS) and Senegal the CFA franc (XOF). Both celebrations are outdoors and warm — bring light fabrics, sunscreen, and comfortable shoes for dancing.',
        },
      ],
    },
    rsvp: {
      kicker: 'Join us',
      title: 'RSVP',
      intro:
        'Kindly respond by 1 November 2026. Let us know which celebration(s) you’ll join — you’re welcome at both.',
      fields: {
        name: 'Full name',
        email: 'Email',
        attendingGhana: 'I’ll celebrate in Ghana 🇬🇭',
        attendingSenegal: 'I’ll celebrate in Senegal 🇸🇳',
        partySize: 'Number of guests (including you)',
        dietary: 'Dietary notes',
        dietaryPlaceholder: 'Allergies, preferences, anything we should know',
        message: 'A note for the couple',
        messagePlaceholder: 'Share your excitement, a blessing, a song request…',
      },
      submit: 'Send RSVP',
      submitting: 'Sending…',
      successTitle: 'Thank you — we can’t wait to celebrate with you!',
      successBody:
        'Your RSVP has been received. A confirmation has been sent to your email.',
      another: 'Submit another response',
      errorGeneric: 'Something went wrong. Please try again in a moment.',
      errorEmail: 'Please enter a valid email address.',
      errorName: 'Please enter your name.',
      errorAttend: 'Please choose at least one celebration to attend.',
      confirmationNote: 'We’ll send a confirmation to this address.',
    },
    countdown: {
      kicker: 'The countdown',
      title: 'Until we say “I do”',
      to: 'Counting down to Accra',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      passed: 'The celebration has begun! 🎉',
    },
    footer: {
      madeWith: 'Made with love across two continents',
      hashtag: '#FaithSealedUs',
    },
    admin: {
      title: 'RSVP Dashboard',
      passwordLabel: 'Admin password',
      login: 'Enter',
      wrongPassword: 'Incorrect password. Please try again.',
      logout: 'Log out',
      total: 'Total responses',
      ghana: 'Attending Ghana',
      senegal: 'Attending Senegal',
      guests: 'Total guests',
      exportCsv: 'Export CSV',
      noRsvps: 'No RSVPs yet.',
      colName: 'Name',
      colEmail: 'Email',
      colGhana: 'Ghana',
      colSenegal: 'Senegal',
      colParty: 'Party',
      colDietary: 'Dietary',
      colMessage: 'Message',
      colDate: 'Date',
      yes: 'Yes',
      no: 'No',
    },
  },
  fr: {
    nav: {
      story: 'Notre histoire',
      week: 'La semaine',
      gallery: 'Galerie',
      travel: 'Voyage & séjour',
      rsvp: 'RSVP',
      langLabel: 'Langue',
    },
    hero: {
      kicker: 'Nous nous marions',
      and: '&',
      tagline: 'Deux pays, une semaine, toute une vie à célébrer.',
      dates: '19 – 23 décembre 2026 · Accra & Dakar',
      cta: 'RSVP',
      scroll: 'Défiler',
      bride: 'Faith',
      groom: 'Georges',
    },
    story: {
      kicker: 'Notre histoire',
      title: 'De cofondateurs à pour toujours',
      paragraphs: [
        'Nous nous sommes rencontrés devant un tableau blanc, pas autour d’un dîner aux chandelles. Ce qui n’était que deux personnes bâtissant une entreprise est devenu le plus beau partenariat de nos vies — dans tous les sens du terme.',
        'Entre les délais et les journées de démonstration, nous avons compris que nous construisions bien plus qu’une société : un foyer l’un pour l’autre. Le Ghana a rencontré le Sénégal, Faith a rencontré Georges, et tout est devenu évident.',
        'Aujourd’hui, nous échangeons nos présentations d’investisseurs contre des vœux de mariage, et nous voulons célébrer comme nous faisons tout — ensemble, à travers les deux cultures qui nous ont façonnés.',
      ],
    },
    week: {
      kicker: 'La semaine',
      title: 'Une semaine, deux célébrations',
      intro:
        'Impossible de choisir entre nos deux pays — alors nous ne choisissons pas. Rejoignez-nous au Ghana et au Sénégal la même semaine de joie.',
      labels: {
        when: 'Quand',
        where: 'Où',
        dress: 'Tenue',
        map: 'Ouvrir la carte',
        culture: 'À quoi s’attendre',
      },
      events: [ghanaEventFr, senegalEventFr],
    },
    gallery: {
      kicker: 'Instants',
      title: 'Galerie photo',
      intro:
        'Quelques-uns de nos clichés préférés — et bien d’autres après les célébrations.',
      empty:
        'Les photos arrivent. Revenez bientôt pour découvrir des images de notre parcours ensemble.',
    },
    travel: {
      kicker: 'Voyage & séjour',
      title: 'Venir et rester un moment',
      intro:
        'Deux pays en une semaine, c’est une aventure. Voici tout ce qu’il faut pour voyager sereinement entre Accra et Dakar.',
      items: [
        {
          title: 'Arriver au Ghana',
          body: 'Atterrissez à l’aéroport international Kotoka (ACC) d’Accra, bien relié à l’Europe, au Moyen-Orient et au reste de l’Afrique. La plupart des nationalités ont besoin d’un visa ou e-visa — anticipez.',
        },
        {
          title: 'Arriver au Sénégal',
          body: 'L’aéroport international Blaise Diagne (DSS) dessert Dakar, à environ 45 minutes du centre. Le Sénégal offre l’entrée sans visa à de nombreuses nationalités — vérifiez vos conditions avant de partir.',
        },
        {
          title: 'Entre les deux pays',
          body: 'Des vols directs relient Accra (ACC) et Dakar (DSS) en 3 à 4 heures environ, avec ASKY, Air Peace ou Royal Air Maroc (via Casablanca). Nous conseillons le trajet Accra → Dakar les 21–22 décembre.',
        },
        {
          title: 'Où loger à Accra',
          body: 'Nous avons réservé un bloc de chambres près de Labadi Beach. Le Labadi Beach Hotel et le Kempinski Gold Coast City sont superbes, à deux pas de la cérémonie et de la côte.',
        },
        {
          title: 'Où loger à Dakar',
          body: 'Le Terrou-Bi accueille notre célébration sénégalaise et dispose de chambres sur place. Le Radisson Blu et le Pullman Dakar Teranga sont d’excellentes alternatives sur la Corniche.',
        },
        {
          title: 'Bon à savoir',
          body: 'Le Ghana utilise le cedi (GHS) et le Sénégal le franc CFA (XOF). Les deux célébrations sont en plein air et chaudes — prévoyez des tissus légers, de la crème solaire et de bonnes chaussures pour danser.',
        },
      ],
    },
    rsvp: {
      kicker: 'Rejoignez-nous',
      title: 'RSVP',
      intro:
        'Merci de répondre avant le 1er novembre 2026. Dites-nous à quelle(s) célébration(s) vous vous joindrez — vous êtes les bienvenus aux deux.',
      fields: {
        name: 'Nom complet',
        email: 'Email',
        attendingGhana: 'Je célébrerai au Ghana 🇬🇭',
        attendingSenegal: 'Je célébrerai au Sénégal 🇸🇳',
        partySize: 'Nombre d’invités (vous compris)',
        dietary: 'Régime alimentaire',
        dietaryPlaceholder: 'Allergies, préférences, tout ce qu’il faut savoir',
        message: 'Un mot pour les mariés',
        messagePlaceholder: 'Partagez votre joie, une bénédiction, une chanson…',
      },
      submit: 'Envoyer le RSVP',
      submitting: 'Envoi…',
      successTitle: 'Merci — nous avons hâte de célébrer avec vous !',
      successBody:
        'Votre RSVP a bien été reçu. Une confirmation a été envoyée à votre adresse email.',
      another: 'Envoyer une autre réponse',
      errorGeneric: 'Une erreur est survenue. Merci de réessayer dans un instant.',
      errorEmail: 'Merci d’indiquer une adresse email valide.',
      errorName: 'Merci d’indiquer votre nom.',
      errorAttend: 'Merci de choisir au moins une célébration.',
      confirmationNote: 'Nous enverrons une confirmation à cette adresse.',
    },
    countdown: {
      kicker: 'Le compte à rebours',
      title: 'Avant le grand « oui »',
      to: 'Compte à rebours vers Accra',
      days: 'Jours',
      hours: 'Heures',
      minutes: 'Minutes',
      seconds: 'Secondes',
      passed: 'La célébration a commencé ! 🎉',
    },
    footer: {
      madeWith: 'Fait avec amour sur deux continents',
      hashtag: '#FaithSealedUs',
    },
    admin: {
      title: 'Tableau de bord RSVP',
      passwordLabel: 'Mot de passe admin',
      login: 'Entrer',
      wrongPassword: 'Mot de passe incorrect. Merci de réessayer.',
      logout: 'Se déconnecter',
      total: 'Réponses totales',
      ghana: 'Présents au Ghana',
      senegal: 'Présents au Sénégal',
      guests: 'Invités au total',
      exportCsv: 'Exporter en CSV',
      noRsvps: 'Aucun RSVP pour le moment.',
      colName: 'Nom',
      colEmail: 'Email',
      colGhana: 'Ghana',
      colSenegal: 'Sénégal',
      colParty: 'Groupe',
      colDietary: 'Régime',
      colMessage: 'Message',
      colDate: 'Date',
      yes: 'Oui',
      no: 'Non',
    },
  },
};
