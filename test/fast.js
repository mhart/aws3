var should = require('should')
  , aws3   = require('../')
  , cred   = { accessKeyId: 'ABCDEF', secretAccessKey: 'abcdef1234567890' }
  , date   = 'Wed, 26 Dec 2012 06:10:30 GMT'
  , auth   = 'AWS3-HTTPS AWSAccessKeyId=ABCDEF,' +
             'Algorithm=HmacSHA256,' +
             'Signature=Cl1olDHzwBq9V1pUWhQuoBLq5Z7m9RSTYZ7BJP/9baQ='

describe('aws3', function() {

  // Save and ensure we restore process.env
  var envAccessKeyId, envSecretAccessKey

  before(function() {
    envAccessKeyId = process.env.AWS_ACCESS_KEY_ID
    envSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
    process.env.AWS_ACCESS_KEY_ID = cred.accessKeyId
    process.env.AWS_SECRET_ACCESS_KEY = cred.secretAccessKey
  })

  after(function() {
    process.env.AWS_ACCESS_KEY_ID = envAccessKeyId
    process.env.AWS_SECRET_ACCESS_KEY = envSecretAccessKey
  })

  describe('#sign() when constructed with string url', function() {
    it('should parse into request correctly', function() {
      var signer = new aws3.RequestSigner('https://route53.amazonaws.com/')
      signer.request.headers = { Date: date }
      signer.sign().headers['X-Amzn-Authorization'].should.equal(auth)
    })
  })

  describe('#sign() with no credentials', function() {
    it('should use process.env values', function() {
      var opts = aws3.sign({ service: 'route53', headers: { Date: date } })
      opts.headers['X-Amzn-Authorization'].should.equal(auth)
    })
  })

  describe('#sign() with credentials', function() {
    it('should use passed in values', function() {
      var cred = { accessKeyId: 'A', secretAccessKey: 'B' }
        , opts = aws3.sign({ service: 'route53', headers: { Date: date } }, cred)
      opts.headers['X-Amzn-Authorization'].should.equal(
        'AWS3-HTTPS AWSAccessKeyId=A,' +
        'Algorithm=HmacSHA256,' +
        'Signature=CGQ7R6cS/DitpSn+4ShCZPawz6QKkGhP2oL5EbIYImg=')
    })
  })

  describe('#sign() with no host or region', function() {
    it('should add hostname and default region', function() {
      var opts = aws3.sign({ service: 'swf' })
      opts.hostname.should.equal('swf.us-east-1.amazonaws.com')
      opts.headers['Host'].should.equal('swf.us-east-1.amazonaws.com')
    })
    it('should add hostname and no region if service is regionless', function() {
      var opts = aws3.sign({ service: 'route53' })
      opts.hostname.should.equal('route53.amazonaws.com')
      opts.headers['Host'].should.equal('route53.amazonaws.com')
    })
    it('should populate AWS headers correctly', function() {
      var opts = aws3.sign({ service: 'route53', headers: { Date: date } })
      opts.headers['X-Amz-Date'].should.equal(date)
      opts.headers['X-Amzn-Authorization'].should.equal(auth)
    })
  })

  describe('#sign() with no host, but with region', function() {
    it('should add correct hostname', function() {
      var opts = aws3.sign({ service: 'swf', region: 'us-west-1' })
      opts.hostname.should.equal('swf.us-west-1.amazonaws.com')
      opts.headers['Host'].should.equal('swf.us-west-1.amazonaws.com')
    })
  })

  describe('#sign() with hostname', function() {
    it('should populate AWS headers correctly', function() {
      var opts = aws3.sign({ hostname: 'route53.amazonaws.com', headers: { Date: date } })
      opts.headers['X-Amz-Date'].should.equal(date)
      opts.headers['X-Amzn-Authorization'].should.equal(auth)
    })
  })

  describe('#sign() with host', function() {
    it('should populate AWS headers correctly', function() {
      var opts = aws3.sign({ host: 'route53.amazonaws.com', headers: { Date: date } })
      opts.headers['X-Amz-Date'].should.equal(date)
      opts.headers['X-Amzn-Authorization'].should.equal(auth)
    })
  })

  describe('#sign() with body', function() {
    it('should use POST', function() {
      var opts = aws3.sign({ body: 'SomeAction' })
      opts.method.should.equal('POST')
    })
    it('should set Content-Type', function() {
      var opts = aws3.sign({ body: 'SomeAction' })
      opts.headers['Content-Type'].should.equal('text/xml')
    })
  })

  describe('#sign() with many different options', function() {
    it('should populate AWS headers correctly', function() {
      var opts = aws3.sign({
        service: 'swf',
        region: 'ap-southeast-2',
        method: 'DELETE',
        path: '/Some/Path?param=key&param=otherKey',
        body: '{"registrationStatus":"REGISTERED"}',
        headers: {
          Date: date,
          'Content-Type': 'application/x-amz-json-1.0',
          'X-Amz-Target': 'SimpleWorkflowService.ListDomains'
        }
      })
      opts.headers['X-Amz-Date'].should.equal(date)
      opts.headers['X-Amzn-Authorization'].should.equal(
        'AWS3 AWSAccessKeyId=ABCDEF,' +
        'Algorithm=HmacSHA256,' +
        'SignedHeaders=host;x-amz-date;x-amz-target,' +
        'Signature=opWjm/XSn9lyojMUqW0u67VDeMeiWYQS7NLjmif91Bk=')
    })
  })

})

