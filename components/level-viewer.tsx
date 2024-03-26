import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";
import { Svg, Circle } from "react-native-svg";

const radius = 35;
const strokeWidth = 10;
const padding = 10;
const adjustedRadius = radius - strokeWidth / 2;
const circumference = 2 * Math.PI * adjustedRadius;
const width = adjustedRadius * 2 + padding * 2;
const height = adjustedRadius * 2 + padding * 2;

const LevelProgressBar = ({
  level,
  currentXp,
  targetXp,
  styles,
  onTouchStart,
}) => {
  const [strokeDashoffset, setStrokeDashoffset] = useState(0);

  useEffect(() => {
    if (!currentXp || !targetXp) return;
    const percentage = (currentXp / targetXp) * 100;
    const strokeDashoffset = Math.round(
      circumference - (circumference * percentage) / 100,
    );

    setStrokeDashoffset(strokeDashoffset);
  }, [currentXp, targetXp]);

  return (
    <View style={styles}>
      <View style={otherStyles.innerContainer}>
        <View
          style={[styles, { padding, width, height }]}
          onTouchStart={onTouchStart}
        >
          <Svg style={otherStyles.svg} width={width} height={height}>
            <Circle
              cx={adjustedRadius + padding}
              cy={adjustedRadius + padding}
              r={adjustedRadius}
              stroke="white"
              fill="transparent"
              strokeWidth={strokeWidth}
            />

            <Circle
              cx={adjustedRadius + padding}
              cy={adjustedRadius + padding}
              r={adjustedRadius}
              stroke="#3498db"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </Svg>
          <View style={otherStyles.levelContainer}>
            <Text style={otherStyles.levelText}>{level}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const otherStyles = StyleSheet.create({
  levelText: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3498db",
  },
  levelContainer: {
    flex: 1,
    justifyContent: "center",
  },
  innerContainer: {
    position: "relative",
    paddingTop: 20,
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: [{ rotate: "-90deg" }],
  },
});

export default LevelProgressBar;
