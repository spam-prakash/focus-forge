import html2canvas from 'html2canvas'

/**
 * Generate a shareable image from an achievement card
 * @param {React.RefObject} cardRef - Reference to the achievement card element
 * @param {string} filename - Optional filename for the generated image
 * @returns {Promise<Blob>} - Promise that resolves with the image blob
 */
export const generateAchievementImage = async (cardRef, filename = 'focusforge-achievement.png') => {
  if (!cardRef.current) {
    throw new Error('Card reference not found')
  }

  try {
    // Ensure element is accessible
    const element = cardRef.current
    if (!element) {
      throw new Error('Card element is not mounted')
    }

    // Small delay to ensure DOM is fully settled
    await new Promise(resolve => setTimeout(resolve, 100))

    // Generate canvas from DOM element with optimized settings
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      imageTimeout: 0, // Disable image timeout
      ignoreElements: (el) => {
        // Ignore certain elements that don't render well in canvas
        if (el.classList && el.classList.contains('lucide-react-icon')) {
          return true
        }
        return false
      },
      onclone: (clonedDocument) => {
        // Ensure all elements are visible for cloning
        const elements = clonedDocument.querySelectorAll('*')
        elements.forEach((el) => {
          el.style.pointerEvents = 'none'
        })
      }
    })

    // Verify canvas has content
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas is empty - unable to capture element')
    }

    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            blob.name = filename
            resolve(blob)
          } else {
            reject(new Error('Failed to generate image blob or blob is empty'))
          }
        },
        'image/png',
        0.95
      )
    })
  } catch (error) {
    console.error('Error generating achievement image:', error)
    // Provide more detailed error info
    if (error.message.includes('timeout')) {
      throw new Error('Image generation timed out - please try again')
    }
    throw new Error(`Failed to generate achievement card: ${error.message}`)
  }
}

/**
 * Convert blob to data URL
 * @param {Blob} blob - Image blob
 * @returns {Promise<string>} - Promise that resolves with data URL
 */
export const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert blob to data URL'))
      }
    }
    reader.onerror = () => reject(new Error('FileReader error'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Generate text with image for sharing
 * @param {number} tasks - Tasks completed
 * @param {number} sessions - Sessions logged
 * @returns {string} - Share text
 */
export const generateShareText = (tasks, sessions) => {
  return `I've completed ${tasks} tasks and logged ${sessions} study sessions this week on FocusForge! 🚀 #Productivity #FocusForge`
}
