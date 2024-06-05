// pages/api/extract-text.js

import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdf from 'pdf-parse';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const uploadDir = path.join(process.cwd(), 'uploads');

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({ uploadDir, keepExtensions: true });

        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject(err);
            }
            resolve({ fields, files });
        });
    });
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Ensure the upload directory exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    try {
        const { files } = await parseForm(req);
        const pdfFile = files.PDF;
        if (!pdfFile) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        const dataBuffer = fs.readFileSync(pdfFile[0].filepath);
        const data = await pdf(dataBuffer);
        fs.unlinkSync(pdfFile[0].filepath);
        fs.rmSync(uploadDir, { recursive: true, force: true });
        res.status(200).json({ text: data.text });
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        res.status(500).json({ error: 'Failed to extract text from PDF' });
    }
}
