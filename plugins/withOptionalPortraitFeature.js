const { withAndroidManifest } = require("expo/config-plugins");

// orientation: "portrait" makes Google Play imply a required android.hardware.screen.portrait feature,
// which hides the app on tablets, desktops and XR devices. Declaring it optional keeps the portrait lock
// on phones without restricting availability.
const PORTRAIT_FEATURE = "android.hardware.screen.portrait";

module.exports = function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (modConfig) => {
    const manifest = modConfig.modResults.manifest;
    const usesFeatures = manifest["uses-feature"] ?? [];
    const otherFeatures = usesFeatures.filter(
      (feature) => feature.$["android:name"] !== PORTRAIT_FEATURE,
    );
    manifest["uses-feature"] = [
      ...otherFeatures,
      { $: { "android:name": PORTRAIT_FEATURE, "android:required": "false" } },
    ];
    return modConfig;
  });
};
