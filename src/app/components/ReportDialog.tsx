import React, { FormEventHandler, useMemo } from 'react';
import {
  Box,
  Button,
  Dialog,
  Header,
  Icon,
  IconButton,
  Icons,
  Input,
  Spinner,
  Text,
  TextArea,
  color,
  config,
} from 'folds';
import FocusTrap from 'focus-trap-react';
import { AsyncStatus, useAsyncCallback } from '../hooks/useAsyncCallback';
import { stopPropagation } from '../utils/keyboard';

type ReportDialogSubmit = {
  reason: string;
  details?: string;
};

type ReportDialogProps = {
  open: boolean;
  title: string;
  targetLabel: string;
  helperText?: string;
  requestClose: () => void;
  onSubmit: (data: ReportDialogSubmit) => Promise<void>;
};

export function ReportDialog({
  open,
  title,
  targetLabel,
  helperText,
  requestClose,
  onSubmit,
}: ReportDialogProps) {
  const [submitState, submitReport] = useAsyncCallback(onSubmit);

  const disabled =
    submitState.status === AsyncStatus.Loading || submitState.status === AsyncStatus.Success;

  const successMessage = useMemo(
    () => `${targetLabel} has been reported and forwarded for review.`,
    [targetLabel]
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    if (disabled) return;

    const form = evt.target as HTMLFormElement | undefined;
    const reasonInput = form?.reasonInput as HTMLInputElement | undefined;
    const detailsInput = form?.detailsInput as HTMLTextAreaElement | undefined;

    const reason = reasonInput?.value.trim();
    const details = detailsInput?.value.trim() || undefined;

    if (!reason) return;

    submitReport({ reason, details });
  };

  if (!open) return null;

  return (
    <Dialog variant="Surface">
      <FocusTrap
        focusTrapOptions={{
          initialFocus: false,
          clickOutsideDeactivates: true,
          onDeactivate: requestClose,
          escapeDeactivates: stopPropagation,
        }}
      >
        <div>
          <Header
            style={{
              padding: `0 ${config.space.S200} 0 ${config.space.S400}`,
              borderBottomWidth: config.borderWidth.B300,
            }}
            variant="Surface"
            size="500"
          >
            <Box grow="Yes">
              <Text size="H4">{title}</Text>
            </Box>
            <IconButton size="300" onClick={requestClose} radii="300">
              <Icon src={Icons.Cross} />
            </IconButton>
          </Header>
          <Box
            as="form"
            onSubmit={handleSubmit}
            style={{ padding: config.space.S400 }}
            direction="Column"
            gap="400"
          >
            <Text priority="400">
              {helperText ?? `Report ${targetLabel.toLowerCase()} for review.`}
            </Text>

            <Box direction="Column" gap="100">
              <Text size="L400">Reason</Text>
              <Input name="reasonInput" variant="Background" required disabled={disabled} />
            </Box>

            <Box direction="Column" gap="100">
              <Text size="L400">
                Details{' '}
                <Text as="span" size="T200">
                  (optional)
                </Text>
              </Text>
              <TextArea
                name="detailsInput"
                variant="Background"
                rows={4}
                resize="Vertical"
                disabled={disabled}
              />
            </Box>

            {submitState.status === AsyncStatus.Error && (
              <Text style={{ color: color.Critical.Main }} size="T300">
                {submitState.error instanceof Error
                  ? submitState.error.message
                  : `Failed to report ${targetLabel.toLowerCase()}.`}
              </Text>
            )}

            {submitState.status === AsyncStatus.Success && (
              <Text style={{ color: color.Success.Main }} size="T300">
                {successMessage}
              </Text>
            )}

            <Button
              type="submit"
              variant="Critical"
              before={
                submitState.status === AsyncStatus.Loading ? (
                  <Spinner fill="Solid" variant="Critical" size="200" />
                ) : undefined
              }
              aria-disabled={disabled}
            >
              <Text size="B400">
                {submitState.status === AsyncStatus.Loading ? 'Reporting...' : 'Report'}
              </Text>
            </Button>
          </Box>
        </div>
      </FocusTrap>
    </Dialog>
  );
}
