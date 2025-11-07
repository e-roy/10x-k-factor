- [x] cohort selection in signup
- [ ] padding/margin in signup right sheet
- [ ] hide persona selection for users when ready2go
- [ ] general system agent buddy for teachers & tutors, but personalized agent buddy for students
- [ ] header: remove Cohort selection there. Cohorts are for group chats / forums / group progress.
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

- [ ] address recentResults and userCohorts types in

```ts
async function fetchDashboardData(
  userId: string, 
  persona: string,
  context: {
    recentResults: any[];
    userCohorts: any[];
    streak: number;
    mostCommonSubject: string;
  }
)
```