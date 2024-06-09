const parceLeagueTable = (doc = document) => {
  const parcedTable = [];
  const leagueTable = doc.querySelector("table#myTable") as HTMLTableElement;
  for (let i = 1; i < leagueTable.rows.length; i++) {
    const rows = leagueTable.querySelectorAll("tr");
    const cells = rows[i].querySelectorAll("td")!;
    parcedTable.push({
      POS: Number(cells[0].textContent!.trim()),
      TEAM: {
        name: cells[1].textContent!.trim(),
        URL: (cells[1].firstElementChild as HTMLAnchorElement).href,
      },
      PL: Number(cells[3].textContent!.trim()),
      W: Number(cells[4].textContent!.trim()),
      D: Number(cells[5].textContent!.trim()),
      L: Number(cells[6].textContent!.trim()),
      F: Number(cells[7].textContent!.trim()),
      A: Number(cells[8].textContent!.trim()),
      PTS: Number(cells[9].textContent!.trim()),
    });
  }
  return parcedTable;
};
const parseMatchTablehead = (doc: Document) => {
  if (!doc) doc = document;
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
const parseMatches = (doc: Document) => {
  if (!doc) doc = document;
  const matches: {
    round: { number: number; time: { date: string; time: string } };
    matches: {
      homeTeam: { name: string; id: number };
      awayTeam: { name: string; id: number };
      game: { score: string; id: number };
    }[];
  }[] = [];
  const gamesTables = doc.querySelectorAll("div.cup_title + div>table");
  const tableHeads = parseMatchTablehead(doc);
  gamesTables.forEach((table, index) => {
    const parcedTable = [...table.querySelectorAll("tr")].map((e) => {
      const anchors = e.querySelectorAll("a");
      const parcedLine = {
        homeTeam: {
          name: anchors[0].textContent!.trim(),
          id: Number(anchors[0].href.match(/clubid\/(\d+)/)![1]),
        },
        awayTeam: {
          name: anchors[2].textContent!.trim(),
          id: Number(anchors[2].href.match(/clubid\/(\d+)/)![1]),
        },
        game: {
          score: anchors[1].textContent!.trim(),
          id: Number(anchors[1].href.match(/gameid\/(\d+)/)![1]),
        },
      };
      return parcedLine;
    });
    matches.push({ round: tableHeads[index], matches: parcedTable });
  });
  return matches;
};

const parseLeague = (doc: Document) => {
  if (!doc) doc = document;
  return { leagueTable: parceLeagueTable(doc), schedule: parseMatches(doc) };
};

export default parseLeague;
