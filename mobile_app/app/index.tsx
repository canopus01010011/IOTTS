import { Gear } from "@/components/UI/Gear";
import { colors } from "@/constants/theme";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const GEARS = [
  { size: 160, topPct: 0.04, leftPct: -0.04, duration: 20000, opacity: 0.15 },
  {
    size: 110,
    topPct: 0.03,
    leftPct: 0.68,
    duration: 15000,
    opacity: 0.12,
    reverse: true,
  },
  { size: 180, topPct: 0.52, leftPct: 0.72, duration: 25000, opacity: 0.1 },
  {
    size: 90,
    topPct: 0.62,
    leftPct: 0.06,
    duration: 12000,
    opacity: 0.18,
    reverse: true,
  },
  { size: 135, topPct: 0.72, leftPct: 0.42, duration: 18000, opacity: 0.13 },
  {
    size: 80,
    topPct: 0.08,
    leftPct: 0.53,
    duration: 10000,
    opacity: 0.16,
    reverse: true,
  },
  { size: 125, topPct: 0.38, leftPct: -0.04, duration: 22000, opacity: 0.11 },
  {
    size: 100,
    topPct: 0.27,
    leftPct: 0.83,
    duration: 14000,
    opacity: 0.14,
    reverse: true,
  },
];

export default function SplashScreen() {
  const { goToLogin } = useAppNavigation();

  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-180);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(30);
  const taglineOpacity = useSharedValue(0);
  const lineScale = useSharedValue(0);
  const btnOpacity = useSharedValue(0);
  const btnY = useSharedValue(20);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    logoScale.value = withDelay(
      200,
      withSpring(1, { stiffness: 120, damping: 14 }),
    );
    logoRotate.value = withDelay(
      200,
      withSpring(0, { stiffness: 120, damping: 14 }),
    );

    titleOpacity.value = withDelay(500, withTiming(1, { duration: 700 }));
    titleY.value = withDelay(
      500,
      withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }),
    );

    taglineOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    lineScale.value = withDelay(1100, withTiming(1, { duration: 800 }));

    btnOpacity.value = withDelay(1300, withTiming(1, { duration: 500 }));
    btnY.value = withDelay(1300, withTiming(0, { duration: 500 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ translateY: btnY.value }, { scale: btnScale.value }],
  }));

  function handlePressIn() {
    btnScale.value = withTiming(0.97, { duration: 100 });
  }
  function handlePressOut() {
    btnScale.value = withSpring(1, { stiffness: 300, damping: 15 });
  }
  function handlePress() {
    goToLogin();
  }
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {GEARS.map((g, i) => (
        <Gear
          key={i}
          size={g.size}
          top={height * g.topPct}
          left={width * g.leftPct}
          duration={g.duration}
          opacity={g.opacity}
          reverse={g.reverse}
        />
      ))}

      <View style={styles.glow} pointerEvents="none" />

      <View style={styles.content}>
        <Animated.View style={[styles.logoWrapper, logoStyle]}>
          <Image
            source={require("@/assets/images/telcotrack-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={titleStyle}>
          <Text style={styles.title}>
            <Text style={styles.titleWhite}>Telco</Text>
            <Text style={styles.titleAccent}>Track</Text>
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Equipment tracking &amp; mission management
        </Animated.Text>

        <Animated.View style={[styles.line, lineStyle]} />

        <Animated.View style={[{ marginTop: 16 }, btnStyle]}>
          <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.buttonText}>Get Started</Text>
            <Text style={[styles.buttonText, { fontSize: 18 }]}> →</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(30, 168, 212, 0.04)",
  },
  content: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    borderRadius: 24,
    backgroundColor: colors.gearBody,
    borderWidth: 1.5,
    borderColor: "rgba(30, 168, 212, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 56,
  },
  titleWhite: {
    color: colors.textPrimary,
  },
  titleAccent: {
    color: colors.primary,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 220,
  },
  line: {
    width: 100,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  buttonText: {
    color: colors.buttonText,
    fontWeight: "700",
    fontSize: 16,
  },
});
