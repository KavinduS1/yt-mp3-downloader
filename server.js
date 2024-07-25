const express = require('express');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/download', async (req, res) => {
    const url = req.body.url;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ message: 'Invalid YouTube URL' });
    }

    const videoId = ytdl.getURLVideoID(url);
    const output = path.resolve(__dirname, `public/${videoId}.mp3`);

    try {
        const stream = ytdl(url, { quality: 'highestaudio' });
        ffmpeg(stream)
            .audioBitrate(128)
            .save(output)
            .on('end', () => {
                res.json({ file: `${videoId}.mp3` });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'Failed to download and convert video' });
            });
    } catch (error) {
        res.status(500).json({ message: 'Error processing request' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
