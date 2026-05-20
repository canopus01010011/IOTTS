const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// CRITICAL: prevent scanning parent folders (web/backend)
config.watchFolders = [];

module.exports = config;