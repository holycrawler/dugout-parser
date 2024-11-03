export const parseMatch = (doc: Document = document) => {
  const homeScoreEl = doc.querySelector("div#goals_home");
  const awayScoreEl = doc.querySelector("div#goals_away");
  const homeTeamEl = homeScoreEl!.previousElementSibling;
  const awayTeamEl = awayScoreEl!.nextElementSibling;
};
