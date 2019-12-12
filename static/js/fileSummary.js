/*Location of data - tags related to selected Top programming language*/
var ingredients_location = "static/data/ingredients.json";

var selected = [];
var currently_selected;

var ingredients = [];
$.ajax({
    type: 'GET',
    url: ingredients_location,
    dataType: 'json',
    async: false,
    success: function(ingredients_data) {ingredients = ingredients_data;}
});

number_of_ingredients = Object.keys(ingredients).length;

// Function to shuffle the demo data
function shuffle(num) {
  return ingredients[num];
}

// HEADS UP; for the _.map function i use underscore (actually lo-dash) here
function ingredData() {
  return _.map(_.range(0, number_of_ingredients-1), function(i) {
    return {
      id: i,
      text: shuffle(i),
    };
  });
}
(function() {
  // init select 2
  $('#ingred').select2({
    data: ingredData(),
    placeholder: 'search',
    multiple: true,
    // query with pagination
    query: function(q) {
      var pageSize,
        results,
        that = this;
      pageSize = 20; // or whatever pagesize
      results = [];
      if (q.term && q.term !== '') {
        // HEADS UP; for the _.filter function i use underscore (actually lo-dash) here
        results = _.filter(that.data, function(e) {
          return e.text.toUpperCase().indexOf(q.term.toUpperCase()) >= 0;
        });
      } else if (q.term === '') {
        results = that.data;
      }
      q.callback({
        results: results.slice((q.page - 1) * pageSize, q.page * pageSize),
        more: results.length >= q.page * pageSize,
      });
    },
  });

})();

function something(data) {
    selected.push(data.innerText);
}

// On change
document.querySelector("#ingred").onchange = ()=>{
    selected = [...document.querySelectorAll("#s2id_ingred > ul > li > div")]
                    .map((data)=>{return data.innerText;})
    // Update the "q" in the form
    var main = document.getElementsByClassName("main");
    main.q.value = "";

    for(var val=0; val <selected.length; val++) {
        main.q.value += selected[val] + ", ";
    }
    // Remove the last comma and space
    main.q.value = main.q.value.substring(0, main.q.value.length-2)
}

// On submission
$('form').on('submit', function (e) {
    e.preventDefault();
    $.post(window.location.href, $(this).serialize(), function (data) {
        console.log('Result Found!');
        $('textarea').val(data)
    });
});
