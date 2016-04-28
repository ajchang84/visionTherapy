const express = require("express");
const router = express.Router()
const knex = require("../db/knex");
const helpers = require('../helpers/authHelpers');

router.use(helpers.isAuthenticated);
router.use(helpers.isDoctor);
router.use(helpers.currentUser);

// INDEX doctors route
router.get('/', function(req,res){
  res.redirect(`/doctors/${req.user.id}`)
});


// VIEW doctor's dashboard
router.get('/:id', helpers.ensureCorrectUser, function(req,res){
  knex('doctors').join('patients', 'doctors.id', 'patients.doctor_id')
    .where('doctors.id', +req.params.id)
    .then((doctor_patients) => {
    res.format({
      'text/html':() =>{
        res.render('doctors/show', {doctor_patients});
      },
      'application/json':() =>{
        console.log(doctor_patients)
        res.send(doctor_patients)
      },
      'default': () => {
        // log the request and respond with 406
        res.status(406).send('Not Acceptable');
      }
    })
  });
})
// EDIT Doctor
router.get('/:id/edit', helpers.ensureCorrectUser, function(req,res){
  res.render('doctors/edit');
})

// GET Doctor's patient exercises info in JSON
router.get('/:id/ex', function(req,res){
  knex('patients').join('plans', 'patients.id', 'plans.patient_id')
    .select('exercises.name', 'plans.id')
    .join('exercises', 'exercises.id', 'plans.exercise_id')
    .where('patients.id', req.params.id)
    .then((data)=>res.json(data))
  
})


// DELETE Doctor
router.delete('/:id', helpers.ensureCorrectUser, function(req,res){
  knex('doctors').del().where('doctors.id', +req.params.id)
    .then(()=>{
      req.logout();
      res.redirect('/');      
    })
})

// PUT 
router.put('/:id', helpers.ensureCorrectUser, function(req,res){
  knex('doctors').update(req.body.doctor).where('doctors.id', +req.params.id).returning('id')
    .then((id)=>{
      res.redirect(`/doctors/${id}`);      
    })
})


module.exports = router;