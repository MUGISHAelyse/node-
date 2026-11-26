// image.js: turns a picture chosen from the computer into small text the browser can store.

// Reads an image file, shrinks it so its longest side is at most `maxSize` pixels and
// returns it as a JPEG data URL. Without a server the picture has to be saved in the
// browser (localStorage), which is small, so shrinking keeps each picture around 30 to 80 KB.
// The promise fails with an Error whose message can be shown to the admin.
export function imageToDataUrl(file, maxSize = 480) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file (JPG, PNG, WebP or GIF).'))
    if (file.size > 8 * 1024 * 1024) return reject(new Error('That image is bigger than 8 MB. Please choose a smaller one.'))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('The image could not be read.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('That file is not a valid image.'))
      img.onload = () => {
        // Scale down (never up) and draw the picture on a canvas.
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff' // JPEG has no transparency, so transparent PNGs get a white background
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
