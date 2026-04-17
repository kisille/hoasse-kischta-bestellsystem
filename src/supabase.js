import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://hvgjrvvytfzekavlaeia.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2Z2pydnZ5dGZ6ZWthdmxhZWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNzAwMjEsImV4cCI6MjA5MTg0NjAyMX0.dMm4lpmlvf6PkBAUnGUaF1Ia6Dbps2Ab335IolJuHjo"
);
