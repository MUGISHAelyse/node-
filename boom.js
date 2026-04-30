const mysql = require('mysql2');
const connection = mysqli.creatconnection(

{
    host : 'localhost',
    user : 'your_username',
    password : 'your_password',
    database : 'my_database'
}
) ;
connection.connect((error)=>{
    if(error){
        console.error('error connectio to Database',error.stack);
        return;
    }
    console.log('connected to the database as ID ',connection.threadID);
}) ;
module.exports=connection;