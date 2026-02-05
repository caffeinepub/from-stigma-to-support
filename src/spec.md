# Specification

## Summary
**Goal:** Remove the admin UI ability to edit community posts unless the admin is also the original author.

**Planned changes:**
- Update Community page post controls so the **Edit** action is shown only when the authenticated user is the post author (principal matches `post.author`), regardless of admin status.
- Keep **Delete** controls unchanged: admins can delete any post; non-admin users can delete only their own posts.

**User-visible outcome:** Admins no longer see an Edit button on other users’ community posts, but can still edit posts they authored and can still delete any post.
