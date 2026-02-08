import SnackLogger from '@/components/SnackLogger';
import GroupManager from '@/components/GroupManager';

export default function Home() {
  return (
    <div style={{ paddingBottom: '4rem' }}>
      <SnackLogger />
      <GroupManager />
    </div>
  );
}
