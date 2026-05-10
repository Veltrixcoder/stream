'use client';

import { MediaPlayer, MediaProvider, Poster } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

export default function VideoPlayer({ src, title, poster }) {
  return (
    <MediaPlayer
      title={title}
      src={src}
      crossOrigin
      playsInline
      className="player"
      autoPlay
    >
      <MediaProvider>
        {poster && (
          <Poster
            className="vds-poster"
            src={poster}
            alt={title}
          />
        )}
      </MediaProvider>
      <DefaultVideoLayout icons={defaultLayoutIcons} />
    </MediaPlayer>
  );
}
