const request = require('request');
const fs = require('fs')

module.exports = function (o) {
  let token = o.token;
  let vendor = o.vendor;
  let tokenConfirmed = false;
  this.setToken = (e) => {
    this.token = e;
    tokenConfirmed = false;
  }
  this.setVendor = (e) => {
    this.vendor = e
  }
  this.checkToken = async () => {
    let res = await (function () {
      return new Promise(function (resolve, reject) {
        let options = {
          'method': 'POST',
          'url': 'https://jverify.us/verify-token',
          'headers': {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: token
          })
        };
        request(options, function (error, response) {
          if (!error && response.statusCode == 200) {
            tokenConfirmed = true;
            resolve();
          } else {
            if (response.statusCode == 403) {
              tokenConfirmed = false;
              reject({
                message: "JVerify did not recognize your token. Please try a different token or check your JVerify dashboard"
              })
            } else throw new Error(error)
          }
        });
      })
    })();
  }
  this.start = async (o) => {
    o.number = parseInt(o.number)
    let res = await (function () {
      return new Promise(function (resolve, reject) {
        let options = {
          'method': 'POST',
          'url': 'https://jverify.us/start',
          'headers': {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            key: token,
            name: o.name,
            vendor: vendor,
            to: o.number
          })
        };
        request(options, function (error, response) {
          if (!error) {
            resolve(response);
          } else {
            reject(error);
          }
        });
      })
    })();
    let message = '';
    let status = '';
    let btr = null;
    switch (res.statusCode) {
      case 200:
        message = 'OK';
        status = 'OK';
        btr = res.body;
        break;
      case 203:
        message = 'The account was not charged for the message, but everything went through fine. You should only see this if JVerify has taken you on as a pro-bono client. Contact us for troubleshooting support if you see this or if you should be seeing this.';
        status = 'Non-Authoritative Information';
        btr = res.body;
        break;
      case 401:
        message = 'The token is incorrect. If this occurs, double-check your key and if it appears correct, request a new one from the dashboard. If that fails, contact us.';
        status = 'Unauthorized';
        break;
      case 402:
        message = 'Something went wrong verifying your account exists and is in good standing. If this occurs, double-check your key and if it appears correct, request a new one from the dashboard. If that fails, contact us.';
        status = 'Payment Required';
        break;
      case 403:
        message = 'The request was made from a domain you have not authorized in the dashboard. To fix this, change your allowed domain in the dashboard or remove the restriction.';
        status = 'Forbidden';
      case 406:
        message = "The token you submitted equals 'T3h5N3RyUPNT4NkQ73cuUtdh_cpNsXHG...' This token is the one used in our documentation and cannot be used for real requests. Request your token (key) from the dashboard.";
        status = 'Not Acceptable';
      case 422:
        message = 'Your request either had missing body content or the body content was empty. This is a bug with the JVerify library, so please let us know about it at jverify.us/contact.html';
        status = 'Unprocessable Entity'
      case 429:
        message = 'JVerify does not rate limit. We use the 429 header to inform you that you have gone over the maximum number of messages authorized in the dashboard and the message was not delivered. To fix this, wait for the 1st day of the next billing period or increase the number of authorized messages in the dashboard';
        status = 'Too Many Requests';
      case 500:
        message = 'Something went wrong on our end. Please contact us at jverify.us/contact.html and we will get it resolved.';
        status = 'Internal Server Error'
      default:
        message = 'Something went really wrong and we can\'t even identify what went wrong'
        status = 'Generic Error'
    }
    return {
      code: res.statusCode,
      message: message,
      status: status,
      body: JSON.parse(btr)
    }
  }
  this.verify = async (o) => {
    o.pin = parseInt(o.pin)
    let res = await (function () {
      return new Promise(function (resolve, reject) {
        let options = {
          'method': 'POST',
          'url': 'https://jverify.us/verify',
          'headers': {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "key": token,
            "hash": o.hash,
            "pin": o.pin
          })
        };
        request(options, function (error, response) {
          if (!error) {
            resolve(response);
          } else {
            reject(error);
          }
        });
      })
    })();
    let message = '';
    let status = '';
    let btr = null;
    switch (res.statusCode) {
      case 200:
        message = 'OK';
        status = 'OK';
        btr = res.body;
        break;
      case 422:
        message = 'Your request either had missing body content or the body content was empty. This is a bug with the JVerify library, so please let us know about it at jverify.us/contact.html';
        status = 'Unprocessable Entity'
      case 500:
        message = 'Something went wrong on our end. Please contact us at jverify.us/contact.html and we will get it resolved.';
        status = 'Internal Server Error'
      default:
        message = 'Something went really wrong and we can\'t even identify what went wrong'
        status = 'Generic Error'
    }
    return {
      code: res.statusCode,
      message: message,
      status: status,
      body: JSON.parse(btr)
    }
  }
  this.getToken = () => {
    return (token)
  }
  this.getVendor = () => {
    return (vendor)
  }
  this.getTokenConfirmed = () => {
    return (tokenConfirmed)
  }
}