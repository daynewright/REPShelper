export type DocumentPictureInPicture = {
  window: Window | null;
  requestWindow: (options?: {
    width?: number;
    height?: number;
    disallowReturnToOpener?: boolean;
    preferInitialWindowPlacement?: boolean;
  }) => Promise<Window>;
};

export function getDocumentPip(): DocumentPictureInPicture | null {
  if (typeof window === "undefined") return null;
  const api = (
    window as Window & { documentPictureInPicture?: DocumentPictureInPicture }
  ).documentPictureInPicture;
  return api ?? null;
}

export function supportsDocumentPip() {
  return getDocumentPip() !== null;
}
