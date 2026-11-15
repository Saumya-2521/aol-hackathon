// The guided practice plays the team's chosen recording from YouTube inside the app (config.guided_practice).
// The app never copies the audio and never writes its own practice instructions.
import React from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';

export function Player({ videoId, playing, onEnded }: { videoId: string; playing: boolean; onEnded: () => void }) {
  return <YoutubePlayer height={206} play={playing} videoId={videoId} onChangeState={(state: string) => { if (state === 'ended') onEnded(); }} />;
}
