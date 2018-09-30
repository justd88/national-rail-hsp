const fetch = require('cross-fetch');
const moment = require('moment');
const baseUrl = 'https://hsp-prod.rockshore.net/api/v1/serviceMetrics';

const getDayId = function (date) {
    const dayNumber = moment(date, 'YYYY-MM-DD').isoWeekday();
    if (dayNumber < 6) {
        return 'WEEKDAY';
    } else if (dayNumber === 6) {
        return 'SATURDAY';
    }
    return 'SUNDAY';
}
const getHeaders = function (username, password) {
    return {
        Authorization: `Basic ${new Buffer.from(`${username}:${password}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
}

const HSP = function (username, password) {
    this.headers = getHeaders(username, password);
}
HSP.prototype.getServiceMetrics = function (from_loc, to_loc, from_time, to_time, from_date, to_date, days) {
    return fetch(baseUrl, {
        headers: this.headers,
        method: 'POST',
        body: JSON.stringify({
            from_loc,
            to_loc,
            from_time,
            to_time,
            from_date,
            to_date,
            days
        })
    }).then(function (response) {
        return response.json()
    });
}
HSP.prototype.getServiceMetricsSimple = function (from_loc, to_loc, from_time, from_date) {
    //Try to fix midnight issue however the API does not support it yet...
    const days = getDayId(from_date);
    const to_time = moment(`${from_time}`, 'HHmm').add(1, 'minute').format('HHmm');
    const to_date = to_time >= from_time ?
        from_date :
        moment(`${from_date}`, 'YYYY-MM-DD')
            .add(1, 'day')
            .format('YYYY-MM-DD');
    return fetch(baseUrl, {
        headers: this.headers,
        method: 'POST',
        body: JSON.stringify({
            from_loc,
            to_loc,
            from_time,
            to_time,
            from_date,
            to_date,
            days
        })
    }).then(function (response) {
        return response.json()
    });
}

HSP.prototype.getServiceDetails = function (rid) {
    return fetch(baseUrl, {
        headers: this.headers,
        method: 'POST',
        body: JSON.stringify({
            rid
        })
    }).then(function (response) { return response.json() });
}
module.exports = HSP;