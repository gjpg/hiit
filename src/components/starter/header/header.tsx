import { $, component$ } from '@builder.io/qwik';
import { QwikLogo } from '../icons/qwik';
import styles from './header.module.css';
import { supabase } from '~/utils/supabase';
import { useNavigate } from '@builder.io/qwik-city';

export default component$(() => {
  const nav = useNavigate();

  const handleSignOutEvent = $(async (event: any) => {
    const { error } = await supabase.auth.signOut();

    console.log('SignOut error:', error);
    await nav('/login');
  });

  return (
    <header class={styles.header}>
      <div class={['container', styles.wrapper]}>
        <div class={styles.logo}>
          <a href="/" title="qwik">
            <QwikLogo height={50} width={143} />
          </a>
        </div>
        <ul>
          <li>
            <a href="https://qwik.builder.io/docs/components/overview/" target="_blank">
              Docs
            </a>
          </li>
          <li>
            <a href="https://qwik.builder.io/examples/introduction/hello-world/" target="_blank">
              Examples
            </a>
          </li>
          <li>
            <a href="https://qwik.builder.io/tutorial/welcome/overview/" target="_blank">
              Tutorials
            </a>
          </li>
          <li>
            <a href="/signup" target="_blank">
              Create Account
            </a>
          </li>
          <li>
            <a href="/login" target="_blank">
              Log In
            </a>
          </li>
          <li>
            <button onClick$={handleSignOutEvent}>Sign Out</button>
          </li>
        </ul>
      </div>
    </header>
  );
});
