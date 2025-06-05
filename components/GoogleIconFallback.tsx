import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GoogleIconFallbackProps {
  size?: number;
}

export const GoogleIconFallback: React.FC<GoogleIconFallbackProps> = ({ size = 20 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Text style={[styles.text, { fontSize: size * 0.7 }]}>G</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4285F4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'System',
  },
});
