module.exports = {
  // ...
  packagerConfig: {
    icon: "assets/Icon", // no file extension required
  },
  makers: [
    {
      // Path to the icon to use for the app in the DMG window
      name: "@electron-forge/maker-dmg",
      config: {
        icon: "assets/Icon.icns",
      },
    },
  ],
  // ...
};
