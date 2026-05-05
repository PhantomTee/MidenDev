# MidenHub Security Specification

## Data Invariants
1. Submissions must always be created with status 'pending'.
2. Only Admins can change a submission's status to 'approved' or 'featured'.
3. Only the author of a submission can update its title or description (while pending).
4. UserProfiles are strictly isolated to the authenticated user.
5. Admins cannot be self-appointed; they must be managed in the /admins/ collection.

## Dirty Dozen Payloads (Target: DENIED)

1. **Identity Spoofing**: User A creates a submission with `authorId: "UserB"`.
2. **State Shortcutting**: User creates a submission with `status: "approved"`.
3. **Privilege Escalation**: User tries to update their profile to add `role: "admin"` (though not in schema, testing for shadow fields).
4. **ID Poisoning**: User tries to create a submission with a 2MB string as document ID.
5. **PII Leak**: Non-admin user tries to list all user profiles to see emails.
6. **Recursive Cost Attack**: User sends a 500-tag array to blow up parse costs.
7. **Resource Exhaustion**: User sends a 1MB string for Title.
8. **Unauthorized Approval**: Non-admin user updates a submission to `status: "featured"`.
9. **History Manipulation**: User updates `createdAt` timestamp to a past date.
10. **Shadow Field Injection**: User adds `isVerified: true` to a submission.
11. **Orphaned Write**: Creating a comment for a non-existent submission.
12. **Blanket Read Attack**: User queries `/userProfiles` without a filter on their own UID.

## Red Team Conflict Report
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|-------------------|---------------------|
| submissions| Blocked (isValid) | Blocked (isValid) | Blocked (size)      |
| userProfiles| Blocked (ownerId) | N/A                | Blocked (size)      |
| admins     | Read-only         | Read-only         | Read-only           |
