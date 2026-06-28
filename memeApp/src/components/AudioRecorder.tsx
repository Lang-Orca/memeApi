import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import AudioRecorderPlayer, { RecordBackType } from 'react-native-audio-recorder-player';
import { theme } from '../styles/theme';

interface AudioRecorderProps {
  onRecordingComplete: (filePath: string) => void;
  onRecordingClear: () => void;
  isLoading: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  onRecordingClear,
  isLoading,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTime, setRecordTime] = useState<string>('00:00');
  const [savedFilePath, setSavedFilePath] = useState<string | null>(null);

  const audioRecorderPlayer = useRef(AudioRecorderPlayer);

  useEffect(() => {
    checkPermission();
    return () => {
      // Clean up recording listeners on unmount
      if (isRecording) {
        audioRecorderPlayer.current.stopRecorder().catch(() => {});
        audioRecorderPlayer.current.removeRecordBackListener();
      }
    };
  }, [isRecording]);

  const checkPermission = async () => {
    try {
      const permission = Platform.OS === 'android' 
        ? PERMISSIONS.ANDROID.RECORD_AUDIO 
        : PERMISSIONS.IOS.MICROPHONE;
      
      const result = await check(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
      }
    } catch (err) {
      console.log('Check permission error:', err);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = Platform.OS === 'android' 
        ? PERMISSIONS.ANDROID.RECORD_AUDIO 
        : PERMISSIONS.IOS.MICROPHONE;
      
      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        setHasPermission(true);
      } else {
        setHasPermission(false);
        Alert.alert(
          'Microphone Permission Required',
          'This app needs microphone access to record voice memes.'
        );
      }
    } catch (err) {
      console.log('Request permission error:', err);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermission();
      return;
    }

    try {
      setSavedFilePath(null);
      setIsRecording(true);
      setRecordTime('00:00');

      // startRecorder will use default path / filename
      const uri = await audioRecorderPlayer.current.startRecorder();
      
      audioRecorderPlayer.current.addRecordBackListener((e: RecordBackType) => {
        // e.currentPosition is in milliseconds
        const seconds = Math.floor(e.currentPosition / 1000);
        const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
        const ss = (seconds % 60).toString().padStart(2, '0');
        setRecordTime(`${mm}:${ss}`);
      });
      
      console.log('Recording started, uri:', uri);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.current.stopRecorder();
      audioRecorderPlayer.current.removeRecordBackListener();
      setIsRecording(false);
      
      console.log('Recording stopped, file saved to:', result);
      setSavedFilePath(result);
      onRecordingComplete(result);
    } catch (err) {
      console.error('Failed to stop recording:', err);
      setIsRecording(false);
    }
  };

  const clearRecording = () => {
    setSavedFilePath(null);
    setRecordTime('00:00');
    onRecordingClear();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Voice Note Input (OR Text context above)</Text>
      
      <View style={styles.recorderCard}>
        {/* Permission Request state */}
        {!hasPermission && (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionText}>Microphone permission is required to record audio memes.</Text>
            <Pressable style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </Pressable>
          </View>
        )}

        {hasPermission && (
          <View style={styles.controlsRow}>
            {/* Record / Stop Toggle Trigger */}
            <View style={styles.buttonWrapper}>
              <Pressable
                disabled={isLoading}
                onPress={isRecording ? stopRecording : startRecording}
                style={({ pressed }) => [
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  pressed && styles.buttonPressed,
                ]}
              >
                <View style={[styles.innerCircle, isRecording && styles.innerCircleActive]} />
              </Pressable>
              <Text style={styles.buttonLabel}>
                {isRecording ? 'Tap to Stop' : 'Tap to Record'}
              </Text>
            </View>

            {/* Timer and Status display */}
            <View style={styles.statusCol}>
              <Text style={[styles.timer, isRecording && styles.timerActive]}>
                {recordTime}
              </Text>
              <Text style={styles.statusLabel}>
                {isRecording 
                  ? 'Recording voice note...' 
                  : savedFilePath 
                    ? 'Voice note saved ✅' 
                    : 'Ready to record'}
              </Text>
            </View>

            {/* Delete / Clear button */}
            {savedFilePath && (
              <Pressable 
                disabled={isLoading} 
                onPress={clearRecording} 
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>🗑️ Clear</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 6,
  },
  recorderCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  permissionBox: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  permissionText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  permissionButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
  },
  permissionButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonWrapper: {
    alignItems: 'center',
    width: 90,
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  recordButtonActive: {
    borderColor: theme.colors.error,
  },
  innerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
  },
  innerCircleActive: {
    backgroundColor: theme.colors.error,
    borderRadius: 4, // Square stop button look
    width: 20,
    height: 20,
  },
  buttonLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs - 2,
    fontWeight: theme.typography.weights.medium,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  statusCol: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  timer: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg + 2,
    fontWeight: theme.typography.weights.black,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  timerActive: {
    color: theme.colors.error,
  },
  statusLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    marginTop: 2,
  },
  clearButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearButtonText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
});
