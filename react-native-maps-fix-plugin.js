const fs = require("fs");
const path = require("path");

const plugins = require("@expo/config-plugins");
const {
  removeContents,
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

// The Google Maps import fix
const googleMapsPodfileFix = `
    # Replace @import GoogleMaps; with #import <GoogleMaps/GoogleMaps.h> in specific files
    specific_files = [
      "#{Pod::Config.instance.installation_root}/Pods/Google-Maps-iOS-Utils/Sources/GoogleMapsUtilsObjC/include/GMSMarker+GMUClusteritem.h",
      "#{Pod::Config.instance.installation_root}/Pods/Google-Maps-iOS-Utils/Sources/GoogleMapsUtilsObjC/include/GMUGeoJSONParser.h",
      "#{Pod::Config.instance.installation_root}/Pods/Google-Maps-iOS-Utils/Sources/GoogleMapsUtilsObjC/include/GMUPolygon.h",
      "#{Pod::Config.instance.installation_root}/Pods/Google-Maps-iOS-Utils/Sources/GoogleMapsUtilsObjC/include/GMUWeightedLatLng.h",
      "#{Pod::Config.instance.installation_root}/Pods/GoogleMaps/Maps/Sources/GMSEmpty.h"
    ]

    specific_files.each do |file|
      if File.exist?(file)
        text = File.read(file)
        if text.include?("@import GoogleMaps;")
          new_text = text.gsub("@import GoogleMaps;", "#import <GoogleMaps/GoogleMaps.h>")
          File.open(file, "w") { |f| f.write(new_text) }
          puts "🔧 Patched @import in: #{file}"
        else
          puts "ℹ️ No @import GoogleMaps; found in: #{file}"
        end
      else
        puts "⚠️ File not found: #{file}"
      end
    end`;

// The custom react-native-maps pod entries
const customMapsPodsEntries = `
# Custom react-native-maps configuration
rn_maps_path = '../node_modules/react-native-maps'
pod 'react-native-maps', :path => rn_maps_path
pod 'react-native-maps-generated', :path => rn_maps_path
`;

module.exports = function withReactNativeMapsCustomization(config) {
  return plugins.withDangerousMod(config, [
    "ios",
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(filePath, "utf-8");

      // Step 1: Add custom pods after use_native_modules!
      const removeOldPods = removeContents({
        tag: "custom-react-native-maps-pods",
        src: contents,
      });

      const addCustomPods = mergeContents({
        tag: "custom-react-native-maps-pods",
        src: removeOldPods.contents,
        newSrc: customMapsPodsEntries,
        anchor: /config = use_native_modules!\(config_command\)/,
        offset: 1,
        comment: "#",
      });

      if (!addCustomPods.didMerge) {
        console.log(
          "ERROR: react-native-maps-fix-plugin.js: Cannot add custom react-native-maps pods to the project's ios/Podfile. Could not find 'use_native_modules!' call."
        );
        console.log(addCustomPods);
        return config;
      }

      // Step 2: If previous build already has modified this, remove the old Google Maps fix
      const removeOldFix = removeContents({
        tag: "react-native-maps-import-fix",
        src: addCustomPods.contents,
      });

      // Step 3: Add our Google Maps fix after the react_native_post_install call
      const enableFix = mergeContents({
        tag: "react-native-maps-import-fix",
        src: removeOldFix.contents,
        newSrc: googleMapsPodfileFix,
        anchor: /react_native_post_install\(/,
        offset: 6, // Position after the closing ")" and subsequent line(s)
        comment: "#",
      });

      if (!enableFix.didMerge) {
        console.log(
          "ERROR: react-native-maps-fix-plugin.js: Cannot add Google Maps import fix to the project's ios/Podfile because it's malformed. Please report this with a copy of your project Podfile."
        );
        console.log(enableFix);
        return config;
      }

      fs.writeFileSync(filePath, enableFix.contents);
      console.log(
        "✅ Added custom react-native-maps pods and Google Maps import fix to Podfile"
      );

      return config;
    },
  ]);
};
