'use client';

import { Popover, Box, FormGroup, FormControlLabel, Checkbox, Button } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { COLLECTION_COLUMN_OPTIONS } from '@/lib/collectionColumns';

type ColumnField = (typeof COLLECTION_COLUMN_OPTIONS)[number]['field'];

type Props = {
  open: boolean;
  anchorEl: HTMLButtonElement | null;
  onClose: () => void;
  columnVisibilityModel: Record<ColumnField, boolean>;
  onToggle: (field: ColumnField) => void;
  onReset: () => void;
};

export function ColumnPopover({ open, anchorEl, onClose, columnVisibilityModel, onToggle, onReset }: Props) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2, minWidth: 220 }}>
        <div className="mb-2 flex items-center justify-between">
          <strong>Columns</strong>
          <Button
            size="small"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
          >
            Reset
          </Button>
        </div>

        <FormGroup>
          {COLLECTION_COLUMN_OPTIONS.map((column) => (
            <FormControlLabel
              key={column.field}
              control={
                <Checkbox
                  checked={columnVisibilityModel[column.field]}
                  onChange={() => onToggle(column.field)}
                />
              }
              label={column.label}
            />
          ))}
        </FormGroup>
      </Box>
    </Popover>
  );
}
