import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { client } from '@/sanity/lib/client';


// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Parse the incoming form
    const form = new IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(400).json({ success: false, message: 'Invalid form data' });
      }

      const name = fields.name as string; // The "name" value from the form
      const file = files.file as formidable.File; // The uploaded file

      if (!name || !file) {
        return res.status(400).json({ success: false, message: 'Name and file are required' });
      }

      // Upload the file to Sanity
      const asset = await client.assets.upload('file', fs.createReadStream(file.filepath), {
        filename: file.originalFilename || 'uploaded-file',
      });

      // Create a new document in Sanity based on your schema
      const document = await client.create({
        _type: 'post', // Referencing your schema's name
        name, // The name from the form
        file: {
          _type: 'file',
          asset: {
            _type: 'reference',
            _ref: asset._id,
          },
        },
      });

      return res.status(200).json({ success: true, document });
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
