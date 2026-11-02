const { withProjectBuildGradle } = require("@expo/config-plugins");

const KOTLIN_GRADLE_PLUGIN =
  "classpath('org.jetbrains.kotlin:kotlin-gradle-plugin:2.1.20')";

module.exports = function withKotlinGradleClasspath(config) {
  return withProjectBuildGradle(config, (modConfig) => {
    const { contents } = modConfig.modResults;

    if (contents.includes(KOTLIN_GRADLE_PLUGIN)) {
      return modConfig;
    }

    const unversionedClasspath =
      /classpath\s*\(\s*['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\s*\)/;
    const propertyBasedClasspath =
      /def kotlinVersion = findProperty\(['"]android\.kotlinVersion['"]\)[\s\S]*?classpath\(kotlinVersion\s*\?\s*"org\.jetbrains\.kotlin:kotlin-gradle-plugin:\$kotlinVersion"\s*:\s*'org\.jetbrains\.kotlin:kotlin-gradle-plugin'\s*\)/;

    if (propertyBasedClasspath.test(contents)) {
      modConfig.modResults.contents = contents.replace(
        propertyBasedClasspath,
        KOTLIN_GRADLE_PLUGIN,
      );
      return modConfig;
    }

    if (unversionedClasspath.test(contents)) {
      modConfig.modResults.contents = contents.replace(
        unversionedClasspath,
        KOTLIN_GRADLE_PLUGIN,
      );
      return modConfig;
    }

    throw new Error(
      "Unable to locate the Kotlin Gradle plugin classpath in android/build.gradle. Update with-kotlin-gradle-classpath.js for the current Expo template.",
    );
  });
};
