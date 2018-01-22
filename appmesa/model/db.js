var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/mesaDB');

var modelUsers = require('./users');

function createDefaultUser() {
    modelUsers.getAllUsers((error, users)=>{
        if (error) {
            console.log('Error occured');
        } else if(users === null) {
            var defaultUser = new modelUsers.User({
                firstname : 'adminfirstname',
                lastname : 'adminlastname',
                username : 'adminusername',
                email : 'admin@mail.gr',
                password : '1234567890',
                birthdate : '1991-09-04',
                gender : 'default',
                city : 'admincity',
                phone : '1234567890',
                moreinfo : 'This is the default user in the system.',
                role : 'admin_user'
            });

            modelUsers.saveUser(defaultUser, (error, user)=> {
                if(error) {
                    console.log('Error in save default user.');
                } else {
                    console.log('Success creation of default user.');
                }
            });
        }
    });
}

createDefaultUser();


/*var options = {
    server: {
       socketOptions: { keepAlive: 1 } 
    }
};*/


//mongoose.connect(credentials.mongo.development.connectionString, options);


/*switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}*/
