/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import OpenAI from 'openai'
import fs from 'node:fs'

router.post('/GenerateImage', async (req) => {
  const { prompt, words, date } = await req.request.body()
  const image = await generateImage(prompt, words, date)
  console.log('Prompt:', prompt, 'Words:', words, 'Date:', date)
  return {
    image,
  }
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateImage(prompt: string, words: string, date: string): Promise<string> {
  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      n: 1,
      quality: 'medium',
    })

    console.log('OpenAI image response:', response.data)

    if (!response.data || response.data.length === 0 || !response.data[0].b64_json) {
      throw new Error('No image data received from OpenAI')
    }

    const imageBase64 = response.data[0].b64_json
    if (!imageBase64) {
      throw new Error('Image base64 data is undefined')
    }

    const imageBytes = Buffer.from(imageBase64, 'base64')
    // Format date (YYYY-MM-DD)
    const dateFolder = date || new Date().toISOString().slice(0, 10)
    const wordsFolder = words
      ? words
          .trim()
          .replace(/[\,\s]+/g, '-')
          .replace(/[^a-zA-Z0-9_-]/g, '')
          .toLowerCase()
      : 'untitled'
    const folderPathPublic = `public/images/${dateFolder}/${wordsFolder}`
    const folderPathStaticImages = `images/${dateFolder}/${wordsFolder}`
    fs.mkdirSync(folderPathPublic, { recursive: true })

    // Find next available image number
    const files = fs
      .readdirSync(folderPathPublic)
      .filter((f) => f.startsWith('image-') && f.endsWith('.png'))
    let maxNum = 0
    files.forEach((f) => {
      const match = f.match(/image-(\d+)\.png$/)
      if (match) {
        const num = Number.parseInt(match[1], 10)
        if (num > maxNum) maxNum = num
      }
    })
    const nextNum = maxNum + 1
    const fileName = `image-${nextNum}.png`
    const filePath = `${folderPathPublic}/${fileName}`
    fs.writeFileSync(filePath, imageBytes)
    // Return the public URL for the image
    return `${folderPathStaticImages}/${fileName}`
  } catch (error) {
    console.error('Error generating image:', error)
    throw error
  }
}
