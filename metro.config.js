// Learn more https://docs.expo.io/guides/customizing-metro
const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = path.resolve(__dirname);

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// تأكيد projectRoot (سبب محتمل 1: الملف غير مُراقَب).
config.projectRoot = projectRoot;

module.exports = config;
