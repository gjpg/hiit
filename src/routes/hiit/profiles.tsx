import { supabase } from '~/utils/supabase';
import { component$, $ } from '@builder.io/qwik';

export const Profile = component$(() => {
  const clicked = $(async () => {
    await supabase.from('profiles').select();
  });

  return (
    <div>
      <button onClick$={() => clicked()}>Profile</button>
    </div>
  );
});
