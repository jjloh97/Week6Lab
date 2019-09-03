let mongodb = require('mongodb');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

let MongoDBClient = mongodb.MongoClient; 
let url = "mongodb://localhost:27017/"

let db = []; //database
let col = null; //collection (table)
//global access, cllass level variable

let viewsPath = __dirname + "/views/";

app.use(express.static('images'));
app.use(express.static('css'));

MongoDBClient.connect(url, {useNewUrlParser:true, useUnifiedTopology:true}, function(err,client){
    //MongoDBClient.connect(url, function(err,client))
    //userNewURLParser and useUnifiedTopology are used to remove the error  
    db = client.db('To-Do');
    //name for the database
    col = db.collection('Tasks');
    //databse table
    
    // col.insertOne({maker:'BMW', year:'1998'});
});


app.get('/', function(req,res){
    res.sendFile(viewsPath+"index.html");
});

app.use(bodyParser.urlencoded({extended:false}));

app.post('/newtask', function(req,res){
    //If the request arrive, we need to execute the same callback /newCarRequest
    let theId = getnewRandomId();
    let myTaskObjs = {taskid:theId, taskname:req.body.taskname, assignto:req.body.assignto, duedate:parseInt(req.body.duedate), taskstatus:req.body.taskstatus, taskdesc:req.body.taskdesc};
    // col.insertOne(req.body);
    col.insertOne(myTaskObjs);
    res.redirect('/listtasks');
});

function getnewRandomId(){
    let id;
    id = Math.round(Math.random()*1000);
    //we need a random ID from 1 - 1000 not 1 - 10 
    return id;
};


app.get('/listtasks', function (req, res) {
    col.find({}).toArray(function (err, data) {
        res.render('listtasks', { task: data });
    });
});

app.post('/deletetasks', function (req,res){
    // let del = {taskid:{taskid:req.body.taskid}};
    //req.body return the req params as string instead of int, we have to parse it through int
    let del = {taskid:parseInt(req.body.taskid)};
    col.deleteOne(del, function(err,obj){
        console.log(obj.result);
        //check if the return object obj contains the number of deleted documents. 
        res.redirect('/listtasks');
    });
});

app.get('/deletecomplete', function (req,res){
    col.deleteMany({taskstatus:'complete'}, function(err,obj){
        console.log(obj.result);
        res.redirect('/listtasks');
    });
});

app.post('/updatetasks', function(req,res){
    let upd = {taskid:parseInt(req.body.taskid)};
    let upd1 = {$set: {taskstatus:req.body.taskstatus}}; 
    let upd2 = {upsert: true};
    col.updateOne(upd, upd1, upd2, function(err,result){
    res.redirect('/listtasks');
    });
});

app.get('/deletetasks', function (req,res){
    res.sendFile(viewsPath+"deletetasks.html");
});

app.get('/newtask', function(req,res){
    res.sendFile(viewsPath+"newtask.html");
});

app.get('/updatetasks', function(req,res){
    res.sendFile(viewsPath+"updatetasks.html");
});

//app.get is necessary to direct the params such as localhost:8080/newtask.html 

app.listen(8080);

