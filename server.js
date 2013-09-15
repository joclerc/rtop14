#!/bin/env node

var express = require('express')
var teams = require('js/teams');
var jours = require('js/jours');
var dates = require('js/lesdates');
dates.setDates();
var lesdates = dates.getDates();
var jourEnCours="J0"
var scores = require('js/scores');
var resultats = require('js/resultats');
var champion = require('js/championnat');

var app = express();
app.set('view engine', 'ejs');
app.use(express.bodyParser());
app.use("/stylesheets",express.static(__dirname + "/public/stylesheets"));
app.use("/lib",express.static(__dirname + "/public/javascripts"));
app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'))
console.log('Express server listening on port ' + app.get('port'));

app.get('/', function(req, res) {
	//res.send('Welcome to Node Twitter')
	 var title = 'Chirpie',
     header = 'Menu TOP14'
	//console.log(dates.getDates());
  res.render('index', {
    locals: {
      'title': title,
      'header': header,
      stylesheets: ['/public/stylesheets/style.css']
    }
  })
})

app.get('/team', function(req,res) {
	var title='Traitement des Teams (consultation/modification/suppression)'
	var header='Welcome to TOP14'
	var liste = teams.teams
  res.render('team', {
    locals: {
      'title': title,
      'header': header,
	  'header': 'liste des teams',
	  'teams': liste
    }
  })
})

app.get('/journee',function(req,res) {
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('journee', {
		'teams': teams.teams,
		'jours': jours.getMatchs(),
		'day': jourEnCours,
		'lesdates': lesdates,
		'header':'Journees de championnat',
		'resultats':resultats
	})
})

app.get('/journee/refresh/:id',function(req,res) {
	jourEnCours = req.params.id
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('journee', {
		'teams': teams.teams,
		'jours': jours.getMatchs(),
		'day': jourEnCours,
		'lesdates': lesdates,
		'header':'Journees de championnat',
		'resultats':resultats
	})
})

app.get('/listescores',function(req,res) {
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('listescore', {
		'teams': teams.teams,
		'jours': jours.getMatchs(),
		'day': jourEnCours,
		'lesdates': lesdates,
		'resultats':resultats
	})
})

app.get('/listescores/refresh/:id',function(req,res) {
	jourEnCours = req.params.id
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('listescore', {
		'teams': teams.teams,
		'jours': jours.getMatchs(),
		'day': jourEnCours,
		'lesdates': lesdates,
		'resultats':resultats
	})
})


app.get('/score/:jr/:eq',function(req,res) {
	//console.log(req.params.jr)
	//console.log(req.params.eq)
	res.render('score', {
		'jour':req.params.jr,
		'equipe':req.params.eq,
		'header':'Les scores de match',
		'liste':scores.getScores(req.params.jr.toString()+","+req.params.eq.toString())
	})
})

app.post('/newday',function(req,res) {
	//console.log(req.body.jours);
	//console.log(req.body.local);
	//console.log(req.body.visit);
	jours.addMatch({'jour':req.body.jours,
					'match':[req.body.local,req.body.visit]
					});
	res.redirect('/journee');
})


app.get('/newteam',function(req,res) {
	res.render('newteam', {
		'header':'Nouveau Team'
	})
})

app.get('/team/mod/:id',function(req,res) {
	var teamToMod=teams.getItem(req.params.id)
	//console.log(teamToMod);
	res.render('modteam', {
		'team':teamToMod,
		'header':'Modifier Team',
		'rang':req.params.id
	})
})

app.post('/ajoutteam',function(req,res) {
	var ajout = {'code':req.body.code,
					'nom':req.body.nom,
					'lieu':req.body.lieu}
	//console.log(ajout);
	teams.ajout(ajout)
	res.redirect('/team');
})

app.post('/modifteam',function(req,res) {
	var modif = { 'rang':req.body.rang,
				'code':req.body.code,
				'nom':req.body.nom,
				'lieu':req.body.lieu}
	//console.log(modif);
	teams.setItem(modif);
	res.redirect('/team');
})

app.get('/team/sup/:id',function(req,res) {
	//console.log(req.params.id);
	teams.sup(req.params.id);
	res.redirect('/team');
})

app.post('/ajoutscore',function(req,res) {
	var jour=req.body.jour
	var equipe=req.body.equipe
	var temps=req.body.temps
	var joueur=req.body.joueur
	var pts=req.body.pts
	var record={}
	//var record = {'score':[jour,equipe],'temps':temps,'pts':pts,'joueur':joueur}
	record['score']=jour.toString()+","+equipe.toString()
	record[[jour,equipe]]={'temps':temps,'pts':pts,'joueur':joueur}
	//console.log(jour+": "+equipe+": "+temps+": "+pts+": "+joueur);
	//console.log(record);
	scores.addScores(record);
	res.redirect('/score/'+jour+'/'+equipe);
})

app.get('/resultatjour',function(req,res) {
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('resultatjour', {
		'day': jourEnCours,
		'lesdates': lesdates,
		'header': 'Resultat jour',
		'listeres':resultats.listerResultats()
	})
})

app.get('/resultatjour/refresh/:id',function(req,res) {
	jourEnCours = req.params.id
	resultats.calcul(jourEnCours,jours.getMatchsJour(jourEnCours),scores);
	res.render('resultatjour', {
		'day': jourEnCours,
		'lesdates': lesdates,
		'header': 'Resultat jour',
		'listeres': resultats.listerResultats()
	})
})

app.get('/championnat', function(req,res) {
	var result = champion.calcul();
	res.render('championnat', {
		'header': 'Championnat TOP14 2013/2014',
		'listeres': Object.getOwnPropertyNames(result),
		'dicores': result
	})
})

