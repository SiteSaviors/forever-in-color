import type { Orientation } from '@/utils/imageUtils';
import type { FrameColor } from '@/store/useFounderStore';

type ArtRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type RoomAsset = {
  src: string;
  artRectPct: ArtRect;
};

const ORIENTATION_FILENAME: Record<Orientation, string> = {
  vertical: 'portrait',
  horizontal: 'horizontal',
  square: 'square',
};

// Derived from OpenCV contour detection to align artwork inside each room asset.
const ROOM_ASSET_ART_RECTS: Record<Orientation, Record<FrameColor, ArtRect>> = {
  horizontal: {
    black: {
      left: 0.24166666666666667,
      top: 0.14583333333333334,
      width: 0.5025,
      height: 0.3433333333333333,
    },
    white: {
      left: 0.24083333333333334,
      top: 0.14583333333333334,
      width: 0.5041666666666667,
      height: 0.3458333333333333,
    },
    none: {
      left: 0.234375,
      top: 0.33203125,
      width: 0.7294921875,
      height: 0.486328125,
    },
  },
  vertical: {
    black: {
      left: 0.2075,
      top: 0.06583333333333333,
      width: 0.3425,
      height: 0.5033333333333333,
    },
    white: {
      left: 0.21166666666666667,
      top: 0.06916666666666667,
      width: 0.335,
      height: 0.5025,
    },
    none: {
      left: 0.234375,
      top: 0.009765625,
      width: 0.54150390625,
      height: 0.80810546875,
    },
  },
  square: {
    black: {
      left: 0.3485,
      top: 0.1740,
      width: 0.2883,
      height: 0.2875,
    },
    white: {
      left: 0.3485,
      top: 0.1740,
      width: 0.2883,
      height: 0.2875,
    },
    none: {
      left: 0.2665,
      top: 0.147,
      width: 0.4653,
      height: 0.4613,
    },
  },
};

const FRAME_VARIANT: Record<FrameColor, string> = {
  black: 'black-framed',
  white: 'white-framed',
  none: 'unframed',
};

type RoomAssetKey = `${Orientation}-${FrameColor}`;

const ROOM_ASSET_MANIFEST: Record<RoomAssetKey, RoomAsset> = (() => {
  const manifest: Partial<Record<RoomAssetKey, RoomAsset>> = {};

  (Object.keys(ORIENTATION_FILENAME) as Orientation[]).forEach((orientation) => {
    (Object.keys(FRAME_VARIANT) as FrameColor[]).forEach((frame) => {
      const key: RoomAssetKey = `${orientation}-${frame}`;
      const artRect = ROOM_ASSET_ART_RECTS[orientation]?.[frame];
      if (!artRect) {
        return;
      }

      manifest[key] = {
        src: `/room-backgrounds/${ORIENTATION_FILENAME[orientation]}-${FRAME_VARIANT[frame]}.jpg`,
        artRectPct: artRect,
      };
    });
  });

  return manifest as Record<RoomAssetKey, RoomAsset>;
})();

export function getRoomAsset(orientation: Orientation, frame: FrameColor): RoomAsset {
  const key: RoomAssetKey = `${orientation}-${frame}`;

  if (ROOM_ASSET_MANIFEST[key]) {
    return ROOM_ASSET_MANIFEST[key];
  }

  const fallbackKey: RoomAssetKey = `${orientation}-none`;
  return ROOM_ASSET_MANIFEST[fallbackKey];
}
