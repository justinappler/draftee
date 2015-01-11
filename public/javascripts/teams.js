function Teams(element) {
  var teams = [
  'Caught Red Hernandez',
  'Monica\'s Lips, Clinton-Dix',
  'Turn Down for WATT',
  'Breezus, King of the Drews',
  'Felton Sluggers',
  'The Bomb Threats',
  'Jeremy\'s Nice Team',
  'Water Sucks'];

  // TODO This should be configurable
  var teamComposition = ['QB', 'WR', 'WR', 'RB', 'RB', 'TE', 'K', 'DEF', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN', 'BN'];

  var teamsElement = $(element),
      draftTeams = [],
      defaultTeams = $.map(teams, function(team, index) {
         return { id: index, name: team, cash: 200, players: [] };
      });

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

  function getTeamsPositions(players) {
    var teamsPositions = [],
        availablePositions = {};

    // Get a count of available positions
    teamComposition.forEach(function(position) {
      if (!availablePositions[position]) {
        availablePositions[position] = 0;
      }
      availablePositions[position]++;
    });

    // Remove bought players from the team's available list
    players.forEach(function(player) {
      if (availablePositions[player.position] > 0) {
        availablePositions[player.position]--;
      } else if (availablePositions['BN'] > 0) {
        availablePositions['BN']--;
      } else {
        // TODO we probably want to surface this error when the
        // team tries to buy the player
        console.warn('Team has the wrong player compisition')
      }
    });

    // Build the list of team positions
    teamComposition.forEach(function(position) {
      var span = $('<span></span>');
      span.addClass('position');

      // If there aren't any remaining, then the
      // position has been taken
      if (availablePositions[position] > 0) {
        availablePositions[position]--;
      } else {
        span.addClass('taken');
      }

      span.text(position);
      teamsPositions.push(span);
    });

    return teamsPositions;
  }

  function populateTable() {
    teamsElement.empty();
    draftTeams.forEach(function (team) {
      teamsElement.append(
        $('<tr></tr>').append(
          $('<td></td>').append(
            $('<div></div>').text(team.name),
            $('<div></div>').addClass('positions').append(getTeamsPositions(team.players))),
          $('<td></td>').text(team.cash).attr('id', 'cash' + team.id).addClass('money'),
          $('<td></td>').text(getCashRemaining(team)).attr('id', 'maxBid' + team.id).addClass('money')
        )
      );
    });
  }

  function draft(draftableName, draftablePosition, winningTeam, amount) {
    draftTeams.forEach(function (team) {
      if (team.name == winningTeam) {
        // Charge the team
        team.cash -= amount;

        // Add the player to it's team
        team.players.push({
          name: draftableName,
          position: draftablePosition
        });

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
