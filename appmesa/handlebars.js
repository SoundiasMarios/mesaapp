var _ = require('underscore');

var handlebars = require('express3-handlebars').create({
	defaultLayout: 'default',
	helpers: {
		ifEqual: function(val1, val2, options) {
			if (val1 === val2) {
				return options.fn(this);
			} else {
				return options.inverse(this);
			}
		},
        ifEqualOR: function(val1, val2, val3, options) {
            if ((val1 === val2) || (val1 === val3)) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
        ifOR: function(val1, val2, options) {
            if (val1 || val2) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        },
		changeDateFormat: function(birthdate) {
			var birth = new Date(birthdate);

            var b_yyyy = birth.getFullYear();
            var b_dd = birth.getDate();
            var b_mm = birth.getMonth()+1;

            if(b_dd<10){
                b_dd='0'+b_dd;
            } 
            if(b_mm<10){
                b_mm='0'+b_mm;
            }

            return b_dd+'/'+b_mm+'/'+b_yyyy;
		},

		changeDateFormatTypeDate: function(birthdate) {
			var birth = new Date(birthdate);

            var b_yyyy = birth.getFullYear();
            var b_dd = birth.getDate();
            var b_mm = birth.getMonth()+1;

            if(b_dd<10){
                b_dd='0'+b_dd;
            } 
            if(b_mm<10){
                b_mm='0'+b_mm;
            }

            return b_yyyy+'-'+b_mm+'-'+b_dd;
		},

        genderType: function(gender) {
            if (gender=='male') {
                return 'Άνδρας';
            } else if(gender=='female') {
                return 'Γυναίκα';
            } else {
                return 'Μη εφραμόσιμο';
            }
        },

        eventStatusType: function(status) {
            if(status=='default') {
                return 'Δεν έχει τροποποιηθεί';
            }else if(status=='modified') {
                return 'Τροποιήθηκε';
            }else if(status=='canceled') {
                return 'Ακυρώθηκε';
            }else {
                return 'Ολοκληρώθηκε';
            }
        },

        mergeTags: function(tags) {
            var allTags='';
            tags.forEach(function(value) {
                allTags += '#' + value;
            });
            return allTags;
        },

        ifNotEmpty: function(object, options) {
            if (!(_.isEmpty(object))) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
	}
});

module.exports = handlebars;