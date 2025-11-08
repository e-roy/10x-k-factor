- [x] cohort selection in signup
- [x] padding/margin in signup right sheet
- [ ] hide persona selection for users when ready2go
- [ ] agent buddy for students
  - [ ] eventually for tutors, maybe expose student buddys to parents? eh
- [x] xp system
  - [x] demo page to add xp
- [ ] seed various users
- [ ] header: remove Cohort selection there. Cohorts are for group chats / forums / group progress.
- [ ] make search work
- [ ] 


post-quickstart oneshot:
💬 Ready for Next Steps?
You're now at a great stopping point! The foundation is solid and ready for:
Testing the current UI
Connecting real data to replace mocks
Building the modal system for viral loops
Implementing Parent/Tutor dashboard


Wire up smart link generation APIs
Add WhatsApp share integration
Generate OG images for share cards
Track modal events for analytics
Add celebration animations




## ✅ Completed: Agent Buddy System

### 1. **Database Schema (`apps/web/db/buddy-schema.ts`)**
   - **`agent_buddies` table**: Main buddy record with archetype, appearance (JSONB), state (JSONB), timestamps
   - **`buddy_inventories` table**: Cosmetics, resources, artifacts with qty, data, acquisition tracking
   - **`buddy_unlocks` table**: Feature unlocks based on criteria (level, achievements, etc.)
   - **`buddy_messages` table**: Chat/nudge history with role (buddy/system/user), content, metadata
   - **Enum**: `inv_kind` for inventory item types (cosmetic, resource, artifact)

### 2. **User Profile Enhancement (`apps/web/db/user-schema.ts`)**
   - Added `personalizationTheme` field (varchar 64) for reward/gameplay/message flavor customization

### 3. **Buddy Utility Library (`apps/web/lib/buddy.ts`)**
   - **Buddy Management:**
     - `getOrCreateBuddy()` - Auto-creates buddy with level from XP system
     - `updateBuddyAppearance()` - Update skin, aura, sprite
     - `updateBuddyState()` - Update mood, energy
     - `setBuddyMood()` - Quick mood setter
   
   - **Inventory Functions:**
     - `addInventoryItem()` - Add/stack items with metadata
     - `getInventory()` - Query by kind (cosmetic/resource/artifact)
   
   - **Unlock Functions:**
     - `hasUnlock()` - Check if feature is unlocked
     - `grantUnlock()` - Grant new unlock with criteria
     - `getUserUnlocks()` - Get all unlocks
   
   - **Message Functions:**
     - `addBuddyMessage()` - Log chat messages
     - `getBuddyMessages()` - Get message history
     - `getLatestBuddyMessage()` - Get most recent message

### 4. **API Endpoints**
   - **GET `/api/buddy`** - Get/create user's buddy (includes level from XP)
   - **GET/POST `/api/buddy/messages`** - Fetch/add buddy chat messages
   - **GET/POST `/api/buddy/inventory`** - Query/add inventory items

### 5. **React Hook (`hooks/useBuddy.ts`)**
   - `useBuddy()` hook with buddy data, loading state, error handling, refresh function

### 6. **Demo Page (`/app/demos/buddy`)**
   - Visual buddy display with AgentBuddy component
   - Level & XP progress bar (linked to XP system)
   - Mood display with icons and colors (calm, fired_up, focused)
   - Energy bar (0-100)
   - Appearance details (skin, aura, sprite)
   - System metadata (timestamps, IDs)

### 7. **Seed Data (`scripts/seed.ts`)**
   - Sample buddies for both student users:
     - Student 1: "wayfinder" archetype, blue aura, calm mood
     - Student 2: "guardian" archetype, purple aura, fired up mood

### Key Features:
✅ **Level Sync**: Buddy level automatically derives from user's XP  
✅ **JSONB Storage**: Flexible appearance & state without schema changes  
✅ **Inventory System**: Ready for cosmetics, resources, artifacts  
✅ **Unlock Mechanics**: Criteria-based feature unlocking  
✅ **Message History**: Full chat log with metadata  
✅ **Mood States**: 3 moods (calm, fired_up, focused)  
✅ **Energy System**: 0-100 energy for future idle game mechanics  

### Ready for Future Enhancements:
- Tier-based rewards unlock system
- Idle game mechanics (energy regeneration, passive rewards)
- Cosmetic shop and customization
- Dynamic mood changes based on activity
- Agent-powered chat responses
- Resource gathering and crafting

The Agent Buddy system is now fully implemented and ready for testing at `/app/demos/buddy`! 🤖✨