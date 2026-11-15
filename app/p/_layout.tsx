import { TabBar } from '@/components/TabBar';

export default function ParticipantTabs() {
  return (
    <TabBar
      tabs={[
        { name: 'home', href: '/p', label: 'Home', icon: 'home' },
        { name: 'practice', href: '/p/practice', label: 'Practice', icon: 'sunrise' },
        { name: 'events', href: '/p/events', label: 'Events', icon: 'calendar' },
        { name: 'volunteer', href: '/p/volunteer', label: 'Volunteer', icon: 'heart' },
        { name: 'chat', href: '/p/chat', label: 'Chat', icon: 'message-square' },
      ]}
    />
  );
}
