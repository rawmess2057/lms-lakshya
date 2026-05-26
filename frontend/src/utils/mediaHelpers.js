export const getVideoSource = (url) => {
    if (!url) return 'unknown';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    }

    if (url.includes('drive.google.com')) {
        return 'drive';
    }

    if (url.includes('bunny.net') || url.includes('b-cdn.net')) {
        return 'bunny';
    }

    return 'direct';
};

export const getEmbedUrl = (url) => {
    if (!url) return '';

    const source = getVideoSource(url);

    if (source === 'drive') {
        // Convert view/edit to preview
        return url.replace(/\/view.*$/, '/preview').replace(/\/edit.*$/, '/preview');
    }

    if (source === 'youtube') {
        // Return as is, ReactPlayer handles it, or convert if using raw iframe
        // But for consistency with the requirement "Convert links into proper embeddable formats"
        // we will rely on the player component to handle youtube, or if we use raw iframe:
        // This helper is primarily for things ReactPlayer might struggle with or checking logic.
        return url;
    }

    if (source === 'bunny') {
        // If it's a direct video link, just return it
        // If it's an embed link, ensure it's correct
        return url;
    }

    return url;
};

export const cleanYoutubeUrl = (url) => {
  if (!url) return url;

  const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
  if (!isYoutube) return url;

  let videoId = null;

  if (url.includes('youtu.be')) {
    const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) videoId = match[1];
  }

  if (!videoId) {
    try {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } catch {
      // URL parsing failed, try regex fallback
      const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
      if (match) videoId = match[1];
    }
  }

  if (!videoId) {
    const match = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (match) videoId = match[1];
  }

  if (!videoId) return url;

  return `https://www.youtube.com/watch?v=${videoId}`;
};

export const validateImageUrl = (url) => {
    if (!url) return false;
    return url.match(/^https?:\/\/.+\/.+$/);
};
