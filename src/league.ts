/**
 * the league table from league page.
 */
interface LeagueTable {
  pos: number;
  teamName: string;
  teamId: number;
  pl: number;
  w: number;
  d: number;
  l: number;
  f: number;
  a: number;
  pts: number;
}

/**
 * Parses the league table from the league page.
 * @param {Document} [doc=document] - The document to parse, defalts to the current document if not passed.
 * @returns {LeagueTable[]} - The parsed league table.
 */
const parceLeagueTable = (doc: Document = document): LeagueTable[] => {
  const parcedTable: LeagueTable[] = [];
  const leagueTable = doc.querySelector("table#myTable") as HTMLTableElement;
  for (let i = 1; i < leagueTable.rows.length; i++) {
    const rows = leagueTable.querySelectorAll("tr");
    const cells = rows[i].querySelectorAll("td")!;
    parcedTable.push({
      /** The position of the team in the league table. */
      pos: Number(cells[0].textContent!.trim()),
      /** The name of the team. */
      teamName: cells[1].textContent!.trim(),
      /** The ID of the team. */
      teamId: Number(
        (cells[1].firstElementChild as HTMLAnchorElement).href.match(
          /clubid\/(\d+)/
        )![1]
      ),
      /** The number of played matches. */
      pl: Number(cells[3].textContent!.trim()),
      /** The number of wins. */
      w: Number(cells[4].textContent!.trim()),
      /** The number of draws. */
      d: Number(cells[5].textContent!.trim()),
      /** The number of losses. */
      l: Number(cells[6].textContent!.trim()),
      /** The number of goals scored. */
      f: Number(cells[7].textContent!.trim()),
      /** The number of goals conceded. */
      a: Number(cells[8].textContent!.trim()),
      /** The number of points. */
      pts: Number(cells[9].textContent!.trim()),
    });
  }
  return parcedTable;
};

interface MatchTablehead {
  number: number; // round number
  time: {
    date: string; // the format will depend your dugout settings but default is "dd.mm.yyyy"
    time: string; // hh:mm
  };
}

/**
 * Parses the table head of a match and returns an array of MatchTablehead objects.
 *
 * @param {Document} [doc=document] - The document to parse, defaults to the current document if not passed.
 * @return {MatchTablehead[]} - An array of MatchTablehead objects.
 */
const parseMatchTablehead = (doc: Document = document): MatchTablehead[] => {
  const tableHeads = [...doc.querySelectorAll("div.cup_title")].map((th) =>
    th.textContent!.trim()
  );
  return tableHeads.map((e) => {
    const match = e.match(/Round (\d+) matches\s?\((\S+)\s?(\S+)\s?\s?\)/);
    const roundNumber = match![1];
    const matchDateTime = match![2];
    const matchTime = match![3];
    return {
      number: Number(roundNumber),
      time: { date: matchDateTime, time: matchTime },
    };
  });
};

interface Matches {
  round: MatchTablehead;
  matches: {
    home: { name: string; id: number };
    away: { name: string; id: number };
    game: { score: string; id: number };
  }[];
}
/**
 * parses the matches bellow the league table in competition page
 * @param {Document} [doc=document] - The document to parse from, defaults to the current document if not passed.
 * @returns {Matches[]} - The parsed matches
 */
const parseMatches = (doc: Document = document): Matches[] => {
  const matches: Matches[] = [];
  const gamesTables = doc.querySelectorAll("div.cup_title + div>table");
  const tableHeads = parseMatchTablehead(doc);
  gamesTables.forEach((table, index) => {
    const parsedTable = [...table.querySelectorAll("tr")].map((e) => {
      const anchors = e.querySelectorAll("a");
      const parsedLine = {
        home: {
          name: anchors[0].textContent!.trim(),
          id: Number(anchors[0].href.match(/clubid\/(\d+)/)![1]),
        },
        away: {
          name: anchors[2].textContent!.trim(),
          id: Number(anchors[2].href.match(/clubid\/(\d+)/)![1]),
        },
        game: {
          score: anchors[1].textContent!.trim(),
          id: Number(anchors[1].href.match(/gameid\/(\d+)/)![1]),
        },
      };
      return parsedLine;
    });
    matches.push({ round: tableHeads[index], matches: parsedTable });
  });
  return matches;
};

interface League {
  leagueTable: LeagueTable[];
  matches: Matches[];
}

/**
 * Parses the league page and returns an object containing the league table and matches for that round.
 *
 * @param {Document} [doc=document] - The document to parse from, defaults to the current document if not passed.
 * @return {League} - An object containing the league table and round matches.
 */
const parseLeague = (doc: Document = document): League => {
  return {
    leagueTable: parceLeagueTable(doc),
    matches: parseMatches(doc),
  };
};

export default parseLeague;
