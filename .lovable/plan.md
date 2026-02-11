
## Fix Column Child Editors: Add Image Upload and Variable Insert

### Problem
1. **Image sections in columns** only have a URL paste field — no upload button
2. **Headline/Body sections in columns** lack the variable insert (`VariableInsert`) dropdown

### Changes

**File: `src/components/builder/SectionProperties.tsx`**

1. **Add image upload for column child images** (around line 894-909)
   - After the existing image URL `<Input>`, add an upload button using the same pattern as the existing `UploadButton` component but wired to update the specific child section's `imageUrl` within `columnChildren`
   - A new helper function `handleChildImageUpload(colIdx, childId, file)` will handle uploading to storage and updating the correct nested child

2. **Add variable insert for column child headline/body** (around line 877-892)
   - Wrap the existing `<Textarea>` label area with the `VarLabel`-style pattern, adding a `VariableInsert` dropdown above the textarea
   - When a variable token is selected, it will be inserted into the child's text value

### Technical Details

**Child image upload handler** -- a new function inside the `columns2`/`columns3` case block:
- Accepts `colIdx` and `childId`, uploads the file to `template-logos` bucket under `builder/` folder
- On success, updates `columnChildren[colIdx]` to set the matching child's `imageUrl` to the public URL

**Variable insert for child text** -- adds a `VariableInsert` component above each headline/body textarea in columns:
- Uses the same `insertAtCursor` utility already defined in the file
- The `onInsert` callback appends the token to the child's current text value (consistent with how top-level sections work)

### Scope
- Single file change: `src/components/builder/SectionProperties.tsx`
- No new dependencies or database changes
