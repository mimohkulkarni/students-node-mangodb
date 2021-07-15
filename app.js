const express = require('express');
const app = express();

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongoose').Types;

const uri = "mongodb+srv://mimoh:0DcY8xOqD1PUKaou@cluster0.seqr2.mongodb.net/students?retryWrites=true&w=majority";

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('students-table')
    const studentsCollection = db.collection('students')

    app.set('view engine', 'ejs')
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    app.use(express.static('public'))

    app.get('/', (req, res) => {
        db.collection('students').find().toArray()
          .then(students => {
            res.render('index.ejs', { students:students })
          })
          .catch(error => console.error(error))
      })

      app.get('/add', (req, res) => {
        res.render('add.ejs');
      })
  
      app.post('/add', (req, res) => {
        const student = getFormattedStudent(req.body);
        studentsCollection.insertOne(student)
          .then(() => {
            res.redirect('/')
          })
          .catch(error => console.error(error))
      })

      app.get('/update/:id',async (req, res) => {
        const student = await studentsCollection.findOne({_id: ObjectId (req.params.id)});
        res.render('update.ejs',{student: student});
      })
  
      app.post('/update', async (req, res) => {
        const student = getFormattedStudent(req.body);
        await studentsCollection.replaceOne({_id: ObjectId(req.body.id)},student,{upsert: true})
          .then(() => {
            res.redirect('/')
          })
          .catch(error => console.error(error))
      })

      app.get('/delete/:id',async (req, res) => {
        await studentsCollection.deleteOne({_id: ObjectId(req.params.id)})
          .then(() => res.redirect("/"))
          .catch(error => console.error(error))
      })
  
      const PORT = 3000
      app.listen(PORT, function () {
        console.log(`listening on port ${PORT}`)
      })
    })
    .catch(console.error)

  const getFormattedStudent = body => {
    const student = {
      name: body.name,
      contact: body.contact,
      subjects: Array.isArray(body.subjects) ? body.subjects : new Array(body.subjects),
      class: body.class,
      year: body.year
    }
    if(body.society){
      student.society = Array.isArray(body.society) ? body.society : new Array(body.society);
    }
    // console.log(student);
    return student;
  }