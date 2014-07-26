function NFLData() {
  var players = [];
  var teams = [];

  var total = 0;
  var loadedCallback;

  var nflDataKey = 'draftee:nflData';
  var positions = ['K', 'WR', 'TE', 'RB', 'QB', 'DEF'];

  var loaded = {
    'K': false,
    'TE': false,
    'WR': false,
    'RB': false,
    'QB': false,
    'DEF': false
  };

  function expose() {
    return {
      players: players,
      teams: teams
    };
  }

  function clearData() {
    window.localStorage.removeItem(nflDataKey);
    players = [], teams = [];
    positions.forEach(function(key) {
      loaded[key] = false;
    });
  }

  function loadData(callback) {
    var storedNFLData;

    if (window.localStorage &&
          (storedNFLData = window.localStorage.getItem(nflDataKey))) {

      var storedNFLDataObject = JSON.parse(storedNFLData);
      players = storedNFLDataObject.players;
      teams = storedNFLDataObject.teams;

      total = players.length + teams.length;

      callback(total);
    } else {
      loadedCallback = callback;
      callKimonoAPI('DEF');
    }
  }

  function loadPlayerData() {
    positions.forEach(function(position) {
        if (position != 'DEF') {
          callKimonoAPI(position);
        }
    });
  }

  function doneLoading() {
    if (window.localStorage) {
      window.localStorage.setItem(nflDataKey, JSON.stringify({
        players: players,
        teams: teams
      }));
    }

    loadedCallback(total);
  }

  function abbrevToTeam(abbrev) {
    var name = abbrev;
    teams.forEach(function (team) {
      if (team.abbrev.indexOf(abbrev) != -1) {
        name = team.name;
      }
    });
    return name;
  }

  function toFirstLast(name) {
    return name.split(',').map(function (c) {return c.trim();}).reverse().join(' ');
  }

  function callKimonoAPI(position) {
    $.ajax({
      "url": '/nflData?position=' + position,
      "dataType": "json"
    })
    .done(function (data) {
      if (position == 'DEF') {
        getTeams(data);
      } else {
        getPlayers(data);
      }
    });
  }

  function getPlayers(data) {
    if (data.results.collection1) {
      data.results.collection1.forEach(function(player) {
        players.push({
          name: toFirstLast(player.name.text),
          number: player.number,
          position: player.position,
          team: abbrevToTeam(player.team.text)
        });
      });
    }

    if (data.results.collection1.length > 1) {
      var position = data.results.collection1[0].position;
      loaded[position] = true;
      total += data.results.collection1.length;

      if (isLoaded()) {
        doneLoading();
      }
    }
  }

  function getTeams(data) {
    if (data.results.collection1) {
      data.results.collection1.forEach(function(teamObj) {
        teams.push({
          name: teamObj.team.text,
          abbrev: teamObj.team.href.split('=')[1]
        });
      });
    }

    if (data.results.collection1.length > 1) {
      loaded['DEF'] = true;
      total += data.results.collection1.length;

      loadPlayerData();
    }
  }

  function isLoaded() {
    for (var i = 0; i < positions.length; i++) {
      if (!loaded[positions[i]]) {
        return false;
      }
    }

    return true;
  }

  function findDraftables(query) {
    matches = [];

    players.forEach(function (player) {
      var playerName = player.name.toLowerCase();
      if (playerName.indexOf(query.toLowerCase()) != -1) {
        matches.push(player);
      }
    });

    teams.forEach(function (team) {
      var teamName = team.name.toLowerCase();
      if (teamName.indexOf(query.toLowerCase()) != -1) {
        matches.push(team);
      }
    })

    return matches;
  }

  return {
    clearData: clearData.bind(this),
    loadData: loadData.bind(this),
    findDraftables: findDraftables.bind(this),
    expose: expose.bind(this)
  };
}
