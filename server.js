const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

app.use(express.static(__dirname));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'layout.html'));
});

app.get('/play', (req, res) => {
    res.sendFile(path.join(__dirname, 'ckplay.html'));
});

app.post('/upload', upload.single('videoFile'), (req, res) => {
    if (!req.file) {
        return res.json({ success: false });
    }

    // Verifica se o arquivo é um vídeo MP4
    if (req.file.mimetype !== 'video/mp4') {
        fs.unlinkSync(req.file.path);
        return res.json({ success: false });
    }

    const videoUrl = req.protocol + '://' + req.get('host') + '/video/' + req.file.filename;
    res.json({ success: true, videoUrl: videoUrl });
});

// Rota para acessar um vídeo específico
app.get('/video/:fileName', (req, res) => {
    const videoPath = path.join(__dirname, 'uploads', req.params.fileName);
    const videoStat = fs.statSync(videoPath);
    const fileSize = videoStat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
