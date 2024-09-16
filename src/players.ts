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
interface PlayersAttributes {
  [key: (typeof ATTRIBUTE_NAMES)[number]]: number;
}

/**
 * Interface that defines the attributes of a player.
 * The keys are the names of the attributes, which are defined in the `ATTRIBUTE_NAMES` constant.
 * The values are the player's attributes, as numbers.
 */
export interface Player {
  position: string;
  nationalTeam: string | null;
  name: string;
  transferListed: boolean;
  bidStarted: boolean;
  injured: boolean;
  redCard: boolean;
  onLoan: boolean;
  loanedOut: boolean;
  id: number;
  age: number;
  country: { name: string; code: string };
  rating: number;
  attributes: PlayersAttributes | null;
  tableRow: HTMLTableRowElement;
}

/**
 * Parses the player tables on club players page returns an array of player objects.
 * @param {Document} [doc=document] players page document. defaults to current document if not passed
 * @returns {Player[]} An array of player objects @see {@link Player}.
 */
export const parsePlayerTables = (doc = document): Player[] => {
  // Get all player tables on the page. GOALKEEPERS / DEFENDERS / MIDFIELDERS / ATTACKERS
  const playerTables = [
    ...(doc.querySelectorAll(
      "table.forumline"
    ) as NodeListOf<HTMLTableElement>),
  ];

  // check if the current page is the player page of the user's own team
  // all the cells are increased by 1 if the user is on their own team
  // the reason for this is that on the user own the first cell is used for active position(setting tactics)
  const isOwnTeam =
    doc.querySelector("div#top_positions")!.childElementCount > 0 ? 1 : 0;

  // Parse each player table and return an array of player objects
  return playerTables
    .map((table) => {
      return [
        ...(table.querySelectorAll(
          "tr[class*='matches_row']"
        ) as NodeListOf<HTMLTableRowElement>),
      ].map((tr) => {
        const cells = tr.cells;

        const playerPosEl = cells[0 + isOwnTeam];
        const playerInfoEl = cells[1 + isOwnTeam];
        const playerNameEl = cells[2 + isOwnTeam];
        const playerAgeEl = cells[3 + isOwnTeam];
        const playerNatEl = cells[4 + isOwnTeam];
        const playerRatEl = cells[5 + isOwnTeam];

        const playerLinkEl = playerNameEl.querySelector("a")!;
        const playerName = playerLinkEl.textContent!.trim();

        const playerID = Number(playerLinkEl.href.match(/playerID\/(\d+)/)![1]);

        const NT = playerPosEl
          .firstElementChild!.className.replace("_icon", "")
          .toUpperCase();

        const onLoan = playerLinkEl
          .textContent!.trim()
          .match(/^([^\(\)]+) \([^\(\)]*\)$/);
        const loanedOut = !playerInfoEl.firstElementChild;

        const transferListed = !!cells[2 + isOwnTeam].querySelector(".pl_tra");
        const bidStarted = !!cells[2 + isOwnTeam].querySelector(".pl_bid");

        const injured = !!cells[2 + isOwnTeam].querySelector(".pl_injured");
        const redCard = !!cells[2 + isOwnTeam].querySelector(".pl_cardr");

        const attributesObject: PlayersAttributes = {};
        if (!loanedOut) {
          const playerAttributs = [
            ...playerInfoEl.querySelectorAll("td[class]"),
          ]
            .map((td) => Number(td.textContent))
            .filter((attr) => attr);

          ATTRIBUTE_NAMES.forEach(
            (ATTRIBUTE, i) => (attributesObject[ATTRIBUTE] = playerAttributs[i])
          );
        }

        return {
          position: playerPosEl.textContent!.trim(),
          nationalTeam: NT === "DEF" ? null : NT,
          name: onLoan ? onLoan[1] : playerName,
          transferListed,
          bidStarted,
          injured,
          redCard,
          onLoan: onLoan ? !loanedOut : false,
          loanedOut,
          id: playerID,
          age: Number(playerAgeEl.textContent!.trim()),
          country: {
            name: (playerNatEl.firstElementChild as HTMLImageElement).title,
            code: (playerNatEl.firstElementChild as HTMLImageElement).src.match(
              /(?<=flags_small\/new\/)\w+(?=\.png)/
            )![0],
          },
          rating: Number(playerRatEl.textContent!.trim()),
          attributes: loanedOut ? null : attributesObject, // we check if loadedout because the attribues table isnt availble for loaned players for some reason
          tableRow: tr,
        };
      });
    })
    .flat(1);
};

//parsePlayerTables()
