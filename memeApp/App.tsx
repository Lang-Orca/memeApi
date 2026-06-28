import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import ShareMenu from 'react-native-share-menu';
import Share from 'react-native-share';
import { theme } from './src/styles/theme';
import { VibeSelector, VIBE_OPTIONS } from './src/components/VibeSelector';
import { InputForm } from './src/components/InputForm';
import { AudioRecorder } from './src/components/AudioRecorder';
import { MemeCanvas, MemeCanvasRef } from './src/components/MemeCanvas';
import { api } from './src/services/api';
import { VibeOption } from './src/types/meme';

interface GeneratedMemeData {
  imageUrl: string;
  dialect: string;
}

const COLOR_OPTIONS = [
  { name: 'White', value: '#FFFFFF' },
  { name: 'Yellow', value: '#FBBF24' },
  { name: 'Cyan', value: '#22D3EE' },
  { name: 'Lime', value: '#A3E635' },
];

function App() {
  const [selectedVibe, setSelectedVibe] = useState<VibeOption>(VIBE_OPTIONS[0]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [memeData, setMemeData] = useState<GeneratedMemeData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Meme states (Part C)
  const [topText, setTopText] = useState<string>('');
  const [bottomText, setBottomText] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(24);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Part B and Share Intent states
  const [recordedAudioPath, setRecordedAudioPath] = useState<string | null>(null);
  const [sharedText, setSharedText] = useState<string>('');
  const [sharedMedia, setSharedMedia] = useState<{ type: string; uri: string } | null>(null);

  const canvasRef = useRef<MemeCanvasRef>(null);

  // Check backend health on startup
  useEffect(() => {
    const checkHealth = async () => {
      const online = await api.checkConnection();
      setIsBackendOnline(online);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Listen for shared intents (WhatsApp integration)
  useEffect(() => {
    const handleShareData = (data: any) => {
      if (!data) return;
      const { mimeType, data: sharedContent } = data;
      console.log('Shared Intent Received:', sharedContent, 'Mime:', mimeType);

      if (mimeType.startsWith('text/')) {
        setSharedText(sharedContent);
        setSharedMedia(null);
        setErrorMsg(null);
      } else if (mimeType.startsWith('audio/') || mimeType.startsWith('image/')) {
        setSharedMedia({ type: mimeType, uri: sharedContent });
        if (mimeType.startsWith('audio/')) {
          setRecordedAudioPath(sharedContent);
        }
        setErrorMsg(null);
      }
    };

    ShareMenu.getSharedData(handleShareData);
    const listener = ShareMenu.addNewShareListener(handleShareData);

    return () => {
      listener.remove();
    };
  }, []);

  const handleGenerateMeme = async (context: string, prompt: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setMemeData(null);
    setTopText('');
    setBottomText('');

    try {
      let response;
      if (recordedAudioPath) {
        console.log('Generating meme from voice note:', recordedAudioPath);
        response = await api.generateMemeWithAudio(recordedAudioPath, context, prompt);
      } else {
        console.log('Generating meme from text prompt');
        response = await api.generateMeme({
          context,
          user_prompt: prompt,
          temperature: 0.7,
        });
      }

      if (typeof response.result === 'string') {
        // Mock response handler for demo testing
        setTopText(`WHEN YOU CHOOSE ${selectedVibe.name.toUpperCase()}`);
        setBottomText('BUT THE BACKEND IS STILL MOCKING');
        setMemeData({
          imageUrl: `https://image.pollinations.ai/p/funny_computer_programmer_meme_generating_ai?width=512&height=512&seed=${Math.floor(Math.random() * 100)}`,
          dialect: selectedVibe.culturalVibe,
        });
      } else {
        // Structured API response
        setTopText(response.result.memeCaptionTop);
        setBottomText(response.result.memeCaptionBottom);
        setMemeData({
          imageUrl: response.result.imageUrl,
          dialect: response.result.detectedDialect || selectedVibe.culturalVibe,
        });
      }
    } catch (err: any) {
      console.log('Generation failed', err);
      setErrorMsg(err.message || 'Connection to backend failed.');
      
      // Fallback visualization
      setTopText('BACKEND OFFLINE / REQUEST FAILED');
      setBottomText('DEFAULTING TO CLIENT-SIDE DEMONSTRATION');
      setMemeData({
        imageUrl: 'https://image.pollinations.ai/p/stressed_student_studying_computer_science_cartoon?width=512&height=512&seed=99',
        dialect: selectedVibe.culturalVibe,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compile view and share general chooser
  const handleShareMeme = async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    try {
      const localUri = await canvasRef.current.capture();
      console.log('Meme compiled successfully:', localUri);
      
      await Share.open({
        title: 'Share your meme!',
        url: localUri,
        type: 'image/png',
        failOnCancel: false,
      });
    } catch (err) {
      console.error('Sharing failed:', err);
      Alert.alert('Compilation Error', 'Failed to compile and share the meme.');
    } finally {
      setIsSharing(false);
    }
  };

  // Compile view and quick share to WhatsApp (Part D bypass)
  const handleWhatsAppShare = async () => {
    if (!canvasRef.current) return;
    setIsSharing(true);
    try {
      const localUri = await canvasRef.current.capture();
      console.log('Meme compiled successfully for WhatsApp:', localUri);

      await Share.shareSingle({
        social: Share.Social.WHATSAPP as any,
        url: localUri,
        type: 'image/png',
      });
    } catch (err: any) {
      console.error('WhatsApp sharing failed:', err);
      // Fallback to general sharing if single share fails or WhatsApp is not installed
      if (err.message && err.message.includes('not installed')) {
        Alert.alert(
          'WhatsApp not installed',
          'WhatsApp was not detected on this device. Opening general sharing instead...',
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  if (canvasRef.current) {
                    const localUri = await canvasRef.current.capture();
                    await Share.open({ url: localUri, type: 'image/png' });
                  }
                } catch (shareErr) {
                  console.error('Fallback sharing failed:', shareErr);
                }
              },
            },
          ]
        );
      } else {
        Alert.alert('Compilation Error', 'Failed to compile and share the meme.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  const clearSharedMedia = () => {
    setSharedMedia(null);
    setRecordedAudioPath(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>MEME <Text style={styles.headerTitleAccent}>GEN</Text></Text>
              <Text style={styles.headerSubtitle}>ICT202 G2 Multimodal Meme Engine</Text>
            </View>
            
            {/* Status indicator */}
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, isBackendOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
              <Text style={styles.statusText}>{isBackendOnline ? 'API Connected' : 'API Offline'}</Text>
            </View>
          </View>

          {/* Selector component */}
          <VibeSelector
            selectedVibeId={selectedVibe.id}
            onSelectVibe={setSelectedVibe}
          />

          {/* Shared Content Notification Banner */}
          {sharedMedia && (
            <View style={styles.sharedBadge}>
              <View style={styles.sharedBadgeContent}>
                <Text style={styles.sharedBadgeText}>
                  📎 Shared {sharedMedia.type.split('/')[0]} file loaded!
                </Text>
                <Pressable onPress={clearSharedMedia} style={styles.sharedBadgeClear}>
                  <Text style={styles.sharedBadgeClearText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Audio Recorder component */}
          <AudioRecorder
            onRecordingComplete={(path) => setRecordedAudioPath(path)}
            onRecordingClear={() => setRecordedAudioPath(null)}
            isLoading={isLoading}
          />

          {/* Form component */}
          <InputForm
            onGenerate={handleGenerateMeme}
            isLoading={isLoading}
            initialContext={sharedText}
          />

          {/* Error Message banner */}
          {errorMsg && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMsg} (Using demo fallback)</Text>
            </View>
          )}

          {/* Meme Output & Editor Section */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>3. Meme Editor & Export</Text>
            
            {isLoading && (
              <View style={[styles.memeContainer, styles.memePlaceholder]}>
                <Image
                  source={{ uri: 'https://image.pollinations.ai/p/loading_animation_vector_art?width=512&height=512' }}
                  style={StyleSheet.absoluteFill}
                  blurRadius={10}
                />
                <Text style={styles.loadingOverlayText}>Brewing meme magic...</Text>
              </View>
            )}

            {!isLoading && !memeData && (
              <View style={[styles.memeContainer, styles.memeEmpty]}>
                <Text style={styles.emptyText}>Fill in the details above and hit Generate to see your meme editor appear here!</Text>
              </View>
            )}

            {!isLoading && memeData && (
              <View style={styles.editorCard}>
                {/* 1. Visual Meme ViewShot Canvas (Part C) */}
                <MemeCanvas
                  ref={canvasRef}
                  imageUrl={memeData.imageUrl}
                  topText={topText}
                  bottomText={bottomText}
                  fontSize={fontSize}
                  textColor={textColor}
                  textShadowColor="#000000"
                />
                
                {/* 2. Text Adjustments Customization Inputs (Part C phase 4) */}
                <View style={styles.adjustmentsContainer}>
                  <Text style={styles.sectionSubTitle}>Customize Meme Caption Text</Text>
                  
                  <View style={styles.adjustInputRow}>
                    <Text style={styles.adjustLabel}>Top:</Text>
                    <TextInput
                      style={styles.adjustInput}
                      value={topText}
                      onChangeText={setTopText}
                      placeholder="TOP OVERLAY TEXT"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  <View style={styles.adjustInputRow}>
                    <Text style={styles.adjustLabel}>Bottom:</Text>
                    <TextInput
                      style={styles.adjustInput}
                      value={bottomText}
                      onChangeText={setBottomText}
                      placeholder="BOTTOM OVERLAY TEXT"
                      placeholderTextColor={theme.colors.textSecondary}
                    />
                  </View>

                  {/* Font Size Controllers */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>Font Size: {fontSize}px</Text>
                    <View style={styles.sizeBtnRow}>
                      <Pressable 
                        style={styles.sizeBtn} 
                        onPress={() => setFontSize(Math.max(12, fontSize - 2))}
                      >
                        <Text style={styles.sizeBtnText}>A-</Text>
                      </Pressable>
                      <Pressable 
                        style={styles.sizeBtn} 
                        onPress={() => setFontSize(Math.min(48, fontSize + 2))}
                      >
                        <Text style={styles.sizeBtnText}>A+</Text>
                      </Pressable>
                    </View>
                  </View>

                  {/* Text Color Options */}
                  <View style={styles.controlRow}>
                    <Text style={styles.controlLabel}>Text Color:</Text>
                    <View style={styles.colorPalette}>
                      {COLOR_OPTIONS.map((color) => {
                        const isSelected = textColor === color.value;
                        return (
                          <Pressable
                            key={color.value}
                            onPress={() => setTextColor(color.value)}
                            style={[
                              styles.colorBubble,
                              { backgroundColor: color.value },
                              isSelected && styles.colorBubbleSelected,
                            ]}
                          />
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* 3. Export Share Actions (Part D / WhatsApp share) */}
                <View style={styles.actionsContainer}>
                  <Pressable
                    disabled={isSharing}
                    style={({ pressed }) => [
                      styles.shareBtn,
                      pressed && styles.shareBtnPressed,
                    ]}
                    onPress={handleShareMeme}
                  >
                    {isSharing ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.shareBtnText}>📤 Share Meme</Text>
                    )}
                  </Pressable>

                  <Pressable
                    disabled={isSharing}
                    style={({ pressed }) => [
                      styles.waBtn,
                      pressed && styles.waBtnPressed,
                    ]}
                    onPress={handleWhatsAppShare}
                  >
                    {isSharing ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.shareBtnText}>🟢 WhatsApp Quick Share</Text>
                    )}
                  </Pressable>
                </View>

                {/* Metadata label */}
                <View style={styles.memeMeta}>
                  <Text style={styles.metaLabel}>Vibe Dialect: <Text style={styles.metaValue}>{memeData.dialect}</Text></Text>
                  {recordedAudioPath && (
                    <Text style={styles.audioSourceLabel}>🎤 Generated from Voice Note</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.black,
    letterSpacing: 1,
  },
  headerTitleAccent: {
    color: theme.colors.primary,
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs - 1,
    fontFamily: theme.typography.fontFamily,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: theme.colors.success,
  },
  statusDotOffline: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xs - 2,
    fontFamily: theme.typography.fontFamily,
  },
  sharedBadge: {
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    marginVertical: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  sharedBadgeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sharedBadgeText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  sharedBadgeClear: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: theme.colors.secondary,
    borderRadius: 4,
  },
  sharedBadgeClearText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginVertical: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily,
  },
  previewSection: {
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  previewTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.sm,
  },
  editorCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.sm,
    alignItems: 'center',
  },
  memeContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
  },
  memePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  memeEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    padding: theme.spacing.lg,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  },
  loadingOverlayText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  adjustmentsContainer: {
    width: '100%',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: theme.spacing.md,
  },
  sectionSubTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
  },
  adjustInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  adjustLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    width: 65,
  },
  adjustInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceElevated,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    fontSize: theme.typography.sizes.sm,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  controlLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  sizeBtnRow: {
    flexDirection: 'row',
  },
  sizeBtn: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  sizeBtnText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  colorPalette: {
    flexDirection: 'row',
  },
  colorBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorBubbleSelected: {
    borderColor: theme.colors.text,
    borderWidth: 2,
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.xs,
  },
  shareBtnPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#25D366', // WhatsApp branding color
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },
  waBtnPressed: {
    backgroundColor: '#128C7E',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  memeMeta: {
    width: '100%',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs,
    fontFamily: theme.typography.fontFamily,
  },
  metaValue: {
    color: theme.colors.primaryLight,
    fontWeight: theme.typography.weights.bold,
  },
  audioSourceLabel: {
    color: theme.colors.success,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default App;
