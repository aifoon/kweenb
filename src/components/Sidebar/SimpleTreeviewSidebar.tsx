import React, { ReactElement, useEffect, useState } from "react";
import { ButtonProps } from "../Buttons/Button";
import { Box, TextField } from "@mui/material";
import { SimpleTreeView, TreeItem, TreeItemProps } from "@mui/x-tree-view";

export interface SimpleTreeviewSidebarData {
  label: string;
  items: { label: string; treeItem: ReactElement<TreeItemProps> }[];
  folders: SimpleTreeviewSidebarData[];
}

export interface SimpleTreeviewSidebarProps {
  treeviewSidebarData: SimpleTreeviewSidebarData | null;
  divider?: boolean;
  filterButtons?: boolean;
}

export const SimpleTreeviewSidebar = ({
  treeviewSidebarData = null,
  divider = false,
  filterButtons = false,
}: SimpleTreeviewSidebarProps) => {
  // If no data, return null
  if (!treeviewSidebarData) return <></>;

  /**
   * Inner State
   */
  const [filteredTreeviewSidebarData, setFilteredTreeviewSidebarData] =
    useState<SimpleTreeviewSidebarData | null>(treeviewSidebarData);
  const [currentFilter, setCurrentFilter] = useState<string>("");
  const [currentTreeviewSidebarData, setCurrentTreeviewSidebarData] =
    useState<SimpleTreeviewSidebarData | null>(treeviewSidebarData);

  useEffect(() => {
    setCurrentTreeviewSidebarData(treeviewSidebarData);
  }, [treeviewSidebarData]);

  useEffect(() => {
    if (currentTreeviewSidebarData) {
      // Helper function to filter each SimpleTreeviewSidebarData item
      const filterHelper = (
        node: SimpleTreeviewSidebarData
      ): SimpleTreeviewSidebarData | null => {
        // Check if the node label includes the filterText
        const labelMatch = node.label
          .toLowerCase()
          .includes(currentFilter.toLowerCase());

        // Filter items where the label matches the filterText
        const filteredItems = node.items.filter((item) =>
          item.label.toLowerCase().includes(currentFilter.toLowerCase())
        );

        // Recursively filter folders
        const filteredFolders = node.folders
          .map(filterHelper) // Apply filter to each folder
          .filter((folder) => folder !== null) as SimpleTreeviewSidebarData[];

        // If there is a label match, keep all original items and folders
        if (labelMatch) {
          return {
            label: node.label,
            items: filteredItems.length > 0 ? filteredItems : node.items, // Filter root items based on filterText
            folders:
              filteredFolders.length > 0 ? filteredFolders : node.folders, // Retain original folders if any subfolder matches
          };
        }

        // If a subfolder or item matches, include this node and any matched content
        if (filteredItems.length > 0 || filteredFolders.length > 0) {
          return {
            label: node.label,
            items: filteredItems, // Keep only matching items in root level
            folders: filteredFolders, // Retain only matched folders
          };
        }

        // Exclude this node if there are no matches
        return null;
      };
      setFilteredTreeviewSidebarData(filterHelper(currentTreeviewSidebarData));
    } else {
      setCurrentTreeviewSidebarData(currentTreeviewSidebarData);
    }
  }, [currentFilter, currentTreeviewSidebarData]);

  /**
   * Render the tree items recursively
   * @param data
   * @returns
   */
  const renderTreeItems = (data: SimpleTreeviewSidebarData, parentId = "") => {
    const uniqueId = parentId ? `${parentId}-0` : "0";
    return (
      <TreeItem key={uniqueId} itemId={uniqueId} label={data.label}>
        {data?.items && data?.items.map((item) => item.treeItem)}
        {data.folders.length > 0 &&
          data.folders.map((child, index) =>
            renderTreeItems(child, `${uniqueId}-${index}`)
          )}
      </TreeItem>
    );
  };

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      gap={0}
      borderRight={divider ? "1px solid var(--grey-300)" : "none"}
    >
      {filterButtons && (
        <TextField
          sx={{ marginBottom: "10px" }}
          autoFocus
          size="small"
          value={currentFilter}
          onChange={(event) => setCurrentFilter(event.target.value)}
        />
      )}
      <SimpleTreeView>
        {filteredTreeviewSidebarData?.folders?.map((tsd, i) =>
          renderTreeItems(tsd, `${tsd.label}-a-${i}`)
        )}
        {filteredTreeviewSidebarData?.items?.map((item) => item.treeItem)}
      </SimpleTreeView>
    </Box>
  );
};
