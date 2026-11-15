// D4 Volunteer (seva): opportunities nearby, how full each is, and a Sign up button.
import { SevaCard } from '@/components/cards';
import { Body, Empty, Loading, Screen } from '@/components/ui';
import { useApp } from '@/lib/app';

export default function Volunteer() {
  const { pv } = useApp();
  if (!pv) return <Loading />;
  return (
    <Screen title={`Seva near ${pv.fsa}`}>
      <Body>
        {pv.seva.length ? pv.seva.map((s) => <SevaCard key={s.key} seva={s} />) : <Empty text="No seva nearby just now. New opportunities appear as teachers add them." />}
      </Body>
    </Screen>
  );
}
