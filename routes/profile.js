const { Router } = require('express')
const auth = require('../middleware/auth')
const path = require('path')
const User = require('../models/user')
const { Readable } = require('stream')
const buffer = new Buffer('1.jpg', 'base64')
var readable
var file_mimetype = 'image/jpg'
var file_originalname = '123.jpg'

const router = Router();
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const token = require('../token.json');
const { resolve } = require('path')
var name
const content = require(path.join(__dirname, '../credentials.json'))
const { client_secret, client_id, redirect_uris } = content.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

// Check if we have previously stored a token.
oAuth2Client.setCredentials(token);



router.get('/', async (req, res) => {
    console.log(req.session)
    res.render('profile', {
        title: 'Профиль',
        isProfile: true,
        user: req.user.toObject()
    })
})
router.post('/', auth, async (req, res) => {
    try {

        name = req.file.originalname
        readable = new Readable()
        readable._read = () => { }
        readable.push(req.file.buffer)
        readable.push(null)
        file_mimetype = req.file.mimetype
        file_originalname = req.file.originalname




        const user = await User.findById(req.user._id)
        const id =  await uploadFile(oAuth2Client);

        console.log("Id in post:", id)
        const toChange = {
            name: req.body.name
        }
        // console.log(req.file)
        if (req.file) {
            toChange.avatarUrl = 'https://drive.google.com/uc?export=view&id=' +
                id
        }
        Object.assign(user, toChange)
        await user.save()

        res.redirect('/profile')
    } catch (e) {
        console.log(e)
    }
})

function listFiles(auth) {
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');

            return files.find((item) =>
                item.name == name
            ).id;
        } else {
            console.log('No files found.');
        }
    });
}
function start(file) {


}
function list() {
    fs.readFile(path.join(__dirname, '../credentials.json'), (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Drive API.
        authorize(JSON.parse(content), listFiles);
    });
}
function authorize(credentials, uploadFile) {


}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
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
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}



function downloadFile(auth) {
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

function uploadFile(auth) {
    return new Promise(function (res, rej) {

        const drive = google.drive({ version: 'v3', auth });
        const fileMetadata = {
            'name': file_originalname,
            parents: ['1_Y-C52YLzdFcFGFHVYVaFqATq1fj0YI1']
        };
        const media = {
            mimeType: file_mimetype,
            body: readable,
        };
        drive.files.create({
            auth: auth,
            resource: fileMetadata,
            media: media,
            fields: 'id',

        }, (err, file) => {
            if (err) {
                // Handle error

                console.error(err);
            } else {
                console.log("Id:", file.data.id)
                res(file.data.id);
            }
        });

    })
}



module.exports = router