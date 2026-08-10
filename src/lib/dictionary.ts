export type Language = 'en' | 'fr';

export interface WeekEvent {
  id: string;
  act: string;
  flag: string;
  country: string;
  city: string;
  date: string; // human-readable date + place line
  isoDate: string; // machine-readable, for the countdown
  blurb: string; // one descriptive sentence
  venue: string;
  time: string;
  dressCode: string;
  mapUrl: string;
}

export interface Movement {
  title: string;
  body: string;
}

export interface WitnessGroup {
  role: string;
  names: string;
  note?: string;
  tbd?: boolean;
}

export interface WitnessCity {
  act: string; // e.g. "Act I — Accra"
  flag: string;
  groups: WitnessGroup[];
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
    witnesses: string;
    prayers: string;
    travel: string;
    rsvp: string;
    langLabel: string;
  };
  hero: {
    kicker: string; // tagline: "Two homelands, one union"
    tagline: string; // sub: "We're getting married…"
    dates: string; // "Accra — 2 December · Dakar — 5 December 2026"
    cta: string;
    scroll: string;
    and: string;
    bride: string;
    groom: string;
  };
  story: {
    kicker: string;
    title: string;
    movements: Movement[];
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
    };
    events: WeekEvent[];
  };
  gallery: {
    kicker: string;
    title: string;
    intro: string;
    empty: string;
  };
  witnesses: {
    kicker: string;
    title: string;
    intro: string;
    cities: WitnessCity[];
    godmother: WitnessGroup;
  };
  travel: {
    kicker: string;
    title: string;
    intro: string;
    flights: {
      label: string;
      intro: string;
      legs: { route: string; day: string; detail: string }[];
      airline: string;
      airlineLinkLabel: string;
      airlineUrl: string;
    };
    stayLabel: string;
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
    errorRate: string;
    confirmationNote: string;
  };
  prayers: {
    kicker: string;
    title: string;
    intro: string;
    placeholder: string;
    namePlaceholder: string;
    submit: string;
    submitting: string;
    empty: string;
    thanks: string;
    error: string;
    errorConfig: string;
    countLabel: string; // suffix after the number of blessings
    signed: string; // "— {name}" prefix word, kept generic
  };
  exclusive: {
    teaser: string;
    prompt: string;
    placeholder: string;
    unlock: string;
    unlocking: string;
    invalid: string;
    title: string;
    when: string;
    note: string;
    attend: string;
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
    closing: string;
  };
  music: {
    play: string;
    pause: string;
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
    exclusive: string;
    guests: string;
    exportCsv: string;
    noRsvps: string;
    prayersTitle: string;
    noPrayers: string;
    colName: string;
    colEmail: string;
    colGhana: string;
    colSenegal: string;
    colExclusive: string;
    colParty: string;
    colDietary: string;
    colMessage: string;
    colDate: string;
    yes: string;
    no: string;
  };
}

// Map links to the confirmed venues.
const ACCRA_MAP =
  'https://maps.google.com/?q=19+Jacob+Avenue,+Nmai+Djorn,+Ashalley+Botwe,+Accra';
const DAKAR_MAP = 'https://maps.app.goo.gl/mpk1KSCMRXpwojZJ6';

const accraEn: WeekEvent = {
  id: 'ghana',
  act: 'Act I — Accra',
  flag: '🇬🇭',
  country: 'Ghana',
  city: 'Accra',
  date: 'Wednesday, 2 December — Accra, Ghana',
  isoDate: '2026-12-02T10:00:00+00:00',
  blurb: 'The celebration opens in Accra, the first act of our week.',
  venue: '19 Jacob Avenue, Nmai Djorn, Ashalley Botwe, Accra',
  time: 'From 10:00 am',
  dressCode: 'Emerald green, white or black — no strict dress code',
  mapUrl: ACCRA_MAP,
};

const senegalEn: WeekEvent = {
  id: 'senegal',
  act: 'Act II — Senegal',
  flag: '🇸🇳',
  country: 'Senegal',
  city: 'Dakar',
  date: 'Saturday, 5 December — Dakar, Senegal',
  isoDate: '2026-12-05T17:00:00+00:00',
  blurb: 'A few days later we gather again in Georges’s home to close the circle.',
  venue: '312 Comico, Ouakam, Dakar',
  time: 'From 5:00 pm',
  dressCode: 'Emerald green, white or black — no strict dress code',
  mapUrl: DAKAR_MAP,
};

const accraFr: WeekEvent = {
  ...accraEn,
  act: 'Acte I — Accra',
  date: 'Mercredi 2 décembre — Accra, Ghana',
  blurb: 'La célébration s’ouvre à Accra, le premier acte de notre semaine.',
  time: 'À partir de 10h00',
  dressCode: 'Vert émeraude, blanc ou noir — pas de tenue imposée',
};

const senegalFr: WeekEvent = {
  ...senegalEn,
  act: 'Acte II — Sénégal',
  date: 'Samedi 5 décembre — Dakar, Sénégal',
  blurb: 'Quelques jours plus tard, nous nous réunissons chez Georges pour boucler la boucle.',
  time: 'À partir de 17h00',
  dressCode: 'Vert émeraude, blanc ou noir — pas de tenue imposée',
};

export const dictionaries: Record<Language, Dictionary> = {
  en: {
    nav: {
      story: 'Our Story',
      week: 'The Week',
      gallery: 'Us',
      witnesses: 'Our Witnesses',
      prayers: 'Prayers',
      travel: 'Travel & Stay',
      rsvp: 'RSVP',
      langLabel: 'Language',
    },
    hero: {
      kicker: 'Two homelands, one union',
      tagline: 'We’re getting married, and we’d be honored to have you there.',
      dates: 'Accra — 2 December · Dakar — 5 December 2026',
      cta: 'RSVP',
      scroll: 'Scroll',
      and: '&',
      bride: 'Augusta',
      groom: 'Georges',
    },
    story: {
      kicker: 'Our Story',
      title: 'How it was sealed',
      movements: [
        {
          title: 'Where it began.',
          body: 'MEST, December 2022. We met at the Meltwater Entrepreneurial School of Technology, placed on the same team almost by chance. When the program ended, we went our separate ways — neither of us guessing the road would ever loop back.',
        },
        {
          title: 'The turn.',
          body: 'It did. When illness found Georges, Augusta was the one who reached out — not with the polite “feeling better?” everyone offers, but in her own quiet way, the kind that stays with a person. We graduated as friends. She kept her guard up — a tall man with a military past was, honestly, a *no*. But something steadier was already at work.',
        },
        {
          title: 'When it was sealed.',
          body: 'Georges stayed in Ghana, and the distance she feared became the distance we chose to cross. Somewhere in the crossing we found we were aligned in the things that hold — in faith, if not the same religion; in business; in ambition. What neither of us planned, God settled. And so, here we are.',
        },
      ],
    },
    week: {
      kicker: 'The Week',
      title: 'One week, two acts',
      intro:
        'Not two weddings — one celebration in two homelands, the same joyful week.',
      labels: {
        when: 'When',
        where: 'Where',
        dress: 'Dress code',
        map: 'Open map',
      },
      events: [accraEn, senegalEn],
    },
    gallery: {
      kicker: 'Moments',
      title: 'Us',
      intro: 'A few frames from our story — more to come after the celebrations.',
      empty:
        'Photos are on their way. Check back soon for pictures from our journey together.',
    },
    witnesses: {
      kicker: 'Our Witnesses',
      title: 'Those standing with us',
      intro: 'The people who’ve carried us here, and who’ll stand beside us — in each of our homelands.',
      cities: [
        {
          act: 'Act I — Accra',
          flag: '🇬🇭',
          groups: [
            {
              role: 'Standing with Georges',
              names: 'Brice Die Koue & Emily Fiagbedzi',
              note: 'Emily led our program at MEST — where our story began.',
            },
            {
              role: 'Standing with Augusta',
              names: 'Regina Shang & Linda Daniella Naa Akuye Addy',
            },
          ],
        },
        {
          act: 'Act II — Dakar',
          flag: '🇸🇳',
          groups: [
            {
              role: 'Standing with Georges',
              names: 'Brice Die Koue & Yela Ba',
              note: 'the brothers he chose, who’ve carried life alongside him longer than anyone.',
            },
            {
              role: 'Standing with Augusta',
              names: 'Ahmed Ekoume & Miranaya Wallace-Ollennu',
            },
          ],
        },
      ],
      godmother: {
        role: 'Godmother of the union',
        names: 'Elisabeth Sophie Dioh',
      },
    },
    travel: {
      kicker: 'Travel & Stay',
      title: 'Getting there & staying a while',
      intro:
        'Because you travel for both celebrations, here’s what you need to move between Accra and Dakar with ease.',
      flights: {
        label: 'The journey',
        intro:
          'We’ve booked our own flights — here they are, so you can be on board with us.',
        legs: [
          {
            route: 'Dakar → Accra',
            day: 'Friday, 27 November',
            detail:
              'Air Côte d’Ivoire, departing Blaise Diagne (DSS) 10:40, landing Kotoka (ACC) 16:35 — one stop, ahead of the first celebration on 2 December.',
          },
          {
            route: 'Accra → Dakar',
            day: 'Thursday, 3 December',
            detail:
              'Air Côte d’Ivoire, departing Kotoka (ACC) 10:45, landing Blaise Diagne (DSS) 17:35 — one stop, two days before we gather in Dakar.',
          },
        ],
        airline:
          'We’re flying Air Côte d’Ivoire — around XOF 599,400 (≈ $1,055) return at the promotional fare when we booked.',
        airlineLinkLabel: 'Book the same flights',
        airlineUrl: 'https://www.aircotedivoire.com',
      },
      stayLabel: 'Stay & essentials',
      items: [
        {
          title: 'Where to stay in Accra',
          body: 'Our hotel recommendations near the Accra venue are on their way — we’ll list a few options at different budgets.',
        },
        {
          title: 'Where to stay in Dakar',
          body: 'Recommendations near the Dakar venue in Ouakam are coming shortly, close to the celebration and the coast.',
        },
        {
          title: 'Visas & entry',
          body: 'Requirements differ for Ghana and Senegal and vary by nationality — please check yours early. Detailed guidance to follow.',
        },
      ],
    },
    rsvp: {
      kicker: 'Join us',
      title: 'Will you be with us?',
      intro:
        'A final response date will be confirmed here shortly. Let us know which celebration(s) you’ll join — you’re welcome at both.',
      fields: {
        name: 'Full name',
        email: 'Email',
        attendingGhana: 'Joining us in Accra (2 Dec)',
        attendingSenegal: 'Joining us in Senegal (5 Dec)',
        partySize: 'How many of you?',
        dietary: 'Dietary notes',
        dietaryPlaceholder: 'Allergies, preferences, anything we should know',
        message: 'A note for us (optional)',
        messagePlaceholder: 'Share your excitement, a blessing, a song request…',
      },
      submit: 'Send RSVP',
      submitting: 'Sending…',
      successTitle: 'Thank you — we can’t wait to celebrate with you.',
      successBody: 'Your RSVP has been received. A confirmation will follow by email.',
      another: 'Submit another response',
      errorGeneric: 'Something went wrong. Please try again in a moment.',
      errorEmail: 'Please enter a valid email address.',
      errorName: 'Please enter your name.',
      errorAttend: 'Please choose at least one celebration to attend.',
      errorRate: 'You’ve submitted a few times already. Please try again shortly.',
      confirmationNote: 'We’ll send a confirmation to this address.',
    },
    prayers: {
      kicker: 'Blessings',
      title: 'A cloud of prayers',
      intro:
        'Leave us a prayer or a blessing — it joins the cloud above and travels with us into both ceremonies.',
      placeholder: 'Type your prayer or blessing…',
      namePlaceholder: 'Your name (optional)',
      submit: 'Add to the cloud',
      submitting: 'Adding…',
      empty: 'Be the first to leave a blessing.',
      thanks: 'Amen — thank you for your blessing.',
      error: 'Something went wrong. Please try again in a moment.',
      errorConfig: 'The prayer wall isn’t connected to its database yet — please try again shortly.',
      countLabel: 'blessings and counting',
      signed: '—',
    },
    exclusive: {
      teaser: 'Have a private invitation code?',
      prompt: 'Enter your code to unlock the private ceremony.',
      placeholder: 'Invitation code',
      unlock: 'Unlock',
      unlocking: 'Checking…',
      invalid: 'That code isn’t recognised. Please check and try again.',
      title: 'The private ceremony',
      when: 'Saturday, 5 December — evening',
      note: 'An intimate gathering, by invitation only. The address will be shared with your confirmation.',
      attend: 'Yes — I’ll join the private ceremony',
    },
    countdown: {
      kicker: 'The countdown',
      title: 'Until we say “I do”',
      to: 'Counting down to Accra · 2 December 2026',
      days: 'Days',
      hours: 'Hours',
      minutes: 'Minutes',
      seconds: 'Seconds',
      passed: 'The celebration has begun.',
    },
    footer: {
      closing: 'With love, Augusta & Georges',
    },
    music: {
      play: 'Play music',
      pause: 'Pause music',
    },
    admin: {
      title: 'RSVP Dashboard',
      passwordLabel: 'Admin password',
      login: 'Enter',
      wrongPassword: 'Incorrect password. Please try again.',
      logout: 'Log out',
      total: 'Total responses',
      ghana: 'Attending Accra',
      senegal: 'Attending Senegal',
      exclusive: 'Private ceremony',
      guests: 'Total guests',
      exportCsv: 'Export CSV',
      noRsvps: 'No RSVPs yet.',
      prayersTitle: 'Prayer wall',
      noPrayers: 'No prayers yet.',
      colName: 'Full name',
      colEmail: 'Email',
      colGhana: 'Accra',
      colSenegal: 'Senegal',
      colExclusive: 'Private',
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
      gallery: 'Nous',
      witnesses: 'Nos témoins',
      prayers: 'Prières',
      travel: 'Voyage & hébergement',
      rsvp: 'Confirmer',
      langLabel: 'Langue',
    },
    hero: {
      kicker: 'Deux terres, une seule union',
      tagline: 'Nous nous marions, et nous serions honorés de votre présence.',
      dates: 'Accra — le 2 décembre · Dakar — le 5 décembre 2026',
      cta: 'Confirmer',
      scroll: 'Défiler',
      and: '&',
      bride: 'Augusta',
      groom: 'Georges',
    },
    story: {
      kicker: 'Notre histoire',
      title: 'Comment tout s’est scellé',
      movements: [
        {
          title: 'Le commencement.',
          body: 'MEST, décembre 2022. Nous nous sommes rencontrés à la Meltwater Entrepreneurial School of Technology, réunis dans la même équipe presque par hasard. À la fin du programme, nos chemins se sont séparés — sans que ni l’un ni l’autre n’imagine qu’ils se croiseraient à nouveau.',
        },
        {
          title: 'Le tournant.',
          body: 'Et pourtant. Lorsque la maladie a frappé Georges, c’est Augusta qui a tendu la main — pas avec le « tu vas mieux ? » poli que tout le monde offre, mais à sa manière, discrète, celle qui marque. Diplômés, nous sommes restés amis. Elle gardait ses distances — un homme grand, au passé militaire, c’était franchement un *non*. Mais quelque chose de plus profond était déjà à l’œuvre.',
        },
        {
          title: 'Scellés.',
          body: 'Georges est resté au Ghana, et la distance qu’elle redoutait est devenue celle que nous avons choisi de franchir. En chemin, nous nous sommes découverts alignés sur l’essentiel — dans la foi, sinon la même religion ; dans les affaires ; dans l’ambition. Ce que nous n’avions pas prévu, Dieu l’a scellé. Et nous voici.',
        },
      ],
    },
    week: {
      kicker: 'La semaine',
      title: 'Une semaine, deux actes',
      intro:
        'Non pas deux mariages — une seule célébration en deux terres, la même semaine de joie.',
      labels: {
        when: 'Quand',
        where: 'Où',
        dress: 'Tenue',
        map: 'Ouvrir la carte',
      },
      events: [accraFr, senegalFr],
    },
    gallery: {
      kicker: 'Instants',
      title: 'Nous',
      intro:
        'Quelques images de notre histoire — et bien d’autres après les célébrations.',
      empty:
        'Les photos arrivent. Revenez bientôt pour découvrir notre parcours ensemble.',
    },
    witnesses: {
      kicker: 'Nos témoins',
      title: 'Celles et ceux à nos côtés',
      intro: 'Les personnes qui nous ont portés jusqu’ici, et qui se tiendront près de nous — dans chacune de nos deux terres.',
      cities: [
        {
          act: 'Acte I — Accra',
          flag: '🇬🇭',
          groups: [
            {
              role: 'Aux côtés de Georges',
              names: 'Brice Die Koue & Emily Fiagbedzi',
              note: 'Emily dirigeait notre programme au MEST — là où notre histoire a commencé.',
            },
            {
              role: 'Aux côtés d’Augusta',
              names: 'Regina Shang & Linda Daniella Naa Akuye Addy',
            },
          ],
        },
        {
          act: 'Acte II — Dakar',
          flag: '🇸🇳',
          groups: [
            {
              role: 'Aux côtés de Georges',
              names: 'Brice Die Koue & Yela Ba',
              note: 'les frères qu’il s’est choisis, présents à ses côtés depuis toujours.',
            },
            {
              role: 'Aux côtés d’Augusta',
              names: 'Ahmed Ekoume & Miranaya Wallace-Ollennu',
            },
          ],
        },
      ],
      godmother: {
        role: 'Marraine de l’union',
        names: 'Elisabeth Sophie Dioh',
      },
    },
    travel: {
      kicker: 'Voyage & hébergement',
      title: 'Venir et rester un moment',
      intro:
        'Puisque vous voyagez pour les deux célébrations, voici l’essentiel pour circuler sereinement entre Accra et Dakar.',
      flights: {
        label: 'Le voyage',
        intro:
          'Nous avons réservé nos propres vols — les voici, pour embarquer avec nous.',
        legs: [
          {
            route: 'Dakar → Accra',
            day: 'Vendredi 27 novembre',
            detail:
              'Air Côte d’Ivoire, départ de Blaise Diagne (DSS) à 10h40, arrivée à Kotoka (ACC) à 16h35 — une escale, avant la première célébration du 2 décembre.',
          },
          {
            route: 'Accra → Dakar',
            day: 'Jeudi 3 décembre',
            detail:
              'Air Côte d’Ivoire, départ de Kotoka (ACC) à 10h45, arrivée à Blaise Diagne (DSS) à 17h35 — une escale, deux jours avant nos retrouvailles à Dakar.',
          },
        ],
        airline:
          'Nous volons avec Air Côte d’Ivoire — environ 599 400 XOF (≈ 1 055 $) aller-retour au tarif promotionnel lors de notre réservation.',
        airlineLinkLabel: 'Réserver les mêmes vols',
        airlineUrl: 'https://www.aircotedivoire.com',
      },
      stayLabel: 'Hébergement & essentiels',
      items: [
        {
          title: 'Où loger à Accra',
          body: 'Nos suggestions d’hôtels près du lieu d’Accra arrivent bientôt — plusieurs options, à différents budgets.',
        },
        {
          title: 'Où loger à Dakar',
          body: 'Nos suggestions près du lieu à Ouakam arrivent sous peu, à deux pas de la célébration et de la côte.',
        },
        {
          title: 'Visas & entrée',
          body: 'Les conditions diffèrent pour le Ghana et le Sénégal et varient selon la nationalité — vérifiez les vôtres au plus tôt. Informations détaillées à venir.',
        },
      ],
    },
    rsvp: {
      kicker: 'Rejoignez-nous',
      title: 'Serez-vous des nôtres ?',
      intro:
        'Une date limite de réponse sera confirmée ici prochainement. Dites-nous à quelle(s) célébration(s) vous vous joindrez — vous êtes les bienvenus aux deux.',
      fields: {
        name: 'Nom complet',
        email: 'E-mail',
        attendingGhana: 'Présent(e) à Accra (2 déc.)',
        attendingSenegal: 'Présent(e) au Sénégal (5 déc.)',
        partySize: 'Combien serez-vous ?',
        dietary: 'Régime alimentaire',
        dietaryPlaceholder: 'Allergies, préférences, tout ce qu’il faut savoir',
        message: 'Un mot pour nous (facultatif)',
        messagePlaceholder: 'Partagez votre joie, une bénédiction, une chanson…',
      },
      submit: 'Envoyer',
      submitting: 'Envoi…',
      successTitle: 'Merci — nous avons hâte de célébrer avec vous.',
      successBody: 'Votre réponse a bien été reçue. Une confirmation suivra par e-mail.',
      another: 'Envoyer une autre réponse',
      errorGeneric: 'Une erreur est survenue. Merci de réessayer dans un instant.',
      errorEmail: 'Merci d’indiquer une adresse e-mail valide.',
      errorName: 'Merci d’indiquer votre nom.',
      errorAttend: 'Merci de choisir au moins une célébration.',
      errorRate: 'Vous avez déjà répondu plusieurs fois. Merci de réessayer plus tard.',
      confirmationNote: 'Nous enverrons une confirmation à cette adresse.',
    },
    prayers: {
      kicker: 'Bénédictions',
      title: 'Un nuage de prières',
      intro:
        'Laissez-nous une prière ou une bénédiction — elle rejoint le nuage ci-dessus et nous accompagnera dans les deux cérémonies.',
      placeholder: 'Écrivez votre prière ou bénédiction…',
      namePlaceholder: 'Votre nom (facultatif)',
      submit: 'Ajouter au nuage',
      submitting: 'Envoi…',
      empty: 'Soyez la première personne à laisser une bénédiction.',
      thanks: 'Amen — merci pour votre bénédiction.',
      error: 'Une erreur est survenue. Merci de réessayer dans un instant.',
      errorConfig: 'Le mur de prières n’est pas encore connecté à sa base de données — merci de réessayer bientôt.',
      countLabel: 'bénédictions, et ce n’est que le début',
      signed: '—',
    },
    exclusive: {
      teaser: 'Vous avez un code d’invitation privé ?',
      prompt: 'Saisissez votre code pour dévoiler la cérémonie privée.',
      placeholder: 'Code d’invitation',
      unlock: 'Déverrouiller',
      unlocking: 'Vérification…',
      invalid: 'Ce code n’est pas reconnu. Merci de vérifier et de réessayer.',
      title: 'La cérémonie privée',
      when: 'Samedi 5 décembre — en soirée',
      note: 'Un moment intime, sur invitation uniquement. L’adresse vous sera communiquée avec votre confirmation.',
      attend: 'Oui — je me joins à la cérémonie privée',
    },
    countdown: {
      kicker: 'Le compte à rebours',
      title: 'Avant le grand « oui »',
      to: 'Compte à rebours vers Accra · 2 décembre 2026',
      days: 'Jours',
      hours: 'Heures',
      minutes: 'Minutes',
      seconds: 'Secondes',
      passed: 'La célébration a commencé.',
    },
    footer: {
      closing: 'Avec amour, Augusta & Georges',
    },
    music: {
      play: 'Écouter la musique',
      pause: 'Couper la musique',
    },
    admin: {
      title: 'Tableau de bord RSVP',
      passwordLabel: 'Mot de passe admin',
      login: 'Entrer',
      wrongPassword: 'Mot de passe incorrect. Merci de réessayer.',
      logout: 'Se déconnecter',
      total: 'Réponses totales',
      ghana: 'Présents à Accra',
      senegal: 'Présents au Sénégal',
      exclusive: 'Cérémonie privée',
      guests: 'Invités au total',
      exportCsv: 'Exporter en CSV',
      noRsvps: 'Aucun RSVP pour le moment.',
      prayersTitle: 'Mur de prières',
      noPrayers: 'Aucune prière pour le moment.',
      colName: 'Nom complet',
      colEmail: 'E-mail',
      colGhana: 'Accra',
      colSenegal: 'Sénégal',
      colExclusive: 'Privée',
      colParty: 'Groupe',
      colDietary: 'Régime',
      colMessage: 'Message',
      colDate: 'Date',
      yes: 'Oui',
      no: 'Non',
    },
  },
};
