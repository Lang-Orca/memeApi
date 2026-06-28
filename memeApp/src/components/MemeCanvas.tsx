import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, Text, View, Image, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';

interface MemeCanvasProps {
  imageUrl: string;
  topText: string;
  bottomText: string;
  fontSize: number;
  textColor: string;
  textShadowColor: string;
}

export interface MemeCanvasRef {
  capture: () => Promise<string>;
}

export const MemeCanvas = forwardRef<MemeCanvasRef, MemeCanvasProps>(
  (
    {
      imageUrl,
      topText,
      bottomText,
      fontSize,
      textColor = '#FFFFFF',
      textShadowColor = '#000000',
    },
    ref
  ) => {
    const viewShotRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        if (!viewShotRef.current || !viewShotRef.current.capture) {
          throw new Error('ViewShot is not ready');
        }
        return await viewShotRef.current.capture();
      },
    }));

    return (
      <ViewShot
        ref={viewShotRef}
        options={{ format: 'png', quality: 1.0 }}
        style={styles.canvasContainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.memeImage}
          resizeMode="cover"
        />

        {/* Top Text Overlay */}
        <View style={styles.topTextWrapper}>
          <Text
            style={[
              styles.memeText,
              {
                fontSize: fontSize,
                color: textColor,
                textShadowColor: textShadowColor,
              },
            ]}
          >
            {topText.toUpperCase()}
          </Text>
        </View>

        {/* Bottom Text Overlay */}
        <View style={styles.bottomTextWrapper}>
          <Text
            style={[
              styles.memeText,
              {
                fontSize: fontSize,
                color: textColor,
                textShadowColor: textShadowColor,
              },
            ]}
          >
            {bottomText.toUpperCase()}
          </Text>
        </View>
      </ViewShot>
    );
  }
);

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    aspectRatio: 1, // Keep it perfectly square
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  memeImage: {
    width: '100%',
    height: '100%',
  },
  topTextWrapper: {
    position: 'absolute',
    top: 20,
    left: 15,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTextWrapper: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    right: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memeText: {
    fontWeight: '900',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-CondensedBold' : 'sans-serif-condensed',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});
