// TODO maybe move types to a separate package?

/**
 * Attribute names, from player's profile.
 */
const ATTRIBUTE_NAMES = [
  // 1st row
  ["reflexes", "tackling", "creativity", "shooting", "teamWork"],
  // 2nd row
  ["oneOnOnes", "marking", "passing", "dribbling", "speed"],
  // 3rd row
  ["handling", "heading", "longShots", "positioning", "strength"],
  // 4th row
  ["communication", "crossing", "firstTouch", "aggression", "influence"],
  // 5th row
  ["eccentricity"],
].flat(1);

/**
+ * Interface that defines the attributes of a player.
+ * The keys are the names of the attributes, which are defined in the `ATTRIBUTE_NAMES` constant.
+ * The values are the player's attributes, as numbers.
+ */
interface PlayerAttributes {
  [key: (typeof ATTRIBUTE_NAMES)[number]]: number;
}

interface TalentReport {
  /**
   * The average talent of the player, or null if not available.
   */
  averageTalent: number | null;

  /**
   * An array of coach reports, or null if not available. Each report contains the following properties:
   * - coachName: The name of the coach.
   * - numberOfReports: The number of reports by the coach.
   * - jpt: The JPT of the coach.
   * - stars: The number of stars.
   */
  coachesReports: CoachReport[] | null;

  /**
   * An array of scout reports, or null if not available. Each report contains the following properties:
   * - scoutType: The type of scout.
   * - numberOfReports: The number of reports by the scout.
   * - stars: The number of stars.
   */
  scoutReports: ScoutReport[] | null;
}

/**
 * The type of position
 *
 * @see {@link POSITION_COORDS} for the mapping of pixel coordinates to positions.
 */
type Position =
  | "GK"
  | "DC"
  | "DL"
  | "DR"
  | "MC"
  | "ML"
  | "MR"
  | "FC"
  | "FL"
  | "FR";

/**
 * Maps player positions to their corresponding pixel coordinates in the parent container.
 * Used for easier lookup of a player's position.
 *
 * @see getPosition
 */
const POSITION_COORDS: Record<string, Position> = {
  // Pixel coordinates for each position stolen from dug-tool.
  // The format is "top(px)left(px)".
  // Example: "69px10px" corresponds to the goalkeeper position.

  "69px10px": "GK",
  "69px40px": "DC",
  "20px40px": "DL",
  "117px40px": "DR",
  "69px108px": "MC",
  "20px108px": "ML",
  "117px108px": "MR",
  "69px185px": "FC",
  "20px185px": "FL",
  "117px185px": "FR",
};

/**
 * Returns the player's main position.
 *
 * @param positionsEl - the positions element
 *
 * @returns the player's main position
 *
 * This function extracts the player's main position
 *
 * @see POSITION_COORDS
 */
const getPosition = (positionsEl: Element): Position => {
  // Find the div with the style attribute containing 'club/positions-1.png'
  const mainPosition = positionsEl.querySelector(
    "div[style*='club/positions-1.png']"
  ) as HTMLElement;

  // Extract the coordinates of the div
  const coords = `${mainPosition.style.top}${mainPosition.style.left}`;

  // Look up the corresponding position in the POSITION_COORDS object
  return POSITION_COORDS[coords];
};

interface CoachReport {
  coachName: string;
  numberOfReports: number;
  jpt: number;
  stars: number;
}

/**
 * Retrieves the coach reports from the given table element.
 *
 * @param tableEl - The table element containing the coach reports.
 * @returns An array of coach reports or null if the table element is null.
 * @see CoachReport
 */
function getCoachReports(
  tableEl: HTMLTableElement | null
): CoachReport[] | null {
  if (!tableEl) return null;
  return [
    ...(tableEl.querySelectorAll(
      "tr[class*=row]"
    ) as NodeListOf<HTMLTableRowElement>),
  ].map((e: HTMLTableRowElement) => {
    const cells = e.cells;
    const stars =
      cells[2].querySelectorAll("li.fa-star").length +
      cells[2].querySelectorAll("li.fa-star-half-o").length / 2;
    const coachInfoMatch = cells[0]
      .textContent!.trim()
      .match(/^(.*?)\s*\((\d+)\s*[^\)]+\)$/)!;

    return {
      coachName: coachInfoMatch[1],
      numberOfReports: Number(coachInfoMatch[2]),
      jpt: Number(cells[1].textContent!.trim()),
      stars: stars,
    } as CoachReport;
  });
}

/**
 * Calculates the average talent based on the given element.
 *
 * @param talentEl - The element containing the coach reports.
 * @returns The average talent as a number.
 */
function getAverageTalent(talentEl: Element | null): number | null {
  const starEls =
    talentEl?.querySelectorAll(":scope > li.coach_star.fa-star") || [];
  const starHalfEls =
    talentEl?.querySelectorAll(":scope > li.coach_star.fa-star-half-o") || [];

  const starCount = starEls.length;
  const starHalfCount = starHalfEls.length;
  const totalStars = starCount + starHalfCount / 2;

  return totalStars > 0 ? totalStars : null;
}
interface ScoutReport {
  scoutType: string;
  numberOfReports: number;
  stars: number;
}
/**
 * Extracts scout reports from the given table.
 *
 * @param scoutReportTable - The table containing the scout reports.
 * @returns An array of scout reports objects or null if the table is not found.
 * @see ScoutReport
 */
function getScoutReports(
  scoutReportTable: HTMLTableElement | null
): ScoutReport[] | null {
  if (!scoutReportTable) return null;
  return [
    ...(scoutReportTable.querySelectorAll(
      "tr[class*=row]"
    ) as NodeListOf<HTMLTableRowElement>),
  ].map((e) => {
    const cells = e.cells;
    const stars =
      cells[1].querySelectorAll("li.fa-star").length +
      cells[1].querySelectorAll("li.fa-star-half-o").length / 2;

    const scoutInfoMatch = cells[0]
      .textContent!.trim()
      .match(/^(.*?)\s*\((\d+)\s*[^\)]+\)$/)!;

    return {
      scoutType: scoutInfoMatch[1],
      numberOfReports: Number(scoutInfoMatch[2]),
      stars: stars,
    } as ScoutReport;
  });
}
/**
 * Defines the player profile.
 */
interface Player {
  id: number;
  name: string;
  age: number;
  country: {
    code: string;
    name: string;
  };
  club: {
    id: number;
    name: string;
    url: string;
    country: {
      code: string;
      name: string;
    };
  };
  attributes: PlayerAttributes;
  condition: number;
  moral: string;
  weeksAtClub: number;
  prefFoot: string;
  form: string;
  formHistory: number[];
  talentReport: TalentReport;
  experience: number;
  position: Position;
  contract: number;
  wage: number;
  estimatedValue: number;
  personalities: string[];
}

/**
 * Parses player's data from an individual player's page.
 * @param doc - The document containing the player's data.
 * @return returns an object of all the player's details
 * @see Player
 */
const parsePlayer = (doc: Document = document): Player => {
  /*
   * Get the player's page main elements by selecting the div siblings of #main-1 (which is actually the skillsEl).
   * Note that some div siblings are ignored, hence the extra commas in below destructuring.
   */
  const [headerEl, , bioEl, basicEl, mainEl] = doc
    .querySelector("#main-1")!
    .parentNode!.querySelectorAll(":scope > div");
  const [idEl, countryEl, nameEl] = headerEl.querySelectorAll(
    ":scope .player_id_txt,img,.player_name"
  );
  const [clubCountryEl, clubEl, , ageEl] = bioEl.querySelectorAll("td");
  const clubLinkEl = clubEl.firstElementChild as HTMLAnchorElement;
  //

  // economics = financial + status
  const [skillsEl, personalityEl, positionsEl, formEl, economicsEl] =
    mainEl.querySelectorAll(":scope > div");

  const [
    ,
    conditionEl,
    ,
    moralEl,
    ,
    weeksAtClubEl,
    talentEl,
    ,
    prefFootEl,
    ,
    formValueEl,
    ,
    expEl,
  ] = basicEl
    .querySelector("table")!
    .querySelectorAll(":scope>tbody > tr[class*=row] > td");
  const [, contractEl, , wageEl, , estimatedValueEl] = economicsEl
    .querySelector("table")!
    .querySelectorAll(":scope>tbody>tr[class*=row]>td");

  const name = nameEl.textContent!;
  // we are selecting 3n + 2 because each skill is a trio of skill name(1), skill value(2) and a up/down/same image(3)
  const skillValueEls = skillsEl.querySelectorAll(
    ".row1 td:nth-child(3n + 2), .row2 td:nth-child(3n + 2)"
  );
  const attributes: PlayerAttributes = {};
  for (let i = 0; i < ATTRIBUTE_NAMES.length; i++) {
    const attributeName = ATTRIBUTE_NAMES[i];
    attributes[attributeName] = Number(skillValueEls[i].textContent);
  }

  const [coachesReportTable, scoutReportTable] = doc.querySelectorAll(
    "#talentPanel table"
  ) as NodeListOf<HTMLTableElement>;

  const coachesReports = getCoachReports(coachesReportTable);
  const scoutReports = getScoutReports(scoutReportTable);
  const averageTalent = getAverageTalent(talentEl);
  const talentReport = {
    averageTalent,
    coachesReports,
    scoutReports,
  };

  const formHistoryString = (
    doc.querySelector("img[src*=form_history]") as HTMLImageElement
  ).src!.match(/form_history=([\d-]+)/);
  const formHistory = formHistoryString
    ? formHistoryString[1].split("-").map(Number)
    : [];

  return {
    id: Number(idEl.textContent!.replace(/\D+/g, "")),
    name,
    age: Number(ageEl.textContent!.replace(/\D+/g, "")),
    country: {
      code: (countryEl as HTMLImageElement).src.match(
        /(?<=flags_round\/half\/)\w+(?=\.png)/
      )![0],
      name: (countryEl as HTMLImageElement).title,
    },
    club: {
      id: Number(clubLinkEl.href.replace(/\D/g, "")),
      name: clubLinkEl.textContent!,
      url: clubLinkEl.href,
      country: {
        code: clubCountryEl
          .querySelector("img")!
          .src.match(/(?<=flags_small\/new\/)\w+(?=\.png)/)![0],
        name: clubCountryEl.querySelector("img")!.title,
      },
    },
    attributes,
    talentReport,
    condition: Number(conditionEl.textContent!.trim().replace("%", "")),
    moral: moralEl.textContent!.trim(),
    weeksAtClub: Number(weeksAtClubEl.textContent!.trim()),
    prefFoot: prefFootEl.textContent!.trim(),
    form: formValueEl.textContent!.trim(),
    formHistory,
    experience: Number(
      (expEl.firstElementChild as HTMLImageElement).title.replace(/\D+/g, "")
    ),
    position: getPosition(positionsEl),
    contract: Number(contractEl.textContent!.trim().replace(/\D+/g, "")),
    wage: Number(wageEl.textContent!.trim().replace(/\D+/g, "")),
    estimatedValue: Number(
      estimatedValueEl.textContent!.trim().replace(/\D+/g, "")
    ),
    personalities: [...personalityEl.querySelectorAll(".row1, .row2")]
      .map((e) => e.textContent!.trim())
      // Needs to match the player's first name, otherwise it's "Your assistant didn't notice blah blah blah"
      .filter((trait) => trait.includes(name.replace(/\s\S+$/, ""))),
  };
};

export default parsePlayer;

//parsePlayer()
