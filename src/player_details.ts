// TODO maybe move types to a separate package?

/**
 * Skill names, from player's profile.
 */
const SKILL_NAMES = [
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
 * Defines the player's skills
 */
interface PlayerSkills {
  [key: (typeof SKILL_NAMES)[number]]: number;
}

/**
 * Defines the player's talent report details
 */

interface CoachReports {
  averageTalent: number | null;
  coachesReports:
    | {
        coachName: string;
        numberOfReports: number;
        jpt: number;
        stars: number;
      }[]
    | null;
  scoutReports:
    | {
        scoutType: string;
        numberOfReports: number;
        stars: number;
      }[]
    | null;
}

/**
 * Defines all the possible player's positions.
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
 * Defines the mapping of a position with its pixel coordinates in the parent container, for easier lookup.
 * @see getPosition
 */
const POSITION_COORDS: Record<string, Position> = {
  // i stole these from dug-tool
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
 * Note that it concatenates the coordinates for easier lookup.
 *
 * @param positionsEl the positions element
 * @return Position player's main position
 * @see POSITION_COORDS
 */
const getPosition = (positionsEl: Element): Position => {
  const mainPosition = positionsEl.querySelector(
    "div[style*='club/positions-1.png)']"
  ) as HTMLElement;
  const coords = mainPosition.style.top + mainPosition.style.left;
  return POSITION_COORDS[coords];
};

/**
 * Defines the player profile.
 */
interface Player {
  id: number;
  name: string;
  age: number;
  countryCode: string;
  country: string;
  club: {
    id: number;
    name: string;
    url: string;
    country: string;
    countryCode: string;
  };
  skills: PlayerSkills;
  condition: number;
  moral: string;
  weeksAtClub: number;
  prefFoot: string;
  form: string;
  talentReport: CoachReports;
  experience: number;
  position: Position;
  contract: number;
  wage: number;
  estimatedValue: number;
  personalities: string[];
}

/**
 * Parses player's data from an individual player's page.
 * @return Player the player
 */
const parsePlayer = (doc = document): Player => {
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
  const skills: PlayerSkills = {};
  for (let i = 0; i < SKILL_NAMES.length; i++) {
    const skillName = SKILL_NAMES[i];
    skills[skillName] = Number(skillValueEls[i].textContent);
  }

  const [coachesReportTable, scoutReportTable] =
    document.querySelectorAll("#talentPanel table");
  const coachesReports = coachesReportTable
    ? [
        ...(coachesReportTable.querySelectorAll(
          "tr[class*=row]"
        ) as NodeListOf<HTMLTableRowElement>),
      ].map((e) => {
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
        };
      })
    : null;

  const scoutReports = scoutReportTable
    ? [
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
        };
      })
    : null;

  const averageTalent =
    talentEl?.querySelectorAll(":scope > li.coach_star.fa-star").length! +
    talentEl?.querySelectorAll(":scope > li.coach_star.fa-star-half-o")
      .length! /
      2;

  const talentReport = {
    averageTalent: averageTalent ? averageTalent : null,
    coachesReports,
    scoutReports,
  };

  return {
    id: Number(idEl.textContent!.replace(/\D+/g, "")),
    name: name,
    age: Number(ageEl.textContent!.replace(/\D+/g, "")),
    countryCode: (countryEl as HTMLImageElement).src.match(
      /(?<=flags_round\/half\/)\w+(?=\.png)/
    )![0],
    country: (countryEl as HTMLImageElement).title,
    club: {
      id: Number(clubLinkEl.href.replace(/\D/g, "")),
      name: clubLinkEl.textContent!,
      url: clubLinkEl.href,
      country: clubCountryEl.querySelector("img")!.title,
      countryCode: clubCountryEl
        .querySelector("img")!
        .src.match(/(?<=flags_small\/new\/)\w+(?=\.png)/)![0],
    },
    skills: skills,
    talentReport,
    condition: Number(conditionEl.textContent!.trim().replace("%", "")),
    moral: moralEl.textContent!.trim(),
    weeksAtClub: Number(weeksAtClubEl.textContent!.trim()),
    prefFoot: prefFootEl.textContent!.trim(),
    form: formValueEl.textContent!.trim(),
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

export { parsePlayer };
//parsePlayer()
