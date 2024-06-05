// pages/api/extract-text.js

import { IncomingForm } from 'formidable';
import pdf from 'pdf-parse';
import { promises as fs } from 'fs';
import path from 'path';

export const config = {
    api: {
        bodyParser: false,
    },
};

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm({ keepExtensions: true });

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

    try {
        const { files } = await parseForm(req);
        const pdfFile = files.PDF;

        if (!pdfFile) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }

        const filePath = pdfFile[0].filepath;
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);

        // Clean up the temporary file
        await fs.unlink(filePath);

        res.status(200).json({ text: data.text });
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        res.status(500).json({ error: 'Failed to extract text from PDF' });
    }
}
