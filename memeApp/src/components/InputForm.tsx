import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ActivityIndicator, Keyboard } from 'react-native';
import { theme } from '../styles/theme';

interface InputFormProps {
  onGenerate: (context: string, prompt: string) => void;
  isLoading: boolean;
  initialContext?: string;
  initialPrompt?: string;
}

export const InputForm: React.FC<InputFormProps> = ({
  onGenerate,
  isLoading,
  initialContext = '',
  initialPrompt = '',
}) => {
  const [context, setContext] = useState(initialContext);
  const [prompt, setPrompt] = useState(initialPrompt);

  useEffect(() => {
    if (initialContext) {
      setContext(initialContext);
    }
  }, [initialContext]);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);
  const [contextFocused, setContextFocused] = useState(false);
  const [promptFocused, setPromptFocused] = useState(false);

  const handleGenerate = () => {
    if (!context.trim() || !prompt.trim()) {
      return;
    }
    Keyboard.dismiss();
    onGenerate(context.trim(), prompt.trim());
  };

  const isButtonDisabled = !context.trim() || !prompt.trim() || isLoading;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>2. Input Details</Text>

      {/* Context Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Exchange Context (Min 20 characters)</Text>
        <TextInput
          style={[
            styles.textInput,
            styles.multilineInput,
            contextFocused && styles.inputFocused,
          ]}
          placeholder="Example: My friend asked me for money and I told him 'Ah no fit shout abeg' after he spent his salary on sneakers..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={4}
          value={context}
          onChangeText={setContext}
          onFocus={() => setContextFocused(true)}
          onBlur={() => setContextFocused(false)}
          editable={!isLoading}
          textAlignVertical="top"
        />
        <Text style={[styles.charCounter, context.length < 20 && styles.charCounterWarning]}>
          {context.length} / 20 chars min
        </Text>
      </View>

      {/* Prompt Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meme Idea / Final Punchline</Text>
        <TextInput
          style={[
            styles.textInput,
            promptFocused && styles.inputFocused,
          ]}
          placeholder="Example: Broke friend acting rich but crying inside"
          placeholderTextColor={theme.colors.textSecondary}
          value={prompt}
          onChangeText={setPrompt}
          onFocus={() => setPromptFocused(true)}
          onBlur={() => setPromptFocused(false)}
          editable={!isLoading}
        />
      </View>

      {/* Submit Button */}
      <Pressable
        style={({ pressed }) => [
          styles.button,
          isButtonDisabled && styles.buttonDisabled,
          pressed && !isButtonDisabled && styles.buttonPressed,
        ]}
        onPress={handleGenerate}
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={theme.colors.text} style={styles.spinner} />
            <Text style={styles.buttonText}>AI is thinking...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Generate Meme 🚀</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.sm,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
  },
  multilineInput: {
    height: 100,
  },
  inputFocused: {
    borderColor: theme.colors.primaryLight,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  charCounter: {
    alignSelf: 'flex-end',
    fontSize: theme.typography.sizes.xs - 2,
    color: theme.colors.success,
    marginTop: 4,
  },
  charCounterWarning: {
    color: theme.colors.error,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonPressed: {
    backgroundColor: theme.colors.primaryDark,
    opacity: 0.9,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: theme.spacing.sm,
  },
});
