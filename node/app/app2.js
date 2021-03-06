// Include the modules
var express = require('express')            // express module for handling static files and requests easily
var mongoose = require('mongoose')          // mongoose is the databse driver for mongodb

var path = require('path')                  // path module helps us provide absolute paths for static files


var Student = require('./models/Student')   // the student model that we created in student.js

var app = express()                         // create a server app using express
mongoose.connect('mongodb://127.0.0.1:27017');          // connect to the mongodb server

app.use(express.static('public'))           // specify the folder where static files are kept

// API routes for different URLs
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/index.html'))           // serve the index.html file when user hits the root URL
})
// API route to create a new student
app.get('/createStudent', function (req, res) {
    var sname = req.query.name              // get the value of name from the query string the request URL
    var sage = req.query.age                // get the value of age from the query string the request URL
    var std = new Student({                 // create a new student object using the constructor from Student module
        name: sname,
        age: sage
    })
    std.save(function (err) {               // save the student object to actual databse collection
        if (err) {                          // handle the possibility of error
            throw err
            res.end(err)
        } else {                            // send appropriate response to the user if success
            console.log("student saved successfully!! ID: " + std.id)
            res.end("student saved successfully!! ID: " + std.id)
        }
    })
})
// API route to get all students
app.get('/getStudents', function (req, res) {
    res.setHeader('Content-Type', 'application/json')   // set the response header that tells the format of response here - JSON
    Student.find({}, function (err, students) {            // find the students in the collection, empty dictionary {} because we want all sudents thus we don't provide any serach filter
        if (err) {
            throw err
            res.end(err)
        } else {                                        // an array of student objects is returned by the databse
            console.log(students)
            res.end(JSON.stringify(students))
        }
    })
})
// API route to search student
app.get('/searchStudent', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    var sname = req.query.name
    Student.find({name: sname}, function (err, students) {          // here we provide the name given by the user as a search filter
        if (err) {
            throw err
            res.end(err)
        } else {
            console.log(students)
            res.end(JSON.stringify(students))
        }
    })    
})

// API route to update a student
app.get('/updateStudent', function (req, res) {
    var id = req.query.id                                   // extract the id, newname and newage values from the query string
    var newname = req.query.newname
    var newage = req.query.newage
    Student.find({_id: id}, function (err, students) {      // search the student with given id
        if (err) {
            throw err
            res.end(err)
        } else {                                            // because mongodb assigns unique ids to each student, the students array should have only one element
            if (students.length === 1) {
                res.write("Found Student: " + JSON.stringify(students))
                students[0].name = newname                  // update the fields
                students[0].age = newage
                students[0].save(function (err) {           // save the modified object
                    if (err) {
                        throw err
                        console.log("Could not update student! ID: " + id)
                        res.end("Could not update student! ID: " + id)
                    } else {
                        console.log("updated student! ID: " + id)
                        res.end("\nUpdated Student: " + JSON.stringify(students))
                    }
                })
            } else {
                res.end("No Such Student")
            }
        }
    }) 
})

// API route to delete a student
// similar to update, we first find the student to be deleted and then use the remove method to delete it fom the databse
app.get('/deleteStudent', function (req, res) {
    var id = req.query.id
    Student.find({_id:id}, function (err, students) {
        if (err) {
            throw err
            console.log(err)
            res.end(err)
        } else {
            console.log(students)
            res.write("Removing Students: " + JSON.stringify(students))
            if (students.length === 1) {
                students[0].remove(function (err) {
                    if (err) {
                        throw err
                        console.log(err)
                        res.end("An error occured" + err)
                    } else {
                        res.end("\nRemoved!!!")
                    }
                })
            }
        }
    })
})

// start the server
app.listen(8000, function () {
    console.log('App listening on port 8000!')
})