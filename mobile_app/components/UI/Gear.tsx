import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GearProps {
  size: number;
  top: number;
  left: number;
  duration: number;
  delay?: number;
  opacity?: number;
  reverse?: boolean;
}

export function Gear({
  size,
  top,
  left,
  duration,
  delay = 0,
  opacity = 0.15,
  reverse = false,
}: GearProps) {
  const rotation = useSharedValue(0);
  const teeth = Math.max(8, Math.floor(size / 8));
  const outerR = size * 0.48;
  const innerR = size * 0.35;
  const toothH = size * 0.12;

  const toothPath = Array.from({ length: teeth }, (_, i) => {
    const a1 = (i / teeth) * Math.PI * 2;
    const a2 = ((i + 0.4) / teeth) * Math.PI * 2;
    const x1 = Math.cos(a1) * outerR;
    const y1 = Math.sin(a1) * outerR;
    const x2 = Math.cos(a1) * (outerR + toothH);
    const y2 = Math.sin(a1) * (outerR + toothH);
    const x3 = Math.cos(a2) * (outerR + toothH);
    const y3 = Math.sin(a2) * (outerR + toothH);
    const x4 = Math.cos(a2) * outerR;
    const y4 = Math.sin(a2) * outerR;
    return `M${x1},${y1} L${x2},${y2} L${x3},${y3} L${x4},${y4} Z`;
  }).join(' ');

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(reverse ? -360 : 360, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const viewBox = `-${size / 2} -${size / 2} ${size} ${size}`;

  return (
    <Animated.View
    style={[
      {
        position: 'absolute' as const,
        top: top,
        left: left,
        width: size,
        height: size,
        opacity: opacity ?? 0.15,
      },
      animatedStyle,
    ]}
  >
      <Svg
        viewBox={viewBox}
        width={size}
        height={size}
      >
        <Circle
          cx={0} cy={0} r={outerR}
          fill={colors.gearBody}
          stroke={colors.gearStroke}
          strokeWidth={1.5}
        />
        <Path
          d={toothPath}
          fill="hsl(200, 70%, 18%)"
          stroke={colors.gearStroke}
          strokeWidth={1}
        />
        <Circle
          cx={0} cy={0} r={innerR}
          fill={colors.gearBg}
          stroke={colors.gearStroke}
          strokeWidth={1.5}
        />
        <Circle
          cx={0} cy={0} r={innerR * 0.4}
          fill="none"
          stroke="hsl(199, 60%, 30%)"
          strokeWidth={1}
        />
      </Svg>
    </Animated.View>
  );
}