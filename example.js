var https = require('https')
  , aws3  = require('aws3')

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
    'X-Amzn-Authorization': 'AWS3-HTTPS AWSAccessKeyId=ABCDEF1234567890,Algorithm=HmacSHA256,Signature=/frrTLlefAd19DcPY9LJarRejLxf3NiHZXN/t0VJJTs='
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


