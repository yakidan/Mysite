const { Readable } =require('stream')
const buffer = new Buffer('1.jpg', 'base64')
const readable = new Readable()
readable._read = () => {}
readable.push(buffer)
readable.push(null)
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

class GoogleIP{
    SCOPES = ['https://www.googleapis.com/auth/drive'];
 
    TOKEN_PATH = '../token.json';
     start() {
         console.log("start")
        fs.readFile('../credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Drive API.
            this.authorize(JSON.parse(content),this.uploadFile);
        });
    }
   authorize (credentials, callback) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
    
        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err) return this.getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
    }
  getAccessToken (oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
                    console.log('Token stored to', this.TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
    uploadFile (auth) {
        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            'name': 'ejler.jpg',
            parents: ['1_Y-C52YLzdFcFGFHVYVaFqATq1fj0YI1']
        };
        const media = {
            mimeType: 'image/jpeg',
            body: readable
        };
        drive.files.create({
            auth: auth,
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, (err, file) => {
            if (err) {
                // Handle error
                console.error(err);
            } else {
                console.log('File Id: ', file.id);
            }
        });
    }
    downloadFile (auth) {
        const drive = google.drive({
            version: 'v3',
            auth
        })
            ;
        var fileId = '1IheO2n70I_P7vEL563ulu_HpplI_i4tq';
        var dest = fs.createWriteStream('shenon.jpeg');
        drive.files.get({ fileId: fileId, alt: 'media' }, {
            responseType: 'stream'
        }, function (err, res) {
            res.data
                .on('end', () => {
                    console.log('Done');
                })
                .on('error', err => {
                    console.log('Error', err);
                })
                .pipe(dest);
        }
        )
        // example code here
    }
}

module.exports=GoogleIP