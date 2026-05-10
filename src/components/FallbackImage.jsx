import { useState } from 'react'
import { FALLBACK_POSTER } from '../utils/fallbackImages'

function FallbackImage({ src, fallbackSrc = FALLBACK_POSTER, alt, ...props }) {
  const resolvedSrc = src || fallbackSrc
  const [failedSrc, setFailedSrc] = useState('')
  const currentSrc = failedSrc === resolvedSrc ? fallbackSrc : resolvedSrc

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setFailedSrc(resolvedSrc)
    }
  }

  return <img src={currentSrc} alt={alt} onError={handleError} {...props} />
}

export default FallbackImage
