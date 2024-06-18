export interface ClubInfo {
  id: number;
  teamName: string;
  shortName: string;
  manager: {
    name: string;
    id: number;
  };
  country: {
    name: string;
    code: string;
  };
  lastActive: string;
  stadium: {
    name: string;
    capacity: number;
  };
  rating: number;
  league: {
    name: string;
    url: string;
  };
  trophies: string[];
  achievements: string[];
  premiumAccount: {
    active: boolean;
    viewedBy: number | null;
    fameRank: number | null;
  };
}

/**
 * Parses club info from a document.
 *
 * @param {Document} [doc=document] - The document to parse. Defaults to the current document.
 * @returns {ClubInfo} - The parsed club info.
 */
export const parseClubInfo = (doc: Document = document): ClubInfo => {
  // Select the image element representing the club's flag
  const flagEl = doc.querySelector(
    "img[src*='images/flags_round']"
  ) as HTMLImageElement;

  // Select the last "maninfo" element (RATING/MANAGER/LAST ACTIVE) under the teams name
  const lastActiveEl = doc.querySelectorAll(
    "td.maninfo:last-child"
  )![2] as HTMLTableCellElement;

  // Select the quick facts table
  const quickFactsTableEl = doc.querySelector(
    "div#content_main > div:last-child table"
  ) as HTMLTableElement;

  // Select the elements containing the club's details
  const [
    teamNameEl,
    shortNameEl,
    StadiumEl,
    ratingEl,
    managerEl,
    ,
    leagueEl,
    idEl,
    viewdByEl,
    fameRankEl,
  ] = quickFactsTableEl.querySelectorAll(
    "td[class*=matches_row]:nth-child(2)"
  ) as NodeListOf<HTMLTableCellElement>;

  // Check if the club has premium
  const pa = quickFactsTableEl.querySelectorAll("img").length === 1;

  // Extract the stadium name and capacity from the text content
  const stadium = StadiumEl.textContent!.match(/(.*)\(([0-9]*\/[0-9]*)\)/)!;

  // Select the league link element
  const leagueLinkEl = leagueEl.firstElementChild as HTMLAnchorElement;

  // Extract the manager's ID from the href attribute
  const managerId = Number(
    (managerEl.firstElementChild as HTMLAnchorElement).href.match(
      /toid\/(\d+)/
    )![1]
  );

  // Select all the trophy and achievement elements
  const trophiesEl = doc.querySelectorAll(
    "img[src*='images/club/cups']"
  ) as NodeListOf<HTMLImageElement>;
  const achivementsEl = doc.querySelectorAll(
    "img[src*='images/trophies']"
  ) as NodeListOf<HTMLImageElement>;

  // Extract the titles of the trophies and achievements
  const trophies = Array.from(trophiesEl!).map(
    (el) => el.getAttribute("title")!
  );
  const achivements = Array.from(achivementsEl).map(
    (el) => el.getAttribute("title")!
  );

  return {
    id: Number(idEl.textContent!.replace(/\D+/g, "")),
    teamName: teamNameEl.textContent!.trim(),
    shortName: shortNameEl.textContent!.trim(),
    manager: {
      name: managerEl.textContent!.trim(),
      id: managerId,
    },
    country: {
      name: flagEl.getAttribute("title")!,
      code: flagEl.src.match(/(?<=flags_round\/)\w+(?=\.png)/)![0],
    },
    lastActive: lastActiveEl.textContent!.trim(),
    stadium: {
      name: stadium[1].trim(),
      capacity: Number(stadium[2]),
    },
    rating: Number(ratingEl.textContent!.replace(/\D+/g, "")),
    league: {
      name: leagueLinkEl.textContent!,
      url: leagueLinkEl.href,
    },
    trophies: trophies,
    achievements: achivements,
    premiumAccount: {
      active: pa,
      viewedBy: pa ? Number(viewdByEl.textContent!.replace(/\D+/g, "")) : null,
      fameRank: pa ? Number(fameRankEl.textContent!.replace(/\D+/g, "")) : null,
    },
  };
};
