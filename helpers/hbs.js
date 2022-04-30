const moment = require('moment')

module.exports = {
  formatDate: function (date, format) {
    return moment(date).local().format(format)
  },
  maxBookingTime: function(){
    return Date.now() + 1000*60*15
  }
}
