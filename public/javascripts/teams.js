function Teams(element) {
  var teamsElement = $(element),
      draftTeams = [],
      defaultTeams = [
        { id: 1, name: 'Caught Red Hernandez', cash: 200, players: [] },
        { id: 2, name: 'The Raji Mathai\'s', cash: 200, players: [] },
        { id: 3, name: 'Kaep\'n Crunch', cash: 200, players: [] },
        { id: 4, name: 'The Smooth Peas', cash: 200, players: [] },
        { id: 5, name: 'New Mexico Hood Rats', cash: 200, players: [] },
        { id: 6, name: 'Chad\'s Champion Team', cash: 200, players: [] },
        { id: 7, name: 'Felton Sluggers', cash: 200, players: [] },
        { id: 8, name: 'The Bomb Threats', cash: 200, players: [] },
        { id: 9, name: 'Jeremy\'s Nice Team', cash: 200, players: [] },
        { id: 10, name: 'Water Sucks', cash: 200, players: [] }
      ];

  var storedTeams = window.localStorage.getItem('draftee:teams');
  if (storedTeams) {
    draftTeams = JSON.parse(storedTeams).teams;
    populateTable();
  } else {
    resetDraftData();
  }

  function getNames() {
    return draftTeams.map(function (team) {
      return team.name;
    });
  }

  function getCashRemaining(team) {
    return team.cash - (14 - team.players.length)
  }

  function resetDraftData() {
    draftTeams = $.extend(true, {}, {teams: defaultTeams}).teams;

    populateTable();
    persist();
  }

  function populateTable() {
    teamsElement.empty();
    draftTeams.forEach(function (team) {
      teamsElement.append(
        $('<tr></tr>').append(
          $('<td></td>').text(team.name),
          $('<td></td>').text(team.cash).attr('id', 'cash' + team.id).addClass('money'),
          $('<td></td>').text(getCashRemaining(team)).attr('id', 'maxBid' + team.id).addClass('money')
        )
      );
    });
  }

  function draft(draftableName, winningTeam, amount) {
    draftTeams.forEach(function (team) {
      if (team.name == winningTeam) {
        // Charge the team
        team.cash -= amount;

        // Add the player to it's team
        team.players.push(draftableName);

        // Save the team state, and re-populate the table
        persist();
        populateTable();
      }
    });
  }

  function persist () {
    if (window.localStorage) {
      window.localStorage.setItem("draftee:teams", JSON.stringify({teams: draftTeams}));
    }
  }

  return {
    resetDraftData: resetDraftData.bind(this),
    populateTable: populateTable.bind(this),
    persist: persist.bind(this),
    draft: draft.bind(this),
    getNames: getNames.bind(this)
  };
}
