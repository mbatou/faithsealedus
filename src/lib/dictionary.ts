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
    groups: WitnessGroup[];
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
    errorRate: string;
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
    closing: string;
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

// Map links to the confirmed venues.
const ACCRA_MAP =
  'https://maps.google.com/?q=19+Jacob+Avenue,+Nmai+Djorn,+Ashalley+Botwe,+Accra';
const DAKAR_MAP = 'https://maps.google.com/?q=312+Comico,+Ouakam,+Dakar';

const accraEn: WeekEvent = {
  id: 'ghana',
  act: 'Act I — Accra',
  flag: '🇬🇭',
  country: 'Ghana',
  city: 'Accra',
  date: 'Wednesday, 2 December — Accra, Ghana',
  isoDate: '2026-12-02T13:00:00+00:00',
  blurb: 'The celebration opens in Accra, the first act of our week.',
  venue: '19 Jacob Avenue, Nmai Djorn, Ashalley Botwe, Accra',
  time: 'From 1:00 pm',
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
  time: 'À partir de 13h00',
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
      intro: 'The people who’ve carried us here, and who’ll stand beside us.',
      groups: [
        {
          role: 'Standing with Georges',
          names: 'Brice Die Koue & Yela Ba',
          note: 'the brothers he chose, who’ve carried life alongside him longer than anyone.',
        },
        {
          role: 'Godmother of the union',
          names: 'Elisabeth Sophie Dioh',
        },
        {
          role: 'Standing with Augusta',
          names: 'Regina Shang & Linda Daniella Naa Akuye Addy',
        },
      ],
    },
    travel: {
      kicker: 'Travel & Stay',
      title: 'Getting there & staying a while',
      intro:
        'Because you travel for both celebrations, here’s what you need to move between Accra and Dakar with ease.',
      items: [
        {
          title: 'Between Ghana & Senegal',
          body: 'Fly into Kotoka International (ACC) in Accra for the first act, and Blaise Diagne International (DSS) for Dakar. Direct flights connect the two in around four hours — detailed routing to follow.',
        },
        {
          title: 'Where to stay in Accra',
          body: 'Hotel recommendations near the Accra celebration are coming soon.',
        },
        {
          title: 'Where to stay in Senegal',
          body: 'Hotel recommendations for the Senegal celebration are coming soon.',
        },
        {
          title: 'Visas & entry',
          body: 'Visa guidance for both Ghana and Senegal will be shared here. Please check your own requirements early, as they vary by nationality.',
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
    admin: {
      title: 'RSVP Dashboard',
      passwordLabel: 'Admin password',
      login: 'Enter',
      wrongPassword: 'Incorrect password. Please try again.',
      logout: 'Log out',
      total: 'Total responses',
      ghana: 'Attending Accra',
      senegal: 'Attending Senegal',
      guests: 'Total guests',
      exportCsv: 'Export CSV',
      noRsvps: 'No RSVPs yet.',
      colName: 'Full name',
      colEmail: 'Email',
      colGhana: 'Accra',
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
      gallery: 'Nous',
      witnesses: 'Nos témoins',
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
      intro: 'Les personnes qui nous ont portés jusqu’ici, et qui se tiendront près de nous.',
      groups: [
        {
          role: 'Aux côtés de Georges',
          names: 'Brice Die Koue & Yela Ba',
          note: 'les frères qu’il s’est choisis, présents à ses côtés depuis toujours.',
        },
        {
          role: 'Marraine de l’union',
          names: 'Elisabeth Sophie Dioh',
        },
        {
          role: 'Aux côtés d’Augusta',
          names: 'Regina Shang & Linda Daniella Naa Akuye Addy',
        },
      ],
    },
    travel: {
      kicker: 'Voyage & hébergement',
      title: 'Venir et rester un moment',
      intro:
        'Puisque vous voyagez pour les deux célébrations, voici l’essentiel pour circuler sereinement entre Accra et Dakar.',
      items: [
        {
          title: 'Entre le Ghana & le Sénégal',
          body: 'Atterrissez à l’aéroport international Kotoka (ACC) d’Accra pour le premier acte, et à Blaise Diagne (DSS) pour Dakar. Des vols directs relient les deux en quatre heures environ — itinéraires détaillés à venir.',
        },
        {
          title: 'Où loger à Accra',
          body: 'Nos suggestions d’hôtels près de la célébration d’Accra arrivent bientôt.',
        },
        {
          title: 'Où loger au Sénégal',
          body: 'Nos suggestions d’hôtels pour la célébration au Sénégal arrivent bientôt.',
        },
        {
          title: 'Visas & entrée',
          body: 'Les informations de visa pour le Ghana et le Sénégal seront partagées ici. Vérifiez vos conditions au plus tôt, car elles varient selon la nationalité.',
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
    admin: {
      title: 'Tableau de bord RSVP',
      passwordLabel: 'Mot de passe admin',
      login: 'Entrer',
      wrongPassword: 'Mot de passe incorrect. Merci de réessayer.',
      logout: 'Se déconnecter',
      total: 'Réponses totales',
      ghana: 'Présents à Accra',
      senegal: 'Présents au Sénégal',
      guests: 'Invités au total',
      exportCsv: 'Exporter en CSV',
      noRsvps: 'Aucun RSVP pour le moment.',
      colName: 'Nom complet',
      colEmail: 'E-mail',
      colGhana: 'Accra',
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
