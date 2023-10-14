import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://punpkusvndbgdflxguzj.supabase.co';
const supabaseAnonPublic =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1bnBrdXN2bmRiZ2RmbHhndXpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY0OTI3NzEsImV4cCI6MjAxMjA2ODc3MX0.GjtcFGfNmv3EXm_l5c0__sC1haBo2v9hPQEvy34h2iw';

export const supabase = createClient(supabaseUrl, supabaseAnonPublic);
