import { TabBar } from '@/components/TabBar';

export default function TeacherTabs() {
  return (
    <TabBar
      tabs={[
        { name: 'today', href: '/t', label: 'Today', icon: 'sun' },
        { name: 'people', href: '/t/people', label: 'People', icon: 'users' },
        { name: 'reports', href: '/t/reports', label: 'Reports', icon: 'bar-chart-2' },
        { name: 'events', href: '/t/events', label: 'Events', icon: 'calendar' },
        { name: 'chat', href: '/t/chat', label: 'Chat', icon: 'message-square' },
      ]}
    />
  );
}
