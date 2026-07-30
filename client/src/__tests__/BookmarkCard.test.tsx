import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BookmarkCard } from "../components/BookmarkCard";
import { EmptyState } from "../components/EmptyState";
import type { Bookmark } from "../types";

describe("Frontend Components Test Suite", () => {
  const sampleBookmark: Bookmark = {
    id: 1,
    userId: 1,
    title: "Vite Next Generation Frontend Tooling",
    url: "https://vite.dev",
    description: "Fast frontend build tool",
    folderId: 10,
    folderName: "Web Tools",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [
      { id: 101, name: "vite" },
      { id: 102, name: "build" },
    ],
  };

  it("BookmarkCard renders bookmark info and handles actions", () => {
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();
    const handleTagClick = vi.fn();
    const handleFolderClick = vi.fn();

    render(
      <BookmarkCard
        bookmark={sampleBookmark}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTagClick={handleTagClick}
        onFolderClick={handleFolderClick}
      />
    );

    // Title & description rendered
    expect(screen.getByText("Vite Next Generation Frontend Tooling")).toBeDefined();
    expect(screen.getByText("Fast frontend build tool")).toBeDefined();

    // Hostname rendered
    expect(screen.getByText("vite.dev")).toBeDefined();

    // Folder badge rendered
    const folderBadge = screen.getByText("Web Tools");
    expect(folderBadge).toBeDefined();
    fireEvent.click(folderBadge);
    expect(handleFolderClick).toHaveBeenCalledWith(10);

    // Tag badge rendered
    const tagBadge = screen.getByText("vite");
    expect(tagBadge).toBeDefined();
    fireEvent.click(tagBadge);
    expect(handleTagClick).toHaveBeenCalledWith("vite");

    // Edit button clicked
    const editBtn = screen.getByTitle("Edit Bookmark");
    fireEvent.click(editBtn);
    expect(handleEdit).toHaveBeenCalledWith(sampleBookmark);

    // Delete button clicked
    const deleteBtn = screen.getByTitle("Delete Bookmark");
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(sampleBookmark);
  });

  it("EmptyState renders title, description, and handles action", () => {
    const handleAction = vi.fn();

    render(
      <EmptyState
        title="Custom Empty State"
        description="Nothing to see here"
        actionLabel="Click to Create"
        onAction={handleAction}
      />
    );

    expect(screen.getByText("Custom Empty State")).toBeDefined();
    expect(screen.getByText("Nothing to see here")).toBeDefined();

    const actionBtn = screen.getByText("Click to Create");
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
