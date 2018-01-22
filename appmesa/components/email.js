var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var credentials = require('../credentials');
 var options = {
	viewEngine: {
		/*extname: '.handlebars',
		layoutsDir: 'views/email/',
		defaultLayout : 'email',*/
		helpers: {
			ifEqual: function(val1, val2, options) {
				if (val1 === val2) {
					return options.fn(this);
				} else {
					return options.inverse(this);
				}
			}
		}
	},
	viewPath: 'views/email/',
	extName: '.handlebars'
 };

var mailer = nodemailer.createTransport({
	service: credentials.gmail.service,
	auth: {
		user: credentials.gmail.mail,
		pass: credentials.gmail.password,
	}
});

mailer.use('compile', hbs(options));
var sendmail = function(username, password, role, usermail) {
	var deviceKey = credentials.deviceKEY;
	mailer.sendMail({
		from: credentials.gmail.mail,
		to: usermail,
		subject: 'MESA - Καλώς Ορίσατε',
		template: 'email',
		context: {
			username : username,
			password : password,
			role: role,
			deviceKey: deviceKey
		}
	}, function (error, response) {
		if(error)
			global.logger.error('In sendmail -> ', error);
		mailer.close();
	});
};

module.exports = {sendmail : sendmail};