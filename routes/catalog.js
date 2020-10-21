const express = require('express')
const router = express.Router()
const checkIfAuthenticated = require('../auth/utils')
const UserCourse = require('../models/UserCourse')
const {Course, Video} = require('../models/Course')

const algoliasearch = require("algoliasearch");
const client = algoliasearch("8J6CR8F7VC", "c0a86e89b92d5d33a9254d5bf2551e65");
const index = client.initIndex("COURSE");

// Get list of top courses
router.get('/courses', function (req, res, next) {
    Course.find().sort({views: -1}).limit(20).then((courses) => {
        res.status(200).send(courses)
    }).catch((err) =>{
        res.status(500).send('Error getting courses:' + err)
    })
})

// Get course by code
router.get('/courses/:code', function(req, res) {
    var code = req.params.code  
    if (code == null) {
        res.status(400).send('No code supplied')
    }
    Course.findOne({objectID: code}).then((course) => {
        if (course == null) {
            
        }
        res.status(200).send(course)
    }).catch((err) =>{
        res.status(500).send('Error getting course:' + err)
    })
})

// Get a specific item by code
router.get('/courses/:course/item/:item', function(req, res) {
    var code = req.params.course  
    var itemCode = req.params.item
    if (code == null || itemCode == null) {
        res.status(400).send('No code supplied')
    }
    Course.findOne({objectID: code}).then((course) => {
        if (course == null) {
            res.status(404).send('No course found')
        }
        var index = null
        for (var i = 0; i < course.videos.length; i++) {
            if (course.videos[i]['id'] == itemCode) {
                index = i
            }
        }
        if (index == null) res.status(404).send('No Item Found')
        res.send({
            course: course,
            index: index
        })
    }).catch((err) =>{
        res.status(500).send('Error getting course:' + err)
    })
})

// Add a new course - need to check if authenticated later
router.post('/courses', function(req, res) {
    var course = req.body
    if (course == null)  res.status(400).send('No Course Sent')
    const myCourse = Course(course).save()
    .then(function(document) {
        if (document==null) res.status(500).send('Failed to add course:' + error)    
        index.saveObject(document.toObject()).catch((err) => console.log(err));a
        res.send('Added Course!')
    })
    .catch(function(error) {
        res.status(500).send('Failed to add course:' + error)
    })
})

// Get progress on a course by code for a user
router.get('/progress/:course', checkIfAuthenticated, function(req, res) {
    var course = req.params.course
    if (course == null) {
        res.status(400).send('No Course Sent')
        return
    }  
    const uid = res.locals.uid; // Get user ID
    User.findOne({uid: uid}).populate('courses.course').then( (user) => {
        if (user == null) res.status(404).send('Error fetching')
        var foundCourse;
        for (var i = 0; i < user.courses.length; i++) {
            var userCourse = user.courses[i]
            if (userCourse.course.objectID.localeCompare(course) == 0) {
                foundCourse = userCourse
            }
        }
        if (foundCourse != null) {
            res.json({
                course: course,
                completed: foundCourse.completed
            })
        } else {
            res.json({
                course: course,
                completed: []
            })
        }
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})

// Update progress of a user 
router.post('/progress/:course', checkIfAuthenticated, function(req, res) {
    var course = req.params.course
    var updated = req.body.completed
    console.log('this object is' + course)
    var d = new Date();
    if (course == null) {
         res.status(400).send('No Course Sent')
         return
    }
    const uid = res.locals.uid; // Get user ID
    User.findOne({uid: uid}).populate('courses.course').then( (user) => {
        if (user == null) res.status(404).send('Error fetching homepage details')
        var foundCourse;
        console.log(user.courses)
        for (var i = 0; i < user.courses.length; i++) {
            var courseIndex = i
            if (user.courses[courseIndex].course.objectID.localeCompare(course) == 0) {
                foundCourse = courseIndex
                console.log('Found course!')
            }
        }

        if (foundCourse == null) {
            Course.findOne({objectID: course})
                .then((doc) => {
                    if (doc == null) {
                        res.send('Error finding course')
                        return
                    }
                    console.log('Found course!' + doc)
                    const myCourse = UserCourse({
                        course: doc._id,
                        completed: updated,
                        dateUpdated: Math.round(d.getTime() / 1000)
                    })
                    if (user.courses == null) {
                        user.courses = []
                    }
                    user.courses.push(myCourse)
                    
                    user.save().then((usr) => {
                        console.log('finished updating user' + usr)
                        res.send('Done!')
                    })
                    .catch((err) => {
                        console.log('error updating user' + err)
                        res.send('Error saving data' + err)
                    })
                    
                })
                .catch((err) => {
                    res.send('Error finding course:' + err)
                })
        } else {
            user.courses[foundCourse].completed = updated,
            user.courses[foundCourse].dateUpdated = Math.round(d.getTime() / 1000)
            user.save().then((usr) => {
                res.send('Done!')
            })
            .catch((err) => {
                res.send('Error saving data' + err)
            })
        }
        
    })
    .catch((err) => {
        res.status(500).send('Error fetching details:' + err)
    })
})


module.exports = router