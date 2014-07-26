function Transactions(element) {
  var transElement = $(element),
      transactions = [];

  var storedTransactions = window.localStorage.getItem('draftee:transactions');
  if (storedTransactions) {
    transactions = JSON.parse(storedTransactions).transactions;
    populateTable();
  } else {
    resetTransactions();
  }

  function addTransaction(team, draftableName, price) {
    position = transactions.length + 1;
    transactions.push({
      team: team,
      draftable: draftableName,
      price: price,
      position: position
    });

    persist();
    populateTable();
  }

  function isDrafted(draftableName) {
    return transactions
      .filter(function(transaction) {
        return transaction.draftable.indexOf(draftableName) != -1;
      })
      .length > 0;
  }

  function resetTransactions() {
    transactions = [];

    populateTable();
    persist();
  }

  function populateTable() {
    transElement.empty();

    transactions.forEach(function (transaction) {
      transElement.prepend(
        $('<tr></tr>').append(
          $('<td></td>').text(transaction.position),
          $('<td></td>').text(transaction.team),
          $('<td></td>').text(transaction.draftable),
          $('<td></td>').text(transaction.price).addClass('money')
        )
      );
    });
  }

  function persist () {
    if (window.localStorage) {
      window.localStorage.setItem("draftee:transactions",
        JSON.stringify({transactions: transactions}));
    }
  }

  return {
    resetTransactions: resetTransactions.bind(this),
    persist: persist.bind(this),
    addTransaction: addTransaction.bind(this),
    isDrafted: isDrafted.bind(this)
  };
}
