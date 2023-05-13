import { TableCell, TableRow, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import { IBee } from '@shared/interfaces'
import React, { useState } from 'react'

type BeeTagProps = {
  bee: IBee
  tags: string[]
  selected?: string
  onTagChange: (bee: IBee, pozyxTagId: string) => void
}

export const BeeTagTableRow = ({ bee, tags, onTagChange, selected = "" }: BeeTagProps) => {
  const [selectedTag, setSelectedTag] = useState(selected ? selected : "None");
  const innerTags = [ "None",...tags];

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedTag(event.target.value);
    onTagChange(bee, event.target.value === "None" ? "" : event.target.value);
  }

  return (
    <TableRow>
      <TableCell>{bee.name}</TableCell>
      <TableCell align="right">
        <Select defaultValue='None' value={selectedTag} size="small" onChange={handleChange}>
          {innerTags.map((tag) =>
            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
          )}
        </Select>
      </TableCell>
    </TableRow>
  )
}
