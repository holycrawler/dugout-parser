const parseClubInfo = (doc = document) => {
  const flagEl = doc.querySelector(
    "img[src*='images/flags_round']"
  ) as HTMLImageElement; // selecting the big round flag left of the club name
  const lastActiveEl = doc.querySelectorAll(
    "td.maninfo"
  ) as NodeListOf<HTMLTableCellElement>; // selecting the last

  const [
    teamNameEl,
    shortNameEl,
    StadiumEl,
    ratingEl,
    managerEl,
    ,
    leagueEl,
    idEl,
  ] = (
    doc.querySelector(
      "div#content_main > div:last-child table"
    ) as HTMLTableElement
  ).querySelectorAll(
    "td[class*=matches_row]:nth-child(2)"
  ) as NodeListOf<HTMLTableCellElement>; // selecting the 2nd column of the "quick facts" table

  const stadium = StadiumEl.textContent!.match(/(.*)\([0-9]*\/([0-9]*)\)/)!; // extracting the stadium name and capacity
  const leagueLinkEl = leagueEl.firstElementChild as HTMLAnchorElement;

  const trophiesEl = doc.querySelectorAll(
    "img[src*='images/club/cups']"
  ) as NodeListOf<HTMLImageElement>;
  const achivementsEl = doc.querySelectorAll(
    "img[src*='images/trophies']"
  ) as NodeListOf<HTMLImageElement>;
  const trophies = Array.from(trophiesEl!).map(
    (el) => el.getAttribute("title")!
  );
  const achivements = Array.from(achivementsEl).map(
    (el) => el.getAttribute("title")!
  );

  return {
    teamName: teamNameEl.textContent!.trim(),
    shortName: shortNameEl.textContent!.trim(),
    country: flagEl.getAttribute("title")!,
    lastActive: lastActiveEl[5].textContent!.trim(), // i didn't convert this to unix time because it's not a fixed format
    stadium: { name: stadium[1].trim(), capacity: Number(stadium[2]) },
    rating: Number(ratingEl.textContent!.replace(/\D+/g, "")),
    manager: managerEl.textContent!.trim(),
    league: {
      name: leagueLinkEl.textContent!,
      url: leagueLinkEl.href,
    },
    id: Number(idEl.textContent!.replace(/\D+/g, "")),
    trophies: trophies,
    achivements: achivements,
  };
};

export default {
  parseClubInfo,
};
