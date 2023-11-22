const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')
//const { errorMonitor } = require('events')
const bcrypt = require("bcrypt")
//const { error } = require('console')




//creating our mysql database + connecting it with node (next function)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
})

db.connect(err => {
    if (err) {
        console.error('MySQL Connection Error:', err);
        throw err;
    }
    console.log('MySQL Connected');
});

let table = 'CREATE TABLE IF NOT EXISTS users (id int AUTO_INCREMENT, name VARCHAR (255), password VARCHAR (255), email VARCHAR (255) UNIQUE, PRIMARY KEY(id))'
    db.query(table, err => {
        if(err){
        throw err
        }
        console.log('users table created')
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req,res) => {
   res.send('<h1>Works</h1>')
})

//asynchronious function for hashing passwords (returns promise ---> handle with .then)
async function Hashing(originalPassword) {
    const saltRounds = 10
    return bcrypt.hash(originalPassword, saltRounds)
    .then((hashedPassword) => {
            return hashedPassword
        })

    //catching errors
    .catch((err) => {
        throw err
    })
}

/*async function checkEmailFunction(emailTry) {
    let checkEmail = 'SELECT email FROM users'
    const index = db.query(checkEmail, (err, results) => {
        if (err) {
            throw err;
        }
        console.log("emails are: " , results)
        //console.log(results[0].email)
        if(results){
            results.forEach((element) => {
                //console.log(element)
                if(email === element.email){
                    console.log('found')
                    throw err
                }
                else{
                    console.log('free email') 
                }
            })
        }
    }); 
    return true
}*/

function deleteUserString(email){
    let sql = `DELETE FROM users WHERE email = '${email}'`
    db.query(sql, (err)=>{
        if(err){
            console.log('delete wrong registration error')
            throw err
        }
        console.log('delete wrong registration success')
    })

}

//registrating user - adding him to database (input checks: no, hashing: yes))
app.post('/add', (req,res) => { 
    console.log('success')
    
    const name = req.body.username
    console.log(name)
    const email = req.body.useremail
    console.log(email)
    const password = req.body.userpassword
    console.log(password)

    //handling hashing
    
    Hashing(password)
        .then((newHashedPassword) => {
            console.log(newHashedPassword)
            //initialization of the post object ---> inserting into mysql table with post
            let post = {name: name , password: newHashedPassword, email: email}
            
            //mysql syntax for inserting
            let sql = 'INSERT INTO users SET ?'
            db.query(sql,post, (err) => {
                if(err){
                    if (err.code === 'ER_DUP_ENTRY') {
                        //add delete function with sql syntaxis ??? - does not work
                        return res.status(409).json({ error: 'email in use' });
                        
                    } else {
                        throw err;
                    }
                }
                console.log('user added!')
                res.status(201).json({ message: 'user added' });
            })
            //res.status(201)*/
        })
        .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: 'server error' });
        })    
})


//додай функцію РОЗХЕШУВАННЯ вже у самому алгоритмі автентифікації користувача


const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})