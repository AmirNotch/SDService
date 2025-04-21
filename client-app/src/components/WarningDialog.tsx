// WarningDialog.tsx
import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

interface WarningDialogProps {
  open: boolean;
  onClose: (accepted: boolean) => void;
}

const WarningDialog: React.FC<WarningDialogProps> = ({ open, onClose }) => {
  const handleAgree = () => {
    onClose(true); // Закрыть диалог с согласие
  };

  const handleDisagree = () => {
    onClose(false); // Закрыть диалог без согласия
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>Окно с предупреждением об использовании ПД</DialogTitle>
      <DialogContent>
        <p>Вы должны согласиться с условиями перед продолжением.</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDisagree} color="secondary">Нет</Button>
        <Button onClick={handleAgree} color="primary">Согласен</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
