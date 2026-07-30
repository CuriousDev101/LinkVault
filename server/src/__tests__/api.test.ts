import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../app.js";

describe("LinkVault API Test Suite", () => {
  const timestamp = Date.now();
  const user1 = {
    name: "Alice Tester",
    email: `alice_${timestamp}@test.com`,
    password: "password123",
  };
  const user2 = {
    name: "Bob Observer",
    email: `bob_${timestamp}@test.com`,
    password: "securepassword",
  };

  let token1: string;
  let token2: string;
  let folderId1: number;
  let bookmarkId1: number;
  let bookmarkId2: number;

  it("FR-01 & FR-02: User Registration and Duplicate Prevention", async () => {
    // 1. Successful registration
    const res = await request(app)
      .post("/api/auth/register")
      .send(user1);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(user1.email);
    token1 = res.body.token;

    // 2. Prevent duplicate email registration
    const dupRes = await request(app)
      .post("/api/auth/register")
      .send(user1);

    expect(dupRes.status).toBe(409);
    expect(dupRes.body.error).toContain("already registered");

    // 3. Register user2
    const res2 = await request(app)
      .post("/api/auth/register")
      .send(user2);
    expect(res2.status).toBe(201);
    token2 = res2.body.token;
  });

  it("FR-03: User Login and Logout (Client side discarding token)", async () => {
    // Correct login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user1.email, password: user1.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");

    // Invalid login
    const badRes = await request(app)
      .post("/api/auth/login")
      .send({ email: user1.email, password: "wrongpassword" });

    expect(badRes.status).toBe(401);
  });

  it("FR-04: Protected Routes Reject Unauthenticated Requests", async () => {
    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(401);

    const badTokenRes = await request(app)
      .get("/api/bookmarks")
      .set("Authorization", "Bearer invalidtoken123");
    expect(badTokenRes.status).toBe(401);
  });

  it("FR-13, FR-14: Folder Management (Create & Rename)", async () => {
    // Create folder
    const createRes = await request(app)
      .post("/api/folders")
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Work Docs" });

    expect(createRes.status).toBe(201);
    expect(createRes.body.folder.name).toBe("Work Docs");
    folderId1 = createRes.body.folder.id;

    // Rename folder
    const updateRes = await request(app)
      .put(`/api/folders/${folderId1}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({ name: "Work & Reference" });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.folder.name).toBe("Work & Reference");
  });

  it("FR-06, FR-07, FR-12, FR-15, FR-18, FR-19: Bookmark Creation with Validation, Folder & Tags", async () => {
    // Invalid URL validation
    const invalidUrlRes = await request(app)
      .post("/api/bookmarks")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        title: "Bad Link",
        url: "not-a-valid-url",
      });
    expect(invalidUrlRes.status).toBe(400);

    // Create valid bookmark 1
    const res1 = await request(app)
      .post("/api/bookmarks")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        title: "GitHub Platform",
        url: "https://github.com",
        description: "Development and version control platform",
        folderId: folderId1,
        tags: ["dev", "tools"],
      });

    expect(res1.status).toBe(201);
    expect(res1.body.bookmark.title).toBe("GitHub Platform");
    expect(res1.body.bookmark.folderId).toBe(folderId1);
    expect(res1.body.bookmark.tags.length).toBe(2);
    expect(res1.body.bookmark).toHaveProperty("createdAt");
    expect(res1.body.bookmark).toHaveProperty("updatedAt");
    bookmarkId1 = res1.body.bookmark.id;

    // Create valid bookmark 2
    const res2 = await request(app)
      .post("/api/bookmarks")
      .set("Authorization", `Bearer ${token1}`)
      .send({
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org",
        description: "Web standards and JavaScript documentation",
        tags: ["dev", "docs"],
      });

    expect(res2.status).toBe(201);
    bookmarkId2 = res2.body.bookmark.id;
  });

  it("FR-05: User Data Isolation (User 2 cannot see or modify User 1 data)", async () => {
    // User 2 should have 0 bookmarks
    const user2Bookmarks = await request(app)
      .get("/api/bookmarks")
      .set("Authorization", `Bearer ${token2}`);

    expect(user2Bookmarks.status).toBe(200);
    expect(user2Bookmarks.body.bookmarks.length).toBe(0);

    // User 2 cannot access user 1's bookmark
    const getRes = await request(app)
      .get(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(getRes.status).toBe(404);

    // User 2 cannot edit user 1's bookmark
    const editRes = await request(app)
      .put(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token2}`)
      .send({ title: "Hacked" });

    expect(editRes.status).toBe(404);

    // User 2 cannot delete user 1's bookmark
    const deleteRes = await request(app)
      .delete(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token2}`);

    expect(deleteRes.status).toBe(404);
  });

  it("FR-08, FR-09: Bookmark Viewing and Editing", async () => {
    // View single bookmark
    const getRes = await request(app)
      .get(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.bookmark.title).toBe("GitHub Platform");

    // Edit bookmark
    const editRes = await request(app)
      .put(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token1}`)
      .send({
        title: "GitHub: Where the world builds software",
        url: "https://github.com",
        description: "Official GitHub website",
        tags: ["git", "dev"],
      });

    expect(editRes.status).toBe(200);
    expect(editRes.body.bookmark.title).toBe("GitHub: Where the world builds software");
    expect(editRes.body.bookmark.tags.map((t: any) => t.name)).toContain("git");
  });

  it("FR-22, FR-23, FR-24: Search, Sorting, and Filtering", async () => {
    // Search by title
    const searchRes = await request(app)
      .get("/api/bookmarks?search=Mozilla")
      .set("Authorization", `Bearer ${token1}`);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.bookmarks.length).toBe(1);
    expect(searchRes.body.bookmarks[0].id).toBe(bookmarkId2);

    // Search by tag
    const tagSearchRes = await request(app)
      .get("/api/bookmarks?search=git")
      .set("Authorization", `Bearer ${token1}`);

    expect(tagSearchRes.status).toBe(200);
    expect(tagSearchRes.body.bookmarks.length).toBe(1);
    expect(tagSearchRes.body.bookmarks[0].id).toBe(bookmarkId1);

    // Filter by tag
    const filterTagRes = await request(app)
      .get("/api/bookmarks?tagName=docs")
      .set("Authorization", `Bearer ${token1}`);

    expect(filterTagRes.status).toBe(200);
    expect(filterTagRes.body.bookmarks.length).toBe(1);

    // Filter by folder
    const filterFolderRes = await request(app)
      .get(`/api/bookmarks?folderId=${folderId1}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(filterFolderRes.status).toBe(200);
    expect(filterFolderRes.body.bookmarks.length).toBe(1);
    expect(filterFolderRes.body.bookmarks[0].id).toBe(bookmarkId1);

    // Sorting by title asc
    const sortRes = await request(app)
      .get("/api/bookmarks?sortBy=title&sortOrder=asc")
      .set("Authorization", `Bearer ${token1}`);

    expect(sortRes.status).toBe(200);
    expect(sortRes.body.bookmarks[0].title.localeCompare(sortRes.body.bookmarks[1].title)).toBeLessThanOrEqual(0);
  });

  it("FR-17: Deleting a folder shall not silently delete its bookmarks", async () => {
    // Delete the folder
    const deleteFolderRes = await request(app)
      .delete(`/api/folders/${folderId1}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(deleteFolderRes.status).toBe(200);

    // Check that the bookmark previously in that folder still exists with folderId = null
    const bookmarkRes = await request(app)
      .get(`/api/bookmarks/${bookmarkId1}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(bookmarkRes.status).toBe(200);
    expect(bookmarkRes.body.bookmark.folderId).toBeNull();
  });

  it("FR-10: Bookmark Deletion", async () => {
    const deleteRes = await request(app)
      .delete(`/api/bookmarks/${bookmarkId2}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(deleteRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/api/bookmarks/${bookmarkId2}`)
      .set("Authorization", `Bearer ${token1}`);

    expect(getRes.status).toBe(404);
  });

  it("Dashboard stats endpoint returns counts and recent items", async () => {
    const statsRes = await request(app)
      .get("/api/stats")
      .set("Authorization", `Bearer ${token1}`);

    expect(statsRes.status).toBe(200);
    expect(statsRes.body.stats.totalBookmarks).toBe(1); // bookmarkId1 is left
    expect(statsRes.body.recentBookmarks.length).toBe(1);
  });
});
