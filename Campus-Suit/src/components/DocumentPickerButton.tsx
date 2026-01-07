import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { AppButton } from './AppButton';
import { theme } from '../theme/theme';

type DocumentPickerResult = Awaited<ReturnType<typeof DocumentPicker.getDocumentAsync>>;
type DocumentAsset = DocumentPickerResult extends { assets: (infer U)[] } ? U : never;

export interface PickedFile {
  uri: string;
  name: string;
  type: string | null;
  size: number;
  data: FormData;
}

interface Props {
  label?: string;
  onDocumentPicked: (file: PickedFile | null) => void;
  value?: string | null;
}

export const DocumentPickerButton: React.FC<Props> = ({ 
  label = 'Upload document',
  onDocumentPicked,
  value
}) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Create a FormData object to send the file
        const formData = new FormData();
        const fileUri = asset.uri;
        const fileName = asset.name || 'document';
        const fileType = asset.mimeType || 'application/octet-stream';
        
        // @ts-ignore - We need to append the file data to FormData
        formData.append('file', {
          uri: fileUri,
          name: fileName,
          type: fileType,
        });
        
        const file: PickedFile = {
          uri: fileUri,
          name: fileName,
          type: fileType,
          size: asset.size || 0,
          data: formData,
        };
        
        setFileName(file.name);
        onDocumentPicked(file);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      alert('Error picking document. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppButton label={label} onPress={handlePick} variant="outline" />
      <View style={styles.row}>
        <Ionicons name="document-text-outline" size={18} color={theme.colors.textMuted} />
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">
          {value || fileName || 'No document selected'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.small,
  },
});
