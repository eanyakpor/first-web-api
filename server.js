const cookieParser = require('cookie-parser');
const request = require('request');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const querystring = require('querystring');
require('dotenv').config()

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
var redirect_uri = 'http://127.0.0.1:8080/callback';

// generates random string as a key identifier for a requried argument of an api 
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const app = express();
app.use(cors());

// Set up session middleware
app.use(session({
  secret: 'spotify-auth-app',
  resave: false,
  saveUninitialized: true
}));
// endpoint that logins in the user 
app.get('/login', function(req, res) {
  console.log('HIT /login endpoint');

  var state = generateRandomString(16);
  // Store state in session instead of cookie
  req.session.spotify_auth_state = state;

  var scope = 'user-read-private user-read-email user-library-read';

  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});
// endpoint to return refresh token and access token 
app.get('/callback', function(req, res) {
  console.log('Hit /callback endpoint')
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.session.spotify_auth_state || null;

  console.log('State received:', state);
  console.log('Stored state:', storedState);

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    req.session.spotify_auth_state = null; // Clear the state from session
  
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    // sucessful post provides printing of access token and refresh token 
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        var access_token = body.access_token;
        var refresh_token = body.refresh_token;
        
        console.log('Access token:', access_token);
        console.log('Refresh token:', refresh_token);
        
        res.send(`
          <h1>Authentication successful</h1>
          <p>Access token: ${access_token}</p>
          <p>Refresh token: ${refresh_token}</p>
        `);
      } else {
        console.error('Error getting token:', error, body);
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

// when I want a new access token 
app.get('/refresh_token', function(req ,res) {
  console.log('hit refresh_token endpoint');
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token, refresh_token = body.refresh_token;

      console.log('Access token:', access_token);
      console.log('Refresh token:', refresh_token);
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
});

app.get('/me/albums', async (req, res) => {
  const accessToken = process.env.ACCESS_TOKEN; // token stays on the server!
  const limit = req.query.limit || 4;
  const market = req.query.market || 'ES';

  const spotifyRes = await fetch(`https://api.spotify.com/v1/me/albums?limit=${limit}&market=${market}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const data = await spotifyRes.json();
  res.json(data);
});

app.listen(8080, () => {
  console.log('Server running at http://localhost:8080');
});