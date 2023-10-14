import { component$, useStore, useSignal, $ } from '@builder.io/qwik';
import { Link } from '@builder.io/qwik-city';
import { Message } from '~/components/ui/message';
import { validateEmail } from '~/utils/helpers';
import { supabase } from '~/utils/supabase';
import { MessageObject } from '~/routes/types';

export default component$(() => {
  const message = useStore<MessageObject>({ message: undefined, status: 'error' });
  const isLoading = useSignal(false);
  const handleEmailSignup = $(async (event: any) => {
    message.message = undefined;
    message.status = 'error';
    isLoading.value = true;

    try {
      const email = event.target.email.value;
      const isTerms = event.target.terms.checked;
      const password = event.target.password.value;
      const confirm = event.target.confirm.value;
      const isEmailValid = validateEmail(email);

      if (!isEmailValid) {
        message.message = 'You must have a valid email';
        return;
      }
      if (!isTerms) {
        message.message = 'You must agree to our terms';
        return;
      }
      if (!password || password !== confirm) {
        message.message = 'You have not supplied a valid matching password';
        return;
      }

      // const timestamp = Date.now();
      // const pwd = Math.floor(Math.random() * 1000000) + email + timestamp;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: 'https://www.google.com' },
      });

      console.log({ error });
      if (data?.user?.id) {
        message.message = 'Success, please check your email spam folder';
        message.status = 'success';
        return;
      } else {
        message.message = 'There was a problem creating a user. ' + error?.message;

        return;
      }
    } finally {
      isLoading.value = false;
    }
  });

  return (
    <>
      <Message message={message} />
      <form onSubmit$={handleEmailSignup} preventdefault:submit>
        <div style={{ display: 'flex', flexDirection: 'column', width: 150 }}>
          <label>
            Email
            <input name="email" type="email" placeholder="Email" />
          </label>
          <label>
            Agree
            <input name="terms" type="checkbox" />
          </label>
          <label>
            Password
            <input name="password" type="password" />
          </label>
          <label>
            Confirm
            <input name="confirm" type="password" />
          </label>

          <button type="submit" style={{ maxWidth: 150 }}>
            Submit
          </button>
        </div>
      </form>
    </>
  );
});
