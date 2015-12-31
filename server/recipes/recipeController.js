var db = require('../data.js');
var search = require('../search.js');
var Recipe = require('./recipeModel.js');
var request = require('request');
var Q = require('q');

module.exports = {
  getAll: function(req, res) {
    res.status(200);
    res.json(db);
  },
  getYummlyData: function(req, res, next) {
    // insert api id and api password
    var apiId = '';
    var apiPW = '';
    var searchParams = req.body;
    var searchString = '';

    // creates api parameter string
    for (key in searchParams) {
      searchParams[key].forEach(function(val) {
        if (val.name === searchParams[key]){
          searchString += ('&' + 'allowed' + key.charAt(0).toUpperCase() + key.slice(1) + '[]=' + val.searchValue);
        }
      })
    }

    var apiUrl = 'http://api.yummly.com/v1/api/recipes?_app_id' + apiId + '&_app_key=' + apiPW + searchString + '&requirePictures=true';
    request(apiUrl, function (err, response, body) {
      if (err) {
        res.status(401).send();
      } else {
        res.json(body);
      }
    });
  },
  saveRecipe: function(req, res, next) {
    var id = req.body.id;
    
    var findRecipe = Q.nbind(Recipe.findOne, Recipe);
    findRecipe({id: id})
      .then(function (recipe) {
        // if recipe exists, we want to iterate the number of saves
        // to keep track of popularity
        if (recipe) {
          recipe.numberOfSaves++;
          recipe.save();
        } else {
          var newRecipe = new Recipe(req.body);
          return newRecipe.save();
        }
      });
  }
};
