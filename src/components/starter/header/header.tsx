import { component$ } from '@builder.io/qwik';
import styles from './header.module.css';
import { Link, useLocation } from '@builder.io/qwik-city';

export const NavLink = component$<{ href: string; label: string }>(({ href, label }) => {
  const { url } = useLocation();
  const { pathname } = url;
  const isCurrent = href + '/' === pathname;

  console.log({ pathname, isCurrent });
  return (
    <li>
      <Link href={href} class={isCurrent ? styles.current : ''}>
        <label>{label}</label>
      </Link>
    </li>
  );
});

export default component$(() => {
  return (
    <header class={styles.header}>
      <nav class={['container', styles.wrapper]}>
        <ul>
          <NavLink label="Go" href="/hiit" />
          <NavLink label="Edit" href="/edit" />
          <NavLink label="Search" href="/search" />
          <NavLink label="Log In" href="/login" />
        </ul>
      </nav>
    </header>
  );
});
