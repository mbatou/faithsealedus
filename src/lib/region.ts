import type { Dictionary, Language } from './dictionary';

// Which version of the site a visitor sees. Visitors located in Ghana get the
// Accra-only view: Augusta doesn't want the Senegal celebration shown to them.
export type Region = 'all' | 'gh';

const GH_COPY: Record<
  Language,
  {
    dates: string;
    act: string;
    blurb: string;
    weekKicker: string;
    weekTitle: string;
    weekIntro: string;
    witnessesIntro: string;
    travelIntro: string;
    visasBody: string;
    rsvpIntro: string;
    prayersIntro: string;
  }
> = {
  en: {
    dates: 'Accra — 2 December 2026',
    act: 'The celebration — Accra',
    blurb: 'We celebrate in Accra, surrounded by the people we love.',
    weekKicker: 'The Day',
    weekTitle: 'Celebrate with us',
    weekIntro: 'One joyful day in Accra — we can’t wait to celebrate with you.',
    witnessesIntro: 'The people who’ve carried us here, and who’ll stand beside us in Accra.',
    travelIntro: 'Everything you need to join us in Accra with ease.',
    visasBody:
      'Entry requirements for Ghana vary by nationality — please check yours early. Detailed guidance to follow.',
    rsvpIntro:
      'A final response date will be confirmed here shortly. Let us know you’ll be with us in Accra.',
    prayersIntro:
      'Leave us a prayer or a blessing — it joins the cloud above and travels with us into the ceremony.',
  },
  fr: {
    dates: 'Accra — le 2 décembre 2026',
    act: 'La célébration — Accra',
    blurb: 'Nous célébrons à Accra, entourés de celles et ceux que nous aimons.',
    weekKicker: 'Le jour J',
    weekTitle: 'Célébrez avec nous',
    weekIntro: 'Une journée de joie à Accra — nous avons hâte de la célébrer avec vous.',
    witnessesIntro:
      'Les personnes qui nous ont portés jusqu’ici, et qui se tiendront près de nous à Accra.',
    travelIntro: 'L’essentiel pour nous rejoindre sereinement à Accra.',
    visasBody:
      'Les conditions d’entrée au Ghana varient selon la nationalité — vérifiez les vôtres au plus tôt. Informations détaillées à venir.',
    rsvpIntro:
      'Une date limite de réponse sera confirmée ici prochainement. Dites-nous que vous serez des nôtres à Accra.',
    prayersIntro:
      'Laissez-nous une prière ou une bénédiction — elle rejoint le nuage ci-dessus et nous accompagnera dans la cérémonie.',
  },
};

/** The dictionary as a visitor in `region` should see it. */
export function forRegion(t: Dictionary, lang: Language, region: Region): Dictionary {
  if (region !== 'gh') return t;
  const c = GH_COPY[lang];

  return {
    ...t,
    nav: { ...t.nav, week: c.weekKicker },
    hero: { ...t.hero, dates: c.dates },
    week: {
      ...t.week,
      kicker: c.weekKicker,
      title: c.weekTitle,
      intro: c.weekIntro,
      events: t.week.events
        .filter((e) => e.id === 'ghana')
        .map((e) => ({ ...e, act: c.act, blurb: c.blurb })),
    },
    witnesses: {
      ...t.witnesses,
      intro: c.witnessesIntro,
      // Accra panel only; it also drops the act number ("Act I").
      cities: t.witnesses.cities
        .filter((city) => city.flag === '🇬🇭')
        .map((city) => ({ ...city, act: 'Accra' })),
    },
    travel: {
      ...t.travel,
      intro: c.travelIntro,
      // Our flights run Dakar ⇄ Accra, so the whole panel is hidden.
      flights: { ...t.travel.flights, legs: [] },
      items: [
        t.travel.items[0], // Where to stay in Accra
        { ...t.travel.items[2], body: c.visasBody },
      ],
    },
    rsvp: {
      ...t.rsvp,
      intro: c.rsvpIntro,
      geoNoteGhana: '',
    },
    prayers: { ...t.prayers, intro: c.prayersIntro },
  };
}
