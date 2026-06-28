import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { theme } from '../styles/theme';
import { VibeOption } from '../types/meme';

export const VIBE_OPTIONS: VibeOption[] = [
  {
    id: 'cameroonian_pidgin',
    name: 'Cams Pidgin',
    description: 'Cameroonian pidgin / Street slang',
    emoji: '🇨🇲',
    culturalVibe: 'Cameroonian Pidgin',
  },
  {
    id: 'nigerian_pidgin',
    name: 'Naija Pidgin',
    description: 'Nigerian street pidgin vibes',
    emoji: '🇳🇬',
    culturalVibe: 'Nigerian Pidgin',
  },
  {
    id: 'french_slang',
    name: 'Argot Français',
    description: 'French street slang & verlan',
    emoji: '🇫🇷',
    culturalVibe: 'French Street Slang',
  },
  {
    id: 'aave',
    name: 'AAVE Vibe',
    description: 'African American Vernacular English',
    emoji: '🇺🇸',
    culturalVibe: 'AAVE',
  },
];

interface VibeSelectorProps {
  selectedVibeId: string;
  onSelectVibe: (vibe: VibeOption) => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({
  selectedVibeId,
  onSelectVibe,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>1. Select Cultural Vibe</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {VIBE_OPTIONS.map((vibe) => {
          const isSelected = vibe.id === selectedVibeId;
          return (
            <Pressable
              key={vibe.id}
              onPress={() => onSelectVibe(vibe)}
              style={({ pressed }) => [
                styles.vibeCard,
                isSelected && styles.vibeCardSelected,
                pressed && styles.vibeCardPressed,
              ]}
            >
              <Text style={styles.emoji}>{vibe.emoji}</Text>
              <View style={styles.cardTextContainer}>
                <Text style={[styles.name, isSelected && styles.nameSelected]}>
                  {vibe.name}
                </Text>
                <Text style={styles.description} numberOfLines={1}>
                  {vibe.description}
                </Text>
              </View>
              {isSelected && <View style={styles.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.semibold,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  vibeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    width: 210,
    position: 'relative',
    overflow: 'hidden',
  },
  vibeCardSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: theme.colors.surfaceElevated,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  vibeCardPressed: {
    opacity: 0.8,
  },
  emoji: {
    fontSize: 28,
    marginRight: theme.spacing.sm,
  },
  cardTextContainer: {
    flex: 1,
  },
  name: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.weights.bold,
  },
  nameSelected: {
    color: theme.colors.text,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.xs - 1,
    fontFamily: theme.typography.fontFamily,
    marginTop: 2,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.secondary,
  },
});
