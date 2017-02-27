const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('Recipes List', function(){

    before(function(){
        return runServer();
    });

    after(function(){
        return closeServer();
    });

    it('should return list of recipes', function (){
        chai.request(app)
        .get('/recipes')
        .then(function(res){
            res.should.have.status(200);
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.length.should.be.at.least(1);

            const expectedKeys = ['id', 'name', 'ingredients'];
            res.body.forEach(function(item){
                item.should.be.a('object');
                item.should.include.keys(expectedKeys);
            });
        });
    }); // end get

    it('should add item on POST', function(){
        const newRecipes = {
            name: 'test recipes',
            ingredients: ['test', 'recipes', 2]
        };

        const badRecipes = {
            name: 'test bad recipes'
        };

        //test good input
        return chai.request(app)
            .post('/recipes')
            .send(newRecipes)
            .then(function(res){
                res.should.have.status(201);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.include.keys('name', 'ingredients', 'id');
                res.body.name.should.equal(newRecipes.name);
                res.body.ingredients.should.be.a('array');
                res.body.ingredients.should.include.members(newRecipes.ingredients);
                res.body.should.deep.equal(Object.assign(newRecipes, {id: res.body.id}));
            })
          
          //test bad input
          return chai.request(app)
            .post('/recipes')
            .send(badRecipes)
            .then(function(res){
                res.should.have.status(400);
                res.should.not.be.json;
            });

    }); // end of POST

    it('should update item on PUT', function(){
        //update item
        const updatedRecipes = {
            name: 'new test recipes',
            ingredients: ['new', 'test', 'recipes']
        };
        
        //request for id
        return chai.request(app)
            .get('/recipes')
            .then(function(res){
                updatedRecipes.id = res.body[0].id;
                return chai.request(app)
                    .put(`/recipes/${updatedRecipes.id}`)
                    .send(updatedRecipes)
            }) //end of get and put req
            .then(function(res){
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.deep.equal(updatedRecipes);
            });
    }); // end PUT

    it('should delete an item', function(){
        // request ID
        return chai.request(app)
            .get('/recipes')
            .then(function(res){
                return chai.request(app)
                    .delete(`/recipes/${res.body[0].id}`);
            })
            .then(function(res){
                res.should.have.status(204);
            });

    }); // end of DELETE

}); //end of describe