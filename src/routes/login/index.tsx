import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import { Link, useLocation, useNavigate } from '@builder.io/qwik-city';
import { Message } from '~/components/ui/message';
import { validateEmail } from '~/utils/helpers';
import { supabase } from '~/utils/supabase';
import { MessageObject } from '~/routes/types';

export default component$(() => {
  const message = useStore<MessageObject>({ message: undefined, status: 'error' });
  const isLoading = useSignal(false);
  const nav = useNavigate();

  const handleLoginEvent = $(async (event: any) => {
    message.message = undefined;
    message.status = 'error';
    isLoading.value = true;

    try {
      const email = event.target.email.value;
      const password = event.target.password.value;
      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        message.message = 'Invalid email';
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (data) {
        message.message = 'Success, redirecting';
        message.status = 'success';

        console.log(data);
        {
          const { data, error } = await supabase.from('profiles').select();
          console.log('profiles', data);
        }
        await nav('/hiit');
      } else {
        message.message = 'There was a problem logging in.' + error?.message;

        return;
      }
    } finally {
      isLoading.value = false;
    }
  });
  return (
    <>
      <Message message={message} />
      <form onSubmit$={handleLoginEvent} preventdefault:submit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 150 }}>
          <label>
            Email
            <input name="email" type="email" placeholder="Email" />
          </label>

          <label>
            Password
            <input name="password" type="password" />
          </label>

          <button type="submit" style={{ maxWidth: 150 }}>
            Submit
          </button>
        </div>
      </form>
    </>
  );
});
