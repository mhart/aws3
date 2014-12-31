aws3 (DEPRECATED – all services now use aws4)
---------------------------------------------

[![Build Status](https://secure.travis-ci.org/mhart/aws3.png?branch=master)](http://travis-ci.org/mhart/aws3)

A small utility to sign vanilla node.js http(s) request options using Amazon's
[AWS Signature Version 3](http://docs.amazonwebservices.com/amazonswf/latest/developerguide/HMACAuth-swf.html).

*NB: It is preferrable to use the more secure [aws4](https://github.com/mhart/aws4) over this library.*

Example
-------

```javascript
var https = require('https'),
    aws3  = require('aws3')

// given an options object you could pass to http.request
var opts = { host: 'route53.amazonaws.com', path: '/2012-02-29/hostedzone' }

aws3.sign(opts) // assumes AWS credentials are available in process.env

console.log(opts)
/*
{
  host: 'route53.amazonaws.com',
  path: '/2012-02-29/hostedzone',
  headers: {
    Host: 'route53.amazonaws.com'
    'X-Amz-Date': 'Mon, 14 Jan 2013 08:02:29 GMT',
    'X-Amzn-Authorization': 'AWS3-HTTPS AWSAccessKeyId=ABCDEF1234567890,Algorithm=HmacSHA256,Signature=...'
  }
}
*/

// we can now use this to query AWS using the standard node.js http API
https.request(opts, function(res) { res.pipe(process.stdout) }).end()
/*
<ListHostedZonesResponse xmlns="https://route53.amazonaws.com/doc/2012-02-29/">
...
*/

// you can pass AWS credentials in explicitly
aws3.sign(opts, { accessKeyId: '', secretAccessKey: '' })

// aws3 can infer the host from a service and (optional) region
opts = aws3.sign({ service: 'route53', path: '/2012-02-29/hostedzone' })

// can specify any custom option or header as per usual
opts = aws3.sign({
  service: 'swf',
  region: 'us-east-1',
  body: '{"registrationStatus":"REGISTERED"}',
  headers: {
    'Content-Type': 'application/x-amz-json-1.0',
    'X-Amz-Target': 'SimpleWorkflowService.ListDomains'
  }
})

https.request(opts, function(res) { res.pipe(process.stdout) }).end(opts.body)
/*
{"domainInfos":[]}
...
*/
```

API
---

### aws3.sign(requestOptions, [credentials])

This calculates and populates the `X-Amzn-Authorization` header of
`requestOptions`, and any other necessary AWS headers and/or request
options. Returns `requestOptions` as a convenience for chaining.

`requestOptions` is an object holding the same options that the node.js
[http.request](http://nodejs.org/docs/latest/api/http.html#http_http_request_options_callback)
function takes.

The following properties of `requestOptions` are used in the signing or
populated if they don't already exist:

- `hostname` or `host` (will be determined from `service` and `region` if not given)
- `method` (will use `'GET'` if not given or `'POST'` if there is a `body`)
- `path` (will use `'/'` if not given)
- `body` (will use `''` if not given)
- `service` (will be calculated from `hostname` or `host` if not given)
- `region` (will be calculated from `hostname` or `host` or use `'us-east-1'` if not given)
- `headers['Host']` (will use `hostname` or `host` or be calculated if not given)
- `headers['Content-Type']` (will use `'text/xml'` if not given and there is a `body`)
- `headers['Date']` (used to calculate the signature date if given, otherwise `new Date` is used)

Your AWS credentials (which can be found in your
[AWS console](https://portal.aws.amazon.com/gp/aws/securityCredentials))
can be specified in one of two ways:

- As the second argument, like this:

```javascript
aws3.sign(requestOptions, {
  secretAccessKey: "<your-secret-access-key>",
  accessKeyId: "<your-access-key-id>"
})
```

- From `process.env`, such as this:

```
export AWS_SECRET_ACCESS_KEY="<your-secret-access-key>"
export AWS_ACCESS_KEY_ID="<your-access-key-id>"
export AWS_SESSION_TOKEN="<your-session-token>"
```

(will also use `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` if available)

The `sessionToken` property and `AWS_SESSION_TOKEN` environment variable are optional for signing
with [IAM STS temporary credentials](http://docs.aws.amazon.com/STS/latest/UsingSTS/using-temp-creds.html).

Installation
------------

With [npm](http://npmjs.org/) do:

```
npm install aws3
```

