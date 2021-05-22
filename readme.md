# JVerify JavaScript Library

If you haven't already familiarized yourself with the [general docs](https://jverify.us/docs/api), we recommend doing that before beginning a project.

JVerify offers both an HTTP endpoint as well as libraries for your language of choice. This documents the usage of our JavaScript library.

## Prerequisites

You need to have the JVerify library installed as well as node.js requests.

```shell
npm i jverify-js requests
```

## Importing & intializing

In your node.js file, enter the following code:

```javascript
const JVerify_lib = require('jverify-js');

const JVerify = new JVerify_lib({
  token:'T3h5N3RyUPNT4NkQ73cuUtdh_cpNsXHG...', // Get a token from the JVerify dashboard (jverify.us/dashboard)
  vendor:'JVerify' // Set this to your company name
});
```

Now the JVerify library is set up to send messages!

Notice how the constructor takes an **object**, with schema:

```javascript
{
  token:'your-token',
  vendor:'your-company-name'
}
```

## The Start Method

Sample implementation:

```javascript
let hash; // Globally initialize a variable to hold the hash

JVerify.start({
  name:'John Smith', // Name of your user
  number:2025550106 // Phone number of your user (where the message will be sent)
}).then(r => {
  if(r.code == 200 || r.code == 203) {
    hash = r.body.hash; // Save the hash to the global variable
    // Server-side logic for a properly sent message.
    // Tell the frontend the message was sent properly
  } else {
    // Something has gone wrong, lets throw an error and check it out in the console
    // Tell the frontend something has gone wrong.
    throw new Error(`JVerify threw error ${r.code} (${r.status}): ${r.message}`);
  }
})
```

Just like the constructor, the `.start` method takes an **object** with schema:

```javascript
{
  name:'users-name',
  number:'users-phone-number'
}
```

The start method returns a `promise` which will evaluate in the `then` block in the sample code. The promise will return an object with schema:

```javascript
{
  code:200, // The HTTP response code directly from our request
  message:'what the above code means (from the JVerify documentation)',
  status:'what the above code officially means (official name)',
  body:{
    success:true,
    hash:'hash-of-sent-pin'
  }
}
```

Data types:

```javascript
{
  code:int,
  message:string,
  status:string,
  body:object:{
    success:boolean,
    hash:string
  }
}
```

You should save `body.hash` to use in the verify request. The hash is non-sensitive, meaning it is safe to be sent to your front end or saved in user's cookies.

## The Verify Method

Sample implementation:

```javascript
JVerify.verify({
  hash:'hash-from-start-method', // This should be the hash variable we got in the start method
  pin:393545 // The pin the user entered
}).then(r => {
  if(r.code > 199 && r.code < 300) { // Make sure the request returned a code in the 200s
    	// The user entered the correct pin.
    	// Implement server-side logic and tell the frontend the pin was entered correctly
      console.log('PIN Correct!')
    } else {
      // The user has entered the incorrect pin
      // Tell the frontend the pin was wrong and potentially ask them if they want to send another
      console.log('PIN Incorect')
    }
	} else {
    // Something has gone wrong. Lets throw an error and check it out in the console
    // Tell the frontend something has gone wrong
    throw new Error(`JVerify threw error ${r.code} (${r.status}): ${r.message}`);
  }
})
```

Just like the constructor and start method, the `.verify` endpoint takes an object with schema:

```javascript
{
  hash:'hash-from-start-method',
  pin:'pin from frontend' // Needs to be an integer
}
```

Just like the `.start` method, the `.verify` method returns a `promise` which will evaluate in the `then` block in the sample code. The promise will return an object with schema:

```javascript
{
  code:200 // The HTTP response code directly from our request
  message:'what the above code means (from the JVerify documentation)'
  status:'what the above code officially means (official name)'
  body:{
    correct:true // Set to true if the user entered the correct pin, false if incorrect.
  }
}
```

With data types:

```javascript
{
  code:int,
  message:string,
  status:string,
  body:object:{
    correct:boolean
  }
}
```
