declare module 'react-native-share-menu' {
  export interface ShareData {
    mimeType: string;
    data: any;
  }

  const ShareMenu: {
    getSharedData: (callback: (data: ShareData | null) => void) => void;
    addNewShareListener: (callback: (data: ShareData | null) => void) => { remove: () => void };
  };

  export default ShareMenu;
}
