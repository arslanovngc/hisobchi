import {
  Alert,
  AlertIcon,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Camera } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { recognize } from 'tesseract.js';
import { preprocessReceiptImage } from '../../lib/imagePreprocess';
import { parseReceiptText } from '../../lib/receiptParser';
import type { Item } from '../../types/bill';

type ReceiptScannerButtonProps = {
  onImport: (items: Item[], serviceFeePercent: number, serviceFeeAmount: number) => void;
};

export function ReceiptScannerButton({ onImport }: ReceiptScannerButtonProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  async function scanImage(file: File) {
    onOpen();
    setIsScanning(true);
    setProgress(0);
    setError('');

    try {
      const image = await preprocessReceiptImage(file);
      const result = await recognize(image, 'eng+rus', {
        logger: (event) => {
          if (event.status === 'recognizing text') setProgress(Math.round(event.progress * 100));
        },
      });
      const receipt = parseReceiptText(result.data.text);

      if (receipt.items.length === 0) {
        setError(t('No receipt items found.'));
        return;
      }

      onImport(receipt.items, receipt.serviceFeePercent, receipt.serviceFeeAmount);
      onClose();
    } catch {
      setError(t('Could not scan receipt.'));
    } finally {
      setIsScanning(false);
    }
  }

  return (
    <>
      <Button leftIcon={<Camera size={18} />} onClick={() => inputRef.current?.click()} isLoading={isScanning}>
        {t('Upload image')}
      </Button>
      <Input
        ref={inputRef}
        type='file'
        accept='image/*'
        display='none'
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void scanImage(file);
          event.target.value = '';
        }}
      />
      <Modal isOpen={isOpen} onClose={isScanning ? () => undefined : onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('Scan receipt')}</ModalHeader>
          <ModalBody pb={6}>
            {error ? (
              <Alert status='error' rounded='md'>
                <AlertIcon />
                {error}
              </Alert>
            ) : (
              <>
                <Progress value={progress} colorScheme='teal' rounded='full' />
                <Text mt={3} color='gray.500'>
                  {t('Reading receipt...')} {progress}%
                </Text>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
